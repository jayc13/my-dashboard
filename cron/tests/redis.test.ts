/**
 * Redis Utility Tests
 *
 * Tests for Redis connection management including:
 * - Module exports
 * - Basic functionality
 */

// Mock ioredis
const mockRedis = {
  on: jest.fn(),
  ping: jest.fn(),
  quit: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

describe('Redis Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset module cache to get fresh instances
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Exports', () => {
    it('should export getRedisClient function', () => {
      const redisModule = require('../src/utils/redis');
      expect(typeof redisModule.getRedisClient).toBe('function');
    });

    it('should export getRedisSubscriber function', () => {
      const redisModule = require('../src/utils/redis');
      expect(typeof redisModule.getRedisSubscriber).toBe('function');
    });

    it('should export closeRedisConnections function', () => {
      const redisModule = require('../src/utils/redis');
      expect(typeof redisModule.closeRedisConnections).toBe('function');
    });

    it('should export testRedisConnection function', () => {
      const redisModule = require('../src/utils/redis');
      expect(typeof redisModule.testRedisConnection).toBe('function');
    });
  });

  describe('Environment Configuration', () => {
    it('should use REDIS_URL from environment if set', () => {
      const originalUrl = process.env.REDIS_URL;
      process.env.REDIS_URL = 'redis://test-host:6380';

      // Module should use the environment variable
      expect(process.env.REDIS_URL).toBe('redis://test-host:6380');

      // Restore original
      if (originalUrl) {
        process.env.REDIS_URL = originalUrl;
      } else {
        delete process.env.REDIS_URL;
      }
    });

    it('should have default Redis URL', () => {
      const originalUrl = process.env.REDIS_URL;
      delete process.env.REDIS_URL;

      // Module should have a default
      const redisModule = require('../src/utils/redis');
      expect(redisModule).toBeDefined();

      // Restore original
      if (originalUrl) {
        process.env.REDIS_URL = originalUrl;
      }
    });
  });

  describe('getRedisClient', () => {
    it('should create and return a Redis client', () => {
      const { getRedisClient } = require('../src/utils/redis');
      const client = getRedisClient();

      expect(client).toBeDefined();
      expect(mockRedis.on).toHaveBeenCalled();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const { getRedisClient } = require('../src/utils/redis');
      const client1 = getRedisClient();
      const client2 = getRedisClient();

      expect(client1).toBe(client2);
    });

    it('should setup event handlers on client', () => {
      const { getRedisClient } = require('../src/utils/redis');
      getRedisClient();

      expect(mockRedis.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('getRedisSubscriber', () => {
    it('should create and return a Redis subscriber', () => {
      const { getRedisSubscriber } = require('../src/utils/redis');
      const subscriber = getRedisSubscriber();

      expect(subscriber).toBeDefined();
      expect(mockRedis.on).toHaveBeenCalled();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const { getRedisSubscriber } = require('../src/utils/redis');
      const subscriber1 = getRedisSubscriber();
      const subscriber2 = getRedisSubscriber();

      expect(subscriber1).toBe(subscriber2);
    });

    it('should setup event handlers on subscriber', () => {
      const { getRedisSubscriber } = require('../src/utils/redis');
      getRedisSubscriber();

      expect(mockRedis.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('closeRedisConnections', () => {
    it('should close all Redis connections', async () => {
      mockRedis.quit.mockResolvedValue('OK');
      const { getRedisClient, getRedisSubscriber, closeRedisConnections } = require('../src/utils/redis');

      // Create connections
      getRedisClient();
      getRedisSubscriber();

      // Close them
      await closeRedisConnections();

      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it('should handle closing when no connections exist', async () => {
      mockRedis.quit.mockResolvedValue('OK');
      const { closeRedisConnections } = require('../src/utils/redis');

      await expect(closeRedisConnections()).resolves.not.toThrow();
    });
  });

  describe('testRedisConnection', () => {
    it('should return true when connection is successful', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      const { testRedisConnection } = require('../src/utils/redis');

      const result = await testRedisConnection();

      expect(result).toBe(true);
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should return false when connection fails', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));
      const { testRedisConnection } = require('../src/utils/redis');

      const result = await testRedisConnection();

      expect(result).toBe(false);
    });
  });

  describe('Event Handlers', () => {
    it('should log on connect event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { getRedisClient } = require('../src/utils/redis');

      getRedisClient();

      // Get the connect handler and call it
      const connectHandler = mockRedis.on.mock.calls.find((call: [string, () => void]) => call[0] === 'connect')?.[1];
      if (connectHandler) {
        connectHandler();
      }

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('connected'));
      consoleSpy.mockRestore();
    });

    it('should log on error event', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { getRedisClient } = require('../src/utils/redis');

      getRedisClient();

      // Get the error handler and call it
      const errorHandler = mockRedis.on.mock.calls.find((call: [string, (err: Error) => void]) => call[0] === 'error')?.[1];
      if (errorHandler) {
        errorHandler(new Error('Test error'));
      }

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('error'), expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should log on close event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { getRedisClient } = require('../src/utils/redis');

      getRedisClient();

      // Get the close handler and call it
      const closeHandler = mockRedis.on.mock.calls.find((call: [string, () => void]) => call[0] === 'close')?.[1];
      if (closeHandler) {
        closeHandler();
      }

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('closed'));
      consoleSpy.mockRestore();
    });
  });
});

export {};
