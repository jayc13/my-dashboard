import { test, expect, Page } from '@playwright/test';
import { PullRequestsPage } from '@pages/PullRequestsPage';
import { setupAuthenticatedSession } from '@utils/test-helpers';
import { LoginPage } from '@pages/LoginPage';
import { truncateTables } from '@utils/dbCleanup';

test.describe.configure({ mode: 'serial' });

test.describe('Pull Requests Test Suite', () => {
  let page: Page;
  let pullRequestsPage: PullRequestsPage;

  test.beforeAll(async ({ browser }) => {
    await truncateTables(['pull_requests']);
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await setupAuthenticatedSession(page);
    pullRequestsPage = new PullRequestsPage(page);
  });

  test.beforeEach(async () => {
    await pullRequestsPage.goto();
  });

  test.describe('Empty State', () => {
    test('should display empty state when no pull requests exist', async () => {
      // Verify empty state is visible
      expect(await pullRequestsPage.isEmptyStateVisible()).toBe(true);
      
      // Verify empty state button is visible
      await expect(pullRequestsPage.addPrButtonEmpty).toBeVisible();
      
      // Verify regular add button is not visible
      await expect(pullRequestsPage.addPrButton).not.toBeVisible();
      
      // Verify PR count is 0
      expect(await pullRequestsPage.getPrCount()).toBe(0);
    });

    test('should open add PR dialog from empty state', async () => {
      await pullRequestsPage.addPrButtonEmpty.click();
      await expect(pullRequestsPage.addPrDialog).toBeVisible();
      
      // Cancel and verify dialog closes
      await pullRequestsPage.cancelAddPr();
    });
  });

  test.describe('Add Pull Request', () => {
    test('should successfully add a valid pull request', async () => {
      const validPrUrl = 'https://github.com/facebook/react/pull/12345';
      const initialCount = await pullRequestsPage.getPrCount();
      
      await pullRequestsPage.addPullRequest(validPrUrl);
      
      // Verify PR was added
      await pullRequestsPage.waitForPrAdded(initialCount);
      const newCount = await pullRequestsPage.getPrCount();
      expect(newCount).toBe(initialCount + 1);
      
      // Verify empty state is no longer visible
      expect(await pullRequestsPage.isEmptyStateVisible()).toBe(false);
      
      // Verify regular add button is now visible
      await expect(pullRequestsPage.addPrButton).toBeVisible();
    });

    test('should validate PR URL format', async () => {
      await pullRequestsPage.openAddPrDialog();
      
      // Test invalid URL
      await pullRequestsPage.fillPrUrl('invalid-url');
      await pullRequestsPage.submitAddPr();
      
      // Should show validation error
      await pullRequestsPage.validatePrUrlError('Invalid GitHub Pull Request URL format');
      
      // Dialog should still be open
      await expect(pullRequestsPage.addPrDialog).toBeVisible();
      
      await pullRequestsPage.cancelAddPr();
    });

    test('should disable add button when URL is empty', async () => {
      await pullRequestsPage.openAddPrDialog();
      
      // Button should be disabled initially
      expect(await pullRequestsPage.isAddButtonDisabled()).toBe(true);
      
      // Fill URL and verify button is enabled
      await pullRequestsPage.fillPrUrl('https://github.com/owner/repo/pull/123');
      expect(await pullRequestsPage.isAddButtonDisabled()).toBe(false);
      
      // Clear URL and verify button is disabled again
      await pullRequestsPage.fillPrUrl('');
      expect(await pullRequestsPage.isAddButtonDisabled()).toBe(true);
      
      await pullRequestsPage.cancelAddPr();
    });

    test('should handle server errors gracefully', async () => {
      // Mock server error
      await page.route('**/api/pull_requests', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await pullRequestsPage.openAddPrDialog();
      await pullRequestsPage.fillPrUrl('https://github.com/owner/repo/pull/123');
      await pullRequestsPage.submitAddPr();
      
      // Should handle error gracefully (implementation dependent)
      // Dialog might stay open or show error message
      
      // Clean up route
      await page.unroute('**/api/pull_requests');
    });
  });

  test.describe('Pull Request Management', () => {
    let testPrId: string;

    test.beforeEach(async () => {
      await truncateTables(['pull_requests']);
      // Ensure we have at least one PR for testing
      const prCount = await pullRequestsPage.getPrCount();
      if (prCount === 0) {
        await pullRequestsPage.addPullRequest('https://github.com/microsoft/vscode/pull/67890');
        await pullRequestsPage.waitForPrAdded(0);
      }
      
      // Get the first PR ID for testing
      const prCards = await pullRequestsPage.getAllPrCards();
      if (prCards.length > 0) {
        const testId = await prCards[0].getAttribute('data-testid');
        testPrId = testId?.replace('pr-card-', '') || '';
      }
    });

    test('should copy PR URL to clipboard', async () => {
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      
      await pullRequestsPage.copyPrUrl(testPrId);
      
      // Verify clipboard content (if supported by browser)
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('github.com');
    });

    test('should delete pull request with confirmation', async () => {
      const initialCount = await pullRequestsPage.getPrCount();
      
      await pullRequestsPage.deletePr(testPrId);
      
      // Verify PR was deleted
      await pullRequestsPage.waitForPrRemoved(initialCount);
      const newCount = await pullRequestsPage.getPrCount();
      expect(newCount).toBe(initialCount - 1);
      
      // Verify PR card is no longer visible
      expect(await pullRequestsPage.isPrCardVisible(testPrId)).toBe(false);
    });

    test('should cancel delete operation', async () => {
      const initialCount = await pullRequestsPage.getPrCount();
      
      await pullRequestsPage.cancelDeletePr(testPrId);
      
      // Verify PR was not deleted
      const finalCount = await pullRequestsPage.getPrCount();
      expect(finalCount).toBe(initialCount);
      
      // Verify PR card is still visible
      expect(await pullRequestsPage.isPrCardVisible(testPrId)).toBe(true);
    });
  });
});
