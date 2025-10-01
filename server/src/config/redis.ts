import Redis from 'ioredis';
import * as dotenv from 'dotenv';

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
      console.log('Redis client connected');
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    redisClient.on('close', () => {
      console.log('Redis client connection closed');
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
      console.log('Redis subscriber connected');
    });

    redisSubscriber.on('error', (err) => {
      console.error('Redis subscriber error:', err);
    });

    redisSubscriber.on('close', () => {
      console.log('Redis subscriber connection closed');
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
      console.log('Redis client disconnected');
      redisClient = null;
    }));
  }

  if (redisSubscriber) {
    promises.push(redisSubscriber.quit().then(() => {
      console.log('Redis subscriber disconnected');
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
    console.log('Redis connection test successful');
    return true;
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}

