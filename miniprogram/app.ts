import { ENV } from './config/env';
import { bootstrapStores } from './stores/index';

App<IAppOption>({
  globalData: {
    launchedAt: 0,
    memberId: null,
  },

  onLaunch() {
    this.globalData.launchedAt = Date.now();
    bootstrapStores();
    // 启动信息只写本地日志，不外发；不接入任何第三方统计/埋点 SDK。
    console.info('[app] launched', {
      appId: ENV.appId,
      mockEnabled: ENV.mockEnabled,
      launchedAt: this.globalData.launchedAt,
    });
  },
});
