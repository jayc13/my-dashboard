module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        target: 'es2020',
        allowJs: true
      }
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@my-dashboard|@my-dashboard/sdk|@my-dashboard/types)/)'
  ],
  testTimeout: 30000, // 30 seconds for integration tests
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@tests/(.*)$': '<rootDir>/src/tests/$1',
    '^@my-dashboard/sdk$': '<rootDir>/../../packages/sdk/src/index.ts',
    '^@my-dashboard/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  // Handle ES modules from @my-dashboard packages
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json']
};
