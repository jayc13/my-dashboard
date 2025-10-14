/**
 * E2E Reports Service
 * 
 * Provides methods for interacting with E2E test reports and project status endpoints.
 */

import { BaseClient } from '../base-client';
import {
  DetailedE2EReport,
  DetailedE2EReportOptions,
  E2EManualRun, E2EReportDetail,
} from '@my-dashboard/types';

/**
 * E2E Reports and Manual Runs service
 */
export class E2ERunService extends BaseClient {
  // ============================================================================
  // E2E Run Reports API Methods
  // ============================================================================

  /**
   * Get all E2E test reports
   * @param options Query parameters for filtering reports
   * @returns Promise resolving to array of project summaries
   */
  public async getE2EReport(options: DetailedE2EReportOptions = {}): Promise<DetailedE2EReport> {
    return this.request<DetailedE2EReport>('/api/e2e_run_report', {
      method: 'GET',
      params: {
        date: options.date,
        enrichments: options.enrichments ? JSON.stringify(options.enrichments) : undefined,
        force: options.force ? 'true' : undefined,
      },
    });
  }

  public async triggerManualRun(appId: number): Promise<E2EManualRun> {
    return this.request<E2EManualRun>('/api/e2e_manual_runs', {
      method: 'POST',
      body: JSON.stringify({
        appId,
      }),
    });
  }

  public async getAppLastStatus(summaryId: number, appId: number): Promise<E2EReportDetail> {
    return this.request<E2EReportDetail>(`/api/e2e_run_report/${summaryId}/${appId}`, {
      method: 'GET',
    });
  }

}
