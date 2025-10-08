/**
 * Todo Service Tests
 * 
 * Tests for TodoService including:
 * - CRUD operations for todos
 * - Field formatting and validation
 */

import { TodoService } from '../../services/todo.service';
import { db } from '../../db/database';

// Mock dependencies
jest.mock('../../db/database');

describe('TodoService', () => {
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all todos ordered by due date', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Todo 1',
          description: 'Description 1',
          link: 'https://example.com/1',
          due_date: '2025-10-10',
          is_completed: 0,
        },
        {
          id: 2,
          title: 'Todo 2',
          description: null,
          link: null,
          due_date: '2025-10-15',
          is_completed: 1,
        },
      ];

      mockDb.all.mockResolvedValue(mockRows);

      const result = await TodoService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Todo 1',
        description: 'Description 1',
        link: 'https://example.com/1',
        dueDate: '2025-10-10',
        isCompleted: false,
      });
      expect(result[1].isCompleted).toBe(true);
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM todos ORDER BY due_date ASC');
    });

    it('should throw error when database query fails', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      await expect(TodoService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should fetch todo by id', async () => {
      const mockRow = {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        link: 'https://example.com',
        due_date: '2025-10-10',
        is_completed: 0,
      };

      mockDb.get.mockResolvedValue(mockRow);

      const result = await TodoService.getById(1);

      expect(result).toEqual({
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        link: 'https://example.com',
        dueDate: '2025-10-10',
        isCompleted: false,
      });
      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM todos WHERE id = ?', [1]);
    });

    it('should return undefined when todo not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await TodoService.getById(999);

      expect(result).toBeUndefined();
    });

    it('should throw error when database query fails', async () => {
      mockDb.get.mockRejectedValue(new Error('Database error'));

      await expect(TodoService.getById(1)).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create a new todo with all fields', async () => {
      const newTodo = {
        title: 'New Todo',
        description: 'New Description',
        link: 'https://example.com',
        dueDate: '2025-10-10',
        isCompleted: false,
      };

      mockDb.run.mockResolvedValue({ insertId: 1, affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 1,
        title: 'New Todo',
        description: 'New Description',
        link: 'https://example.com',
        due_date: '2025-10-10',
        is_completed: 0,
      });

      const result = await TodoService.create(newTodo);

      expect(result).toEqual({
        id: 1,
        title: 'New Todo',
        description: 'New Description',
        link: 'https://example.com',
        dueDate: '2025-10-10',
        isCompleted: false,
      });
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO todos'),
        ['New Todo', 'New Description', 'https://example.com', '2025-10-10', false],
      );
    });

    it('should create todo with only required fields', async () => {
      const newTodo = {
        title: 'Simple Todo',
      };

      mockDb.run.mockResolvedValue({ insertId: 2, affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 2,
        title: 'Simple Todo',
        description: null,
        link: null,
        due_date: null,
        is_completed: 0,
      });

      const result = await TodoService.create(newTodo);

      expect(result).toEqual({
        id: 2,
        title: 'Simple Todo',
        description: null,
        link: null,
        dueDate: null,
        isCompleted: false,
      });
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO todos'),
        ['Simple Todo', null, null, null, false],
      );
    });

    it('should create completed todo', async () => {
      const newTodo = {
        title: 'Completed Todo',
        isCompleted: true,
      };

      mockDb.run.mockResolvedValue({ insertId: 3, affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 3,
        title: 'Completed Todo',
        description: null,
        link: null,
        due_date: null,
        is_completed: 1,
      });

      const result = await TodoService.create(newTodo);

      expect(result?.isCompleted).toBe(true);
    });

    it('should throw error when creation fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Insert failed'));

      await expect(TodoService.create({ title: 'Test' })).rejects.toThrow('Insert failed');
    });
  });

  describe('update', () => {
    it('should update all fields', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description',
        link: 'https://updated.com',
        dueDate: '2025-10-20',
        isCompleted: true,
      };

      mockDb.run.mockResolvedValue({ affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 1,
        title: 'Updated Title',
        description: 'Updated Description',
        link: 'https://updated.com',
        due_date: '2025-10-20',
        is_completed: 1,
      });

      const result = await TodoService.update(1, updates);

      expect(result?.title).toBe('Updated Title');
      expect(result?.isCompleted).toBe(true);
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE todos SET'),
        expect.arrayContaining(['Updated Title', 'Updated Description', 'https://updated.com', '2025-10-20', 1, 1]),
      );
    });

    it('should update only specified fields', async () => {
      const updates = {
        isCompleted: true,
      };

      mockDb.run.mockResolvedValue({ affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 1,
        title: 'Test Todo',
        description: null,
        link: null,
        due_date: null,
        is_completed: 1,
      });

      const result = await TodoService.update(1, updates);

      expect(result?.isCompleted).toBe(true);
      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE todos SET is_completed = ? WHERE id = ?',
        [1, 1],
      );
    });

    it('should return undefined when no fields to update', async () => {
      const result = await TodoService.update(1, {});

      expect(result).toBeUndefined();
      expect(mockDb.run).not.toHaveBeenCalled();
    });

    it('should handle updating to null values', async () => {
      const updates = {
        description: null,
        link: null,
        dueDate: null,
      };

      mockDb.run.mockResolvedValue({ affectedRows: 1 });
      mockDb.get.mockResolvedValue({
        id: 1,
        title: 'Test Todo',
        description: null,
        link: null,
        due_date: null,
        is_completed: 0,
      });

      const result = await TodoService.update(1, updates);

      expect(result?.description).toBeNull();
      expect(result?.link).toBeNull();
      expect(result?.dueDate).toBeNull();
    });

    it('should throw error when update fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Update failed'));

      await expect(TodoService.update(1, { title: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete todo successfully', async () => {
      mockDb.run.mockResolvedValue({ affectedRows: 1 });

      await TodoService.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM todos WHERE id = ?', [1]);
    });

    it('should not throw error when todo not found', async () => {
      mockDb.run.mockResolvedValue({ affectedRows: 0 });

      await expect(TodoService.delete(999)).resolves.not.toThrow();
    });

    it('should throw error when delete fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Delete failed'));

      await expect(TodoService.delete(1)).rejects.toThrow('Delete failed');
    });
  });
});

