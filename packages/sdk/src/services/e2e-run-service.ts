/**
 * E2E Reports Service
 * 
 * Provides methods for interacting with E2E test reports and project status endpoints.
 */

import { BaseClient } from '../base-client';
import {
  DetailedE2EReport,
  DetailedE2EReportOptions,
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
        enrichments: JSON.stringify(options.enrichments || {}),
      },
    });
  }
}
