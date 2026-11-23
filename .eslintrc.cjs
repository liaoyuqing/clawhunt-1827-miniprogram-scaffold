/* eslint-env node */
/**
 * ESLint 配置（flat config 之前的老格式，ESLint 8 通用）。
 *
 * 三套环境分开：
 *   miniprogram/**  小程序运行时（wx / Page / Component / App / getApp 全局）
 *   tests/** + scripts/**  Node + Jest
 * 规则用 @typescript-eslint recommended（非 type-aware，保证 lint 快且不需要 project 配置）。
 */
module.exports = {
  root: true,
  env: { es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'miniprogram/miniprogram_npm/',
    'shots/',
    'logs/',
    'dist/',
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    eqeqeq: ['error', 'always'],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      files: ['miniprogram/**/*.ts'],
      globals: {
        wx: 'readonly',
        App: 'readonly',
        Page: 'readonly',
        Component: 'readonly',
        Behavior: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
        requirePlugin: 'readonly',
      },
    },
    {
      files: ['tests/**/*.ts', 'scripts/**/*.mjs'],
      env: { node: true, jest: true },
    },
  ],
};
