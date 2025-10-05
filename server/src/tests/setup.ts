// Test setup file
// This file runs before all tests

// Set test environment variables first (before any imports)
process.env.NODE_ENV = 'test';
process.env.API_SECURITY_KEY = 'test-api-key';
process.env.LOG_LEVEL = 'error'; // Only log errors during tests

// Mock dotenv config to prevent loading .env file during tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock the logger to reduce noise during testing
jest.mock('../utils/logger', () => ({
  Logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => ({
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      http: jest.fn(),
      debug: jest.fn(),
    })),
    getWinstonLogger: jest.fn(),
  },
}));

// Also mock console methods as a fallback
global.console = {
  ...console,
  // Uncomment the next line to silence console.log during tests
  // log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
