/**
 * 静态预览渲染器：把 wxml + wxss 渲染成 HTML，再用 headless 浏览器截图。
 *
 * ⚠ 重要声明：本脚本产出的 PNG 是「静态预览（由 wxml/wxss 渲染）」，
 *   不是微信开发者工具截图。本机没有安装微信开发者工具（见 README「环境说明」），
 *   所以 AC1 的「开发者工具截图」用三类替代证据：
 *     1) scripts/verify-app-json.mjs  —— app.json 结构断言日志
 *     2) tests/pages/tabs.spec.ts     —— miniprogram-simulate 真实渲染断言
 *     3) 本脚本                        —— wxml/wxss 静态预览图
 *
 * 转换规则（够用即可，不是完整 wxml 实现）：
 *   - <view>/<text>/<image>/<button> 等原生标签 → 带同名 class 的 div/span/img/button
 *   - {{expr}} 插值 → 占位文本
 *   - wx:if / wx:for / wx:else → 去掉属性（骨架页没有真正的条件渲染）
 *   - 自定义组件标签（t-button 等）→ 按 usingComponents 渲染成带边框的占位块并标注组件名
 *   - wxss → 变量替换（--sp-3: 24rpx → 24px）+ 基础选择器映射
 *
 * 用法：node scripts/render-preview.mjs   （输出到 shots/tabs/ 与 shots/subpackages/）
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MP = join(ROOT, 'miniprogram');
const SHOTS = join(ROOT, 'shots');
const TMP = join(SHOTS, '.preview-html');

/** headless 浏览器：优先 Edge，其次 Chrome */
const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const browser = BROWSERS.find((p) => existsSync(p));
if (!browser) {
  console.error('[preview] 未找到可用的 headless 浏览器（Edge/Chrome）');
  process.exit(1);
}

const PAGE_W = 375;
const PAGE_H = 667;

/** 读取 wxss 里的 CSS 变量（--name: value） */
function readVariables(wxss) {
  const vars = {};
  for (const match of wxss.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

/** rpx → px（375 宽设计稿：1rpx ≈ 0.5px） */
function rpxToPx(value) {
  return value.replace(/([0-9.]+)rpx/gi, (m, n) => (Number(n) * 0.5).toFixed(2) + 'px');
}

function resolveVars(css, vars) {
  let out = css;
  for (const [name, value] of Object.entries(vars)) {
    out = out.split('var(' + name + ')').join(rpxToPx(value));
  }
  return out;
}

/** 主题变量（styles/theme.wxss） */
const themeVars = readVariables(readFileSync(join(MP, 'styles', 'theme.wxss'), 'utf8'));
const commonCss = resolveVars(readFileSync(join(MP, 'styles', 'common.wxss'), 'utf8'), themeVars);

/** 读取页面 json 里的 usingComponents */
function readUsingComponents(pageDir) {
  const jsonPath = join(MP, pageDir, 'index.json');
  if (!existsSync(jsonPath)) return {};
  return JSON.parse(readFileSync(jsonPath, 'utf8')).usingComponents ?? {};
}

const NATIVE_TAGS = {
  view: 'div',
  'scroll-view': 'div',
  'cover-view': 'div',
  text: 'span',
  image: 'img',
  button: 'button',
  input: 'input',
  navigator: 'a',
  slot: 'span',
};

/** wxml → html 片段 */
function convertWxml(wxml, usingComponents) {
  let out = wxml;
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/\{\{[^}]*\}\}/g, '内容');
  out = out.replace(/\s(wx:[a-z-]+)(="[^"]*")?/g, '');

  for (const tag of Object.keys(usingComponents)) {
    const re = new RegExp('<' + tag + '([^>]*)>([\\s\\S]*?)<\\/' + tag + '>', 'g');
    out = out.replace(re, (m, attrs, inner) => {
      return (
        '<div class="xcomp xcomp--' +
        tag +
        '"><span class="xcomp__tag">' +
        tag +
        '</span>' +
        inner +
        '</div>'
      );
    });
    out = out.replace(
      new RegExp('<' + tag + '([^>]*)\\/>', 'g'),
      '<div class="xcomp xcomp--' + tag + '"><span class="xcomp__tag">' + tag + '</span></div>',
    );
  }

  for (const [wxmlTag, htmlTag] of Object.entries(NATIVE_TAGS)) {
    out = out.replace(new RegExp('<' + wxmlTag + '(\\s[^>]*)?>', 'g'), '<' + htmlTag + '$1>');
    out = out.replace(new RegExp('</' + wxmlTag + '>', 'g'), '</' + htmlTag + '>');
  }

  out = out.replace(/\s(style|data-[a-z-]+|bind[a-z]+|catch[a-z]+|hover-class)="[^"]*"/g, '');
  return out;
}

/** wxss → 可用于 html 的 css */
function convertWxss(wxss) {
  let out = wxss;
  out = out.replace(/^page\s*\{/gm, 'body {');
  out = rpxToPx(out);
  return out;
}

function buildHtml(pageDir, pageTitle) {
  const wxml = readFileSync(join(MP, pageDir, 'index.wxml'), 'utf8');
  const usingComponents = readUsingComponents(pageDir);
  const pageWxss = existsSync(join(MP, pageDir, 'index.wxss'))
    ? readFileSync(join(MP, pageDir, 'index.wxss'), 'utf8')
    : '';

  const vars = readVariables(
    pageWxss + '\n' + readFileSync(join(MP, 'styles', 'theme.wxss'), 'utf8'),
  );
  const body = convertWxml(wxml, usingComponents);
  const css = [
    resolveVars(convertWxss(commonCss), themeVars),
    resolveVars(convertWxss(pageWxss), vars),
    resolveVars(convertWxss(readFileSync(join(MP, 'styles', 'theme.wxss'), 'utf8')), themeVars),
  ].join('\n');

  const cssVars = Object.entries(themeVars)
    .map(([k, v]) => '  ' + k + ': ' + rpxToPx(v) + ';')
    .join('\n');

  return [
    '<!doctype html>',
    '<html lang="zh-CN"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>' + pageTitle + ' · 静态预览</title>',
    '<style>',
    ':root {',
    cssVars,
    '}',
    'body { margin:0; padding:16px; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; background:#f2f3f5; }',
    '.preview-note { font-size:11px; color:#888; border:1px dashed #bbb; border-radius:8px; padding:6px 8px; margin-bottom:12px; background:#fff; }',
    '.xcomp { display:block; border:1px solid #0052d9; border-radius:4px; padding:6px 8px; margin-top:6px; position:relative; background:#e8f0fe; }',
    '.xcomp__tag { display:inline-block; font-size:10px; color:#0052d9; background:#fff; border:1px solid #0052d9; border-radius:3px; padding:0 4px; margin-right:6px; }',
    'img { width:100%; height:120px; background:#e7e7e7; border-radius:4px; }',
    'button { border:1px solid #0052d9; background:#0052d9; color:#fff; border-radius:4px; padding:8px 12px; font-size:13px; width:100%; }',
    css,
    '</style></head><body>',
    '<div class="preview-note">静态预览（由 wxml/wxss 渲染，<strong>不是微信开发者工具截图</strong>）</div>',
    body,
    '</body></html>',
  ].join('\n');
}

function screenshot(htmlPath, pngPath) {
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-sandbox',
      '--force-device-scale-factor=2',
      '--window-size=' + PAGE_W + ',' + PAGE_H,
      '--screenshot=' + pngPath,
      'file:///' + htmlPath.split('\\').join('/'),
    ],
    { stdio: 'ignore' },
  );
}

