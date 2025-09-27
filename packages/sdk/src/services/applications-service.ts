/**
 * Applications Service
 * 
 * Provides methods for managing applications/projects in the dashboard.
 */

import { BaseClient } from '../base-client';
import { 
  Application,
  ApplicationDetails,
  CreateApplicationRequest,
  UpdateApplicationRequest,
} from '../types';

/**
 * Applications management service
 */
export class ApplicationsService extends BaseClient {
  /**
   * Get all applications
   * @returns Promise resolving to array of application details
   */
  public async getApplications(): Promise<Application[]> {
    return this.request<Application[]>('/api/apps', {
      method: 'GET',
    });
  }

  /**
   * Get application by ID
   * @param id Application ID
   * @returns Promise resolving to application details
   */
  public async getApplication(id: number): Promise<ApplicationDetails> {
    return this.request<ApplicationDetails>(`/api/apps/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Get application by code
   * @param code Application code
   * @returns Promise resolving to application details
   */
  public async getApplicationByCode(code: string): Promise<ApplicationDetails> {
    return this.request<ApplicationDetails>(`/api/apps/code/${encodeURIComponent(code)}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new application
   * @param application Application data
   * @returns Promise resolving to created application
   */
  public async createApplication(application: CreateApplicationRequest): Promise<Application> {
    return this.request<Application>('/api/apps', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  /**
   * Update an existing application
   * @param id Application ID
   * @param updates Application updates
   * @returns Promise resolving to updated application
   */
  public async updateApplication(id: number, updates: UpdateApplicationRequest): Promise<Application> {
    return this.request<Application>(`/api/apps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete an application
   * @param id Application ID
   * @returns Promise resolving to deletion confirmation
   */
  public async deleteApplication(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/apps/${id}`, {
      method: 'DELETE',
    });
  }
}
