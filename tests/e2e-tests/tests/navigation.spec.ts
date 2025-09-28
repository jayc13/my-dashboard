import { test, expect, Page } from '@playwright/test';
import { NavigationPage } from '@pages/NavigationPage';
import { setupAuthenticatedSession } from '@utils/test-helpers';
import { LoginPage } from '@pages/LoginPage';

test.describe('Navigation and Layout Test Suite', () => {
  let page: Page;
  let navigationPage: NavigationPage;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await setupAuthenticatedSession(page);
    navigationPage = new NavigationPage(page);
  });

  test.beforeEach(async () => {
    await navigationPage.goto('/');
  });

  test.describe('Header and Menu', () => {

    test('should open and close navigation drawer', async () => {
      // Initially drawer should not be visible
      expect(await navigationPage.isNavigationDrawerVisible()).toBe(false);
      
      // Open drawer
      await navigationPage.openNavigationDrawer();
      expect(await navigationPage.isNavigationDrawerVisible()).toBe(true);
      
      // Close drawer
      await navigationPage.closeNavigationDrawer();
      expect(await navigationPage.isNavigationDrawerVisible()).toBe(false);
    });
  });

  test.describe('Page Navigation', () => {
    test('should navigate to Home page', async () => {
      await navigationPage.navigateToHome();
      
      expect(await navigationPage.isOnHomePage()).toBe(true);
      await navigationPage.verifyPageHeader('To-Do List');
    });

    test('should navigate to E2E Dashboard page', async () => {
      await navigationPage.navigateToE2eDashboard();
      
      expect(await navigationPage.isOnE2eDashboardPage()).toBe(true);
      // Verify page content specific to E2E dashboard
      await expect(page.locator('[data-testid="e2e-page"]')).toBeVisible();
    });

    test('should navigate to Pull Requests page', async () => {
      await navigationPage.navigateToPullRequests();
      
      expect(await navigationPage.isOnPullRequestsPage()).toBe(true);
      await navigationPage.verifyPageHeader('Pull Requests');
    });

    test('should navigate to Apps page', async () => {
      await navigationPage.navigateToApps();
      
      expect(await navigationPage.isOnAppsPage()).toBe(true);
      await navigationPage.verifyPageHeader('Apps Management');
    });

    test('should handle direct URL navigation', async () => {
      // Navigate directly to pull requests page
      await navigationPage.goto('/pull_requests');
      expect(await navigationPage.isOnPullRequestsPage()).toBe(true);
      
      // Navigate directly to apps page
      await navigationPage.goto('/apps');
      expect(await navigationPage.isOnAppsPage()).toBe(true);
      
      // Navigate directly to e2e dashboard
      await navigationPage.goto('/e2e-dashboard');
      expect(await navigationPage.isOnE2eDashboardPage()).toBe(true);
    });
  });
});
