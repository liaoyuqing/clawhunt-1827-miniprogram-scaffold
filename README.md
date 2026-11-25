# 会员空间小程序工程脚手架（ClawHunt 1827）

微信原生小程序工程骨架：**TypeScript（strict）+ TDesign（tdesign-miniprogram）+ 5 个 tab 空页 + 2 个分包**。
本仓库只交付「地基」：目录骨架、工程配置、示例组件与示例单测，不含业务页面实现。

---

## 一、环境要求

| 项             | 版本                 | 说明                            |
| -------------- | -------------------- | ------------------------------- |
| Node.js        | ≥ 18（实测 26.13.1） | npm ≥ 9（实测 11.20.0）         |
| 微信开发者工具 | 稳定版（实测 2.02.2608080） | 基础库最低 **3.0.0**（实测 3.17.5） |
| 微信 appid     | 占位 `touristappid`  | 真实 appid 由环境注入，见第四节 |

## 二、快速开始

```bash
# 1. 安装依赖
npm install

# 2. 三条自检命令（全部以 0 退出）
npm run lint        # ESLint，--max-warnings 0
npm run typecheck   # tsc --noEmit（strict 模式）
npm run test        # Jest + miniprogram-simulate

# 3. 汇总自检 + 工程配置断言 + 境外 SDK 扫描
npm run verify
```

预期输出（实测）：

```
npm run lint      → 无输出，exit code 0
npm run typecheck → 无输出，exit code 0
npm run test      → Test Suites: 2 passed, 2 total
                       Tests:       11 passed, 11 total
```

## 三、目录结构

```
miniprogram/
├── app.ts / app.json / app.wxss     # 应用入口、页面与分包注册、主题引入
├── config/env.ts                    # 环境变量读取（地址 / mock 开关 / appid）
├── pages/                           # 5 个 tab 空页：home/resource/event/academy/mine
├── pkg-resource/                    # 分包一：资源详情、发布、我的发布
├── pkg-member/                      # 分包二：实名认证、资料维护
├── components/hello/                # 示例自定义组件（四件套）
├── services/                        # 接口层：http / resource / event / member
├── stores/                          # 全局状态：core（微型 store）、resource、member
├── utils/                           # uuid / money / format
├── mock/                            # 虚构测试数据
├── styles/                          # theme.wxss（设计 token）+ common.wxss
└── types/                           # models.ts + global.d.ts
scripts/                             # build-npm / verify-app-json / check-no-tracking-sdk / render-preview
tests/                               # Jest 单测（miniprogram-simulate 渲染断言）
logs/                                # 三条命令与断言脚本的真实输出
shots/                               # ac1-tabs/ = 开发者工具模拟器实拍；tabs/、subpackages/ = wxml/wxss 静态预览图（非开发者工具截图）
```

## 四、环境变量与密钥

小程序端没有 `process.env`，所以配置一律走 **`wx.getExtConfigSync()` 注入**：微信开发者工具自动读取项目根目录的 `ext.json`，第三方平台与 CI 则通过平台配置注入同样的键名。`miniprogram/config/env.ts` 入库，但**只有占位值**（真实 appid / 域名 / token 只允许出现在本机配置或 CI 环境变量里，永远不进仓库）。

| 注入键             | 含义            | 默认值                                                  |
| ------------------ | --------------- | ------------------------------------------------------- |
| `env_api_base_url` | 接口基地址      | `https://api.example.invalid`（无效占位，不会真发请求） |
| `env_mock_enabled` | 是否走本地 mock | `true`                                                  |
| `env_app_id`       | 小程序 appid    | `touristappid`                                          |

**默认全 mock，不需要后端、不需要任何密钥、不发任何网络请求**，克隆即可跑。

## 五、在微信开发者工具里导入

