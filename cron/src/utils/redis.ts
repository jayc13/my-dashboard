import Redis, { RedisOptions } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;

/**
 * Common Redis configuration options
 */
const getRedisUrl = (): string => process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Common retry strategy for Redis connections
 */
const retryStrategy = (times: number): number => Math.min(times * 50, 2000);

/**
 * Setup event handlers for Redis connection
 */
const setupEventHandlers = (redis: Redis, name: string): void => {
  redis.on('connect', () => {
    console.log(`Redis ${name} connected`);
  });

  redis.on('error', (err: Error) => {
    console.error(`Redis ${name} error:`, err);
  });

  redis.on('close', () => {
    console.log(`Redis ${name} connection closed`);
  });
};

/**
 * Create a new Redis instance with common configuration
 */
const createRedisInstance = (name: string): Redis => {
  const redisUrl = getRedisUrl();

  const options: RedisOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy,
  };

  const redis = new Redis(redisUrl, options);
  setupEventHandlers(redis, name);

  return redis;
};

/**
 * Get or create Redis client for general operations
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisInstance('client');
  }
  return redisClient;
}

/**
 * Get or create Redis subscriber for pub/sub operations
 * Note: In Redis pub/sub, a connection in subscriber mode cannot be used for other commands
 */
export function getRedisSubscriber(): Redis {
  if (!redisSubscriber) {
    redisSubscriber = createRedisInstance('subscriber');
  }
  return redisSubscriber;
}

/**
 * Close a Redis connection and log the disconnection
 */
const closeConnection = async (
  redis: Redis | null,
  name: string,
  resetCallback: () => void,
): Promise<void> => {
  if (redis) {
    await redis.quit();
    console.log(`Redis ${name} disconnected`);
    resetCallback();
  }
};

/**
 * Close all Redis connections
 */
export async function closeRedisConnections(): Promise<void> {
  await Promise.all([
    closeConnection(redisClient, 'client', () => {
      redisClient = null;
    }),
    closeConnection(redisSubscriber, 'subscriber', () => {
      redisSubscriber = null;
    }),
  ]);
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

