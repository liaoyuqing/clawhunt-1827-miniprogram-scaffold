/**
 * Jest 全局 setup（setupFiles，早于测试文件执行）。
 *
 * 小程序里的 wx / getApp 是运行时注入的全局量；jsdom 下没有，所以这里补桩。
 * 桩只提供单测真正用到的最小表面，不做行为模拟。
 */
const g = globalThis as unknown as Record<string, unknown>;

g.getApp = () => ({ globalData: { launchedAt: 0, memberId: null } });

g.wx = {
  getExtConfigSync: () => ({}),
  request: () => undefined,
  showToast: () => undefined,
};

export {};