1. 打开「微信开发者工具」→「导入项目」；
2. 目录选择本仓库根目录（含 `project.config.json` 的那一层）；
3. AppID 选「测试号」或填自己的 appid（`project.config.json` 里是占位 `touristappid`，**导入后请替换成自己的**）；
4. 基础库选 **3.0.0 或以上**（`project.config.json` 的 `libVersion` 写的是本次实测用的 `3.17.5`；低到 3.0.0 也可，但需本机已下载该版本）；
5. TypeScript 编译：工具栏「设置 → 项目设置 → TypeScript」开启，或在 `project.config.json` 里确认 `setting.useCompilerPlugins` 含 `typescript`；
6. **点「工具 → 构建 npm」**：这一步把 `node_modules/tdesign-miniprogram/miniprogram_dist` 打包到 `miniprogram/miniprogram_npm/tdesign-miniprogram/`；
   - 该目录是构建产物，**不入库**；
   - 该步骤依赖 `project.config.json` 的 `setting.packNpmManually` = `true` 与 `packNpmRelationList` = `[{packageJsonPath: "./package.json", miniprogramNpmDistDir: "./miniprogram/"}]`（本仓库已配好），缺这两项工具会报 `__NO_NODE_MODULES__`；
   - 本仓库提供了等价脚本 `npm run build:npm`（Node 实现，CI 与单测用），效果与开发者工具的「构建 npm」一致；
7. 编译后即可在模拟器里点击底部 5 个 tab：首页 / 商机 / 活动 / 学院 / 我的。

> ⚠️ `miniprogram/pages/home/index.json` 里 `t-button` 指向 `../../miniprogram_npm/tdesign-miniprogram/button/button`，
> 所以 **必须先执行「构建 npm」再编译**，否则首页的 TDesign 按钮会报「组件未找到」。

## 六、接口对接清单（当前全部是 mock）

| 服务 | 对接点                                                                       | 当前实现                                     |
| ---- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| 商机 | `GET /v1/resources`、`GET /v1/resources/:id`                                 | `services/resource.ts` → `mock/resources.ts` |
| 活动 | `GET /v1/events`                                                             | `services/event.ts` → `mock/events.ts`       |
| 会员 | `GET /v1/member/profile`、`POST /v1/member/verify`、`PUT /v1/member/profile` | `services/member.ts` → `mock/member.ts`      |

把 `env_mock_enabled` 置为 `false` 后，`services/http.ts` 会走真实的 `wx.request`。

## 七、全项目统一约定

- 业务表统一含 `id`(UUID) / `org_id` / `site_id` / `created_at` / `created_by` / `updated_at` / `deleted_at`，见 `miniprogram/types/models.ts`；
- 金额一律以**分**存整数，展示时才用 `utils/money.ts` 的 `centsToYuan()` 转换；
- 配置与密钥只从环境变量读取，不写死在代码里；
- **不引入任何向境外发送数据的统计、埋点、崩溃上报 SDK**（`npm run verify:sdk` 三面扫描强制 0 命中）；
- 只用虚构测试数据，仓库内不出现任何客户名称。

## 八、主题变量

`miniprogram/styles/theme.wxss` 定义设计 token：主色 `--color-primary`、辅助色 `--color-success/warning/error/info`、
圆角 `--radius-sm/md/lg/pill`、间距 `--sp-1` … `--sp-8`（**全部是 8 的倍数**，8rpx…64rpx）。

## 九、仓库自带的校验脚本

| 命令                    | 作用                                                                             | 断言日志                                      |
| ----------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| `npm run verify:app`    | app.json 结构断言：5 个 tab、2 个分包、`lazyCodeLoading`、页面四件套齐全、无外链 | `logs/verify-app-json.txt`                    |
| `npm run verify:sdk`    | 境外统计/埋点/崩溃 SDK 扫描：依赖包名 + 境外域名文本 + app.json 插件挂载点       | `logs/check-no-tracking-sdk.txt`              |
| `npm run preview:shots` | 由 wxml/wxss 生成静态预览图                                                      | `shots/tabs/*.png`、`shots/subpackages/*.png` |

## 十、微信开发者工具实测记录（2026-11-25，本机）

### 10.1 截图来源与运行环境

本仓库 `shots/ac1-tabs/` 下的 5 张图是**微信开发者工具模拟器里的真实运行截图**，不是 wxml/wxss 转 HTML 生成的静态预览图。来源与版本如下：

