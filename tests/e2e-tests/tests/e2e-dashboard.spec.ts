import { test, expect, Page } from '@playwright/test';
import { E2EPage } from '@pages/E2EPage';
import { setupAuthenticatedSession } from '@utils/test-helpers';
import { LoginPage } from '@pages/LoginPage';
import { E2EDataGenerator, E2ETestUtils } from '@utils/e2e-test-helpers';

test.describe('E2E Dashboard Test Suite', () => {
  let page: Page;
  let e2ePage: E2EPage;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await setupAuthenticatedSession(page);
    e2ePage = new E2EPage(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Test Results Per App', () => {
    test.beforeEach(async () => {
      await e2ePage.goto();
      await e2ePage.waitForDataLoad();
    });

    test('should display project cards when there are test results', async () => {
      const cardCount = await e2ePage.getProjectCardCount();
      
      // Should have at least one project card or show empty state
      if (cardCount > 0) {
        expect(cardCount).toBeGreaterThan(0);
        await expect(e2ePage.projectCards.first()).toBeVisible();
      } else {
        // If no cards, should show appropriate empty state
        const noResults = await e2ePage.isNoTestResultsVisible();
        const allPassing = await e2ePage.isAllTestsPassingVisible();
        expect(noResults || allPassing).toBe(true);
      }
    });

    test('should show "All tests passing" message when no failures', async () => {
      // This test depends on actual data state
      // If all tests are passing, the message should be visible
      const allPassing = await e2ePage.isAllTestsPassingVisible();
      const hasFailedCards = await e2ePage.getProjectCardCount() > 0;

      // Either we have failed cards OR we see the all passing message
      expect(hasFailedCards || allPassing).toBe(true);
    });

    test('should display project link that opens in new tab', async () => {
      const cardCount = await e2ePage.getProjectCardCount();
      
      if (cardCount > 0) {
        const firstCard = e2ePage.projectCards.first();
        const link = firstCard.locator('a');
        
        await expect(link).toBeVisible();
        
        // Verify link has target="_blank" attribute
        const target = await link.getAttribute('target');
        expect(target).toBe('_blank');
        
        // Verify link points to Cypress Cloud
        const href = await link.getAttribute('href');
        expect(href).toContain('cloud.cypress.io');
      }
    });
  });

  test.describe('Refresh Functionality', () => {
    test.beforeEach(async () => {
      await e2ePage.goto();
      await e2ePage.waitForDataLoad();
    });

    test('should refresh data when refresh button is clicked', async () => {
      // Set up request interception
      const refreshRequest = E2ETestUtils.interceptGetE2EReport(page);
      
      // Click refresh button
      await e2ePage.clickRefresh();
      
      // Wait for API call to complete
      await refreshRequest;
      
      // Verify page is still visible and functional
      await expect(e2ePage.e2ePage).toBeVisible();
    });

    test('should refresh individual project card status', async () => {
      const cardCount = await e2ePage.getProjectCardCount();
      
      if (cardCount > 0) {
        const firstCard = e2ePage.projectCards.first();
        const refreshButton = firstCard.locator('button[title="Refresh last run status"]');
        
        await expect(refreshButton).toBeVisible();
        
        // Click the refresh button
        await refreshButton.click();
        
        // Verify the button is still there after refresh
        await expect(refreshButton).toBeVisible();
      }
    });
  });

  test.describe('Pagination', () => {
    test('should show pagination when there are many projects with failures', async () => {
      await e2ePage.goto();
      await e2ePage.waitForDataLoad();

      const cardCount = await e2ePage.getProjectCardCount();
      
      // Pagination appears when there are more than PAGE_SIZE (6) failed projects
      if (cardCount >= 6) {
        const hasPagination = await e2ePage.isPaginationVisible();
        expect(hasPagination).toBe(true);
      }
    });

    test('should navigate between pages when pagination is present', async () => {
      await e2ePage.goto();
      await e2ePage.waitForDataLoad();

      const hasPagination = await e2ePage.isPaginationVisible();
      
      if (hasPagination) {
        const currentPage = await e2ePage.getCurrentPage();
        expect(currentPage).toBe(1);

        // Try to navigate to page 2 if it exists
        const totalPages = await e2ePage.getTotalPages();
        if (totalPages > 1) {
          await e2ePage.goToPage(2);
          const newPage = await e2ePage.getCurrentPage();
          expect(newPage).toBe(2);

          // Navigate back to page 1
          await e2ePage.goToPage(1);
          const backToFirst = await e2ePage.getCurrentPage();
          expect(backToFirst).toBe(1);
        }
      }
    });
  });

  test.describe('Empty States', () => {
    test('should handle empty state appropriately', async () => {
      await e2ePage.goto();
      await e2ePage.waitForDataLoad();

      const cardCount = await e2ePage.getProjectCardCount();
      const noResults = await e2ePage.isNoTestResultsVisible();
      const allPassing = await e2ePage.isAllTestsPassingVisible();

      // Should either have cards, or show one of the empty states
      if (cardCount === 0) {
        expect(noResults || allPassing).toBe(true);
      } else {
        expect(cardCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Context Menu Functionality', () => {
    test.beforeEach(async () => {
      await e2ePage.goto();
      await e2ePage.waitForDataLoad();
    });

    test('should open context menu on right-click', async () => {
      const cardCount = await e2ePage.getProjectCardCount();

      if (cardCount > 0) {
        const firstCard = e2ePage.projectCards.first();

        // Right-click on the card
        await firstCard.click({ button: 'right' });

        // Context menu should appear
        await expect(e2ePage.contextMenu).toBeVisible();
      }
    });
  });
});

