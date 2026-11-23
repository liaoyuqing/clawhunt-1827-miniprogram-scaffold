/**
 * 示例自定义组件：本单的唯一组件，用来演示「组件四件套 + 单测」的最小闭环,
 * 也是 miniprogram-simulate 单测的被测对象（tests/components/hello.spec.ts）。
 */
Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    /** 主文案，父页面传入 */
    text: {
      type: String,
      value: 'hello',
    },
  },

  data: {
    count: 0,
  },

  methods: {
    /** 点击自增；单测里直接调用以验证 setData 生效 */
    tap(): void {
      this.setData({ count: this.data.count + 1 });
    },
  },
});