| 项 | 实测值 |
| --- | --- |
| 截图来源 | 本机微信开发者工具「模拟器」面板，用工具自动化接口 `simulator_screenshot` 直接截取（原始 PNG，未转 JPEG） |
| 开发者工具版本 | **Stable 2.02.2608080** |
| 基础库版本 | **3.17.5**（模拟器 `systemInfo.SDKVersion` 读回值） |
| 模拟器机型 | **iPhone 12/13 (Pro)**（`systemInfo.model`；platform=`devtools`，iOS 10.0.1，pixelRatio=3） |
| 工程 appid | 入库的 `project.config.json` 仍为占位 **`touristappid`** |
| 本机验证 appid | 开发者工具可用的**测试号**，只写在 `project.private.config.json`（该文件已加入 `.gitignore`，**不入库**） |

> 说明：`touristappid`（游客模式）与测试号都可以导入工程。本次实测为了让模拟器真正跑起来，用测试号覆盖 appid，其余设置全部取自仓库里的 `project.config.json`。

### 10.2 复现步骤（工具内实际执行顺序）

1. 打开「微信开发者工具」→「导入项目」，目录选本仓库根目录（含 `project.config.json` 的那一层），AppID 选「测试号」或填自己的 appid；
2. 基础库选 3.0.0 以上（本次用 3.17.5）；
3. **点「工具 → 构建 npm」**——必须先做这一步。本仓库 `setting.packNpmManually=true`、`packNpmRelationList` 已配好，本次构建返回 `{"cost":7672,"warnings":[]}`，产物落在 `miniprogram/miniprogram_npm/tdesign-miniprogram/`（1191 个文件，不入库）；
4. **点「工具 → 编译」**（等价 `Ctrl+R`）；
5. 在模拟器底部依次点 5 个 tab：首页 / 商机 / 活动 / 学院 / 我的，每页截图。

### 10.3 5 个 tab 的截图与对应页面

| 截图 | 对应页面 | route | 页面标题 | 底部 tabBar 高亮 |
| --- | --- | --- | --- | --- |
| [`shots/ac1-tabs/home.png`](shots/ac1-tabs/home.png) | 首页 | `/pages/home/index` | 首页 | 首页 |
| [`shots/ac1-tabs/resource.png`](shots/ac1-tabs/resource.png) | 商机 | `/pages/resource/index` | 商机 | 商机 |
| [`shots/ac1-tabs/event.png`](shots/ac1-tabs/event.png) | 活动 | `/pages/event/index` | 活动 | 活动 |
| [`shots/ac1-tabs/academy.png`](shots/ac1-tabs/academy.png) | 学院 | `/pages/academy/index` | 学院 | 学院 |
| [`shots/ac1-tabs/mine.png`](shots/ac1-tabs/mine.png) | 我的 | `/pages/mine/index` | 我的 | 我的 |

5 张图都是同一次运行里连续切换截下的原始 PNG（423×914）。切换用 `switchTab`（不是 `openPage`），所以每张图的 tabBar 高亮与页内标题都对得上。逐页读回的 route / title / pageId、构建 npm 返回值、console 检查、截图 SHA256 全部记在 [`logs/ac1-devtools-run.txt`](logs/ac1-devtools-run.txt)。

### 10.4 CLI 编译输出

[`logs/ac1-devtools-compile.txt`](logs/ac1-devtools-compile.txt) 是工具自带编译器对全部页面逐个编译的输出：**wxml 11/11 success、wxss 14/14 success**（`compile_wxml` / `compile_wxss`，MCP `wechatide` 通道），该遍 `retried=0`，没有任何一个文件需要重试。

### 10.5 基础库最低版本与本次用 3.17.5 的原因

工程对基础库的要求仍是**最低 3.0.0**（不依赖更高版本才有的 API）。本次实测用 3.17.5，原因是本机 `WeappVendor` 只缓存了 3.17.2–3.17.6，没有 3.0.0 可供离线选择；这与工程要求不冲突——3.0.0 以上的版本都能跑。`project.config.json` 的 `libVersion` 写 3.17.5 是为了让导入后默认命中已缓存的版本，换机器时按本机已下载的版本调整即可。

### 10.6 关于仓库里另外两类图（**不是**验收 1 的证据）