/** 要预览的页面清单 */
const TARGETS = [
  { dir: 'pages/home', out: 'tabs/home.png', title: '首页' },
  { dir: 'pages/resource', out: 'tabs/resource.png', title: '商机' },
  { dir: 'pages/event', out: 'tabs/event.png', title: '活动' },
  { dir: 'pages/academy', out: 'tabs/academy.png', title: '学院' },
  { dir: 'pages/mine', out: 'tabs/mine.png', title: '我的' },
  {
    dir: 'pkg-resource/pages/detail',
    out: 'subpackages/resource-detail.png',
    title: '商机详情（分包）',
  },
  {
    dir: 'pkg-resource/pages/publish',
    out: 'subpackages/resource-publish.png',
    title: '发布商机（分包）',
  },
  {
    dir: 'pkg-member/pages/verify',
    out: 'subpackages/member-verify.png',
    title: '实名认证（分包）',
  },
  {
    dir: 'pkg-member/pages/profile',
    out: 'subpackages/member-profile.png',
    title: '资料维护（分包）',
  },
];

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const results = [];
for (const target of TARGETS) {
  const htmlPath = join(TMP, target.out.replace(/\//g, '_') + '.html');
  const pngPath = join(SHOTS, target.out);
  mkdirSync(dirname(pngPath), { recursive: true });
  writeFileSync(htmlPath, buildHtml(target.dir, target.title), 'utf8');
  screenshot(htmlPath, pngPath);
  const size = existsSync(pngPath) ? readFileSync(pngPath).length : 0;
  results.push({ page: target.dir, file: 'shots/' + target.out, bytes: size });
  console.log('[preview] ' + target.dir + ' → shots/' + target.out + ' (' + size + ' bytes)');
}

rmSync(TMP, { recursive: true, force: true });
console.log('[preview] 共生成 ' + results.length + ' 张静态预览图（非微信开发者工具截图）');
