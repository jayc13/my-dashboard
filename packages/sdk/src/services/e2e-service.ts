/**
 * E2E Reports Service
 * 
 * Provides methods for interacting with E2E test reports and project status endpoints.
 */

import { BaseClient } from '../base-client';
import {
  E2EManualRun,
  E2EManualRunInput,
} from '@my-dashboard/types';

/**
 * E2E Reports and Manual Runs service
 */
export class E2EService extends BaseClient {

  // ============================================================================
  // E2E Manual Runs API Methods
  // ============================================================================

  /**
   * Get all E2E manual runs
   * @returns Promise resolving to array of E2E manual runs
   */
  public async getE2EManualRuns(): Promise<E2EManualRun[]> {
    return this.request<E2EManualRun[]>('/api/e2e_manual_runs', {
      method: 'GET',
    });
  }

  /**
   * Get E2E manual run by ID
   * @param id Run ID
   * @returns Promise resolving to E2E manual run
   */
  public async getE2EManualRun(id: number): Promise<E2EManualRun> {
    return this.request<E2EManualRun>(`/api/e2e_manual_runs/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Get E2E manual runs by app ID
   * @param appId Application ID
   * @returns Promise resolving to array of E2E manual runs
   */
  public async getE2EManualRunsByApp(appId: number): Promise<E2EManualRun[]> {
    return this.request<E2EManualRun[]>(`/api/e2e_manual_runs/app/${appId}`, {
      method: 'GET',
    });
  }

  /**
   * Get E2E manual runs by app code
   * @param appCode Application code
   * @returns Promise resolving to array of E2E manual runs
   */
  public async getE2EManualRunsByAppCode(appCode: string): Promise<E2EManualRun[]> {
    return this.request<E2EManualRun[]>(`/api/e2e_manual_runs/app-code/${encodeURIComponent(appCode)}`, {
      method: 'GET',
    });
  }

  /**
   * Create and trigger a new E2E manual run
   * @param runData E2E manual run input data
   * @returns Promise resolving to created E2E manual run
   */
  public async createE2EManualRun(runData: E2EManualRunInput): Promise<E2EManualRun> {
    return this.request<E2EManualRun>('/api/e2e_manual_runs', {
      method: 'POST',
      body: JSON.stringify(runData),
    });
  }

  /**
   * Update an E2E manual run
   * @param id Run ID
   * @param updates Run updates
   * @returns Promise resolving to updated E2E manual run
   */
  public async updateE2EManualRun(id: number, updates: Partial<E2EManualRun>): Promise<E2EManualRun> {
    return this.request<E2EManualRun>(`/api/e2e_manual_runs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete an E2E manual run
   * @param id Run ID
   * @returns Promise resolving to deletion confirmation
   */
  public async deleteE2EManualRun(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/e2e_manual_runs/${id}`, {
      method: 'DELETE',
    });
  }
}
