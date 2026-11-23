/**
 * 渲染辅助：把小程序页面（Page 四件套）与自定义组件都当成自定义组件渲染。
 *
 * 为什么可行：页面与组件都是「wxml + wxss + json + js 四件套」，wxml 模板语法完全一致。
 * miniprogram-simulate 只认 Component() 构造器，所以把 global.Page 指向 Component 即可
 * 让页面文件按组件注册，再用 simulate.render 渲染出真实 DOM 结构。
 *
 * 三个 simulate 的行为约束都体现在这里：
 *  1) 同一路径重复 load 会把注册表搞坏（第二次 render 返回 undefined），
 *     所以 id 按路径缓存，全文件复用；
 *  2) 使用 compiler: 'simulate'（官方 wcc 编译器需要原生二进制，Windows 上会
 *     撞 ENAMETOOLONG，且要求整包编译，工程脚手架场景用不上）；
 *  3) 渲染出的节点类名带标签前缀（tagName 前缀），查子节点必须走 comp.querySelector。
 */
import * as path from 'node:path';
import simulate from 'miniprogram-simulate';

/** 仓库根目录（tests/helpers 往上两级） */
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
export const MINIPROGRAM_ROOT = path.join(PROJECT_ROOT, 'miniprogram');

const toPosix = (p: string): string => p.split(path.sep).join('/');

const idCache = new Map<string, string>();

const internals = globalThis as unknown as { Component?: unknown; Page?: unknown };

/** 让页面文件里的 Page({...}) 走 simulate 的 Component 注册路径 */
export function allowPageAsComponent(): void {
  const component = internals.Component;
  if (typeof component === 'function') {
    internals.Page = component;
  }
}

/**
 * 加载一个组件/页面目录并返回 simulate 的组件 id（同路径只 load 一次）。
 * dir 相对 miniprogram/，如 'pages/home'、'components/hello'。
 */
export function loadComponent(dir: string, tagName = 'page'): string {
  const key = `${tagName}::${dir}`;
  const cached = idCache.get(key);
  if (cached) return cached;
  allowPageAsComponent();
  const componentPath = toPosix(path.join(MINIPROGRAM_ROOT, dir, 'index'));
  const id = simulate.load(componentPath, tagName, {
    compiler: 'simulate',
    rootPath: toPosix(PROJECT_ROOT),
  });
  idCache.set(key, id);
  return id;
}

export interface RenderedPage {
  /** 全部可见文本（已折叠空白） */
  text: string;
  /** 渲染出的 DOM 结构 */
  html: string;
  detach: () => void;
}

/** 加载并渲染一个页面/组件目录 */
export function renderComponent(dir: string, tagName = 'page'): RenderedPage {
  const id = loadComponent(dir, tagName);
  const comp = simulate.render(id);
  const host = document.createElement('parent-node');
  comp.attach(host);
  const dom = comp.dom;
  if (!dom) throw new Error(`render failed: no dom for ${dir}`);
  return {
    text: (dom.textContent || '').replace(/\s+/g, ' ').trim(),
    html: dom.innerHTML,
    detach: () => comp.detach(),
  };
}
