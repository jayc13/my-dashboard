/**
 * App Controller Tests
 * 
 * Tests for AppController including:
 * - Get all apps
 * - Get app by ID
 * - Get app by code
 */

import { Request, Response, NextFunction } from 'express';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';

// Mock dependencies
jest.mock('../services/app.service');

describe('AppController', () => {
  let controller: AppController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new AppController();
    mockRequest = {
      params: {},
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
        { id: 1, name: 'App A', code: 'app-a', watching: true },
        { id: 2, name: 'App B', code: 'app-b', watching: false },
      ];

      (AppService.getAll as jest.Mock).mockResolvedValue(mockApps);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.getAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockApps,
      });
    });

    it('should call next with error on failure', async () => {
      (AppService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getById', () => {
    it('should return app by id', async () => {
      mockRequest.params = { id: '1' };
      const mockApp = { id: 1, name: 'App A', code: 'app-a', watching: true };

      (AppService.getById as jest.Mock).mockResolvedValue(mockApp);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.getById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockApp,
      });
    });

    it('should call next with error for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error when app not found', async () => {
      mockRequest.params = { id: '999' };
      (AppService.getById as jest.Mock).mockResolvedValue(undefined);

      await controller.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getByCode', () => {
    it('should return app by code', async () => {
      mockRequest.params = { code: 'app-a' };
      const mockApp = { id: 1, name: 'App A', code: 'app-a', watching: true };

      (AppService.getByCode as jest.Mock).mockResolvedValue(mockApp);

      await controller.getByCode(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AppService.getByCode).toHaveBeenCalledWith('app-a');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockApp,
      });
    });

    it('should call next with error when app not found', async () => {
      mockRequest.params = { code: 'non-existent' };
      (AppService.getByCode as jest.Mock).mockResolvedValue(undefined);

      await controller.getByCode(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

