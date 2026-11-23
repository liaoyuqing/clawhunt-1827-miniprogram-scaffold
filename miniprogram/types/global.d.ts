/// <reference types="miniprogram-api-typings" />

interface IAppGlobalData {
  /** 应用启动时间戳（毫秒），用于构建信息展示与埋点对齐（不外发） */
  launchedAt: number;
  /** 当前登录会员的 id；未登录为 null */
  memberId: string | null;
}

interface IAppOption {
  globalData: IAppGlobalData;
  onLaunch(): void;
}
