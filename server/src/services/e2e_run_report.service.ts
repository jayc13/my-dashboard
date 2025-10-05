import { DatabaseRow, db } from '../db/database';
import { E2EReportSummary, E2EReportDetail } from '@my-dashboard/types/e2e';
import { CypressAppReportData, E2EReportProcessor } from '../processors/e2e_report.processor';
import { DateTime } from 'luxon';
import { Logger } from '../utils/logger';

/**
 * Service for managing E2E Report Summaries and Details
 */
export class E2ERunReportService {
  /**
   * Map database row to E2EReportSummary
   */
  private static mapRowToReportSummary(row: DatabaseRow): E2EReportSummary {
    return {
      id: row.id,
      date: row.date, // MySQL DATE type returns as string in YYYY-MM-DD format
      status: row.status as 'ready' | 'pending' | 'failed',
      totalRuns: row.total_runs,
      passedRuns: row.passed_runs,
      failedRuns: row.failed_runs,
      successRate: parseFloat(row.success_rate),
    };
  }

  /**
   * Map database row to E2EReportDetail
   */
  private static mapRowToReportDetail(row: DatabaseRow): E2EReportDetail {
    return {
      id: row.id,
      reportSummaryId: row.report_summary_id,
      appId: row.app_id,
      totalRuns: row.total_runs,
      passedRuns: row.passed_runs,
      failedRuns: row.failed_runs,
      successRate: parseFloat(row.success_rate),
      lastRunStatus: row.last_run_status,
      lastFailedRunAt: row.last_failed_run_at ? new Date(row.last_failed_run_at).toISOString() : null,
      lastRunAt: new Date(row.last_run_at).toISOString(),
    };
  }

  // ==================== Report Summary Methods ====================

  /**
   * Get report summary by ID
   */
  static async getSummaryById(id: number): Promise<E2EReportSummary | undefined> {
    try {
      const row = await db.get(
        'SELECT * FROM e2e_report_summaries WHERE id = ?',
        [id],
      );
      if (!row) {
        return undefined;
      }
      return this.mapRowToReportSummary(row);
    } catch (error) {
      Logger.error('Error fetching report summary by id', { id, error });
      throw error;
    }
  }

  /**
   * Get report summary by date
   */
  static async getSummaryByDate(date: string): Promise<E2EReportSummary | undefined> {
    try {
      const row = await db.get(
        'SELECT * FROM e2e_report_summaries WHERE date = ?',
        [date],
      );
      if (!row) {
        return undefined;
      }
      return this.mapRowToReportSummary(row);
    } catch (error) {
      Logger.error('Error fetching report summary by date', { date, error });
      throw error;
    }
  }

