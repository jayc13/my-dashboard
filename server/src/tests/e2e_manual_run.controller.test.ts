/**
 * E2E Manual Run Controller Tests
 * 
 * Tests for E2EManualRunController
 */

import { Request, Response, NextFunction } from 'express';
import { E2EManualRunController } from '../controllers/e2e_manual_run.controller';
import { E2EManualRunService } from '../services/e2e_manual_run.service';

// Mock dependencies
jest.mock('../services/e2e_manual_run.service');

describe('E2EManualRunController', () => {
  let controller: E2EManualRunController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new E2EManualRunController();
    mockRequest = {
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create manual run', async () => {
      mockRequest.body = { appId: 1 };
      const mockRun = {
        id: 1,
        appId: 1,
        status: 'pending',
        createdAt: '2025-10-08T10:00:00Z',
      };

      (E2EManualRunService.create as jest.Mock).mockResolvedValue(mockRun);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2EManualRunService.create).toHaveBeenCalledWith({ appId: 1 });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRun,
      });
    });

    it('should call next with error on failure', async () => {
      mockRequest.body = { appId: 1 };
      (E2EManualRunService.create as jest.Mock).mockRejectedValue(new Error('Service error'));

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

