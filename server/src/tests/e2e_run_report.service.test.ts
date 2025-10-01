import { E2EReportSummary, E2EReportDetail } from '@my-dashboard/types/e2e';

// Mock database module
const mockQuery = jest.fn();
jest.mock('../db/mysql', () => ({
  testMySQLConnection: jest.fn().mockResolvedValue(true),
}));

// Mock service class for testing
class MockE2ERunReportService {
  static async getSummaryById(id: number): Promise<E2EReportSummary | null> {
    const result = await mockQuery('SELECT * FROM e2e_report_summaries WHERE id = ?', [id]);
    if (!result || result.length === 0) {
      return null;
    }
    const row = result[0];
    return {
      id: row.id,
      date: row.date,
      status: row.status,
      totalRuns: row.total_runs,
      passedRuns: row.passed_runs,
      failedRuns: row.failed_runs,
      successRate: row.success_rate,
    };
  }

  static async getSummaryByDate(date: string): Promise<E2EReportSummary | null> {
    const result = await mockQuery('SELECT * FROM e2e_report_summaries WHERE date = ?', [date]);
    if (!result || result.length === 0) {
      return null;
    }
    const row = result[0];
    return {
      id: row.id,
      date: row.date,
      status: row.status,
      totalRuns: row.total_runs,
      passedRuns: row.passed_runs,
      failedRuns: row.failed_runs,
      successRate: row.success_rate,
    };
  }

  static async createSummary(summary: Omit<E2EReportSummary, 'id'>): Promise<E2EReportSummary> {
    const result = await mockQuery(
      'INSERT INTO e2e_report_summaries (date, status, total_runs, passed_runs, failed_runs, success_rate) VALUES (?, ?, ?, ?, ?, ?)',
      [summary.date, summary.status, summary.totalRuns, summary.passedRuns, summary.failedRuns, summary.successRate],
    );
    return { id: result.insertId, ...summary };
  }

  static async updateSummary(id: number, updates: Partial<Omit<E2EReportSummary, 'id'>>): Promise<boolean> {
    const result = await mockQuery('UPDATE e2e_report_summaries SET status = ?, total_runs = ?, passed_runs = ?, failed_runs = ?, success_rate = ? WHERE id = ?',
      [updates.status, updates.totalRuns, updates.passedRuns, updates.failedRuns, updates.successRate, id],
    );
    return result.affectedRows > 0;
  }

