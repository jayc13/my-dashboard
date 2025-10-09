/**
 * Database Tests
 *
 * Tests for database connection and operations
 */

import { DatabaseManager, db } from '../../db/database';
import * as mysql from '../../db/mysql';

// Mock mysql module
jest.mock('../../db/mysql', () => ({
  getMySQLPool: jest.fn(),
  closeMySQLConnection: jest.fn(),
}));

describe('Database', () => {
  let mockPool: any;
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConnection = {
      execute: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };

    mockPool = {
      execute: jest.fn(),
      getConnection: jest.fn().mockResolvedValue(mockConnection),
      end: jest.fn(),
    };

    (mysql.getMySQLPool as jest.Mock).mockReturnValue(mockPool);
  });

  afterEach(async () => {
    // Clear any transaction state
    try {
      await db.rollback();
    } catch (error) {
      // Ignore errors if no transaction in progress
    }
  });

  describe('DatabaseManager singleton', () => {
    it('should return the same instance', () => {
      const instance1 = DatabaseManager.getInstance();
      const instance2 = DatabaseManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should have all required methods', () => {
      expect(db).toBeDefined();
      expect(typeof db.all).toBe('function');
      expect(typeof db.get).toBe('function');
      expect(typeof db.run).toBe('function');
      expect(typeof db.exec).toBe('function');
      expect(typeof db.beginTransaction).toBe('function');
      expect(typeof db.commit).toBe('function');
      expect(typeof db.rollback).toBe('function');
      expect(typeof db.close).toBe('function');
    });
  });

  describe('all method', () => {
    it('should execute query and return all rows', async () => {
      const mockRows = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];
      mockPool.execute.mockResolvedValue([mockRows]);

      const result = await db.all('SELECT * FROM test');

      expect(result).toEqual(mockRows);
      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM test', []);
    });

    it('should execute query with parameters', async () => {
      const mockRows = [{ id: 1, name: 'Test' }];
      mockPool.execute.mockResolvedValue([mockRows]);

      const result = await db.all('SELECT * FROM test WHERE id = ?', [1]);

      expect(result).toEqual(mockRows);
      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM test WHERE id = ?', [1]);
    });

    it('should return empty array when no rows found', async () => {
      mockPool.execute.mockResolvedValue([[]]);

      const result = await db.all('SELECT * FROM test WHERE id = ?', [999]);

      expect(result).toEqual([]);
    });

    it('should handle query errors', async () => {
      const error = new Error('Query failed');
      mockPool.execute.mockRejectedValue(error);

      await expect(db.all('SELECT * FROM test')).rejects.toThrow('Query failed');
    });
  });

  describe('get method', () => {
    it('should return first row when rows exist', async () => {
      const mockRows = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];
      mockPool.execute.mockResolvedValue([mockRows]);

      const result = await db.get('SELECT * FROM test');

      expect(result).toEqual({ id: 1, name: 'Test 1' });
    });

    it('should return undefined when no rows found', async () => {
      mockPool.execute.mockResolvedValue([[]]);

      const result = await db.get('SELECT * FROM test WHERE id = ?', [999]);

      expect(result).toBeUndefined();
    });

    it('should execute query with parameters', async () => {
      const mockRows = [{ id: 1, name: 'Test' }];
      mockPool.execute.mockResolvedValue([mockRows]);

      const result = await db.get('SELECT * FROM test WHERE id = ?', [1]);

      expect(result).toEqual({ id: 1, name: 'Test' });
      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM test WHERE id = ?', [1]);
    });

    it('should handle query errors', async () => {
      const error = new Error('Query failed');
      mockPool.execute.mockRejectedValue(error);

      await expect(db.get('SELECT * FROM test')).rejects.toThrow('Query failed');
    });
  });

  describe('run method', () => {
    it('should execute INSERT and return result', async () => {
      const mockResult = {
        insertId: 123,
        affectedRows: 1,
        changedRows: 0,
      };
      mockPool.execute.mockResolvedValue([mockResult]);

      const result = await db.run('INSERT INTO test (name) VALUES (?)', ['Test']);

      expect(result).toEqual({
        insertId: 123,
        affectedRows: 1,
      });
    });

    it('should execute UPDATE and return affected rows', async () => {
      const mockResult = {
        insertId: 0,
        affectedRows: 2,
        changedRows: 2,
      };
      mockPool.execute.mockResolvedValue([mockResult]);

      const result = await db.run('UPDATE test SET name = ? WHERE id > ?', ['Updated', 10]);

      expect(result).toEqual({
        insertId: 0,
        affectedRows: 2,
      });
    });

    it('should execute DELETE and return affected rows', async () => {
      const mockResult = {
        insertId: 0,
        affectedRows: 1,
        changedRows: 0,
      };
      mockPool.execute.mockResolvedValue([mockResult]);

      const result = await db.run('DELETE FROM test WHERE id = ?', [1]);

      expect(result.affectedRows).toBe(1);
    });

    it('should handle execution errors', async () => {
      const error = new Error('Execution failed');
      mockPool.execute.mockRejectedValue(error);

      await expect(db.run('INSERT INTO test (name) VALUES (?)', ['Test'])).rejects.toThrow('Execution failed');
    });
  });


  describe('exec method', () => {
    it('should execute multiple SQL statements', async () => {
      const sql = 'CREATE TABLE test (id INT); INSERT INTO test VALUES (1); INSERT INTO test VALUES (2);';
      mockConnection.execute.mockResolvedValue([]);

      await db.exec(sql);

      expect(mockPool.getConnection).toHaveBeenCalled();
      expect(mockConnection.execute).toHaveBeenCalledTimes(3);
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should filter out empty statements', async () => {
      const sql = 'CREATE TABLE test (id INT);;; INSERT INTO test VALUES (1);';
      mockConnection.execute.mockResolvedValue([]);

      await db.exec(sql);

      expect(mockConnection.execute).toHaveBeenCalledTimes(2);
    });

    it('should release connection even if execution fails', async () => {
      const error = new Error('Execution failed');
      mockConnection.execute.mockRejectedValue(error);

      await expect(db.exec('CREATE TABLE test (id INT)')).rejects.toThrow('Execution failed');
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should handle single statement', async () => {
      mockConnection.execute.mockResolvedValue([]);

      await db.exec('CREATE TABLE test (id INT)');

      expect(mockConnection.execute).toHaveBeenCalledTimes(1);
      expect(mockConnection.execute).toHaveBeenCalledWith('CREATE TABLE test (id INT)');
    });
  });

  describe('transaction methods', () => {
    describe('beginTransaction', () => {
      it('should begin a transaction', async () => {
        await db.beginTransaction();

        expect(mockPool.getConnection).toHaveBeenCalled();
        expect(mockConnection.beginTransaction).toHaveBeenCalled();
      });

      it('should throw error if transaction already in progress', async () => {
        await db.beginTransaction();

        await expect(db.beginTransaction()).rejects.toThrow('Transaction already in progress');
      });
    });

    describe('commit', () => {
      it('should commit a transaction', async () => {
        await db.beginTransaction();
        await db.commit();

        expect(mockConnection.commit).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
      });

      it('should throw error if no transaction in progress', async () => {
        await expect(db.commit()).rejects.toThrow('No transaction in progress');
      });

      it('should release connection even if commit fails', async () => {
        const error = new Error('Commit failed');
        mockConnection.commit.mockRejectedValue(error);

        await db.beginTransaction();
        await expect(db.commit()).rejects.toThrow('Commit failed');
        expect(mockConnection.release).toHaveBeenCalled();
      });

      it('should allow starting new transaction after commit', async () => {
        await db.beginTransaction();
        await db.commit();

        // Should not throw
        await expect(db.beginTransaction()).resolves.not.toThrow();
      });
    });

    describe('rollback', () => {
      it('should rollback a transaction', async () => {
        await db.beginTransaction();
        await db.rollback();

        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
      });

      it('should throw error if no transaction in progress', async () => {
        await expect(db.rollback()).rejects.toThrow('No transaction in progress');
      });

      it('should release connection even if rollback fails', async () => {
        const error = new Error('Rollback failed');
        mockConnection.rollback.mockRejectedValue(error);

        await db.beginTransaction();
        await expect(db.rollback()).rejects.toThrow('Rollback failed');
        expect(mockConnection.release).toHaveBeenCalled();
      });

      it('should allow starting new transaction after rollback', async () => {
        await db.beginTransaction();
        await db.rollback();

        // Should not throw
        await expect(db.beginTransaction()).resolves.not.toThrow();
      });
    });

    describe('transaction workflow', () => {
      it('should handle complete transaction workflow', async () => {
        await db.beginTransaction();

        // Simulate some operations
        mockPool.execute.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);
        await db.run('INSERT INTO test (name) VALUES (?)', ['Test']);

        await db.commit();

        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(mockConnection.commit).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
      });

      it('should handle transaction with rollback on error', async () => {
        await db.beginTransaction();

        try {
          // Simulate error during operation
          mockPool.execute.mockRejectedValue(new Error('Operation failed'));
          await db.run('INSERT INTO test (name) VALUES (?)', ['Test']);
        } catch (error) {
          await db.rollback();
        }

        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
      });
    });
  });

  describe('close method', () => {
    it('should close the database connection', async () => {
      (mysql.closeMySQLConnection as jest.Mock).mockResolvedValue(undefined);

      await db.close();

      expect(mysql.closeMySQLConnection).toHaveBeenCalled();
    });

    it('should handle close errors', async () => {
      const error = new Error('Close failed');
      (mysql.closeMySQLConnection as jest.Mock).mockRejectedValue(error);

      await expect(db.close()).rejects.toThrow('Close failed');
    });
  });
});
