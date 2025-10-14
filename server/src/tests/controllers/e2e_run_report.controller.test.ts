/**
 * E2E Run Report Controller Tests
 * 
 * Tests for E2E Run Report Controller including:
 * - Get report with various enrichments
 * - Get last project status
 */

import { Request, Response, NextFunction } from 'express';
import { getReport, getLastProjectStatus } from '../../controllers/e2e_run_report.controller';
import { E2ERunReportService } from '../../services/e2e_run_report.service';
import { AppService } from '../../services/app.service';
import { E2EManualRunService } from '../../services/e2e_manual_run.service';
import { publishE2EReportRequest } from '../../processors/e2e_report.processor';
import { ValidationError, DatabaseError, NotFoundError } from '../../errors';

// Mock dependencies
jest.mock('../../services/e2e_run_report.service');
jest.mock('../../services/app.service');
jest.mock('../../services/e2e_manual_run.service');
jest.mock('../../processors/e2e_report.processor');

describe('E2E Run Report Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getReport', () => {
    it('should return report with default date (today)', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      const mockDetails = [
        { id: 1, appId: 1, totalRuns: 5, passedRuns: 4, failedRuns: 1 },
        { id: 2, appId: 2, totalRuns: 5, passedRuns: 4, failedRuns: 1 },
      ];
      const mockApp = { id: 1, name: 'App 1', code: 'app1' };
      const mockManualRuns = [{ id: 1, appId: 1, pipelineId: 'pipeline-1' }];

      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);
      (E2ERunReportService.getDetailsBySummaryId as jest.Mock).mockResolvedValue(mockDetails);
      (AppService.getById as jest.Mock).mockResolvedValue(mockApp);
      (E2EManualRunService.getByAppId as jest.Mock).mockResolvedValue(mockManualRuns);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2ERunReportService.getSummaryByDate).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: true,
        summary: mockSummary,
        details: expect.any(Array),
      });
    });

    it('should return report for specific date', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-08',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      mockRequest.query = { date: '2025-10-08' };
      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);
      (E2ERunReportService.getDetailsBySummaryId as jest.Mock).mockResolvedValue([]);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2ERunReportService.getSummaryByDate).toHaveBeenCalledWith('2025-10-08');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 202 when report is pending', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'pending',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };
      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: true,
        summary: expect.objectContaining({ status: 'pending' }),
        details: [],
        message: 'Report is being generated. Please check back later.',
      });
    });

    it('should trigger report generation when summary does not exist', async () => {
      mockRequest.query = { date: '2025-10-09' };
      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(null);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(publishE2EReportRequest).toHaveBeenCalledWith('2025-10-09');
      expect(mockResponse.status).toHaveBeenCalledWith(202);
    });

    it('should handle enrichments parameter', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      mockRequest.query = {
        enrichments: JSON.stringify({
          includeDetails: false,
          includeAppInfo: false,
          includeManualRuns: false,
        }),
      };
      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: true,
        summary: mockSummary,
        details: undefined,
      });
    });

    it('should skip app when app info is not found', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      const mockDetails = [
        { id: 1, appId: 1, totalRuns: 5, passedRuns: 4, failedRuns: 1 },
        { id: 2, appId: 999, totalRuns: 5, passedRuns: 4, failedRuns: 1 },
      ];
      const mockApp = { id: 1, name: 'App 1', code: 'app1' };

      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);
      (E2ERunReportService.getDetailsBySummaryId as jest.Mock).mockResolvedValue(mockDetails);
      (AppService.getById as jest.Mock)
        .mockResolvedValueOnce(mockApp)
        .mockResolvedValueOnce(undefined);
      (E2EManualRunService.getByAppId as jest.Mock).mockResolvedValue([]);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const sendCall = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sendCall.details).toHaveLength(1);
    });

    it('should call next with ValidationError when date format is invalid', async () => {
      mockRequest.query = { date: 'invalid-date' };

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with ValidationError when enrichments is invalid JSON', async () => {
      mockRequest.query = { enrichments: 'invalid-json' };

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      (E2ERunReportService.getSummaryByDate as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });

    it('should include manual runs when includeManualRuns is true', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      const mockDetails = [
        { id: 1, appId: 1, totalRuns: 5, passedRuns: 4, failedRuns: 1 },
      ];
      const mockApp = { id: 1, name: 'App 1', code: 'app1' };
      const mockManualRuns = [{ id: 1, appId: 1, pipelineId: 'pipeline-1' }];

      mockRequest.query = {
        enrichments: JSON.stringify({
          includeDetails: true,
          includeAppInfo: true,
          includeManualRuns: true,
        }),
      };

      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);
      (E2ERunReportService.getDetailsBySummaryId as jest.Mock).mockResolvedValue(mockDetails);
      (AppService.getById as jest.Mock).mockResolvedValue(mockApp);
      (E2EManualRunService.getByAppId as jest.Mock).mockResolvedValue(mockManualRuns);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2EManualRunService.getByAppId).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should not include manual runs when includeManualRuns is false', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      const mockDetails = [
        { id: 1, appId: 1, totalRuns: 5, passedRuns: 4, failedRuns: 1 },
      ];
      const mockApp = { id: 1, name: 'App 1', code: 'app1' };

      mockRequest.query = {
        enrichments: JSON.stringify({
          includeDetails: true,
          includeAppInfo: true,
          includeManualRuns: false,
        }),
      };

      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);
      (E2ERunReportService.getDetailsBySummaryId as jest.Mock).mockResolvedValue(mockDetails);
      (AppService.getById as jest.Mock).mockResolvedValue(mockApp);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2EManualRunService.getByAppId).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should delete existing report and trigger regeneration when force=true', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      mockRequest.query = { date: '2025-10-09', force: 'true' };
      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);
      (E2ERunReportService.deleteSummary as jest.Mock).mockResolvedValue(undefined);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2ERunReportService.getSummaryByDate).toHaveBeenCalledWith('2025-10-09');
      expect(E2ERunReportService.deleteSummary).toHaveBeenCalledWith(1);
      expect(publishE2EReportRequest).toHaveBeenCalledWith('2025-10-09');
      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: true,
        summary: expect.objectContaining({ status: 'pending' }),
        details: [],
        message: 'Report is being generated. Please check back later.',
      });
    });

    it('should not delete report when force=false', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      mockRequest.query = { date: '2025-10-09', force: 'false' };
      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);
      (E2ERunReportService.getDetailsBySummaryId as jest.Mock).mockResolvedValue([]);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2ERunReportService.deleteSummary).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle force=1 as true', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-09',
        status: 'ready',
        totalRuns: 10,
        passedRuns: 8,
        failedRuns: 2,
        successRate: 0.8,
      };
      mockRequest.query = { date: '2025-10-09', force: '1' };
      (E2ERunReportService.getSummaryByDate as jest.Mock).mockResolvedValue(mockSummary);
      (E2ERunReportService.deleteSummary as jest.Mock).mockResolvedValue(undefined);

      await getReport(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2ERunReportService.deleteSummary).toHaveBeenCalledWith(1);
      expect(publishE2EReportRequest).toHaveBeenCalledWith('2025-10-09');
    });
  });

  describe('getLastProjectStatus', () => {
    it('should return last project status', async () => {
      const mockStatus = {
        id: 1,
        appId: 1,
        totalRuns: 5,
        passedRuns: 4,
        failedRuns: 1,
        successRate: 0.8,
      };
      mockRequest.params = { appId: '1', summaryId: '10' };
      (E2ERunReportService.getLastProjectStatus as jest.Mock).mockResolvedValue(mockStatus);

      await getLastProjectStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(E2ERunReportService.getLastProjectStatus).toHaveBeenCalledWith(10, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStatus,
      });
    });

    it('should call next with NotFoundError when status does not exist', async () => {
      mockRequest.params = { appId: '1', summaryId: '10' };
      (E2ERunReportService.getLastProjectStatus as jest.Mock).mockResolvedValue(null);

      await getLastProjectStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with ValidationError when appId is invalid', async () => {
      mockRequest.params = { appId: 'invalid', summaryId: '10' };

      await getLastProjectStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with ValidationError when summaryId is invalid', async () => {
      mockRequest.params = { appId: '1', summaryId: 'invalid' };

      await getLastProjectStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next with DatabaseError when service throws error', async () => {
      mockRequest.params = { appId: '1', summaryId: '10' };
      (E2ERunReportService.getLastProjectStatus as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getLastProjectStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });
});