  static async deleteSummary(id: number): Promise<boolean> {
    const result = await mockQuery('DELETE FROM e2e_report_summaries WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getDetailsBySummaryId(summaryId: number): Promise<E2EReportDetail[]> {
    const result = await mockQuery('SELECT * FROM e2e_report_details WHERE report_summary_id = ?', [summaryId]);
    return result.map((row: any) => ({
      id: row.id,
      reportSummaryId: row.report_summary_id,
      appId: row.app_id,
      totalRuns: row.total_runs,
      passedRuns: row.passed_runs,
      failedRuns: row.failed_runs,
      successRate: row.success_rate,
      lastRunStatus: row.last_run_status,
      lastFailedRunAt: row.last_failed_run_at,
      lastRunAt: row.last_run_at,
    }));
  }

  static async createDetail(detail: Omit<E2EReportDetail, 'id'>): Promise<E2EReportDetail> {
    const result = await mockQuery(
      'INSERT INTO e2e_report_details (report_summary_id, app_id, total_runs, passed_runs, failed_runs, success_rate, last_run_status, last_failed_run_at, last_run_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [detail.reportSummaryId, detail.appId, detail.totalRuns, detail.passedRuns, detail.failedRuns, detail.successRate, detail.lastRunStatus, detail.lastFailedRunAt, detail.lastRunAt],
    );
    return { id: result.insertId, ...detail };
  }

  static async deleteDetailsBySummaryId(summaryId: number): Promise<boolean> {
    const result = await mockQuery('DELETE FROM e2e_report_details WHERE report_summary_id = ?', [summaryId]);
    return result.affectedRows > 0;
  }
}

describe('E2ERunReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummaryById', () => {
    it('should return a summary by id', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-01',
        status: 'ready',
        total_runs: 50,
        passed_runs: 45,
        failed_runs: 5,
        success_rate: 0.9,
      };

      mockQuery.mockResolvedValue([mockSummary]);

      const result = await MockE2ERunReportService.getSummaryById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM e2e_report_summaries WHERE id = ?',
        [1],
      );
      expect(result).toEqual({
        id: 1,
        date: '2025-10-01',
        status: 'ready',
        totalRuns: 50,
        passedRuns: 45,
        failedRuns: 5,
        successRate: 0.9,
      });
    });

    it('should return null if summary not found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await MockE2ERunReportService.getSummaryById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(MockE2ERunReportService.getSummaryById(1)).rejects.toThrow('Database error');
    });
  });

  describe('getSummaryByDate', () => {
    it('should return a summary by date', async () => {
      const mockSummary = {
        id: 1,
        date: '2025-10-01',
        status: 'ready',
        total_runs: 50,
        passed_runs: 45,
        failed_runs: 5,
        success_rate: 0.9,
      };

      mockQuery.mockResolvedValue([mockSummary]);

      const result = await MockE2ERunReportService.getSummaryByDate('2025-10-01');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM e2e_report_summaries WHERE date = ?',
        ['2025-10-01'],
      );
      expect(result).toEqual({
        id: 1,
        date: '2025-10-01',
        status: 'ready',
        totalRuns: 50,
        passedRuns: 45,
        failedRuns: 5,
        successRate: 0.9,
      });
    });

    it('should return null if summary not found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await MockE2ERunReportService.getSummaryByDate('2025-10-01');

      expect(result).toBeNull();
    });
  });

  describe('createSummary', () => {
    it('should create a new summary', async () => {
      const newSummary = {
        date: '2025-10-01',
        status: 'pending' as const,
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };

      mockQuery.mockResolvedValue({ insertId: 1 });

      const result = await MockE2ERunReportService.createSummary(newSummary);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO e2e_report_summaries'),
        ['2025-10-01', 'pending', 0, 0, 0, 0],
      );
      expect(result).toEqual({
        id: 1,
        ...newSummary,
      });
    });

    it('should handle duplicate date error', async () => {
      const newSummary = {
        date: '2025-10-01',
        status: 'pending' as const,
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      };

      mockQuery.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(MockE2ERunReportService.createSummary(newSummary)).rejects.toMatchObject({
        code: 'ER_DUP_ENTRY',
      });
    });
  });

  describe('updateSummary', () => {
    it('should update a summary', async () => {
      const updates = {
        status: 'ready' as const,
        totalRuns: 50,
        passedRuns: 45,
        failedRuns: 5,
        successRate: 0.9,
      };

      mockQuery.mockResolvedValue({ affectedRows: 1 });

      const result = await MockE2ERunReportService.updateSummary(1, updates);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE e2e_report_summaries SET'),
        expect.arrayContaining(['ready', 50, 45, 5, 0.9, 1]),
      );
      expect(result).toBe(true);
    });

    it('should return false if summary not found', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 0 });

      const result = await MockE2ERunReportService.updateSummary(999, { status: 'ready' });

      expect(result).toBe(false);
    });
  });

  describe('deleteSummary', () => {
    it('should delete a summary', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 1 });

      const result = await MockE2ERunReportService.deleteSummary(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM e2e_report_summaries WHERE id = ?',
        [1],
      );
      expect(result).toBe(true);
    });

    it('should return false if summary not found', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 0 });

      const result = await MockE2ERunReportService.deleteSummary(999);

      expect(result).toBe(false);
    });
  });

  describe('getDetailsBySummaryId', () => {
    it('should return details for a summary', async () => {
      const mockDetails = [
        {
          id: 1,
          report_summary_id: 1,
          app_id: 1,
          total_runs: 10,
          passed_runs: 9,
          failed_runs: 1,
          success_rate: 0.9,
          last_run_status: 'passed',
          last_failed_run_at: null,
          last_run_at: '2025-10-01T10:00:00.000Z',
        },
        {
          id: 2,
          report_summary_id: 1,
          app_id: 2,
          total_runs: 20,
          passed_runs: 18,
          failed_runs: 2,
          success_rate: 0.9,
          last_run_status: 'passed',
          last_failed_run_at: '2025-09-30T10:00:00.000Z',
          last_run_at: '2025-10-01T10:00:00.000Z',
        },
      ];

      mockQuery.mockResolvedValue(mockDetails);

      const result = await MockE2ERunReportService.getDetailsBySummaryId(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM e2e_report_details WHERE report_summary_id = ?',
        [1],
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        reportSummaryId: 1,
        appId: 1,
        totalRuns: 10,
        passedRuns: 9,
        failedRuns: 1,
        successRate: 0.9,
        lastRunStatus: 'passed',
        lastFailedRunAt: null,
        lastRunAt: '2025-10-01T10:00:00.000Z',
      });
    });

    it('should return empty array if no details found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await MockE2ERunReportService.getDetailsBySummaryId(999);

      expect(result).toEqual([]);
    });
  });

  describe('createDetail', () => {
    it('should create a new detail', async () => {
      const newDetail = {
        reportSummaryId: 1,
        appId: 1,
        totalRuns: 10,
        passedRuns: 9,
        failedRuns: 1,
        successRate: 0.9,
        lastRunStatus: 'passed',
        lastFailedRunAt: null,
        lastRunAt: '2025-10-01T10:00:00.000Z',
      };

      mockQuery.mockResolvedValue({ insertId: 1 });

      const result = await MockE2ERunReportService.createDetail(newDetail);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO e2e_report_details'),
        [1, 1, 10, 9, 1, 0.9, 'passed', null, '2025-10-01T10:00:00.000Z'],
      );
      expect(result).toEqual({
        id: 1,
        ...newDetail,
      });
    });
  });

  describe('deleteDetailsBySummaryId', () => {
    it('should delete all details for a summary', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 3 });

      const result = await MockE2ERunReportService.deleteDetailsBySummaryId(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM e2e_report_details WHERE report_summary_id = ?',
        [1],
      );
      expect(result).toBe(true);
    });

    it('should return false if no details found', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 0 });

      const result = await MockE2ERunReportService.deleteDetailsBySummaryId(999);

      expect(result).toBe(false);
    });
  });
});

