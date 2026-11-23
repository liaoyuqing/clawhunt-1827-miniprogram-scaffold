/** 我的 tab 页面。骨架阶段只做四件事：设置导航标题、挂载时写面包屑日志、
 * 预留数据加载钩子、卸载时清理订阅。业务渲染在后续工单补。 */
Page({
  data: {
    pageName: 'mine',
    loadedAt: 0,
  },

  onLoad() {
    this.setData({ loadedAt: Date.now() });
    console.info('[page] mine loaded');
  },

  onUnload() {
    console.info('[page] mine unloaded');
  },
});
