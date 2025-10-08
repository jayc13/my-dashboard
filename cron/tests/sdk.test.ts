/**
 * SDK Utility Tests
 * 
 * Tests for the SDK initialization and configuration
 */

// Mock the SDK package
const mockSDK = {
  pullRequests: {
    getPullRequests: jest.fn(),
    getPullRequestDetails: jest.fn(),
  },
  jira: {
    getManualQATickets: jest.fn(),
  },
};

jest.mock('@my-dashboard/sdk', () => ({
  DashboardSDK: jest.fn().mockImplementation(() => mockSDK),
}));

describe('SDK Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear module cache to get fresh instances
    jest.resetModules();
  });

  describe('getSDK', () => {
    it('should create and return SDK instance', async () => {
      const { getSDK } = require('../src/utils/sdk');
      const sdk = await getSDK();

      expect(sdk).toBeDefined();
      expect(sdk.pullRequests).toBeDefined();
      expect(sdk.jira).toBeDefined();
    });

    it('should return singleton instance', async () => {
      const { getSDK } = require('../src/utils/sdk');
      const sdk1 = await getSDK();
      const sdk2 = await getSDK();

      expect(sdk1).toBe(sdk2);
    });

    it('should use environment variables for configuration', async () => {
      const originalUrl = process.env.API_URL;
      const originalKey = process.env.API_KEY;

      process.env.API_URL = 'https://test-api.example.com';
      process.env.API_KEY = 'test-key-123';

      jest.resetModules();
      const { getSDK } = require('../src/utils/sdk');
      const sdk = await getSDK();

      expect(sdk).toBeDefined();

      // Restore
      if (originalUrl) process.env.API_URL = originalUrl;
      else delete process.env.API_URL;
      if (originalKey) process.env.API_KEY = originalKey;
      else delete process.env.API_KEY;
    });

    it('should handle missing environment variables', async () => {
      const originalUrl = process.env.API_URL;
      const originalKey = process.env.API_KEY;

      delete process.env.API_URL;
      delete process.env.API_KEY;

      jest.resetModules();
      const { getSDK } = require('../src/utils/sdk');
      const sdk = await getSDK();

      expect(sdk).toBeDefined();

      // Restore
      if (originalUrl) process.env.API_URL = originalUrl;
      if (originalKey) process.env.API_KEY = originalKey;
    });
  });

  describe('SDK Methods', () => {
    it('should have pullRequests methods', async () => {
      const { getSDK } = require('../src/utils/sdk');
      const sdk = await getSDK();

      expect(sdk.pullRequests.getPullRequests).toBeDefined();
      expect(sdk.pullRequests.getPullRequestDetails).toBeDefined();
    });

    it('should have jira methods', async () => {
      const { getSDK } = require('../src/utils/sdk');
      const sdk = await getSDK();

      expect(sdk.jira.getManualQATickets).toBeDefined();
    });
  });
});

