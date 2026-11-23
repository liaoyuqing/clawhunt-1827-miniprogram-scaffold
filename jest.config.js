/**
 * Jest 配置。
 *
 * 双 transform：
 *   .ts  → ts-jest（直接吃源码，不用先 tsc）
 *   .js  → babel-jest（tdesign-miniprogram 的 miniprogram_dist 是 ESM 打包产物，
 *          node 下不能直接 require，需要先降级成 CJS）
 * 环境为 jsdom：miniprogram-simulate 依赖 DOM 才能渲染自定义组件。
 * globalSetup 跑 build-npm，保证干净克隆下 miniprogram_npm 里也有 tdesign 组件。
 * --runInBand：模拟器会注册全局构造器，串行执行可避免 worker 退出告警。
 */
module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: { url: 'https://jest.test' },
  roots: ['<rootDir>/tests'],
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  globalSetup: '<rootDir>/scripts/global-setup.cjs',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
    '^.+\\.m?js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(miniprogram-simulate|j-component|tdesign-miniprogram)/)',
  ],
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json'],
  collectCoverageFrom: ['miniprogram/utils/**/*.ts', 'miniprogram/stores/**/*.ts'],
  clearMocks: true,
};
