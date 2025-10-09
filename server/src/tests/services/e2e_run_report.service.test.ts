/**
 * E2E Run Report Service Tests
 *
 * Tests for E2ERunReportService including:
 * - Report summary CRUD operations
 * - Report detail CRUD operations
 * - Data mapping and transformations
 */

import { E2ERunReportService } from '../../services/e2e_run_report.service';
import { db } from '../../db/database';

// Mock dependencies
jest.mock('../../db/database');

describe('E2ERunReportService', () => {
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Report Summary Methods', () => {
    describe('getSummaryById', () => {
      it('should fetch report summary by ID', async () => {
        const mockRow = {
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          total_runs: 100,
          passed_runs: 90,
          failed_runs: 10,
          success_rate: '90.00',
        };

        mockDb.get.mockResolvedValue(mockRow);

        const result = await E2ERunReportService.getSummaryById(1);

        expect(result).toEqual({
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          totalRuns: 100,
          passedRuns: 90,
          failedRuns: 10,
          successRate: 90.00,
        });
        expect(mockDb.get).toHaveBeenCalledWith(
          'SELECT * FROM e2e_report_summaries WHERE id = ?',
          [1],
        );
      });

      it('should return undefined when summary not found', async () => {
        mockDb.get.mockResolvedValue(undefined);

        const result = await E2ERunReportService.getSummaryById(999);

        expect(result).toBeUndefined();
      });

      it('should throw error on database failure', async () => {
        mockDb.get.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.getSummaryById(1)).rejects.toThrow('Database error');
      });
    });

    describe('getSummaryByDate', () => {
      it('should fetch report summary by date', async () => {
        const mockRow = {
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          total_runs: 100,
          passed_runs: 90,
          failed_runs: 10,
          success_rate: '90.00',
        };

        mockDb.get.mockResolvedValue(mockRow);

        const result = await E2ERunReportService.getSummaryByDate('2025-10-08');

        expect(result).toEqual({
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          totalRuns: 100,
          passedRuns: 90,
          failedRuns: 10,
          successRate: 90.00,
        });
        expect(mockDb.get).toHaveBeenCalledWith(
          'SELECT * FROM e2e_report_summaries WHERE date = ?',
          ['2025-10-08'],
        );
      });

      it('should return undefined when summary not found for date', async () => {
        mockDb.get.mockResolvedValue(undefined);

        const result = await E2ERunReportService.getSummaryByDate('2025-01-01');

        expect(result).toBeUndefined();
      });

      it('should throw error on database failure', async () => {
        mockDb.get.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.getSummaryByDate('2025-10-08')).rejects.toThrow('Database error');
      });
    });

    describe('createSummary', () => {
      it('should create a new report summary', async () => {
        const newSummary = {
          date: '2025-10-08',
          status: 'ready' as const,
          totalRuns: 100,
          passedRuns: 90,
          failedRuns: 10,
          successRate: 90.00,
        };

        const mockCreatedRow = {
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          total_runs: 100,
          passed_runs: 90,
          failed_runs: 10,
          success_rate: '90.00',
        };

        mockDb.run.mockResolvedValue({ insertId: 1, affectedRows: 1 });
        mockDb.get.mockResolvedValue(mockCreatedRow);

        const result = await E2ERunReportService.createSummary(newSummary);

        expect(result).toEqual({
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          totalRuns: 100,
          passedRuns: 90,
          failedRuns: 10,
          successRate: 90.00,
        });
        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO e2e_report_summaries'),
          ['2025-10-08', 'ready', 100, 90, 10, 90.00],
        );
      });

      it('should throw error on database failure', async () => {
        const newSummary = {
          date: '2025-10-08',
          status: 'ready' as const,
          totalRuns: 100,
          passedRuns: 90,
          failedRuns: 10,
          successRate: 90.00,
        };

        mockDb.run.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.createSummary(newSummary)).rejects.toThrow('Database error');
      });
    });

    describe('updateSummary', () => {
      it('should update report summary with partial fields', async () => {
        const updates = {
          status: 'failed' as const,
          totalRuns: 120,
        };

        const mockUpdatedRow = {
          id: 1,
          date: '2025-10-08',
          status: 'failed',
          total_runs: 120,
          passed_runs: 90,
          failed_runs: 30,
          success_rate: '75.00',
        };

        mockDb.run.mockResolvedValue({ affectedRows: 1, insertId: undefined });
        mockDb.get.mockResolvedValue(mockUpdatedRow);

        const result = await E2ERunReportService.updateSummary(1, updates);

        expect(result).toBeDefined();
        expect(mockDb.run).toHaveBeenCalledWith(
          'UPDATE e2e_report_summaries SET status = ?, total_runs = ? WHERE id = ?',
          ['failed', 120, 1],
        );
      });

      it('should return existing summary when no updates provided', async () => {
        const mockRow = {
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          total_runs: 100,
          passed_runs: 90,
          failed_runs: 10,
          success_rate: '90.00',
        };

        mockDb.get.mockResolvedValue(mockRow);

        const result = await E2ERunReportService.updateSummary(1, {});

        expect(result).toBeDefined();
        expect(mockDb.run).not.toHaveBeenCalled();
        expect(mockDb.get).toHaveBeenCalledWith(
          'SELECT * FROM e2e_report_summaries WHERE id = ?',
          [1],
        );
      });

      it('should throw error on database failure', async () => {
        mockDb.run.mockRejectedValue(new Error('Database error'));

        await expect(
          E2ERunReportService.updateSummary(1, { status: 'failed' }),
        ).rejects.toThrow('Database error');
      });
    });

    describe('deleteSummary', () => {
      it('should delete report summary', async () => {
        mockDb.run.mockResolvedValue({ affectedRows: 1, insertId: undefined });

        await E2ERunReportService.deleteSummary(1);

        expect(mockDb.run).toHaveBeenCalledWith(
          'DELETE FROM e2e_report_summaries WHERE id = ?',
          [1],
        );
      });

      it('should throw error on database failure', async () => {
        mockDb.run.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.deleteSummary(1)).rejects.toThrow('Database error');
      });
    });

  });




  describe('Report Detail Methods', () => {
    describe('getDetailsBySummaryId', () => {
      it('should fetch all details for a summary', async () => {
        const mockRows = [
          {
            id: 1,
            report_summary_id: 1,
            app_id: 101,
            total_runs: 10,
            passed_runs: 9,
            failed_runs: 1,
            success_rate: '90.00',
            last_run_status: 'passed',
            last_failed_run_at: null,
            last_run_at: '2025-10-08 10:00:00',
          },
          {
            id: 2,
            report_summary_id: 1,
            app_id: 102,
            total_runs: 5,
            passed_runs: 4,
            failed_runs: 1,
            success_rate: '80.00',
            last_run_status: 'failed',
            last_failed_run_at: '2025-10-08 09:00:00',
            last_run_at: '2025-10-08 09:00:00',
          },
        ];

        mockDb.all.mockResolvedValue(mockRows);

        const result = await E2ERunReportService.getDetailsBySummaryId(1);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: 1,
          reportSummaryId: 1,
          appId: 101,
          totalRuns: 10,
          passedRuns: 9,
          failedRuns: 1,
          successRate: 90.00,
          lastRunStatus: 'passed',
          lastFailedRunAt: null,
          lastRunAt: new Date('2025-10-08 10:00:00').toISOString(),
        });
        expect(mockDb.all).toHaveBeenCalledWith(
          'SELECT * FROM e2e_report_details WHERE report_summary_id = ? ORDER BY app_id ASC',
          [1],
        );
      });

      it('should return empty array when no details found', async () => {
        mockDb.all.mockResolvedValue([]);

        const result = await E2ERunReportService.getDetailsBySummaryId(999);

        expect(result).toEqual([]);
      });

      it('should throw error on database failure', async () => {
        mockDb.all.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.getDetailsBySummaryId(1)).rejects.toThrow('Database error');
      });
    });

    describe('getDetailById', () => {
      it('should fetch report detail by ID', async () => {
        const mockRow = {
          id: 1,
          report_summary_id: 1,
          app_id: 101,
          total_runs: 10,
          passed_runs: 9,
          failed_runs: 1,
          success_rate: '90.00',
          last_run_status: 'passed',
          last_failed_run_at: null,
          last_run_at: '2025-10-08 10:00:00',
        };

        mockDb.get.mockResolvedValue(mockRow);

        const result = await E2ERunReportService.getDetailById(1);

        expect(result).toEqual({
          id: 1,
          reportSummaryId: 1,
          appId: 101,
          totalRuns: 10,
          passedRuns: 9,
          failedRuns: 1,
          successRate: 90.00,
          lastRunStatus: 'passed',
          lastFailedRunAt: null,
          lastRunAt: new Date('2025-10-08 10:00:00').toISOString(),
        });
      });

      it('should return undefined when detail not found', async () => {
        mockDb.get.mockResolvedValue(undefined);

        const result = await E2ERunReportService.getDetailById(999);

        expect(result).toBeUndefined();
      });

      it('should throw error on database failure', async () => {
        mockDb.get.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.getDetailById(1)).rejects.toThrow('Database error');
      });
    });

    describe('getDetailBySummaryAndApp', () => {
      it('should fetch detail by summary ID and app ID', async () => {
        const mockRow = {
          id: 1,
          report_summary_id: 1,
          app_id: 101,
          total_runs: 10,
          passed_runs: 9,
          failed_runs: 1,
          success_rate: '90.00',
          last_run_status: 'passed',
          last_failed_run_at: null,
          last_run_at: '2025-10-08 10:00:00',
        };

        mockDb.get.mockResolvedValue(mockRow);

        const result = await E2ERunReportService.getDetailBySummaryAndApp(1, 101);

        expect(result).toEqual({
          id: 1,
          reportSummaryId: 1,
          appId: 101,
          totalRuns: 10,
          passedRuns: 9,
          failedRuns: 1,
          successRate: 90.00,
          lastRunStatus: 'passed',
          lastFailedRunAt: null,
          lastRunAt: new Date('2025-10-08 10:00:00').toISOString(),
        });
        expect(mockDb.get).toHaveBeenCalledWith(
          'SELECT * FROM e2e_report_details WHERE report_summary_id = ? AND app_id = ?',
          [1, 101],
        );
      });

      it('should return undefined when detail not found', async () => {
        mockDb.get.mockResolvedValue(undefined);

        const result = await E2ERunReportService.getDetailBySummaryAndApp(1, 999);

        expect(result).toBeUndefined();
      });
    });


    describe('createDetail', () => {
      it('should create a new report detail', async () => {
        const newDetail = {
          reportSummaryId: 1,
          appId: 101,
          totalRuns: 10,
          passedRuns: 9,
          failedRuns: 1,
          successRate: 90.00,
          lastRunStatus: 'passed' as const,
          lastFailedRunAt: null,
          lastRunAt: '2025-10-08T10:00:00Z',
        };

        const mockCreatedRow = {
          id: 1,
          report_summary_id: 1,
          app_id: 101,
          total_runs: 10,
          passed_runs: 9,
          failed_runs: 1,
          success_rate: '90.00',
          last_run_status: 'passed',
          last_failed_run_at: null,
          last_run_at: '2025-10-08 10:00:00',
        };

        mockDb.run.mockResolvedValue({ insertId: 1, affectedRows: 1 });
        mockDb.get.mockResolvedValue(mockCreatedRow);

        const result = await E2ERunReportService.createDetail(newDetail);

        expect(result).toBeDefined();
        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO e2e_report_details'),
          expect.arrayContaining([1, 101, 10, 9, 1, 90.00, 'passed']),
        );
      });

      it('should throw error on database failure', async () => {
        const newDetail = {
          reportSummaryId: 1,
          appId: 101,
          totalRuns: 10,
          passedRuns: 9,
          failedRuns: 1,
          successRate: 90.00,
          lastRunStatus: 'passed' as const,
          lastFailedRunAt: null,
          lastRunAt: '2025-10-08T10:00:00Z',
        };

        mockDb.run.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.createDetail(newDetail)).rejects.toThrow('Database error');
      });
    });

    describe('updateDetail', () => {
      it('should update report detail with partial fields', async () => {
        const updates = {
          totalRuns: 15,
          passedRuns: 12,
          failedRuns: 3,
          successRate: 80.00,
        };

        const mockUpdatedRow = {
          id: 1,
          report_summary_id: 1,
          app_id: 101,
          total_runs: 15,
          passed_runs: 12,
          failed_runs: 3,
          success_rate: '80.00',
          last_run_status: 'passed',
          last_failed_run_at: null,
          last_run_at: '2025-10-08 10:00:00',
        };

        mockDb.run.mockResolvedValue({ affectedRows: 1, insertId: undefined });
        mockDb.get.mockResolvedValue(mockUpdatedRow);

        const result = await E2ERunReportService.updateDetail(1, updates);

        expect(result).toBeDefined();
        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE e2e_report_details SET'),
          expect.arrayContaining([15, 12, 3, 80.00, 1]),
        );
      });

      it('should return existing detail when no updates provided', async () => {
        const mockRow = {
          id: 1,
          report_summary_id: 1,
          app_id: 101,
          total_runs: 10,
          passed_runs: 9,
          failed_runs: 1,
          success_rate: '90.00',
          last_run_status: 'passed',
          last_failed_run_at: null,
          last_run_at: '2025-10-08 10:00:00',
        };

        mockDb.get.mockResolvedValue(mockRow);

        const result = await E2ERunReportService.updateDetail(1, {});

        expect(result).toBeDefined();
        expect(mockDb.run).not.toHaveBeenCalled();
      });

      it('should throw error on database failure', async () => {
        mockDb.run.mockRejectedValue(new Error('Database error'));

        await expect(
          E2ERunReportService.updateDetail(1, { totalRuns: 20 }),
        ).rejects.toThrow('Database error');
      });
    });

    describe('deleteDetail', () => {
      it('should delete report detail', async () => {
        mockDb.run.mockResolvedValue({ affectedRows: 1, insertId: undefined });

        await E2ERunReportService.deleteDetail(1);

        expect(mockDb.run).toHaveBeenCalledWith(
          'DELETE FROM e2e_report_details WHERE id = ?',
          [1],
        );
      });

      it('should throw error on database failure', async () => {
        mockDb.run.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.deleteDetail(1)).rejects.toThrow('Database error');
      });
    });

    describe('deleteDetailsBySummaryId', () => {
      it('should delete all details for a summary', async () => {
        mockDb.run.mockResolvedValue({ affectedRows: 3, insertId: undefined });

        await E2ERunReportService.deleteDetailsBySummaryId(1);

        expect(mockDb.run).toHaveBeenCalledWith(
          'DELETE FROM e2e_report_details WHERE report_summary_id = ?',
          [1],
        );
      });

      it('should throw error on database failure', async () => {
        mockDb.run.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.deleteDetailsBySummaryId(1)).rejects.toThrow('Database error');
      });
    });

    describe('getSummaryWithDetails', () => {
      it('should fetch summary with all its details', async () => {
        const mockSummaryRow = {
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          total_runs: 100,
          passed_runs: 90,
          failed_runs: 10,
          success_rate: '90.00',
        };

        const mockDetailRows = [
          {
            id: 1,
            report_summary_id: 1,
            app_id: 101,
            total_runs: 10,
            passed_runs: 9,
            failed_runs: 1,
            success_rate: '90.00',
            last_run_status: 'passed',
            last_failed_run_at: null,
            last_run_at: '2025-10-08 10:00:00',
          },
        ];

        mockDb.get.mockResolvedValue(mockSummaryRow);
        mockDb.all.mockResolvedValue(mockDetailRows);

        const result = await E2ERunReportService.getSummaryWithDetails(1);

        expect(result.summary).toBeDefined();
        expect(result.details).toHaveLength(1);
        expect(result.summary?.id).toBe(1);
        expect(result.details[0].appId).toBe(101);
      });

      it('should return empty details when summary not found', async () => {
        mockDb.get.mockResolvedValue(undefined);

        const result = await E2ERunReportService.getSummaryWithDetails(999);

        expect(result.summary).toBeUndefined();
        expect(result.details).toEqual([]);
      });

      it('should throw error on database failure', async () => {
        mockDb.get.mockRejectedValue(new Error('Database error'));

        await expect(E2ERunReportService.getSummaryWithDetails(1)).rejects.toThrow('Database error');
      });
    });

    describe('getSummaryByDateWithDetails', () => {
      it('should fetch summary by date with all its details', async () => {
        const mockSummaryRow = {
          id: 1,
          date: '2025-10-08',
          status: 'ready',
          total_runs: 100,
          passed_runs: 90,
          failed_runs: 10,
          success_rate: '90.00',
        };

        const mockDetailRows = [
          {
            id: 1,
            report_summary_id: 1,
            app_id: 101,
            total_runs: 10,
            passed_runs: 9,
            failed_runs: 1,
            success_rate: '90.00',
            last_run_status: 'passed',
            last_failed_run_at: null,
            last_run_at: '2025-10-08 10:00:00',
          },
        ];

        mockDb.get.mockResolvedValue(mockSummaryRow);
        mockDb.all.mockResolvedValue(mockDetailRows);

        const result = await E2ERunReportService.getSummaryByDateWithDetails('2025-10-08');

        expect(result.summary).toBeDefined();
        expect(result.details).toHaveLength(1);
        expect(result.summary?.date).toBe('2025-10-08');
      });

      it('should return empty details when summary not found for date', async () => {
        mockDb.get.mockResolvedValue(undefined);

        const result = await E2ERunReportService.getSummaryByDateWithDetails('2025-01-01');

        expect(result.summary).toBeUndefined();
        expect(result.details).toEqual([]);
      });

      it('should throw error on database failure', async () => {
        mockDb.get.mockRejectedValue(new Error('Database error'));

        await expect(
          E2ERunReportService.getSummaryByDateWithDetails('2025-10-08'),
        ).rejects.toThrow('Database error');
      });
    });
  });
});

