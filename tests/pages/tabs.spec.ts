/**
 * 5 个 tab 空页面的渲染断言。
 *
 * 这组用例是 AC1「5 个 tab 空页面均可打开」的替代证据之一：
 * 用 miniprogram-simulate 把每个页面目录当组件渲染，断言页面标题与占位文案
 * 真的出现在 DOM 里（说明 wxml 语法合法、页面文件齐备、组件引用可解析）。
 *
 * 本机没有微信开发者工具，无法提供开发者工具截图，所以配套证据是：
 *   scripts/verify-app-json.mjs  → 结构断言日志
 *   scripts/render-preview.mjs    → wxml/wxss 静态预览图（非开发者工具截图）
 */
import { renderComponent } from '../helpers/render';

const TABS: { dir: string; title: string }[] = [
  { dir: 'pages/home', title: '首页' },
  { dir: 'pages/resource', title: '商机' },
  { dir: 'pages/event', title: '活动' },
  { dir: 'pages/academy', title: '学院' },
  { dir: 'pages/mine', title: '我的' },
];

const mounted: { detach: () => void }[] = [];

function render(dir: string) {
  const page = renderComponent(dir);
  mounted.push(page);
  return page;
}

afterEach(() => {
  while (mounted.length) {
    const item = mounted.pop();
    if (item) item.detach();
  }
});

describe('5 个 tab 空页面', () => {
  it.each(TABS)('$dir 渲染出标题「$title」', ({ dir, title }) => {
    const page = render(dir);
    expect(page.text).toContain(title);
    expect(page.text).toContain('本页为工程骨架的占位空页');
  });

  it('首页真实渲染出 TDesign 的 t-button 组件', () => {
    const page = render('pages/home');
    expect(page.html).toContain('t-button');
    expect(page.text).toContain('开始使用');
  });

  it('五个页面互不相同（标题各不相同）', () => {
    const texts = TABS.map((tab) => render(tab.dir).text);
    expect(new Set(texts).size).toBe(TABS.length);
  });
});
