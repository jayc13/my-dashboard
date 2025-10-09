/**
 * To-Do List Controller Tests
 * 
 * Tests for ToDoListController including:
 * - Get all todos
 * - Get todo by ID
 * - Create todo
 * - Update todo
 * - Delete todo
 */

import { Request, Response, NextFunction } from 'express';
import { ToDoListController } from '../../controllers/to_do_list.controller';
import TodoService from '../../services/todo.service';
import { NotFoundError, ValidationError, DatabaseError } from '../../errors';

// Mock dependencies
jest.mock('../../services/todo.service');

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
        { id: 1, title: 'Todo 1', description: 'Description 1', isCompleted: false },
        { id: 2, title: 'Todo 2', description: 'Description 2', isCompleted: true },
      ];
      (TodoService.getAll as jest.Mock).mockResolvedValue(mockTodos);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.getAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodos,
      });
    });

    it('should call next with DatabaseError when service throws error', async () => {
      (TodoService.getAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('getById', () => {
    it('should return todo by id', async () => {
      const mockTodo = { id: 1, title: 'Todo 1', description: 'Description 1', isCompleted: false };
      mockRequest.params = { id: '1' };
      (TodoService.getById as jest.Mock).mockResolvedValue(mockTodo);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.getById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo,
      });
    });

    it('should call next with NotFoundError when todo does not exist', async () => {
      mockRequest.params = { id: '999' };
      (TodoService.getById as jest.Mock).mockResolvedValue(undefined);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with error when id is invalid', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const mockTodo = { id: 1, title: 'New Todo', description: 'Description', isCompleted: false };
      mockRequest.body = {
        title: 'New Todo',
        description: 'Description',
      };
      (TodoService.create as jest.Mock).mockResolvedValue(mockTodo);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.create).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'Description',
        link: undefined,
        dueDate: undefined,
        isCompleted: false,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo,
      });
    });

    it('should create todo with all optional fields', async () => {
      const mockTodo = {
        id: 1,
        title: 'New Todo',
        description: 'Description',
        link: 'https://example.com',
        dueDate: '2025-12-31',
        isCompleted: true,
      };
      mockRequest.body = {
        title: 'New Todo',
        description: 'Description',
        link: 'https://example.com',
        dueDate: '2025-12-31',
        isCompleted: true,
      };
      (TodoService.create as jest.Mock).mockResolvedValue(mockTodo);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should call next with ValidationError when title is missing', async () => {
      mockRequest.body = { description: 'Description' };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with ValidationError when link is invalid URL', async () => {
      mockRequest.body = {
        title: 'New Todo',
        link: 'not-a-valid-url',
      };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      mockRequest.body = { title: 'New Todo' };
      (TodoService.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('update', () => {
    it('should update an existing todo', async () => {
      const existingTodo = { id: 1, title: 'Old Title', description: 'Old Description', isCompleted: false };
      const updatedTodo = { id: 1, title: 'New Title', description: 'Old Description', isCompleted: false };
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'New Title' };
      (TodoService.getById as jest.Mock).mockResolvedValue(existingTodo);
      (TodoService.update as jest.Mock).mockResolvedValue(updatedTodo);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.update).toHaveBeenCalledWith(1, {
        title: 'New Title',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedTodo,
      });
    });

    it('should update multiple fields', async () => {
      const existingTodo = { id: 1, title: 'Title', description: 'Description', isCompleted: false };
      const updatedTodo = { id: 1, title: 'New Title', description: 'New Description', isCompleted: true };
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        title: 'New Title',
        description: 'New Description',
        isCompleted: true,
      };
      (TodoService.getById as jest.Mock).mockResolvedValue(existingTodo);
      (TodoService.update as jest.Mock).mockResolvedValue(updatedTodo);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.update).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should allow clearing link with empty string', async () => {
      const existingTodo = { id: 1, title: 'Title', link: 'https://example.com', isCompleted: false };
      const updatedTodo = { id: 1, title: 'Title', link: null, isCompleted: false };
      mockRequest.params = { id: '1' };
      mockRequest.body = { link: '' };
      (TodoService.getById as jest.Mock).mockResolvedValue(existingTodo);
      (TodoService.update as jest.Mock).mockResolvedValue(updatedTodo);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.update).toHaveBeenCalledWith(1, {
        link: null,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should call next with NotFoundError when todo does not exist', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { title: 'New Title' };
      (TodoService.getById as jest.Mock).mockResolvedValue(undefined);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with ValidationError when link is invalid URL', async () => {
      const existingTodo = { id: 1, title: 'Title', isCompleted: false };
      mockRequest.params = { id: '1' };
      mockRequest.body = { link: 'not-a-valid-url' };
      (TodoService.getById as jest.Mock).mockResolvedValue(existingTodo);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      const existingTodo = { id: 1, title: 'Title', isCompleted: false };
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'New Title' };
      (TodoService.getById as jest.Mock).mockResolvedValue(existingTodo);
      (TodoService.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('delete', () => {
    it('should delete an existing todo', async () => {
      const existingTodo = { id: 1, title: 'Title', isCompleted: false };
      mockRequest.params = { id: '1' };
      (TodoService.getById as jest.Mock).mockResolvedValue(existingTodo);
      (TodoService.delete as jest.Mock).mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(TodoService.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Todo deleted successfully',
      });
    });

    it('should call next with NotFoundError when todo does not exist', async () => {
      mockRequest.params = { id: '999' };
      (TodoService.getById as jest.Mock).mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      const existingTodo = { id: 1, title: 'Title', isCompleted: false };
      mockRequest.params = { id: '1' };
      (TodoService.getById as jest.Mock).mockResolvedValue(existingTodo);
      (TodoService.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });
});

