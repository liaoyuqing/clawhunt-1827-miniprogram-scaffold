/**
 * 示例组件单测：用 miniprogram-simulate 真实渲染 components/hello，
 * 断言属性透传、点击自增与样式落位 —— 这是本单「Jest + miniprogram-simulate 示例单测」的交付物。
 */
import simulate from 'miniprogram-simulate';
import { loadComponent } from '../helpers/render';

function mount(properties?: Record<string, unknown>) {
  const comp = simulate.render(loadComponent('components/hello', 'hello'), properties);
  comp.attach(document.createElement('parent-node'));
  if (!comp.dom) throw new Error('render failed: no dom');
  return comp;
}

describe('components/hello', () => {
  it('渲染默认文案', () => {
    const comp = mount();
    expect(comp.dom?.textContent).toContain('hello');
    expect(comp.dom?.textContent).toContain('点击 0 次');
  });

  it('属性透传：text 由父级传入并渲染到 .hello__text', () => {
    const comp = mount({ text: '会员空间' });
    const textNode = comp.querySelector('.hello__text');
    expect(textNode).toBeTruthy();
    expect(textNode?.dom?.textContent).toBe('会员空间');
  });

  it('点击自增：tap() 后 count 从 0 变 1，DOM 同步更新', () => {
    const comp = mount();
    expect(comp.dom?.textContent).toContain('点击 0 次');
    (comp.instance as unknown as { tap: () => void }).tap();
    expect(comp.dom?.textContent).toContain('点击 1 次');
  });

  it('样式落位：.hello__text 与 .hello__count 两个节点都存在，根节点带 hello 类', () => {
    const comp = mount();
    expect(comp.querySelector('.hello__text')).toBeTruthy();
    expect(comp.querySelector('.hello__count')).toBeTruthy();
    expect(comp.querySelector('.hello')).toBeTruthy();
  });
});
