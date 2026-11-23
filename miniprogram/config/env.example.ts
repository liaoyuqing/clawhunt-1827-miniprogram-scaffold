// 复制为 config/env.ts 后填写本地值；config/env.ts 已在 .gitignore 中，不会进入仓库。
// 真实密钥、appid、生产域名只允许放在本文件或其等价的环境注入流程中。
export const LOCAL_OVERRIDES = {
  apiBaseUrl: 'http://127.0.0.1:8080',
  mockEnabled: true,
  appId: 'touristappid',
};
