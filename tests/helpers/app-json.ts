/**
 * app.json 读取与结构断言辅助（测试与 scripts/verify-app-json.mjs 共用同一份口径）。
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MINIPROGRAM_ROOT } from './render';

export interface AppJsonSubpackage {
  root: string;
  name?: string;
  pages: string[];
}

export interface AppJson {
  pages: string[];
  subpackages?: AppJsonSubpackage[];
  lazyCodeLoading?: string;
  tabBar?: { list: { pagePath: string; text: string }[] };
  window?: Record<string, unknown>;
}

export function readAppJson(): AppJson {
  const raw = fs.readFileSync(path.join(MINIPROGRAM_ROOT, 'app.json'), 'utf8');
  return JSON.parse(raw) as AppJson;
}

/** 一个页面目录下四件套的绝对路径 */
export function pageFileSet(pagePathWithoutExt: string): string[] {
  const base = path.join(MINIPROGRAM_ROOT, pagePathWithoutExt);
  return ['ts', 'json', 'wxml', 'wxss'].map((ext) => `${base}.${ext}`);
}
