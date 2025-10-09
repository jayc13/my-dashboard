/**
 * App Controller Tests
 * 
 * Tests for AppController including:
 * - Get all apps
 * - Get app by ID
 * - Create app
 * - Update app
 * - Delete app
 */

import { Request, Response, NextFunction } from 'express';
import { AppController } from '../../controllers/app.controller';
import { AppService } from '../../services/app.service';
import { NotFoundError, ValidationError, DatabaseError, ConflictError } from '../../errors/AppError';

// Mock dependencies
jest.mock('../../services/app.service');

describe('AppController', () => {
  let controller: AppController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new AppController();
    mockRequest = {
      params: {},
      body: {},
      query: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all apps', async () => {
      const mockApps = [
        { id: 1, name: 'App 1', code: 'app1', watching: true },
        { id: 2, name: 'App 2', code: 'app2', watching: false },
      ];
      (AppService.getAll as jest.Mock).mockResolvedValue(mockApps);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.getAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockApps,
      });
    });

    it('should call next with DatabaseError when service throws error', async () => {
      (AppService.getAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('getById', () => {
    it('should return app by id', async () => {
      const mockApp = { id: 1, name: 'App 1', code: 'app1', watching: true };
      mockRequest.params = { id: '1' };
      (AppService.getById as jest.Mock).mockResolvedValue(mockApp);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.getById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockApp,
      });
    });

    it('should call next with NotFoundError when app does not exist', async () => {
      mockRequest.params = { id: '999' };
      (AppService.getById as jest.Mock).mockResolvedValue(undefined);

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
    it('should create a new app', async () => {
      const mockApp = { id: 1, name: 'New App', code: 'newapp', watching: true };
      mockRequest.body = {
        name: 'New App',
        code: 'newapp',
        watching: true,
      };
      (AppService.create as jest.Mock).mockResolvedValue(mockApp);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.create).toHaveBeenCalledWith({
        name: 'New App',
        code: 'newapp',
        pipelineUrl: undefined,
        e2eTriggerConfiguration: undefined,
        watching: true,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockApp,
      });
    });

    it('should create app with optional fields', async () => {
      const mockApp = { 
        id: 1, 
        name: 'New App', 
        code: 'newapp', 
        pipelineUrl: 'https://example.com',
        e2eTriggerConfiguration: '{"key":"value"}',
        watching: false 
      };
      mockRequest.body = {
        name: 'New App',
        code: 'newapp',
        pipelineUrl: 'https://example.com',
        e2eTriggerConfiguration: '{"key":"value"}',
        watching: false,
      };
      (AppService.create as jest.Mock).mockResolvedValue(mockApp);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should call next with ValidationError when required fields are missing', async () => {
      mockRequest.body = { name: 'New App' };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with ConflictError when code is duplicate', async () => {
      mockRequest.body = {
        name: 'New App',
        code: 'duplicate',
      };
      (AppService.create as jest.Mock).mockRejectedValue(new Error('Duplicate entry'));

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ConflictError));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      mockRequest.body = {
        name: 'New App',
        code: 'newapp',
      };
      (AppService.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('update', () => {
    it('should update an existing app', async () => {
      const existingApp = { id: 1, name: 'Old Name', code: 'oldcode', watching: false };
      const updatedApp = { id: 1, name: 'New Name', code: 'oldcode', watching: true };
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'New Name',
        watching: true,
      };
      (AppService.getById as jest.Mock).mockResolvedValue(existingApp);
      (AppService.update as jest.Mock).mockResolvedValue(updatedApp);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.update).toHaveBeenCalledWith(1, {
        name: 'New Name',
        code: undefined,
        pipelineUrl: undefined,
        e2eTriggerConfiguration: undefined,
        watching: true,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedApp,
      });
    });

    it('should call next with NotFoundError when app does not exist', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'New Name' };
      (AppService.getById as jest.Mock).mockResolvedValue(undefined);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with NotFoundError when update returns null', async () => {
      const existingApp = { id: 1, name: 'Old Name', code: 'oldcode', watching: false };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'New Name' };
      (AppService.getById as jest.Mock).mockResolvedValue(existingApp);
      (AppService.update as jest.Mock).mockResolvedValue(null);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with ConflictError when code is duplicate', async () => {
      const existingApp = { id: 1, name: 'Old Name', code: 'oldcode', watching: false };
      mockRequest.params = { id: '1' };
      mockRequest.body = { code: 'duplicate' };
      (AppService.getById as jest.Mock).mockResolvedValue(existingApp);
      (AppService.update as jest.Mock).mockRejectedValue(new Error('UNIQUE constraint failed'));

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ConflictError));
    });

    it('should handle e2eTriggerConfiguration update', async () => {
      const existingApp = { id: 1, name: 'App', code: 'app', watching: false };
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        e2eTriggerConfiguration: '{"key":"value"}',
      };
      (AppService.getById as jest.Mock).mockResolvedValue(existingApp);
      (AppService.update as jest.Mock).mockResolvedValue(existingApp);

      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.update).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('should delete an existing app', async () => {
      const existingApp = { id: 1, name: 'App', code: 'app', watching: false };
      mockRequest.params = { id: '1' };
      (AppService.getById as jest.Mock).mockResolvedValue(existingApp);
      (AppService.delete as jest.Mock).mockResolvedValue(true);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'App deleted successfully',
      });
    });

    it('should call next with NotFoundError when app does not exist', async () => {
      mockRequest.params = { id: '999' };
      (AppService.getById as jest.Mock).mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with NotFoundError when delete returns false', async () => {
      const existingApp = { id: 1, name: 'App', code: 'app', watching: false };
      mockRequest.params = { id: '1' };
      (AppService.getById as jest.Mock).mockResolvedValue(existingApp);
      (AppService.delete as jest.Mock).mockResolvedValue(false);

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      const existingApp = { id: 1, name: 'App', code: 'app', watching: false };
      mockRequest.params = { id: '1' };
      (AppService.getById as jest.Mock).mockResolvedValue(existingApp);
      (AppService.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });
});

