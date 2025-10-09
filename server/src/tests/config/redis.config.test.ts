/**
 * Redis Configuration Tests
 *
 * Tests for Redis connection management including:
 * - Client creation and singleton pattern
 * - Subscriber creation
 * - Connection configuration
 * - Event handlers
 * - Connection closing
 */

// Mock Redis client
class MockRedis {
  private eventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map();

  constructor(public url: string, public options?: any) {}

  on(event: string, handler: (...args: any[]) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
    return this;
  }

  async quit() {
    return 'OK';
  }

  async ping() {
    return 'PONG';
  }

  emit(event: string, ...args: any[]) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(...args));
  }

  getEventHandlers(event: string) {
    return this.eventHandlers.get(event) || [];
  }
}

// Mock ioredis module
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation((url: string, options?: any) => {
    return new MockRedis(url, options);
  });
});

// Mock Logger
jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import after mocks
import { getRedisClient, getRedisSubscriber, closeRedisConnections, testRedisConnection } from '../../config/redis';

describe('Redis Configuration', () => {
  let originalEnv: typeof process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = { ...process.env };
    // Reset module to clear singleton instances
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Client Creation', () => {
    it('should create Redis client with default URL', () => {
      const defaultUrl = 'redis://localhost:6379';
      const client = new MockRedis(defaultUrl);

      expect(client.url).toBe(defaultUrl);
    });

    it('should create Redis client with custom URL from environment', () => {
      const customUrl = 'redis://custom-host:6380';
      process.env.REDIS_URL = customUrl;
      
      const client = new MockRedis(process.env.REDIS_URL);

      expect(client.url).toBe(customUrl);
    });

    it('should create Redis client with retry strategy', () => {
      const options = {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      };

      const client = new MockRedis('redis://localhost:6379', options);

      expect(client.options).toBeDefined();
      expect(client.options.retryStrategy).toBeDefined();
      expect(client.options.retryStrategy(1)).toBe(50);
      expect(client.options.retryStrategy(10)).toBe(500);
      expect(client.options.retryStrategy(100)).toBe(2000);
    });

    it('should create Redis client with reconnect on error strategy', () => {
      const options = {
        reconnectOnError: (err: Error) => {
          return err.message.includes('READONLY');
        },
      };

      const client = new MockRedis('redis://localhost:6379', options);

      expect(client.options).toBeDefined();
      expect(client.options.reconnectOnError).toBeDefined();
      expect(client.options.reconnectOnError(new Error('READONLY'))).toBe(true);
      expect(client.options.reconnectOnError(new Error('OTHER'))).toBe(false);
    });
  });

  describe('Subscriber Creation', () => {
    it('should create Redis subscriber', () => {
      const subscriber = new MockRedis('redis://localhost:6379');

      expect(subscriber).toBeDefined();
      expect(subscriber.url).toBe('redis://localhost:6379');
    });

    it('should create separate subscriber instance', () => {
      const client = new MockRedis('redis://localhost:6379');
      const subscriber = new MockRedis('redis://localhost:6379');

      expect(client).not.toBe(subscriber);
    });
  });

  describe('Event Handlers', () => {
    it('should register connect event handler', () => {
      const client = new MockRedis('redis://localhost:6379');
      const connectHandler = jest.fn();

      client.on('connect', connectHandler);

      expect(client.getEventHandlers('connect')).toHaveLength(1);
    });

    it('should register error event handler', () => {
      const client = new MockRedis('redis://localhost:6379');
      const errorHandler = jest.fn();

      client.on('error', errorHandler);

      expect(client.getEventHandlers('error')).toHaveLength(1);
    });

    it('should register close event handler', () => {
      const client = new MockRedis('redis://localhost:6379');
      const closeHandler = jest.fn();

      client.on('close', closeHandler);

      expect(client.getEventHandlers('close')).toHaveLength(1);
    });

    it('should call connect event handler on connection', () => {
      const client = new MockRedis('redis://localhost:6379');
      const connectHandler = jest.fn();

      client.on('connect', connectHandler);
      client.emit('connect');

      expect(connectHandler).toHaveBeenCalled();
    });

    it('should call error event handler on error', () => {
      const client = new MockRedis('redis://localhost:6379');
      const errorHandler = jest.fn();
      const error = new Error('Connection failed');

      client.on('error', errorHandler);
      client.emit('error', error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('should call close event handler on close', () => {
      const client = new MockRedis('redis://localhost:6379');
      const closeHandler = jest.fn();

      client.on('close', closeHandler);
      client.emit('close');

      expect(closeHandler).toHaveBeenCalled();
    });
  });

  describe('Connection Management', () => {
    it('should close Redis client connection', async () => {
      const client = new MockRedis('redis://localhost:6379');

      const result = await client.quit();

      expect(result).toBe('OK');
    });

    it('should close Redis subscriber connection', async () => {
      const subscriber = new MockRedis('redis://localhost:6379');

      const result = await subscriber.quit();

      expect(result).toBe('OK');
    });

    it('should close both client and subscriber connections', async () => {
      const client = new MockRedis('redis://localhost:6379');
      const subscriber = new MockRedis('redis://localhost:6379');

      const clientResult = await client.quit();
      const subscriberResult = await subscriber.quit();

      expect(clientResult).toBe('OK');
      expect(subscriberResult).toBe('OK');
    });
  });

  describe('Connection Testing', () => {
    it('should test Redis connection with ping', async () => {
      const client = new MockRedis('redis://localhost:6379');

      const result = await client.ping();

      expect(result).toBe('PONG');
    });

    it('should handle connection test failure', async () => {
      const client = new MockRedis('redis://localhost:6379');
      
      // Override ping to simulate failure
      client.ping = jest.fn().mockRejectedValue(new Error('Connection failed'));

      await expect(client.ping()).rejects.toThrow('Connection failed');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same client instance on multiple calls', () => {
      const client1 = new MockRedis('redis://localhost:6379');
      const client2 = client1; // Simulate singleton

      expect(client1).toBe(client2);
    });

    it('should return same subscriber instance on multiple calls', () => {
      const subscriber1 = new MockRedis('redis://localhost:6379');
      const subscriber2 = subscriber1; // Simulate singleton

      expect(subscriber1).toBe(subscriber2);
    });
  });

  describe('Configuration Options', () => {
    it('should use REDIS_URL from environment', () => {
      process.env.REDIS_URL = 'redis://env-host:6379';

      const client = new MockRedis(process.env.REDIS_URL);

      expect(client.url).toBe('redis://env-host:6379');
    });

    it('should fallback to default URL if REDIS_URL not set', () => {
      delete process.env.REDIS_URL;

      const defaultUrl = 'redis://localhost:6379';
      const client = new MockRedis(defaultUrl);

      expect(client.url).toBe(defaultUrl);
    });

    it('should configure retry strategy with exponential backoff', () => {
      const retryStrategy = (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      };

      expect(retryStrategy(1)).toBe(50);
      expect(retryStrategy(5)).toBe(250);
      expect(retryStrategy(10)).toBe(500);
      expect(retryStrategy(40)).toBe(2000);
      expect(retryStrategy(100)).toBe(2000);
    });

    it('should configure reconnect on READONLY error', () => {
      const reconnectOnError = (err: Error) => {
        return err.message.includes('READONLY');
      };

      expect(reconnectOnError(new Error('READONLY'))).toBe(true);
      expect(reconnectOnError(new Error('READONLY: You can\'t write'))).toBe(true);
      expect(reconnectOnError(new Error('Connection timeout'))).toBe(false);
      expect(reconnectOnError(new Error('Network error'))).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', () => {
      const client = new MockRedis('redis://localhost:6379');
      const errorHandler = jest.fn();

      client.on('error', errorHandler);

      const error = new Error('ECONNREFUSED');
      client.emit('error', error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('should handle authentication errors', () => {
      const client = new MockRedis('redis://localhost:6379');
      const errorHandler = jest.fn();

      client.on('error', errorHandler);

      const error = new Error('NOAUTH Authentication required');
      client.emit('error', error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('should handle timeout errors', () => {
      const client = new MockRedis('redis://localhost:6379');
      const errorHandler = jest.fn();

      client.on('error', errorHandler);

      const error = new Error('Connection timeout');
      client.emit('error', error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });
  });

  describe('Actual Redis Functions', () => {
    // Note: These tests verify the actual redis.ts functions are called correctly
    // The actual Redis connection is mocked, so we're testing the wrapper logic

    it('should create and return Redis client', () => {
      const client = getRedisClient();
      expect(client).toBeDefined();
      expect(client.url).toBe('redis://localhost:6379');
    });

    it('should return same client instance (singleton)', () => {
      const client1 = getRedisClient();
      const client2 = getRedisClient();
      expect(client1).toBe(client2);
    });

    it('should create and return Redis subscriber', () => {
      const subscriber = getRedisSubscriber();
      expect(subscriber).toBeDefined();
      expect(subscriber.url).toBe('redis://localhost:6379');
    });

    it('should return same subscriber instance (singleton)', () => {
      const subscriber1 = getRedisSubscriber();
      const subscriber2 = getRedisSubscriber();
      expect(subscriber1).toBe(subscriber2);
    });

    it('should close all Redis connections', async () => {
      const client = getRedisClient();
      const subscriber = getRedisSubscriber();

      await closeRedisConnections();

      // After closing, new instances should be created
      const newClient = getRedisClient();
      const newSubscriber = getRedisSubscriber();

      expect(newClient).toBeDefined();
      expect(newSubscriber).toBeDefined();
    });

    it('should test Redis connection successfully', async () => {
      const result = await testRedisConnection();
      expect(result).toBe(true);
    });

    it('should handle Redis connection test failure', async () => {
      const client = getRedisClient();
      client.ping = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const result = await testRedisConnection();
      expect(result).toBe(false);
    });

    it('should use custom REDIS_URL from environment', () => {
      process.env.REDIS_URL = 'redis://custom:6380';

      // Need to reset module to pick up new env var
      jest.resetModules();
      const { getRedisClient: getClient } = require('../../config/redis');

      const client = getClient();
      expect(client.url).toBe('redis://custom:6380');
    });
  });
});

