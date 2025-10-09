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

  describe('Error Handling', () => {
    it('should handle pool creation errors', () => {
      // Close existing pool first
      closeMySQLConnection();

      const error = new Error('Pool creation failed');
      (mysql.createPool as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      // Use isolateModules to get a fresh instance
      jest.isolateModules(() => {
        const { getMySQLPool: getPool } = require('../../db/mysql');
        expect(() => getPool()).toThrow('Pool creation failed');
      });
    });

    it('should log error when getting connection fails', async () => {
      const error = new Error('Failed to get connection');
      mockPool.getConnection.mockRejectedValueOnce(error);

      await expect(getMySQLConnection()).rejects.toThrow('Failed to get connection');
      expect(Logger.error).toHaveBeenCalledWith('Failed to get connection from pool:', { error });
    });
  });

  describe('Configuration', () => {
    it('should use environment variables for configuration', () => {
      // Close existing pool first
      closeMySQLConnection();

      process.env.MYSQL_HOST = 'test-host';
      process.env.MYSQL_PORT = '3307';
      process.env.MYSQL_USER = 'test-user';
      process.env.MYSQL_PASSWORD = 'test-pass';
      process.env.MYSQL_DATABASE = 'test-db';
      process.env.MYSQL_CONNECTION_LIMIT = '20';

      // Use isolateModules to get a fresh instance
      jest.isolateModules(() => {
        const { getMySQLPool: getPool } = require('../../db/mysql');
        const pool = getPool();
        expect(pool).toBeDefined();
      });

      expect(Logger.info).toHaveBeenCalledWith(
        expect.stringContaining('test-host:3307/test-db'),
      );
    });

    it('should use default values when environment variables are not set', () => {
      // Close existing pool first
      closeMySQLConnection();

      delete process.env.MYSQL_HOST;
      delete process.env.MYSQL_PORT;
      delete process.env.MYSQL_USER;
      delete process.env.MYSQL_PASSWORD;
      delete process.env.MYSQL_DATABASE;
      delete process.env.MYSQL_CONNECTION_LIMIT;

      // Use isolateModules to get a fresh instance
      jest.isolateModules(() => {
        const { getMySQLPool: getPool } = require('../../db/mysql');
        const pool = getPool();
        expect(pool).toBeDefined();
      });

      expect(Logger.info).toHaveBeenCalledWith(
        expect.stringContaining('localhost:3306/cypress_dashboard'),
      );
    });
  });
});

