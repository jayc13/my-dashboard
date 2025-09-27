/**
 * Pull Requests Service
 * 
 * Provides methods for managing GitHub pull requests tracking.
 */

import { BaseClient } from '../base-client';
import { 
  PullRequest,
  GithubPullRequestDetails,
  AddPullRequestRequest,
} from '../types';

/**
 * Pull requests management service
 */
export class PullRequestsService extends BaseClient {
  /**
   * Get all pull requests
   * @returns Promise resolving to array of pull requests
   */
  public async getPullRequests(): Promise<PullRequest[]> {
    return this.request<PullRequest[]>('/api/pull_requests', {
      method: 'GET',
    });
  }

  /**
   * Add a new pull request
   * @param pullRequest Pull request data
   * @returns Promise resolving to created pull request
   */
  public async addPullRequest(pullRequest: AddPullRequestRequest): Promise<PullRequest> {
    return this.request<PullRequest>('/api/pull_requests', {
      method: 'POST',
      body: JSON.stringify(pullRequest),
    });
  }

  /**
   * Get detailed information about a pull request from GitHub
   * @param id Pull request ID
   * @returns Promise resolving to GitHub pull request details
   */
  public async getPullRequestDetails(id: string): Promise<GithubPullRequestDetails> {
    return this.request<GithubPullRequestDetails>(`/api/pull_requests/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  }

  /**
   * Delete a pull request
   * @param id Pull request ID
   * @returns Promise resolving to deletion confirmation
   */
  public async deletePullRequest(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/pull_requests/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
