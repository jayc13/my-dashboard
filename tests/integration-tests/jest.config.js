module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  bail: true, // Stop test execution on first failure
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        target: 'es2020',
        allowJs: true,
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@my-dashboard|@my-dashboard/sdk|@my-dashboard/types)/)',
  ],
  testTimeout: 2 * 60 * 1000, // 2 min for integration tests
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@utils/dbCleanup$': '<rootDir>/src/utils/dbHelper.ts',
    '^@tests/(.*)$': '<rootDir>/src/tests/$1',
    '^@my-dashboard/sdk$': '<rootDir>/../../packages/sdk/src/index.ts',
    '^@my-dashboard/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  // Handle ES modules from @my-dashboard packages
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Test reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
    [
      'jest-html-reporter',
      {
        pageTitle: 'Integration Tests Report',
        outputPath: '<rootDir>/test-results/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        theme: 'defaultTheme',
        sort: 'status',
      },
    ],
  ],
};
