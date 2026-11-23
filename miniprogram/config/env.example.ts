/**
 * 环境注入示例（供第三方平台 / CI 参考）。
 *
 * 微信开发者工具会自动读取项目根目录的 ext.json（见 ext.json），
 * 第三方平台与 CI 则通过平台的 ext 配置注入同样的键名。
 *
 * 键名与 miniprogram/config/env.ts 的 EXT_KEYS 一一对应：
 *   env_api_base_url  接口基地址（占位 https://api.example.invalid）
 *   env_mock_enabled  是否走本地 mock（默认 true）
 *   env_app_id        小程序 appid（占位 touristappid）
 *
 * 真实 appid / 域名 / token 只允许出现在本机配置或 CI 环境里，仓库内一律占位。
 */
export const ENV_EXAMPLE = {
  env_api_base_url: 'https://api.example.invalid',
  env_mock_enabled: true,
  env_app_id: 'touristappid',
};
