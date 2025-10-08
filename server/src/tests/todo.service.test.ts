/**
 * Todo Service Tests
 * 
 * Tests for TodoService including:
 * - Get all todos
 * - Get todo by ID
 * - Create todo
 * - Update todo
 * - Delete todo
 * - Toggle completion status
 */

import { TodoService } from '../services/todo.service';
import { db } from '../db/database';

// Mock dependencies
jest.mock('../db/database');

describe('TodoService', () => {
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all todos ordered by due date', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          link: 'https://example.com',
          due_date: '2025-10-10',
          is_completed: 0,
        },
        {
          id: 2,
          title: 'Task 2',
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
        title: 'Task 1',
        description: 'Description 1',
        link: 'https://example.com',
        dueDate: '2025-10-10',
        isCompleted: false,
      });
      expect(result[1]).toEqual({
        id: 2,
        title: 'Task 2',
        description: null,
        link: null,
        dueDate: '2025-10-15',
        isCompleted: true,
      });
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM todos ORDER BY due_date ASC');
    });

    it('should return empty array when no todos exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await TodoService.getAll();

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      await expect(TodoService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return todo by id', async () => {
      const mockRow = {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        link: 'https://example.com',
        due_date: '2025-10-10',
        is_completed: 0,
      };

      mockDb.get.mockResolvedValue(mockRow);

      const result = await TodoService.getById(1);

      expect(result).toEqual({
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
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
    it('should create todo with all fields', async () => {
      const input = {
        title: 'New Task',
        description: 'Task description',
        link: 'https://example.com',
        dueDate: '2025-10-20',
        isCompleted: false,
      };

      const mockResult = { insertId: 1 };
      const mockCreatedTodo = {
        id: 1,
        title: 'New Task',
        description: 'Task description',
        link: 'https://example.com',
        due_date: '2025-10-20',
        is_completed: 0,
      };

      mockDb.run.mockResolvedValue(mockResult);
      mockDb.get.mockResolvedValue(mockCreatedTodo);

      const result = await TodoService.create(input);

      expect(result).toEqual({
        id: 1,
        title: 'New Task',
        description: 'Task description',
        link: 'https://example.com',
        dueDate: '2025-10-20',
        isCompleted: false,
      });
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO todos'),
        ['New Task', 'Task description', 'https://example.com', '2025-10-20', false],
      );
    });

    it('should create todo with only required fields', async () => {
      const input = {
        title: 'Simple Task',
      };

      const mockResult = { insertId: 2 };
      const mockCreatedTodo = {
        id: 2,
        title: 'Simple Task',
        description: null,
        link: null,
        due_date: null,
        is_completed: 0,
      };

      mockDb.run.mockResolvedValue(mockResult);
      mockDb.get.mockResolvedValue(mockCreatedTodo);

      const result = await TodoService.create(input);

      expect(result).toEqual({
        id: 2,
        title: 'Simple Task',
        description: null,
        link: null,
        dueDate: null,
        isCompleted: false,
      });
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO todos'),
        ['Simple Task', null, null, null, false],
      );
    });

    it('should throw error when database insert fails', async () => {
      const input = { title: 'New Task' };
      mockDb.run.mockRejectedValue(new Error('Database error'));

      await expect(TodoService.create(input)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update todo', async () => {
      const input = {
        title: 'Updated Task',
        description: 'Updated description',
        link: 'https://updated.com',
        dueDate: '2025-10-25',
        isCompleted: true,
      };

      const mockResult = { changes: 1 };
      const mockUpdatedTodo = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated description',
        link: 'https://updated.com',
        due_date: '2025-10-25',
        is_completed: 1,
      };

      mockDb.run.mockResolvedValue(mockResult);
      mockDb.get.mockResolvedValue(mockUpdatedTodo);

      const result = await TodoService.update(1, input);

      expect(result).toEqual({
        id: 1,
        title: 'Updated Task',
        description: 'Updated description',
        link: 'https://updated.com',
        dueDate: '2025-10-25',
        isCompleted: true,
      });
    });

    it('should return undefined when todo not found', async () => {
      const input = { title: 'Updated Task' };
      const mockResult = { changes: 0 };

      mockDb.run.mockResolvedValue(mockResult);

      const result = await TodoService.update(999, input);

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete todo', async () => {
      const mockResult = { changes: 1 };
      mockDb.run.mockResolvedValue(mockResult);

      await TodoService.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM todos WHERE id = ?', [1]);
    });

    it('should throw error when database delete fails', async () => {
      mockDb.run.mockRejectedValue(new Error('Database error'));

      await expect(TodoService.delete(1)).rejects.toThrow('Database error');
    });
  });
});

