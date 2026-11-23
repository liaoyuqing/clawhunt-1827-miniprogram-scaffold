/**
 * 境外统计 / 埋点 / 崩溃上报 SDK 扫描（AC4）。
 *
 * 扫描面：
 *   1. package.json 的 dependencies + devDependencies 全部包名，匹配黑名单；
 *   2. 全仓文本文件里是否出现境外统计域名；
 *   3. app.json 是否声明了 plugins / preloadRule（第三方插件的挂载点）。
 *
 * 黑名单放在 scripts/tracking-blacklist.json（本脚本与该数据文件自身含这些字符串，
 * 所以扫描时跳过这两个文件，避免自己命中自己）。
 * 用法：node scripts/check-no-tracking-sdk.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SELF = relative(ROOT, fileURLToPath(import.meta.url))
  .split('\\')
  .join('/');
const BLACKLIST_FILE = 'scripts/tracking-blacklist.json';

const blacklist = JSON.parse(readFileSync(join(ROOT, BLACKLIST_FILE), 'utf8'));
const SDK_BLACKLIST = blacklist.sdkFamilies;
const DOMAIN_BLACKLIST = blacklist.domains;

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'coverage',
  'miniprogram_npm',
  'logs',
  'shots',
  '.husky',
]);
const TEXT_EXT = new Set([
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.wxml',
  '.wxss',
  '.md',
  '.yml',
  '.yaml',
  '.txt',
  '.html',
  '.css',
  '.less',
]);
/** 这些文件含黑名单字面量，扫描时跳过 */
const SKIP_FILES = new Set([SELF, BLACKLIST_FILE]);

const findings = [];

// ---- 1. 依赖包名 ----
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
const depNames = Object.keys(deps);
for (const name of depNames) {
  const lower = name.toLowerCase();
  for (const banned of SDK_BLACKLIST) {
    if (lower.includes(banned.toLowerCase())) {
      findings.push('依赖包名命中黑名单: ' + name + '（匹配 ' + banned + '）');
    }
  }
}

// ---- 2. 全文扫描 ----
function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (!TEXT_EXT.has(ext)) continue;
      const rel = relative(ROOT, join(dir, entry.name)).split('\\').join('/');
      if (SKIP_FILES.has(rel)) continue;
      out.push(join(dir, entry.name));
    }
  }
}

const files = [];
walk(ROOT, files);
for (const file of files) {
  const text = readFileSync(file, 'utf8').toLowerCase();
  for (const domain of DOMAIN_BLACKLIST) {
    if (text.includes(domain)) {
      findings.push('文件 ' + relative(ROOT, file) + ' 命中境外统计域名: ' + domain);
    }
  }
}

// ---- 3. app.json plugins / preloadRule ----
const app = JSON.parse(readFileSync(join(ROOT, 'miniprogram', 'app.json'), 'utf8'));
if (app.plugins) findings.push('app.json 声明了 plugins（第三方插件挂载点）');
if (app.preloadRule) findings.push('app.json 声明了 preloadRule（第三方插件预加载）');

const lines = [];
lines.push('# 境外统计 / 埋点 / 崩溃上报 SDK 扫描结果');
lines.push('');
lines.push(
  '依赖包扫描：' +
    depNames.length +
    ' 个包（dependencies ' +
    Object.keys(pkg.dependencies ?? {}).length +
    ' + devDependencies ' +
    Object.keys(pkg.devDependencies ?? {}).length +
    '）',
);
lines.push('文件扫描：' + files.length + ' 个文本文件（已跳过黑名单数据文件本身）');
lines.push('命中：' + findings.length + ' 条');
lines.push('');
lines.push('实际依赖清单：');
for (const name of depNames) lines.push('- ' + name + '@' + deps[name]);
lines.push('');
if (findings.length) {
  for (const f of findings) lines.push('- [FAIL] ' + f);
} else {
  lines.push(
    '- [PASS] 无任何境外统计/埋点/崩溃上报 SDK：依赖包名、境外统计域名文本、app.json 插件挂载点三面扫描均 0 命中',
  );
}
lines.push('');

const logDir = join(ROOT, 'logs');
mkdirSync(logDir, { recursive: true });
writeFileSync(join(logDir, 'check-no-tracking-sdk.txt'), lines.join('\n'), 'utf8');

process.stdout.write(lines.join('\n'));
process.exit(findings.length === 0 ? 0 : 1);
