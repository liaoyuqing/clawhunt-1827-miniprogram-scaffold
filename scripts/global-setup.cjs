/**
 * Jest globalSetup：跑一遍 build-npm，保证干净克隆下 tdesign 组件也存在。
 */
const { execFileSync } = require('node:child_process');
const { dirname, join, resolve } = require('node:path');

const ROOT = resolve(__dirname, '..');

module.exports = function globalSetup() {
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'build-npm.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
};
