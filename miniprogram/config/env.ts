/**
 * 环境配置（只含占位值，仓库里永远不出现真实密钥 / 真实域名 / 真实 appid）。
 *
 * 小程序端没有 process.env，配置一律从「环境注入」读取，两条路径：
 *   1) extConfig：微信开发者工具读取项目根目录的 ext.json，或第三方平台 / CI 注入；
 *      取值走 wx.getExtConfigSync()，键名见 ext.json。
 *   2) 占位默认值：所有键都有安全默认值，默认走本地 mock，不发任何网络请求。
 *
 * 真实 appid / 域名 / token 由买家在本机或 CI 注入，不入库。
 */

export interface AppEnv {
  /** 接口基地址；默认是 .invalid 占位域名，DNS 不存在，不会真的发请求 */
  apiBaseUrl: string;
  /** 是否使用本地 mock 数据（默认 true：无后端也能跑通全部页面） */
  mockEnabled: boolean;
  /** 小程序 appid；占位值由 project.config.json 注入 */
  appId: string;
}

const PLACEHOLDER: AppEnv = {
  apiBaseUrl: 'https://api.example.invalid',
  mockEnabled: true,
  appId: 'touristappid',
};

/** ext.json 的键名 → AppEnv 字段 */
const EXT_KEYS: Record<string, keyof AppEnv> = {
  env_api_base_url: 'apiBaseUrl',
  env_mock_enabled: 'mockEnabled',
  env_app_id: 'appId',
};

/**
 * 读取 extConfig 中的覆盖项；没有注入时回落占位值，
 * 保证 CI 与本地零配置可跑。
 */
export function loadEnv(): AppEnv {
  let ext: Record<string, unknown> = {};
  try {
    ext = (wx.getExtConfigSync() as Record<string, unknown>) || {};
  } catch {
    ext = {};
  }

  const result: AppEnv = { ...PLACEHOLDER };
  for (const [extKey, field] of Object.entries(EXT_KEYS)) {
    const value = ext[extKey];
    if (value === undefined || value === null || value === '') continue;
    if (field === 'mockEnabled') {
      result.mockEnabled = value === true || value === 'true';
    } else if (typeof value === 'string') {
      result[field] = value;
    }
  }
  return result;
}

export const ENV: AppEnv = loadEnv();
