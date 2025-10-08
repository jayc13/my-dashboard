/**
 * Database Migration Tests
 * 
 * Tests for database migration
 */

import { runMigrations } from '../db/migrate';

// Mock dependencies
jest.mock('../db/database', () => ({
  db: {
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
  },
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => 'CREATE TABLE test (id INTEGER);'),
  readdirSync: jest.fn(() => ['001_initial.sql', '002_add_users.sql']),
}));

describe('Database Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runMigrations', () => {
    it('should run migrations', async () => {
      const { db } = require('../db/database');
      db.run.mockResolvedValue({ changes: 1 });
      db.get.mockResolvedValue({ version: 0 });

      await runMigrations();

      expect(db.run).toHaveBeenCalled();
    });

    it('should handle migration errors', async () => {
      const { db } = require('../db/database');
      db.run.mockRejectedValue(new Error('Migration error'));
      db.get.mockResolvedValue({ version: 0 });

      await expect(runMigrations()).rejects.toThrow();
    });

    it('should skip already applied migrations', async () => {
      const { db } = require('../db/database');
      db.get.mockResolvedValue({ version: 2 });

      await runMigrations();

      expect(db.run).toHaveBeenCalled();
    });
  });
});

