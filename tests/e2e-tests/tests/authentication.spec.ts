import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import {
  AUTH_TEST_DATA,
  clearBrowserData,
  setupAuthenticatedSession,
} from '@utils/test-helpers';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto(); // Navigate first to ensure localStorage is available
    await clearBrowserData(page); // Then clear storage
  });

  test.describe('Negative Test Cases', () => {
    const invalidKey = 'fake-security-key';
    test(`should reject invalid API key: ${invalidKey}`, async () => {
      await loginPage.fillApiKey(invalidKey); // whitespace only
      const isDisabled = await loginPage.isSubmitButtonDisabled();

      expect(isDisabled).toBe(false); // Button should be enabled for non-empty input

      await loginPage.performFailedLogin(invalidKey, 'Failed to validate API key. Please try again.');
    });

    test('should handle server error response', async () => {
      await loginPage.page.route('**/api/auth/validate', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await loginPage.performFailedLogin('test-key', 'Failed to validate API key. Please try again.');
    });
  });

  test.describe('Happy Path Test Cases', () => {
    test('should successfully authenticate with valid API key', async () => {
      const validApiKey = AUTH_TEST_DATA.validApiKey();
      await loginPage.performSuccessfulLogin(validApiKey);

      // Verify we're on the dashboard
      expect(await loginPage.isDashboardVisible()).toBe(true);
    });

    test('should persist authentication across page reloads', async () => {
      const validApiKey = AUTH_TEST_DATA.validApiKey();
      await loginPage.performSuccessfulLogin(validApiKey);

      // Reload the page
      await loginPage.page.reload();
      // Should still be authenticated and on dashboard
      expect(await loginPage.isDashboardVisible()).toBe(true);
      await expect(loginPage.apiKeyInput).not.toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should clear session on logout', async ({ page }) => {
      // First authenticate
      await setupAuthenticatedSession(page);
      await page.goto('/');
      expect(await loginPage.isDashboardVisible()).toBe(true);

      await page.locator('button[aria-label="open menu"]').click();

      // Find and click logout button
      const logoutButton = page.locator('div[role="button"]:has-text("Logout")').first();
      await expect(logoutButton).toBeVisible();
      await logoutButton.click();

      // Should redirect to login page
      expect(await loginPage.isPageVisible(), 'Login page should be displayed').toBe(true);

      // Verify session is cleared
      const apiKey = await page.evaluate(() =>
        localStorage.getItem('dashboard_api_key'),
      );
      expect(apiKey).toBeNull();
    });

    test.skip('should handle invalid stored API key', async ({ page }) => {
      // Set invalid API key in storage
      await page.evaluate(() => {
        localStorage.setItem('dashboard_api_key', 'invalid-stored-key');
      });

      await page.goto('/');

      expect(
        await loginPage.isPageVisible(),
        'User should be redirected to login page if the api key is invalid',
      ).toBe(true);

      const storedKey = await loginPage.page.evaluate(() =>
        localStorage.getItem('dashboard_api_key'),
      );
      expect(storedKey).toBeNull();
    });
  });
});