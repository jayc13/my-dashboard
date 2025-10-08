/**
 * MySQL Tests
 * 
 * Tests for MySQL connection utilities
 */

import { testMySQLConnection, getMySQLPool } from '../db/mysql';

// Mock mysql2/promise
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    getConnection: jest.fn().mockResolvedValue({
      ping: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    }),
    query: jest.fn(),
    execute: jest.fn(),
    end: jest.fn(),
  })),
}));

describe('MySQL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MYSQL_HOST = 'localhost';
    process.env.MYSQL_PORT = '3306';
    process.env.MYSQL_USER = 'test';
    process.env.MYSQL_PASSWORD = 'test';
    process.env.MYSQL_DATABASE = 'test_db';
  });

  describe('testMySQLConnection', () => {
    it('should test MySQL connection successfully', async () => {
      const result = await testMySQLConnection();
      expect(result).toBe(true);
    });

    it('should return false on connection error', async () => {
      const mysql = require('mysql2/promise');
      mysql.createPool.mockImplementation(() => ({
        getConnection: jest.fn().mockRejectedValue(new Error('Connection error')),
      }));

      const result = await testMySQLConnection();
      expect(result).toBe(false);
    });
  });

  describe('getMySQLPool', () => {
    it('should create MySQL pool', () => {
      const pool = getMySQLPool();
      expect(pool).toBeDefined();
    });

    it('should return same pool instance', () => {
      const pool1 = getMySQLPool();
      const pool2 = getMySQLPool();
      expect(pool1).toBe(pool2);
    });
  });
});

