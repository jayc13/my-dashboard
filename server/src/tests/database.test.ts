/**
 * Database Tests
 * 
 * Tests for database connection and operations
 */

import { db } from '../db/database';

// Mock mysql2
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    getConnection: jest.fn(),
    query: jest.fn(),
    execute: jest.fn(),
    end: jest.fn(),
  })),
}));

describe('Database', () => {
  describe('db object', () => {
    it('should have all required methods', () => {
      expect(db).toBeDefined();
      expect(typeof db.all).toBe('function');
      expect(typeof db.get).toBe('function');
      expect(typeof db.run).toBe('function');
    });

    it('should have all method', () => {
      expect(db.all).toBeDefined();
    });

    it('should have get method', () => {
      expect(db.get).toBeDefined();
    });

    it('should have run method', () => {
      expect(db.run).toBeDefined();
    });
  });
});

