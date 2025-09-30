import { Page } from '@playwright/test';

/**
 * Pull Request Test Utilities
 * Provides interceptors for pull request API operations similar to NotificationTestUtils
 */
class PullRequestTestUtils {
  /**
   * Wait for GET all pull requests API request to complete
   */
  static async interceptGetAllPullRequests(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/pull_requests') && response.request().method() === 'GET',
    );
  }

  /**
   * Wait for POST add pull request API request to complete
   */
  static async interceptAddPullRequest(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/pull_requests') && response.request().method() === 'POST',
    );
  }

  /**
   * Wait for GET pull request details API request to complete
   */
  static async interceptGetPullRequestDetails(page: Page, prId: string) {
    return page.waitForResponse(
      response => response.url().includes(`/api/pull_requests/${prId}`) &&
                 response.request().method() === 'GET',
    );
  }

  /**
   * Wait for DELETE pull request API request to complete
   */
  static async interceptDeletePullRequest(page: Page, prId: string) {
    return page.waitForResponse(
      response => response.url().includes(`/api/pull_requests/${prId}`) &&
                 response.request().method() === 'DELETE',
    );
  }

  /**
   * Wait for multiple DELETE requests (for delete all functionality if implemented)
   */
  static async interceptDeleteAllPullRequests(page: Page, expectedCount: number) {
    const responses = [];
    for (let i = 0; i < expectedCount; i++) {
      responses.push(
        page.waitForResponse(
          response => response.url().includes('/api/pull_requests/') &&
                     response.request().method() === 'DELETE',
        ),
      );
    }
    return Promise.all(responses);
  }

  /**
   * Mock GitHub API responses for pull request details
   */
  static async mockGitHubPullRequestDetails(page: Page, prId: string, mockData?: any) {
    const defaultMockData = {
      id: 789012345,
      number: 12345,
      title: 'feat: add new feature',
      state: 'open',
      draft: false,
      merged: false,
      mergeable_state: 'clean',
      html_url: 'https://github.com/facebook/react/pull/12345',
      created_at: '2025-09-20T10:30:00.000Z',
      updated_at: '2025-09-20T15:45:00.000Z',
      closed_at: null,
      merged_at: null,
      labels: [
        { name: 'feature', color: '0e8a16' },
        { name: 'frontend', color: '1d76db' },
      ],
      user: {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
        html_url: 'https://github.com/testuser',
      },
    };

    await page.route(`**/api/pull_requests/${prId}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData || defaultMockData),
      });
    });
  }

  /**
   * Mock GitHub API error responses
   */
  static async mockGitHubApiError(page: Page, prId: string, statusCode: number = 404) {
    await page.route(`**/api/pull_requests/${prId}`, async route => {
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: statusCode === 404 ? 'Pull request not found' : 'GitHub API error',
          message: `HTTP ${statusCode}`,
        }),
      });
    });
  }
}

export default PullRequestTestUtils;
