/**
 * E2E Run Report Controller Tests
 *
 * Tests for E2E Run Report Controller functions
 */

import { Request, Response, NextFunction } from 'express';
import * as controller from '../controllers/e2e_run_report.controller';
import { E2ERunReportService } from '../services/e2e_run_report.service';
import { AppService } from '../services/app.service';

// Mock dependencies
jest.mock('../services/e2e_run_report.service');
jest.mock('../services/app.service');
jest.mock('../services/e2e_manual_run.service');
jest.mock('../processors/e2e_report.processor');

describe('E2E Run Report Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
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

  describe('getReport', () => {
    it('should return E2E report', async () => {
      mockRequest.query = { date: '2025-10-08' };

      const mockReport = {
        date: '2025-10-08',
        apps: [],
      };

      (E2ERunReportService.getReportByDate as jest.Mock).mockResolvedValue(mockReport);
      (AppService.getAll as jest.Mock).mockResolvedValue([]);

      await controller.getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should call next with error on failure', async () => {
      mockRequest.query = { date: '2025-10-08' };
      (E2ERunReportService.getReportByDate as jest.Mock).mockRejectedValue(new Error('DB error'));

      await controller.getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

});

