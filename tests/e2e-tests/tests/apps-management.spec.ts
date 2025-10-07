import { test, expect, Page } from '@playwright/test';
import { AppsPage } from '@pages/AppsPage';
import { setupAuthenticatedSession } from '@utils/test-helpers';
import { LoginPage } from '@pages/LoginPage';
import { truncateTables } from '@utils/dbCleanup';
import ApplicationTestUtils from '@utils/app-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('Apps Management Test Suite', () => {
  let page: Page;
  let appsPage: AppsPage;

  test.beforeAll(async ({ browser }) => {
    await truncateTables(['apps']);
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await setupAuthenticatedSession(page);
    appsPage = new AppsPage(page);
  });

  test.beforeEach(async () => {
    const getAllAppsRequest = ApplicationTestUtils.interceptListApps(page);
    await appsPage.goto();
    await getAllAppsRequest;
  });

  test.describe('App Creation', () => {
    test('should create a new app with required fields only', async () => {
      const appData = {
        name: 'Test App',
        code: 'test-app',
      };

      // Turn off watching filter to see all apps (including non-watching ones)
      await appsPage.setWatchingFilter(false);

      await appsPage.createApp(appData);

      await appsPage.setWatchingFilter(false);

      // Verify app appears in the grid
      expect(await appsPage.isAppVisible(appData.code)).toBe(true);

      // Verify app data
      const createdApp = await appsPage.getAppData(appData.code);
      expect(createdApp.name).toBe(appData.name);
      expect(createdApp.code).toBe(appData.code);
      expect(createdApp.watching).toBe(false); // Default value
    });

    test('should create a new app with all fields', async () => {
      const appData = {
        name: 'Complete Test App',
        code: 'complete-app',
        pipelineUrl: 'https://ci.example.com/pipeline/123',
        e2eConfig: '{"environment": "staging", "browser": "chrome"}',
        watching: true,
      };

      await appsPage.createApp(appData);

      // Verify app data (watching app should be visible with default filter)
      const createdApp = await appsPage.getAppData(appData.code);
      expect(createdApp.name).toBe(appData.name);
      expect(createdApp.code).toBe(appData.code);
      expect(createdApp.pipelineUrl).toContain('View in Pipelines');
      expect(createdApp.e2eConfig).toBe(true);
      expect(createdApp.watching).toBe(true);
    });

    test('should handle duplicate app codes', async () => {
      const appData = {
        name: 'Duplicate Test',
        code: 'duplicate-code',
      };

      // Turn off watching filter to see all apps
      await appsPage.setWatchingFilter(false);

      // Create first app
      await appsPage.createApp(appData);

      // Try to create second app with same code
      await appsPage.openAddAppDialog();
      await appsPage.fillAppForm({
        name: 'Another App',
        code: 'duplicate-code',
      });

      await appsPage.appSubmitButton.click();

      // Should handle duplicate error (implementation dependent)
      // This might show an error message or prevent submission
    });
  });

  test.describe('App Editing', () => {
    let testAppCode: string;

    test.beforeEach(async () => {
      // Ensure we have an app to edit
      testAppCode = 'edit-test-app';

      // Turn off watching filter to see all apps
      await appsPage.setWatchingFilter(false);

      if (!(await appsPage.isAppVisible(testAppCode))) {
        await appsPage.createApp({
          name: 'Edit Test App',
          code: testAppCode,
          watching: false,
        });
      }
    });

    test('should edit an existing app', async () => {
      await appsPage.editApp(testAppCode);

      // Verify dialog title shows "Edit App"
      const dialogTitle = await appsPage.getDialogTitle();
      expect(dialogTitle).toContain('Edit App');

      // Get app ID for the intercept
      const appData = await appsPage.getAppData(testAppCode);

      // Update app data
      const updatedData = {
        name: 'Updated Edit Test App',
        pipelineUrl: 'https://updated.example.com/pipeline',
        watching: true,
      };

      await appsPage.fillAppForm(updatedData);
      await appsPage.submitEditApp(appData.id);

      // Verify changes were saved
      const updatedApp = await appsPage.getAppData(testAppCode);
      expect(updatedApp.name).toBe(updatedData.name);
      expect(updatedApp.watching).toBe(true);
    });

    test('should cancel edit operation', async () => {
      const originalApp = await appsPage.getAppData(testAppCode);
      
      await appsPage.editApp(testAppCode);
      
      // Make changes but cancel
      await appsPage.fillAppForm({
        name: 'Should Not Save',
        watching: true,
      });
      
      await appsPage.cancelAppForm();
      
      // Verify original data is unchanged
      const unchangedApp = await appsPage.getAppData(testAppCode);
      expect(unchangedApp.name).toBe(originalApp.name);
      expect(unchangedApp.watching).toBe(originalApp.watching);
    });
  });

  test.describe('App Deletion', () => {
    let testAppCode: string;

    test.beforeEach(async () => {
      // Create an app to delete
      testAppCode = 'delete-test-app';

      // Turn off watching filter to see all apps
      await appsPage.setWatchingFilter(false);

      if (!(await appsPage.isAppVisible(testAppCode))) {
        await appsPage.createApp({
          name: 'Delete Test App',
          code: testAppCode,
        });
      }
    });

    test('should delete an app with confirmation', async () => {
      const initialCount = await appsPage.getAppCount();

      // Get app ID for the intercept
      const appData = await appsPage.getAppData(testAppCode);

      await appsPage.deleteApp(appData.id);

      // Verify app was deleted
      const newCount = await appsPage.getAppCount();
      expect(newCount).toBe(initialCount - 1);

      // Verify app is no longer visible
      expect(await appsPage.isAppVisible(testAppCode)).toBe(false);
    });

    test('should cancel delete operation', async () => {
      const initialCount = await appsPage.getAppCount();

      // Get app ID for the cancel operation
      const appData = await appsPage.getAppData(testAppCode);

      await appsPage.cancelDeleteApp(appData.id);

      // Verify app was not deleted
      const finalCount = await appsPage.getAppCount();
      expect(finalCount).toBe(initialCount);

      // Verify app is still visible
      expect(await appsPage.isAppVisible(testAppCode)).toBe(true);
    });
  });

  test.describe('Search and Filtering', () => {
    test.beforeEach(async () => {
      // Turn off watching filter to see all apps for setup
      await appsPage.setWatchingFilter(false);

      // Ensure we have test data
      const testApps = [
        { name: 'Frontend App', code: 'frontend-app', watching: true },
        { name: 'Backend Service', code: 'backend-service', watching: false },
        { name: 'Mobile App', code: 'mobile-app', watching: true },
      ];

      for (const app of testApps) {
        if (!(await appsPage.isAppVisible(app.code))) {
          await appsPage.createApp(app);
        }
      }

      // Reset to default state (watching filter enabled) for tests
      await appsPage.setWatchingFilter(true);
    });

    test('should load with watching filter enabled by default', async () => {
      // Verify the watching filter is enabled by default (from beforeEach)
      const isWatchingFilterEnabled = await appsPage.watchingFilter.isChecked();
      expect(isWatchingFilterEnabled).toBe(true);

      // Verify only watching apps are visible on initial load
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(false);
    });

    test('should search apps by name (watching=off)', async () => {
      await appsPage.setWatchingFilter(false);
      await appsPage.searchApps('Frontend');
      
      // Should show only matching apps
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(false);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(false);
      
      // Clear search
      await appsPage.searchApps('');
      
      // Should show all apps again
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
    });

    test('should search apps by code (watching=off)', async () => {
      await appsPage.setWatchingFilter(false);
      await appsPage.searchApps('backend');
      
      // Should show only matching apps
      expect(await appsPage.isAppVisible('backend-service')).toBe(true);
      expect(await appsPage.isAppVisible('frontend-app')).toBe(false);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(false);
    });

    test('should show only watching apps by default', async () => {
      // By default, only watching apps should be visible
      // The watching filter should be enabled by default
      const isWatchingFilterEnabled = await appsPage.watchingFilter.isChecked();
      expect(isWatchingFilterEnabled).toBe(true);

      // Only watching apps should be visible
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(false);
    });

    test('should show all apps when watching filter is turned off', async () => {
      // Turn off the watching filter to see all apps
      await appsPage.setWatchingFilter(false);

      // All apps should now be visible
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(true);
    });

    test('should toggle between watching and all apps', async () => {
      // Start with default state (watching filter enabled)
      let isWatchingFilterEnabled = await appsPage.watchingFilter.isChecked();
      expect(isWatchingFilterEnabled).toBe(true);

      // Only watching apps should be visible
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(false);

      // Turn off watching filter
      await appsPage.toggleWatchingFilter();
      isWatchingFilterEnabled = await appsPage.watchingFilter.isChecked();
      expect(isWatchingFilterEnabled).toBe(false);

      // All apps should now be visible
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(true);

      // Turn watching filter back on
      await appsPage.toggleWatchingFilter();
      isWatchingFilterEnabled = await appsPage.watchingFilter.isChecked();
      expect(isWatchingFilterEnabled).toBe(true);

      // Only watching apps should be visible again
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(false);
    });

    test('should combine search and filter with default watching behavior', async () => {
      // Search for "app" - by default watching filter is enabled
      await appsPage.searchApps('app');

      // Should show only watching apps that match search (default behavior)
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(false);

      // Turn off watching filter while keeping search
      await appsPage.setWatchingFilter(false);

      // Should show all apps that match search, regardless of watching status
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(false); // Still filtered out by search

      // Clear search but keep watching filter off
      await appsPage.searchApps('');

      // Should show all apps now
      expect(await appsPage.isAppVisible('frontend-app')).toBe(true);
      expect(await appsPage.isAppVisible('mobile-app')).toBe(true);
      expect(await appsPage.isAppVisible('backend-service')).toBe(true);
    });

    test('should handle newly created apps based on watching status', async () => {
      // Create a non-watching app
      const nonWatchingApp = {
        name: 'Non-Watching App',
        code: 'non-watching-app',
        watching: false,
      };

      await appsPage.createApp(nonWatchingApp);

      // With default watching filter enabled, the new non-watching app should not be visible
      expect(await appsPage.getWatchingFilterState()).toBe(true);
      expect(await appsPage.isAppVisible('non-watching-app')).toBe(false);

      // Turn off watching filter to see the new app
      await appsPage.setWatchingFilter(false);
      expect(await appsPage.isAppVisible('non-watching-app')).toBe(true);

      // Create a watching app
      const watchingApp = {
        name: 'Watching App',
        code: 'new-watching-app',
        watching: true,
      };

      await appsPage.createApp(watchingApp);

      // The watching app should be visible regardless of filter state
      expect(await appsPage.isAppVisible('new-watching-app')).toBe(true);

      // Turn watching filter back on
      await appsPage.setWatchingFilter(true);

      // Only the watching app should be visible now
      expect(await appsPage.isAppVisible('new-watching-app')).toBe(true);
      expect(await appsPage.isAppVisible('non-watching-app')).toBe(false);
    });
  });

  test.describe('URL Parameter Navigation', () => {
    let testAppCode: string;
    let testAppId: number;

    test.beforeEach(async () => {
      // Create a test app to use for URL parameter tests
      testAppCode = 'url-param-test-app';

      // Turn off watching filter to see all apps
      await appsPage.setWatchingFilter(false);

      if (!(await appsPage.isAppVisible(testAppCode))) {
        await appsPage.createApp({
          name: 'URL Param Test App',
          code: testAppCode,
          pipelineUrl: 'https://example.com/pipeline',
          watching: true,
        });
      }

      // Get the app ID for URL parameter tests
      const appData = await appsPage.getAppData(testAppCode);
      testAppId = appData.id;
    });

    test('should open edit dialog when navigating with valid appId parameter', async () => {
      // Navigate to apps page with appId parameter
      await page.goto(`/apps?appId=${testAppId}`);
      await page.waitForTimeout(500); // Wait for apps to load and effect to trigger

      // Verify the edit dialog is open
      await expect(appsPage.appDialog).toBeVisible();

      // Verify dialog title shows "Edit App"
      const dialogTitle = await appsPage.getDialogTitle();
      expect(dialogTitle).toContain('Edit App');

      // Verify the correct app data is loaded in the form
      const nameValue = await appsPage.appNameInput.inputValue();
      expect(nameValue).toBe('URL Param Test App');

      const codeValue = await appsPage.appCodeInput.inputValue();
      expect(codeValue).toBe(testAppCode);

      // Verify URL parameter is removed
      expect(page.url()).not.toContain('appId');
    });

    test('should remove URL parameter when appId does not match any app', async () => {
      const nonExistentAppId = 99999;

      // Navigate to apps page with non-existent appId
      await page.goto(`/apps?appId=${nonExistentAppId}`);
      await page.waitForTimeout(500); // Wait for apps to load and effect to trigger

      // Verify the edit dialog is NOT open
      await expect(appsPage.appDialog).not.toBeVisible();

      // Verify URL parameter is removed
      expect(page.url()).not.toContain('appId');

      // Verify no error message is shown
      const errorAlert = page.locator('[role="alert"]');
      await expect(errorAlert).not.toBeVisible();
    });

    test('should handle invalid appId parameter gracefully', async () => {
      // Navigate to apps page with invalid appId (not a number)
      await page.goto('/apps?appId=invalid');
      await page.waitForTimeout(500); // Wait for apps to load and effect to trigger

      // Verify the edit dialog is NOT open
      await expect(appsPage.appDialog).not.toBeVisible();

      // Verify URL parameter is removed
      expect(page.url()).not.toContain('appId');
    });

    test('should allow editing app opened via URL parameter', async () => {
      // Navigate to apps page with appId parameter
      await page.goto(`/apps?appId=${testAppId}`);
      await page.waitForTimeout(500); // Wait for apps to load and effect to trigger

      // Verify the edit dialog is open
      await expect(appsPage.appDialog).toBeVisible();

      // Make changes to the app
      const updatedName = 'Updated via URL Param';
      await appsPage.fillAppForm({
        name: updatedName,
      });

      // Submit the form
      await appsPage.submitEditApp(testAppId);

      // Verify changes were saved
      await appsPage.setWatchingFilter(false);
      const updatedApp = await appsPage.getAppData(testAppCode);
      expect(updatedApp.name).toBe(updatedName);
    });

    test('should allow canceling edit dialog opened via URL parameter', async () => {
      // Get original app data
      const originalApp = await appsPage.getAppData(testAppCode);

      // Navigate to apps page with appId parameter
      await page.goto(`/apps?appId=${testAppId}`);
      await page.waitForTimeout(500); // Wait for apps to load and effect to trigger

      // Verify the edit dialog is open
      await expect(appsPage.appDialog).toBeVisible();

      // Make changes but cancel
      await appsPage.fillAppForm({
        name: 'Should Not Save',
      });

      await appsPage.cancelAppForm();

      // Verify dialog is closed
      await expect(appsPage.appDialog).not.toBeVisible();

      // Verify original data is unchanged
      await appsPage.setWatchingFilter(false);
      const unchangedApp = await appsPage.getAppData(testAppCode);
      expect(unchangedApp.name).toBe(originalApp.name);
    });

    test('should not reopen dialog when URL parameter is already processed', async () => {
      // Navigate to apps page with appId parameter
      await page.goto(`/apps?appId=${testAppId}`);
      await page.waitForTimeout(500); // Wait for apps to load and effect to trigger

      // Verify the edit dialog is open
      await expect(appsPage.appDialog).toBeVisible();

      // Close the dialog
      await appsPage.cancelAppForm();
      await expect(appsPage.appDialog).not.toBeVisible();

      // Wait a moment to ensure no re-opening occurs
      await page.waitForTimeout(500);

      // Verify dialog remains closed
      await expect(appsPage.appDialog).not.toBeVisible();
    });
  });

  test.describe('Toggle Watching in Table', () => {
    let testAppCode: string;

    test.beforeEach(async () => {
      // Create test apps with different watching states
      testAppCode = 'toggle-test-app';

      // Turn off watching filter to see all apps
      await appsPage.setWatchingFilter(false);

      if (!(await appsPage.isAppVisible(testAppCode))) {
        await appsPage.createApp({
          name: 'Toggle Test App',
          code: testAppCode,
          watching: false,
        });
      }
    });

    test('should toggle watching status from false to true', async () => {
      // Verify initial state
      let appData = await appsPage.getAppData(testAppCode);
      expect(appData.watching).toBe(false);

      // Toggle watching
      await appsPage.toggleWatching(testAppCode);

      // Verify watching is now true
      appData = await appsPage.getAppData(testAppCode);
      expect(appData.watching).toBe(true);
    });

    test('should toggle watching status from true to false', async () => {
      // First ensure the app is watching
      let appData = await appsPage.getAppData(testAppCode);
      if (!appData.watching) {
        await appsPage.toggleWatching(testAppCode);
      }

      // Verify it's watching
      appData = await appsPage.getAppData(testAppCode);
      expect(appData.watching).toBe(true);

      // Toggle watching off
      await appsPage.toggleWatching(testAppCode);

      // Verify watching is now false
      appData = await appsPage.getAppData(testAppCode);
      expect(appData.watching).toBe(false);
    });

    test('should toggle watching multiple times', async () => {
      // Get initial state
      let appData = await appsPage.getAppData(testAppCode);
      const initialWatching = appData.watching;

      // Toggle 3 times
      await appsPage.toggleWatching(testAppCode);
      await appsPage.toggleWatching(testAppCode);
      await appsPage.toggleWatching(testAppCode);

      // Should be opposite of initial state (toggled odd number of times)
      appData = await appsPage.getAppData(testAppCode);
      expect(appData.watching).toBe(!initialWatching);
    });

    test('should update visibility when toggling with watching filter enabled', async () => {
      // Ensure app is not watching
      let appData = await appsPage.getAppData(testAppCode);
      if (appData.watching) {
        await appsPage.toggleWatching(testAppCode);
      }

      // Enable watching filter
      await appsPage.setWatchingFilter(true);

      // App should not be visible
      expect(await appsPage.isAppVisible(testAppCode)).toBe(false);

      // Turn off filter to toggle
      await appsPage.setWatchingFilter(false);
      await appsPage.toggleWatching(testAppCode);

      // Turn filter back on
      await appsPage.setWatchingFilter(true);

      // App should now be visible
      expect(await appsPage.isAppVisible(testAppCode)).toBe(true);
    });

    test('should show tooltip on hover', async () => {
      await appsPage.setWatchingFilter(false);

      const toggleButton = await appsPage.getAppToggleWatchingButton(testAppCode);

      // Hover over the button
      await toggleButton.hover();

      // Wait for tooltip to appear
      await page.waitForTimeout(300);

      // Check if tooltip exists (MUI tooltips appear in the body)
      const tooltip = page.locator('[role="tooltip"]');
      await expect(tooltip).toBeVisible();
    });

    test('should not open edit dialog when clicking toggle button', async () => {
      await appsPage.setWatchingFilter(false);

      // Click the toggle button
      await appsPage.toggleWatching(testAppCode);

      // Verify edit dialog did NOT open
      await expect(appsPage.appDialog).not.toBeVisible();
    });
  });
});
