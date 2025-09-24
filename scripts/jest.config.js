module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!eslint.config.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000,
  maxWorkers: 1,
};
