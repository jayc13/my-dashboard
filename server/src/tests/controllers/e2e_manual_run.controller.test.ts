/**
 * E2E Manual Run Controller Tests
 * 
 * Tests for E2EManualRunController including:
 * - Create manual run
 */

import { Request, Response, NextFunction } from 'express';
import { E2EManualRunController } from '../../controllers/e2e_manual_run.controller';
import { E2EManualRunService } from '../../services/e2e_manual_run.service';
import { ValidationError, ConflictError, DatabaseError } from '../../errors';

// Mock dependencies
jest.mock('../../services/e2e_manual_run.service');

describe('E2EManualRunController', () => {
  let controller: E2EManualRunController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new E2EManualRunController();
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

  describe('create', () => {
    it('should create a new manual run', async () => {
      const mockRun = {
        id: 1,
        app_id: 5,
        pipeline_id: 'pipeline-123',
        created_at: '2025-10-09T00:00:00.000Z',
      };
      mockRequest.body = { appId: 5 };
      (E2EManualRunService.create as jest.Mock).mockResolvedValue(mockRun);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2EManualRunService.create).toHaveBeenCalledWith({ appId: 5 });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 1,
          appId: 5,
          pipelineId: 'pipeline-123',
          createdAt: '2025-10-09T00:00:00.000Z',
        },
      });
    });

    it('should call next with ValidationError when appId is missing', async () => {
      mockRequest.body = {};

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with ValidationError when appId is invalid', async () => {
      mockRequest.body = { appId: 'invalid' };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with ValidationError when app does not exist', async () => {
      mockRequest.body = { appId: 999 };
      (E2EManualRunService.create as jest.Mock).mockRejectedValue(
        new Error('FOREIGN KEY constraint failed')
      );

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid appId: app does not exist',
        })
      );
    });

    it('should call next with ConflictError when manual run is already in progress', async () => {
      mockRequest.body = { appId: 5 };
      (E2EManualRunService.create as jest.Mock).mockRejectedValue(
        new Error('manual run is already in progress')
      );

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ConflictError));
    });

    it('should call next with DatabaseError when service throws other error', async () => {
      mockRequest.body = { appId: 5 };
      (E2EManualRunService.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });
});