  /**
   * Create a new report summary
   */
  static async createSummary(summary: Omit<E2EReportSummary, 'id'>): Promise<E2EReportSummary | undefined> {
    try {
      const result = await db.run(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          summary.date,
          summary.status,
          summary.totalRuns,
          summary.passedRuns,
          summary.failedRuns,
          summary.successRate,
        ],
      );
      return this.getSummaryById(result.insertId!);
    } catch (error) {
      Logger.error('Error creating report summary', { error });
      throw error;
    }
  }

  /**
   * Update an existing report summary
   */
  static async updateSummary(
    id: number,
    summary: Partial<Omit<E2EReportSummary, 'id'>>,
  ): Promise<E2EReportSummary | undefined> {
    try {
      const updates: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values: any[] = [];

      if (summary.date !== undefined) {
        updates.push('date = ?');
        values.push(summary.date);
      }
      if (summary.status !== undefined) {
        updates.push('status = ?');
        values.push(summary.status);
      }
      if (summary.totalRuns !== undefined) {
        updates.push('total_runs = ?');
        values.push(summary.totalRuns);
      }
      if (summary.passedRuns !== undefined) {
        updates.push('passed_runs = ?');
        values.push(summary.passedRuns);
      }
      if (summary.failedRuns !== undefined) {
        updates.push('failed_runs = ?');
        values.push(summary.failedRuns);
      }
      if (summary.successRate !== undefined) {
        updates.push('success_rate = ?');
        values.push(summary.successRate);
      }

      if (updates.length === 0) {
        return this.getSummaryById(id);
      }

      values.push(id);
      await db.run(
        `UPDATE e2e_report_summaries SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );

      return this.getSummaryById(id);
    } catch (error) {
      Logger.error('Error updating report summary', { id, error });
      throw error;
    }
  }

  /**
   * Delete a report summary (will cascade delete associated details)
   */
  static async deleteSummary(id: number): Promise<void> {
    try {
      await db.run('DELETE FROM e2e_report_summaries WHERE id = ?', [id]);
    } catch (error) {
      Logger.error('Error deleting report summary', { id, error });
      throw error;
    }
  }

  // ==================== Report Detail Methods ====================

  /**
   * Get all report details for a specific summary
   */
  static async getDetailsBySummaryId(summaryId: number): Promise<E2EReportDetail[]> {
    try {
      const rows = await db.all(
        'SELECT * FROM e2e_report_details WHERE report_summary_id = ? ORDER BY app_id ASC',
        [summaryId],
      );
      return rows.map(this.mapRowToReportDetail);
    } catch (error) {
      Logger.error('Error fetching report details by summary id', { summaryId, error });
      throw error;
    }
  }

  /**
   * Get a specific report detail by ID
   */
  static async getDetailById(id: number): Promise<E2EReportDetail | undefined> {
    try {
      const row = await db.get(
        'SELECT * FROM e2e_report_details WHERE id = ?',
        [id],
      );
      if (!row) {
        return undefined;
      }
      return this.mapRowToReportDetail(row);
    } catch (error) {
      Logger.error('Error fetching report detail by id', { id, error });
      throw error;
    }
  }

  /**
   * Get a specific report detail by summary ID and app ID
   */
  static async getDetailBySummaryAndApp(
    summaryId: number,
    appId: number,
  ): Promise<E2EReportDetail | undefined> {
    try {
      const row = await db.get(
        'SELECT * FROM e2e_report_details WHERE report_summary_id = ? AND app_id = ?',
        [summaryId, appId],
      );
      if (!row) {
        return undefined;
      }
      return this.mapRowToReportDetail(row);
    } catch (error) {
      Logger.error('Error fetching report detail by summary and app', { summaryId, appId, error });
      throw error;
    }
  }

  /**
   * Create a new report detail
   */
  static async createDetail(
    detail: Omit<E2EReportDetail, 'id'>,
  ): Promise<E2EReportDetail | undefined> {
    try {
      const result = await db.run(
        `INSERT INTO e2e_report_details
        (report_summary_id, app_id, total_runs, passed_runs, failed_runs,
         success_rate, last_run_status, last_failed_run_at, last_run_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          detail.reportSummaryId,
          detail.appId,
          detail.totalRuns,
          detail.passedRuns,
          detail.failedRuns,
          detail.successRate,
          detail.lastRunStatus,
          detail.lastFailedRunAt,
          detail.lastRunAt,
        ],
      );
      return this.getDetailById(result.insertId!);
    } catch (error) {
      Logger.error('Error creating report detail', { error });
      throw error;
    }
  }

  /**
   * Update an existing report detail
   */
  static async updateDetail(
    id: number,
    detail: Partial<Omit<E2EReportDetail, 'id' | 'reportSummaryId' | 'appId'>>,
  ): Promise<E2EReportDetail | undefined> {
    try {
      const updates: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values: any[] = [];

      if (detail.totalRuns !== undefined) {
        updates.push('total_runs = ?');
        values.push(detail.totalRuns);
      }
      if (detail.passedRuns !== undefined) {
        updates.push('passed_runs = ?');
        values.push(detail.passedRuns);
      }
      if (detail.failedRuns !== undefined) {
        updates.push('failed_runs = ?');
        values.push(detail.failedRuns);
      }
      if (detail.successRate !== undefined) {
        updates.push('success_rate = ?');
        values.push(detail.successRate);
      }
      if (detail.lastRunStatus !== undefined) {
        updates.push('last_run_status = ?');
        values.push(detail.lastRunStatus);
      }
      if (detail.lastFailedRunAt !== undefined) {
        updates.push('last_failed_run_at = ?');
        values.push(detail.lastFailedRunAt);
      }
      if (detail.lastRunAt !== undefined) {
        updates.push('last_run_at = ?');
        values.push(detail.lastRunAt);
      }

      if (updates.length === 0) {
        return this.getDetailById(id);
      }

      values.push(id);
      await db.run(
        `UPDATE e2e_report_details SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );

      return this.getDetailById(id);
    } catch (error) {
      Logger.error('Error updating report detail', { id, error });
      throw error;
    }
  }

  /**
   * Delete a report detail
   */
  static async deleteDetail(id: number): Promise<void> {
    try {
      await db.run('DELETE FROM e2e_report_details WHERE id = ?', [id]);
    } catch (error) {
      Logger.error('Error deleting report detail', { id, error });
      throw error;
    }
  }

  /**
   * Delete all report details for a specific summary
   */
  static async deleteDetailsBySummaryId(summaryId: number): Promise<void> {
    try {
      await db.run('DELETE FROM e2e_report_details WHERE report_summary_id = ?', [summaryId]);
    } catch (error) {
      Logger.error('Error deleting report details by summary id', { summaryId, error });
      throw error;
    }
  }

  /**
   * Get report summary with all its details
   */
  static async getSummaryWithDetails(summaryId: number): Promise<{
    summary: E2EReportSummary | undefined;
    details: E2EReportDetail[];
  }> {
    try {
      const summary = await this.getSummaryById(summaryId);
      const details = summary ? await this.getDetailsBySummaryId(summaryId) : [];
      return { summary, details };
    } catch (error) {
      Logger.error('Error fetching summary with details', { summaryId, error });
      throw error;
    }
  }

  /**
   * Get report summary by date with all its details
   */
  static async getSummaryByDateWithDetails(date: string): Promise<{
    summary: E2EReportSummary | undefined;
    details: E2EReportDetail[];
  }> {
    try {
      const summary = await this.getSummaryByDate(date);
      const details = summary ? await this.getDetailsBySummaryId(summary.id) : [];
      return { summary, details };
    } catch (error) {
      Logger.error('Error fetching summary by date with details', { date, error });
      throw error;
    }
  }

  static async getLastProjectStatus(summaryId: number, appId: number): Promise<E2EReportDetail | null> {
    const detailRun = await this.getDetailBySummaryAndApp(summaryId, appId);

    if (!detailRun) {
      return null;
    }

    const summary = (await this.getSummaryById(summaryId))!;

    // Fetch latest Cypress data to ensure up-to-date status
    const updatedStatuses: CypressAppReportData[] = await E2EReportProcessor.fetchCypressData(summary.date, {
      appIds: [appId],
    });

    const updatedStatus = updatedStatuses[0];

    const updatedDetail = await this.updateDetail(detailRun.id, {
      lastRunAt: DateTime.fromISO(updatedStatus.lastRunAt).toISODate()!,
      lastFailedRunAt: updatedStatus.lastFailedRunAt ? DateTime.fromISO(updatedStatus.lastFailedRunAt).toISODate() : null,
      lastRunStatus: updatedStatus.lastRunStatus as 'passed' | 'failed',
      totalRuns: updatedStatus.totalRuns,
      passedRuns: updatedStatus.passedRuns,
      failedRuns: updatedStatus.failedRuns,
      successRate: updatedStatus.successRate,
    });

    return updatedDetail || null;
  }
}

