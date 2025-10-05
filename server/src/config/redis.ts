import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import { Logger } from '../utils/logger';

dotenv.config({ quiet: true });

let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;

/**
 * Get or create Redis client for general operations
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      Logger.info('Redis client connected');
    });

    redisClient.on('error', (err) => {
      Logger.error('Redis client error', { error: err });
    });

    redisClient.on('close', () => {
      Logger.info('Redis client connection closed');
    });
  }

  return redisClient;
}

/**
 * Get or create Redis subscriber for pub/sub operations
 * Note: In Redis pub/sub, a connection in subscriber mode cannot be used for other commands
 */
export function getRedisSubscriber(): Redis {
  if (!redisSubscriber) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisSubscriber = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });

    redisSubscriber.on('connect', () => {
      Logger.info('Redis subscriber connected');
    });

    redisSubscriber.on('error', (err) => {
      Logger.error('Redis subscriber error', { error: err });
    });

    redisSubscriber.on('close', () => {
      Logger.info('Redis subscriber connection closed');
    });
  }

  return redisSubscriber;
}

/**
 * Close all Redis connections
 */
export async function closeRedisConnections(): Promise<void> {
  const promises: Promise<void>[] = [];

  if (redisClient) {
    promises.push(redisClient.quit().then(() => {
      Logger.info('Redis client disconnected');
      redisClient = null;
    }));
  }

  if (redisSubscriber) {
    promises.push(redisSubscriber.quit().then(() => {
      Logger.info('Redis subscriber disconnected');
      redisSubscriber = null;
    }));
  }

  await Promise.all(promises);
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    Logger.info('Redis connection test successful');
    return true;
  } catch (error) {
    Logger.error('Redis connection test failed', { error });
    return false;
  }
}