`shots/tabs/`、`shots/subpackages/` 是由 `scripts/render-preview` 把 wxml/wxss 转成 HTML 再截的**静态预览图**，图上已标「不是开发者工具截图」；`logs/verify-app-json.txt` 是 app.json 的结构断言；`tests/` 里的 `miniprogram-simulate` 是把页面目录当组件渲染的单测。这三类证据**只能佐证工程结构与渲染，不能证明「开发者工具导入后可编译运行」**，验收 1 请以 10.1–10.4 的截图与编译输出为准。

### 10.7 2026-11-24 的历史记录（保留，供追溯）

下面这段是上一轮在没有可用 appid、工具未登录时的实测记录，结论已被 10.1–10.4 取代，仅作追溯保留：

<details>
<summary>2026-11-24 记录（当时未拿到可用 appid，模拟器截图不可得）</summary>

工具版本 **Stable 2.02.2608080**，工程 appid 为占位 `touristappid`，本机未登录。实测结论分两部分：

**工程导入与编译（成功）**

- 以 `微信开发者工具.exe --project <仓库根>` 启动后，工具日志打印 `[backend initEnv] project ready, projectpath=...`，
  `CompileCache` 逐个读到 app.json 的 **5 个 tab 页**与 **2 个分包共 10 个页面**，并 `[createAppService]` 建立 appservice 容器；
- 用工具自带的同一套编译器（`resources/app.asar.unpacked/node_modules/wcc-exec/`）对全部页面编译：
  `wcc.exe -d` **11/11** 个 wxml 全部 `exit=0`（产物 40182–40612 字节），`wcsc.exe` **14/14** 个 wxss 全部 `exit=0`；
- AC2 的三条命令与退出码在同一台机器上重跑并连退出码一起记录：[`logs/ac2-terminal.txt`](logs/ac2-terminal.txt)（`npm run lint` / `npm run typecheck` / `npm run test` 各自 `[exit code: 0]`，Node v26.13.1 / npm 11.20.0）；
- 逐条记录见 [`logs/devtools-compile.txt`](logs/devtools-compile.txt)，导入与构建过程见 [`logs/devtools-import.txt`](logs/devtools-import.txt)，
  界面截图见 [`shots/devtools/`](shots/devtools/)（工程已加载 / 信任弹窗 / 工具→编译菜单）。

**模拟器运行截图（未能产出）**

- 工具未登录，模拟器停在「未登录」二维码弹窗；appid 为 `touristappid` 时工具日志明确拒绝：
  `[automation_game] formatProject reject tourist/empty appid { appid: 'touristappid', isTouristAppid: true }`；
- 点「工具 → 编译」后日志出现 `[SimulatorService] simulator app compile`，但 appservice webview 未 `loadstop`，
  模拟器始终显示工具欢迎页，**没有进入真实首页**。缺真实 appid 且无法登录，这一项在本机不可得，不做伪造。
  拿到测试号 appid 后按第五节导入即可补齐 5 个 tab 的运行截图。

**2026-11-24 追加的两条实测（都不改变上面的结论）**

- 把 `libVersion` 从 `3.0.0`（本机未缓存该版本）改成已缓存的 `3.17.5` 后重开工程：工程照旧加载成功、
  `CompileCache` 照旧枚举 10 个页面，但 `appservice webview loadstop` 与 `simulator launch success` 仍然**都没有出现**，
  模拟器仍是欢迎页。所以先前卡的环节不是基础库版本没对上（`WeappVendor` 里只缓存了 3.17.2–3.17.6，没有 3.0.0）。
- 在工具里手动按「工具 → 编译」（等价 `Ctrl+R`）：日志出现新的 `simulator app before compile` / `simulator app compile`，
  说明编译动作本身被触发并进入模拟器编译阶段，但没有一条走到 `loadstop`。
**顺带修复的工程缺陷**：`project.config.json` 的 `editorSetting.tabIndent` 原写 `"space"`，工具校验只接受
`auto` / `insertSpaces` / `tab`，原值触发 `getAppJSON error` 导致整包拒绝加载；已改为 `"insertSpaces"`。

</details>

## 十一、许可

MIT