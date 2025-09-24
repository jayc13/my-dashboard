// Test setup file for integration tests
// This file runs before all tests

// Set test environment variables
import {cleanupDatabase} from "@utils/dbCleanup";

process.env.NODE_ENV = 'test';

// Mock console methods to reduce test noise (optional)
const originalConsole = { ...console };

beforeAll(() => {
  // You can mock console methods here if needed
  // console.log = jest.fn();
  // console.warn = jest.fn();
  // console.error = jest.fn();
});

afterAll(async () => {
  // Restore console methods
  Object.assign(console, originalConsole);
});

// Global test timeout
jest.setTimeout(30000); // 30 seconds for integration tests
