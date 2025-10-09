/**
 * MySQL Connection Pool Tests
 *
 * Tests for MySQL connection pool management
 *
 * Note: The mysql module uses a singleton pattern, so these tests
 * verify the behavior of the pool functions rather than testing
 * pool creation multiple times.
 */

import mysql from 'mysql2/promise';

// Mock mysql2/promise
jest.mock('mysql2/promise');

// Mock Logger
jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import after mocks are set up
import { getMySQLPool, getMySQLConnection, closeMySQLConnection, testMySQLConnection } from '../../db/mysql';
import { Logger } from '../../utils/logger';

describe('MySQL Connection Pool', () => {
  let mockPool: any;
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConnection = {
      execute: jest.fn(),
      query: jest.fn(),
      release: jest.fn(),
      ping: jest.fn().mockResolvedValue(undefined),
    };

    mockPool = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
      execute: jest.fn(),
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createPool as jest.Mock).mockReturnValue(mockPool);
  });

  describe('getMySQLPool', () => {
    it('should return a pool instance', () => {
      const pool = getMySQLPool();

      expect(pool).toBeDefined();
      expect(pool).toBeTruthy();
    });

    it('should return the same pool instance on subsequent calls (singleton)', () => {
      const pool1 = getMySQLPool();
      const pool2 = getMySQLPool();

      expect(pool1).toBe(pool2);
    });
  });

  describe('getMySQLConnection', () => {
    it('should get a connection from the pool', async () => {
      const connection = await getMySQLConnection();

      expect(connection).toBeDefined();
      expect(connection).toHaveProperty('execute');
      expect(connection).toHaveProperty('query');
      expect(connection).toHaveProperty('release');
    });
  });

  describe('closeMySQLConnection', () => {
    it('should not throw error when closing', async () => {
      await expect(closeMySQLConnection()).resolves.not.toThrow();
    });

    it('should allow creating a new pool after closing', async () => {
      await closeMySQLConnection();
      const pool = getMySQLPool();

      expect(pool).toBeDefined();
    });
  });

  describe('testMySQLConnection', () => {
    it('should return true when connection test succeeds', async () => {
      const result = await testMySQLConnection();

      expect(result).toBe(true);
      expect(Logger.info).toHaveBeenCalledWith('MySQL connection test successful');
    });
  });
});

