/**
 * MySQL Connection Pool Tests
 *
 * Tests for MySQL connection pool management
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

describe('MySQL Connection Pool', () => {
  let mockPool: any;
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the module to clear the pool singleton
    jest.resetModules();
    
    mockConnection = {
      execute: jest.fn(),
      query: jest.fn(),
      release: jest.fn(),
      ping: jest.fn(),
    };

    mockPool = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
      execute: jest.fn(),
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    (mysql.createPool as jest.Mock).mockReturnValue(mockPool);
  });

  afterEach(async () => {
    // Clean up any existing pool
    const { closeMySQLConnection } = require('../../db/mysql');
    await closeMySQLConnection();
  });

  describe('getMySQLPool', () => {
    it('should create a new pool on first call', () => {
      const { getMySQLPool } = require('../../db/mysql');
      const { Logger } = require('../../utils/logger');
      const pool = getMySQLPool();

      expect(pool).toBeDefined();
      expect(mysql.createPool).toHaveBeenCalledTimes(1);
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining('Creating MySQL connection pool'));
    });

    it('should return existing pool on subsequent calls', () => {
      const { getMySQLPool } = require('../../db/mysql');
      const pool1 = getMySQLPool();
      const pool2 = getMySQLPool();

      expect(pool1).toBe(pool2);
      expect(mysql.createPool).toHaveBeenCalledTimes(1);
    });

    it('should use environment variables for configuration', () => {
      process.env.MYSQL_HOST = 'test-host';
      process.env.MYSQL_PORT = '3307';
      process.env.MYSQL_USER = 'test-user';
      process.env.MYSQL_PASSWORD = 'test-password';
      process.env.MYSQL_DATABASE = 'test-db';
      process.env.MYSQL_CONNECTION_LIMIT = '20';

      const { getMySQLPool } = require('../../db/mysql');
      getMySQLPool();

      expect(mysql.createPool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'test-host',
          port: 3307,
          user: 'test-user',
          password: 'test-password',
          database: 'test-db',
          connectionLimit: 20,
        })
      );

      // Clean up
      delete process.env.MYSQL_HOST;
      delete process.env.MYSQL_PORT;
      delete process.env.MYSQL_USER;
      delete process.env.MYSQL_PASSWORD;
      delete process.env.MYSQL_DATABASE;
      delete process.env.MYSQL_CONNECTION_LIMIT;
    });

    it('should use default values when environment variables are not set', () => {
      const { getMySQLPool } = require('../../db/mysql');
      getMySQLPool();

      expect(mysql.createPool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: '',
          database: 'cypress_dashboard',
          connectionLimit: 10,
        })
      );
    });

    it('should configure pool with correct settings', () => {
      const { getMySQLPool } = require('../../db/mysql');
      getMySQLPool();

      expect(mysql.createPool).toHaveBeenCalledWith(
        expect.objectContaining({
          charset: 'utf8mb4',
          timezone: '+00:00',
          waitForConnections: true,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
        })
      );
    });

    it('should throw error if pool creation fails', () => {
      const error = new Error('Pool creation failed');
      (mysql.createPool as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const { getMySQLPool } = require('../../db/mysql');
      const { Logger } = require('../../utils/logger');

      expect(() => getMySQLPool()).toThrow('Pool creation failed');
      expect(Logger.error).toHaveBeenCalledWith('Failed to create MySQL connection pool:', { error });
    });
  });

  describe('getMySQLConnection', () => {
    it('should get a connection from the pool', async () => {
      const { getMySQLConnection } = require('../../db/mysql');
      const connection = await getMySQLConnection();

      expect(connection).toBe(mockConnection);
      expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockPool.getConnection.mockRejectedValue(error);

      const { getMySQLConnection } = require('../../db/mysql');
      const { Logger } = require('../../utils/logger');

      await expect(getMySQLConnection()).rejects.toThrow('Connection failed');
      expect(Logger.error).toHaveBeenCalledWith('Failed to get connection from pool:', { error });
    });
  });

  describe('closeMySQLConnection', () => {
    it('should close the pool if it exists', async () => {
      const { getMySQLPool, closeMySQLConnection } = require('../../db/mysql');
      getMySQLPool(); // Create pool

      await closeMySQLConnection();

      expect(mockPool.end).toHaveBeenCalledTimes(1);
      expect(Logger.info).toHaveBeenCalledWith('MySQL connection pool closed');
    });

    it('should not throw error if pool does not exist', async () => {
      const { closeMySQLConnection } = require('../../db/mysql');

      await expect(closeMySQLConnection()).resolves.not.toThrow();
    });

    it('should allow creating a new pool after closing', async () => {
      const { getMySQLPool, closeMySQLConnection } = require('../../db/mysql');
      
      getMySQLPool(); // Create first pool
      await closeMySQLConnection();
      
      jest.clearAllMocks();
      (mysql.createPool as jest.Mock).mockReturnValue(mockPool);
      
      getMySQLPool(); // Create second pool

      expect(mysql.createPool).toHaveBeenCalledTimes(1);
    });
  });

  describe('testMySQLConnection', () => {
    it('should return true when connection test succeeds', async () => {
      mockConnection.ping.mockResolvedValue(undefined);

      const { testMySQLConnection } = require('../../db/mysql');
      const result = await testMySQLConnection();

      expect(result).toBe(true);
      expect(mockConnection.ping).toHaveBeenCalledTimes(1);
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
      expect(Logger.info).toHaveBeenCalledWith('MySQL connection test successful');
    });

    it('should return false when connection test fails', async () => {
      const error = new Error('Ping failed');
      mockConnection.ping.mockRejectedValue(error);

      const { testMySQLConnection } = require('../../db/mysql');
      const result = await testMySQLConnection();

      expect(result).toBe(false);
      expect(Logger.error).toHaveBeenCalledWith('MySQL connection test failed:', { error });
    });

    it('should return false when getting connection fails', async () => {
      const error = new Error('Connection failed');
      mockPool.getConnection.mockRejectedValue(error);

      const { testMySQLConnection } = require('../../db/mysql');
      const result = await testMySQLConnection();

      expect(result).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});

