/**
 * Database Migration Tests
 *
 * Tests for database migration functionality
 */

import fs from 'fs';
import path from 'path';

// Mock process.exit to prevent test process from exiting
jest.spyOn(process, 'exit').mockImplementation((code) => {
  return undefined as never;
});

// Mock dependencies
jest.mock('fs');
jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../db/mysql', () => ({
  getMySQLPool: jest.fn(),
  closeMySQLConnection: jest.fn(),
}));

jest.mock('../../db/database', () => ({
  db: {
    exec: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
    close: jest.fn(),
  },
}));

import { Logger } from '../../utils/logger';
import { db } from '../../db/database';

describe('Database Migrations', () => {
  const MIGRATIONS_DIR = path.join(__dirname, '../../../migrations/mysql');

  beforeEach(() => {
    jest.clearAllMocks();
    (process.exit as jest.Mock).mockClear();
  });

  describe('runMigrations', () => {
    it('should create migrations table if not exists', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (db.all as jest.Mock).mockResolvedValue([]);

      // Import and run migrations
      const { runMigrations } = require('../../db/migrate');
      await runMigrations();

      expect(db.exec).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations'),
      );
    });

    it('should skip already applied migrations', async () => {
      const appliedMigration = '001_initial.sql';
      (fs.readdirSync as jest.Mock).mockReturnValue([appliedMigration]);
      (db.all as jest.Mock).mockResolvedValue([{ name: appliedMigration }]);
      (fs.readFileSync as jest.Mock).mockReturnValue('CREATE TABLE test;');

      const { runMigrations } = require('../../db/migrate');
      await runMigrations();

      expect(Logger.info).toHaveBeenCalledWith(`Already applied migration: ${appliedMigration}`);
      // Should not apply the migration again
      expect(db.run).not.toHaveBeenCalledWith(
        'INSERT INTO migrations (name) VALUES (?)',
        [appliedMigration],
      );
    });

    it('should apply new migrations', async () => {
      const newMigration = '002_new.sql';
      const migrationSQL = 'CREATE TABLE new_table;';

      (fs.readdirSync as jest.Mock).mockReturnValue([newMigration]);
      (db.all as jest.Mock).mockResolvedValue([]);
      (fs.readFileSync as jest.Mock).mockReturnValue(migrationSQL);
      (db.exec as jest.Mock).mockResolvedValue(undefined);
      (db.run as jest.Mock).mockResolvedValue({ insertId: 1, affectedRows: 1 });

      const { runMigrations } = require('../../db/migrate');
      await runMigrations();

      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join(MIGRATIONS_DIR, newMigration),
        'utf8',
      );
      expect(db.exec).toHaveBeenCalledWith(migrationSQL);
      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO migrations (name) VALUES (?)',
        [newMigration],
      );
      expect(Logger.info).toHaveBeenCalledWith(`Migration applied: ${newMigration}`);
    });

    it('should filter and sort migration files', async () => {
      const files = ['003_third.sql', '001_first.sql', '002_second.sql', 'readme.txt'];
      (fs.readdirSync as jest.Mock).mockReturnValue(files);
      (db.all as jest.Mock).mockResolvedValue([]);
      (fs.readFileSync as jest.Mock).mockReturnValue('CREATE TABLE test;');
      (db.exec as jest.Mock).mockResolvedValue(undefined);
      (db.run as jest.Mock).mockResolvedValue({ insertId: 1, affectedRows: 1 });

      const { runMigrations } = require('../../db/migrate');
      await runMigrations();

      // Should only process .sql files in sorted order
      expect(fs.readFileSync).toHaveBeenCalledTimes(3);
      expect(fs.readFileSync).toHaveBeenNthCalledWith(
        1,
        path.join(MIGRATIONS_DIR, '001_first.sql'),
        'utf8',
      );
      expect(fs.readFileSync).toHaveBeenNthCalledWith(
        2,
        path.join(MIGRATIONS_DIR, '002_second.sql'),
        'utf8',
      );
      expect(fs.readFileSync).toHaveBeenNthCalledWith(
        3,
        path.join(MIGRATIONS_DIR, '003_third.sql'),
        'utf8',
      );
    });

    it('should handle migration errors', async () => {
      const failingMigration = '001_failing.sql';
      const error = new Error('SQL syntax error');

      (fs.readdirSync as jest.Mock).mockReturnValue([failingMigration]);
      (db.all as jest.Mock).mockResolvedValue([]);
      (fs.readFileSync as jest.Mock).mockReturnValue('INVALID SQL;');
      // Mock exec to succeed for migrations table, fail for the migration
      (db.exec as jest.Mock)
        .mockResolvedValueOnce(undefined) // Success for CREATE TABLE migrations
        .mockRejectedValueOnce(error); // Fail for the migration SQL

      const { runMigrations } = require('../../db/migrate');
      await expect(runMigrations()).rejects.toThrow('SQL syntax error');
    });

    it('should log success message when all migrations complete', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (db.all as jest.Mock).mockResolvedValue([]);
      (db.exec as jest.Mock).mockResolvedValue(undefined);
      (db.close as jest.Mock).mockResolvedValue(undefined);

      jest.isolateModules(() => {
        const { runMigrations } = require('../../db/migrate');
        runMigrations();
      });

      // Wait a bit for async operations in finally block
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(Logger.info).toHaveBeenCalledWith('Running MySQL migrations...');
      expect(Logger.info).toHaveBeenCalledWith('All migrations have been applied successfully.');
    });

    it('should close database connection after migrations', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (db.all as jest.Mock).mockResolvedValue([]);
      (db.exec as jest.Mock).mockResolvedValue(undefined);
      (db.close as jest.Mock).mockResolvedValue(undefined);

      jest.isolateModules(() => {
        const { runMigrations } = require('../../db/migrate');
        runMigrations();
      });

      // Wait for finally block to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(db.close).toHaveBeenCalled();
    });
  });
});

