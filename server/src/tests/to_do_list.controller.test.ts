/**
 * ToDoList Controller Tests
 * 
 * Tests for ToDoListController including:
 * - Get all todos
 * - Get todo by ID
 * - Create todo
 * - Update todo
 * - Delete todo
 * - Toggle completion
 */

import { Request, Response, NextFunction } from 'express';
import { ToDoListController } from '../controllers/to_do_list.controller';
import TodoService from '../services/todo.service';
import { NotFoundError, ValidationError, DatabaseError } from '../errors';

// Mock dependencies
jest.mock('../services/todo.service');

describe('ToDoListController', () => {
  let controller: ToDoListController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new ToDoListController();
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Task 1', description: 'Desc 1', link: null, dueDate: null, isCompleted: false },
        { id: 2, title: 'Task 2', description: 'Desc 2', link: null, dueDate: null, isCompleted: true },
      ];

      (TodoService.getAll as jest.Mock).mockResolvedValue(mockTodos);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.getAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodos,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with DatabaseError on failure', async () => {
      (TodoService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('getById', () => {
    it('should return todo by id', async () => {
      mockRequest.params = { id: '1' };
      const mockTodo = { id: 1, title: 'Task 1', description: 'Desc 1', link: null, dueDate: null, isCompleted: false };

      (TodoService.getById as jest.Mock).mockResolvedValue(mockTodo);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.getById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo,
      });
    });

    it('should call next with NotFoundError when todo not found', async () => {
      mockRequest.params = { id: '999' };
      (TodoService.getById as jest.Mock).mockResolvedValue(undefined);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with ValidationError for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('create', () => {
    it('should create todo with valid data', async () => {
      mockRequest.body = {
        title: 'New Task',
        description: 'Task description',
        link: 'https://example.com',
        dueDate: '2025-10-20',
        isCompleted: false,
      };

      const mockCreatedTodo = { id: 1, ...mockRequest.body };
      (TodoService.create as jest.Mock).mockResolvedValue(mockCreatedTodo);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task',
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedTodo,
      });
    });

    it('should call next with ValidationError when title is missing', async () => {
      mockRequest.body = {
        description: 'Task description',
      };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(TodoService.create).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when title is empty', async () => {
      mockRequest.body = {
        title: '   ',
      };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with ValidationError for invalid URL', async () => {
      mockRequest.body = {
        title: 'New Task',
        link: 'not-a-url',
      };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('update', () => {
    it('should update todo with valid data', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        title: 'Updated Task',
        description: 'Updated description',
      };

      const mockUpdatedTodo = { id: 1, ...mockRequest.body, link: null, dueDate: null, isCompleted: false };
      (TodoService.update as jest.Mock).mockResolvedValue(mockUpdatedTodo);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.update).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedTodo,
      });
    });

    it('should call next with NotFoundError when todo not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { title: 'Updated Task' };
      (TodoService.update as jest.Mock).mockResolvedValue(undefined);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with ValidationError for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { title: 'Updated Task' };

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('delete', () => {
    it('should delete todo', async () => {
      mockRequest.params = { id: '1' };
      const mockTodo = { id: 1, title: 'Task 1', description: null, link: null, dueDate: null, isCompleted: false };
      (TodoService.getById as jest.Mock).mockResolvedValue(mockTodo);
      (TodoService.delete as jest.Mock).mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.getById).toHaveBeenCalledWith(1);
      expect(TodoService.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Todo deleted successfully',
      });
    });

    it('should call next with NotFoundError when todo not found', async () => {
      mockRequest.params = { id: '999' };
      (TodoService.getById as jest.Mock).mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with ValidationError for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });
});

