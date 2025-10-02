// Test setup file
// This file runs before all tests

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.API_URL = 'http://localhost:3000';
process.env.API_SECURITY_KEY = 'test-api-key';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.E2E_REPORT_CRON_SCHEDULE = '0 9 * * *';
process.env.CLEAN_UP_OLD_REPORTS_CRON_SCHEDULE = '0 3 * * 0';

// Mock dotenv config to prevent loading .env file during tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock node-cron to prevent actual scheduling during tests
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn((expression: string) => {
    // Basic cron expression validation
    const parts = expression.split(' ');
    return parts.length >= 5 && parts.length <= 6;
  }),
}));

