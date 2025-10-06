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
}

export default PullRequestTestUtils;
