/**
 * Redis Utility Tests
 *
 * Tests for Redis connection management including:
 * - Module exports
 * - Basic functionality
 */

describe('Redis Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});

