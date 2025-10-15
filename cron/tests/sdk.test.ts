/**
 * SDK Utility Tests
 *
 * Tests for the SDK utility module including:
 * - SDK instance creation
 * - Singleton pattern
 * - Configuration
 * - Error handling
 */

describe('SDK Utility', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getSDK: () => Promise<any>;
  let mockMyDashboardAPI: jest.Mock;

  beforeEach(() => {
    // Clear all mocks and module cache
    jest.clearAllMocks();
    jest.resetModules();

    // Reset environment variables
    process.env.API_URL = 'http://localhost:3000';
    process.env.API_SECURITY_KEY = 'test-api-key';

    // Create mock MyDashboardAPI class
    mockMyDashboardAPI = jest.fn().mockImplementation((config) => ({
      config,
      todos: {
        getTodos: jest.fn(),
        deleteTodo: jest.fn(),
      },
      health: {
        getHealthStatus: jest.fn(),
      },
      jira: {
        getManualQATasks: jest.fn(),
      },
    }));

    // Mock the @my-dashboard/sdk module
    jest.doMock('@my-dashboard/sdk', () => ({
      MyDashboardAPI: mockMyDashboardAPI,
    }));

    // Import the module after mocking
    const sdkModule = require('../src/utils/sdk');
    getSDK = sdkModule.getSDK;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SDK Instance Creation', () => {
    it('should create SDK instance on first call', async () => {
      const sdk = await getSDK();

      expect(sdk).toBeDefined();
      expect(mockMyDashboardAPI).toHaveBeenCalledTimes(1);
    });

    it('should create SDK with correct configuration', async () => {
      await getSDK();

      expect(mockMyDashboardAPI).toHaveBeenCalledWith({
        baseUrl: 'http://localhost:3000',
        apiKey: 'test-api-key',
        retries: 3,
        timeout: 30000,
      });
    });

    it('should use API_URL from environment', async () => {
      process.env.API_URL = 'https://api.example.com';

      // Need to reload module to pick up new env var
      jest.resetModules();
      jest.doMock('@my-dashboard/sdk', () => ({
        MyDashboardAPI: mockMyDashboardAPI,
      }));
      const sdkModule = require('../src/utils/sdk');
      await sdkModule.getSDK();

      expect(mockMyDashboardAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://api.example.com',
        }),
      );
    });

    it('should use default baseUrl when API_URL is not set', async () => {
      delete process.env.API_URL;

      // Need to reload module to pick up new env var
      jest.resetModules();
      jest.doMock('@my-dashboard/sdk', () => ({
        MyDashboardAPI: mockMyDashboardAPI,
      }));
      const sdkModule = require('../src/utils/sdk');
      await sdkModule.getSDK();

      expect(mockMyDashboardAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'http://localhost:3000',
        }),
      );
    });

    it('should use API_SECURITY_KEY from environment', async () => {
      process.env.API_SECURITY_KEY = 'custom-api-key';

      // Need to reload module to pick up new env var
      jest.resetModules();
      jest.doMock('@my-dashboard/sdk', () => ({
        MyDashboardAPI: mockMyDashboardAPI,
      }));
      const sdkModule = require('../src/utils/sdk');
      await sdkModule.getSDK();

      expect(mockMyDashboardAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'custom-api-key',
        }),
      );
    });

    it('should set retries to 3', async () => {
      await getSDK();

      expect(mockMyDashboardAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          retries: 3,
        }),
      );
    });

    it('should set timeout to 30000', async () => {
      await getSDK();

      expect(mockMyDashboardAPI).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        }),
      );
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on subsequent calls', async () => {
      const sdk1 = await getSDK();
      const sdk2 = await getSDK();

      expect(sdk1).toBe(sdk2);
      expect(mockMyDashboardAPI).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent calls correctly', async () => {
      const [sdk1, sdk2, sdk3] = await Promise.all([
        getSDK(),
        getSDK(),
        getSDK(),
      ]);

      expect(sdk1).toBe(sdk2);
      expect(sdk2).toBe(sdk3);
      expect(mockMyDashboardAPI).toHaveBeenCalledTimes(1);
    });

    it('should return cached instance immediately after first call', async () => {
      await getSDK();
      const startTime = Date.now();
      await getSDK();
      const endTime = Date.now();

      // Second call should be instant (< 10ms)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when API_SECURITY_KEY is not set', async () => {
      delete process.env.API_SECURITY_KEY;

      // Need to reload module to pick up new env var
      jest.resetModules();
      jest.doMock('@my-dashboard/sdk', () => ({
        MyDashboardAPI: mockMyDashboardAPI,
      }));
      const sdkModule = require('../src/utils/sdk');

      await expect(sdkModule.getSDK()).rejects.toThrow(
        'API_SECURITY_KEY environment variable is required',
      );
    });

    it('should throw error when API_SECURITY_KEY is empty string', async () => {
      process.env.API_SECURITY_KEY = '';

      // Need to reload module to pick up new env var
      jest.resetModules();
      jest.doMock('@my-dashboard/sdk', () => ({
        MyDashboardAPI: mockMyDashboardAPI,
      }));
      const sdkModule = require('../src/utils/sdk');

      await expect(sdkModule.getSDK()).rejects.toThrow(
        'API_SECURITY_KEY environment variable is required',
      );
    });

    it('should not create instance when API_SECURITY_KEY is missing', async () => {
      delete process.env.API_SECURITY_KEY;

      // Need to reload module to pick up new env var
      jest.resetModules();
      jest.doMock('@my-dashboard/sdk', () => ({
        MyDashboardAPI: mockMyDashboardAPI,
      }));
      const sdkModule = require('../src/utils/sdk');

      try {
        await sdkModule.getSDK();
      } catch {
        // Expected error
      }

      expect(mockMyDashboardAPI).not.toHaveBeenCalled();
    });
  });

  describe('SDK Instance Properties', () => {
    it('should have todos service', async () => {
      const sdk = await getSDK();

      expect(sdk.todos).toBeDefined();
      expect(sdk.todos.getTodos).toBeDefined();
      expect(sdk.todos.deleteTodo).toBeDefined();
    });

    it('should have health service', async () => {
      const sdk = await getSDK();

      expect(sdk.health).toBeDefined();
      expect(sdk.health.getHealthStatus).toBeDefined();
    });

    it('should have jira service', async () => {
      const sdk = await getSDK();

      expect(sdk.jira).toBeDefined();
      expect(sdk.jira.getManualQATasks).toBeDefined();
    });
  });

  describe('Module Behavior', () => {
    it('should be a function', () => {
      expect(typeof getSDK).toBe('function');
    });

    it('should return a promise', () => {
      const result = getSDK();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should be callable multiple times', async () => {
      await expect(getSDK()).resolves.toBeDefined();
      await expect(getSDK()).resolves.toBeDefined();
      await expect(getSDK()).resolves.toBeDefined();
    });
  });

  describe('Promise Caching', () => {
    it('should cache promise during initialization', async () => {
      // Start multiple calls simultaneously
      const promise1 = getSDK();
      const promise2 = getSDK();

      // Both should resolve to the same instance
      const [sdk1, sdk2] = await Promise.all([promise1, promise2]);

      expect(sdk1).toBe(sdk2);
      expect(mockMyDashboardAPI).toHaveBeenCalledTimes(1);
    });

    it('should handle promise rejection correctly', async () => {
      // Mock import to throw error
      jest.resetModules();
      jest.doMock('@my-dashboard/sdk', () => {
        throw new Error('Module import failed');
      });

      const sdkModule = require('../src/utils/sdk');

      await expect(sdkModule.getSDK()).rejects.toThrow('Module import failed');
    });
  });
});

export {};

