/**
 * app.json 结构断言（AC3 + AC1 的替代证据之一）。
 *
 * 断言内容：
 *   1. tabBar.list 恰好 5 项，路径集合等于 pages/{home,resource,event,academy,mine}/index
 *   2. subpackages 恰好两个：root 为 pkg-resource 与 pkg-member，且各注册 ≥1 页面
 *   3. lazyCodeLoading === 'requiredComponents'
 *   4. app.json 里每个页面 / 分包页面的 wxml|wxss|json|ts 四件套在磁盘上真实存在
 *   5. 分包 root 目录真实存在
 *   6. app.json 中没有任何 https 外链（境外域名）
 *
 * 用法：node scripts/verify-app-json.mjs   （可加 --json 输出机器可读结果）
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP_JSON = join(ROOT, 'miniprogram', 'app.json');

const app = JSON.parse(readFileSync(APP_JSON, 'utf8'));

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

const EXPECTED_TABS = [
  'pages/home/index',
  'pages/resource/index',
  'pages/event/index',
  'pages/academy/index',
  'pages/mine/index',
];

const tabList = app.tabBar?.list ?? [];
check('tabBar.list 长度为 5', tabList.length === 5, `实际 ${tabList.length} 项`);
const tabPaths = tabList.map((item) => item.pagePath);
check(
  'tabBar 路径集合与预期一致',
  EXPECTED_TABS.every((p) => tabPaths.includes(p)) && tabPaths.length === EXPECTED_TABS.length,
  `实际 ${JSON.stringify(tabPaths)}`,
);
check(
  '每个 tab 都有中文标题',
  tabList.every((item) => typeof item.text === 'string' && item.text.length > 0),
  `标题 ${JSON.stringify(tabList.map((i) => i.text))}`,
);

const subpackages = app.subpackages ?? [];
const roots = subpackages.map((s) => s.root);
check('存在两个分包', subpackages.length === 2, `实际 ${subpackages.length} 个`);
check(
  '分包 root 为 pkg-resource 与 pkg-member',
  roots.includes('pkg-resource') && roots.includes('pkg-member'),
  `实际 ${JSON.stringify(roots)}`,
);
check(
  '每个分包至少注册 1 个页面',
  subpackages.every((s) => Array.isArray(s.pages) && s.pages.length >= 1),
  subpackages.map((s) => `${s.root}:${s.pages.length} 页`).join(', '),
);
check(
  'lazyCodeLoading 为 requiredComponents',
  app.lazyCodeLoading === 'requiredComponents',
  `实际 ${String(app.lazyCodeLoading)}`,
);

/** 页面四件套断言 */
const missing = [];
function assertPageSet(pagePath) {
  for (const ext of ['wxml', 'wxss', 'json', 'ts']) {
    const file = join(ROOT, 'miniprogram', `${pagePath}.${ext}`);
    if (!existsSync(file)) missing.push(`${pagePath}.${ext}`);
  }
}

for (const page of app.pages ?? []) assertPageSet(page);
for (const sub of subpackages) {
  for (const page of sub.pages ?? []) assertPageSet(`${sub.root}/${page}`);
  check(`分包目录存在 ${sub.root}`, existsSync(join(ROOT, 'miniprogram', sub.root)), sub.root);
}
check(
  '所有页面四件套（wxml/wxss/json/ts）齐全',
  missing.length === 0,
  missing.length ? `缺失 ${missing.join(', ')}` : '全部存在',
);

const appJsonText = readFileSync(APP_JSON, 'utf8');
const externalLinks = appJsonText.match(/https?:\/\/[^\s"']+/g) ?? [];
check('app.json 不含任何 http(s) 外链', externalLinks.length === 0, externalLinks.join(', '));

const failed = checks.filter((c) => !c.pass);
const lines = [];
lines.push('# app.json 结构断言结果');
lines.push('');
lines.push('断言文件：miniprogram/app.json');
lines.push(`断言项：${checks.length} 条，失败 ${failed.length} 条`);
lines.push('');
for (const c of checks) {
  lines.push(`- [${c.pass ? 'PASS' : 'FAIL'}] ${c.name} —— ${c.detail}`);
}
lines.push('');
lines.push(failed.length === 0 ? '结论：全部断言通过。' : '结论：存在失败断言。');
lines.push('');

const logDir = join(ROOT, 'logs');
mkdirSync(logDir, { recursive: true });
writeFileSync(join(logDir, 'verify-app-json.txt'), lines.join('\n'), 'utf8');

process.stdout.write(lines.join('\n'));
process.exit(failed.length === 0 ? 0 : 1);
