// Test setup file
// This file runs before all tests

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  // Uncomment the next line to silence console.log during tests
  // log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.API_SECURITY_KEY = 'test-api-key';

// Mock dotenv config to prevent loading .env file during tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));
