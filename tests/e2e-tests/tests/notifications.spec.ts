import { test, expect, Page } from '@playwright/test';
import { NotificationPage } from '@pages/NotificationPage';
import { truncateTables } from '@utils/dbCleanup';
import {
  createTestNotification,
  createMultipleTestNotifications,
  countNotifications,
  countUnreadNotifications,
  SAMPLE_NOTIFICATIONS,
  mockNotificationPermission,
  mockServiceWorker,
  waitForNotificationApiCall,
} from '@utils/notification-test-helpers';
import { LoginPage } from '@pages/LoginPage';
import { NotificationInput } from '@my-dashboard/types';
import { setupAuthenticatedSession } from '@utils/test-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('Notifications E2E Tests', () => {
  let page: Page;
  let notificationPage: NotificationPage;

  test.beforeAll(async ({ browser }) => {
    await truncateTables(['todos']);
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await setupAuthenticatedSession(page);
    notificationPage = new NotificationPage(page);
    await notificationPage.goto();
  });

  test.describe('Notification Center Display', () => {
    test('should show empty state when no notifications exist', async () => {
      // Verify notification center is empty
      expect(await notificationPage.isNotificationCenterEmpty()).toBe(true);
      
      // Verify no badge is shown
      expect(await notificationPage.hasUnreadNotifications()).toBe(false);
      
      // Verify notification count is 0
      expect(await notificationPage.getNotificationCount()).toBe(0);
    });

    test('should display notifications when they exist', async () => {
      // Create test notifications
      const testNotifications: NotificationInput[] = [
        {
          title: 'Test Success',
          message: 'This is a success notification',
          type: 'success',
          isRead: false,
        },
        {
          title: 'Test Error',
          message: 'This is an error notification',
          type: 'error',
          isRead: false,
        },
      ];
      
      await createMultipleTestNotifications(testNotifications);
      
      // Refresh page to load notifications
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');
      
      // Verify notifications are displayed
      expect(await notificationPage.getNotificationCount()).toBe(2);
      expect(await notificationPage.hasUnreadNotifications()).toBe(true);
      
      // Verify notification content
      const firstNotification = await notificationPage.getNotificationDetails(0);
      expect(firstNotification.title).toContain('Test Error'); // Newest first
      expect(firstNotification.message).toContain('This is an error notification');
      expect(firstNotification.isRead).toBe(false);
    });

    test('should show correct unread notification badge count', async () => {
      // Create mix of read and unread notifications
      const notifications: NotificationInput[] = [
        { title: 'Unread 1', message: 'Message 1', type: 'info', isRead: false },
        { title: 'Read 1', message: 'Message 2', type: 'success', isRead: true },
        { title: 'Unread 2', message: 'Message 3', type: 'warning', isRead: false },
        { title: 'Unread 3', message: 'Message 4', type: 'error', isRead: false },
      ];
      
      await createMultipleTestNotifications(notifications);
      
      // Refresh page
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');
      
      // Verify badge shows correct unread count
      expect(await notificationPage.getNotificationBadgeCount()).toBe(3);
      expect(await notificationPage.hasUnreadNotifications()).toBe(true);
    });

    test('should display notifications with different types and styling', async () => {
      // Create notifications of all types
      const notifications: NotificationInput[] = [
        { title: 'Success Test', message: 'Success message', type: 'success', isRead: false },
        { title: 'Error Test', message: 'Error message', type: 'error', isRead: false },
        { title: 'Info Test', message: 'Info message', type: 'info', isRead: false },
        { title: 'Warning Test', message: 'Warning message', type: 'warning', isRead: false },
      ];
      
      await createMultipleTestNotifications(notifications);
      
      // Refresh page
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');
      
      // Open notification center and verify all types are displayed
      await notificationPage.openNotificationCenter();
      
      const notificationItems = await notificationPage.getNotificationItems();
      expect(notificationItems.length).toBe(4);
      
      // Verify each notification type is present
      const details = await Promise.all([
        notificationPage.getNotificationDetails(0),
        notificationPage.getNotificationDetails(1),
        notificationPage.getNotificationDetails(2),
        notificationPage.getNotificationDetails(3),
      ]);
      
      const titles = details.map(d => d.title);
      expect(titles).toContain('Warning Test');
      expect(titles).toContain('Info Test');
      expect(titles).toContain('Error Test');
      expect(titles).toContain('Success Test');
    });

    test('should display notifications with links correctly', async () => {
      // Create notification with link
      const notificationWithLink: NotificationInput = {
        title: 'Link Test',
        message: 'This notification has a link',
        type: 'info',
        link: 'https://example.com/test',
        isRead: false,
      };
      
      await createTestNotification(notificationWithLink);
      
      // Refresh page
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');
      
      // Verify link is present
      const details = await notificationPage.getNotificationDetails(0);
      expect(details.hasLink).toBe(true);
    });
  });

  test.describe('Notification Interactions', () => {
    test.beforeEach(async () => {
      // Create sample notifications for interaction tests
      await createMultipleTestNotifications(SAMPLE_NOTIFICATIONS.slice(0, 3));
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');
    });

    test('should mark individual notification as read', async () => {
      // Verify initial state
      expect(await notificationPage.getNotificationBadgeCount()).toBeGreaterThan(0);
      
      // Mark first notification as read
      await notificationPage.markNotificationAsRead(0);
      
      // Wait for API call to complete
      await waitForNotificationApiCall(notificationPage.page, '/api/notifications/', 'PATCH');
      
      // Verify badge count decreased
      const newBadgeCount = await notificationPage.getNotificationBadgeCount();
      expect(newBadgeCount).toBeLessThan(3);
      
      // Verify in database
      const unreadCount = await countUnreadNotifications();
      expect(unreadCount).toBe(2);
    });

    test('should delete individual notification', async () => {
      // Verify initial count
      expect(await notificationPage.getNotificationCount()).toBe(3);
      
      // Delete first notification
      await notificationPage.deleteNotification(0);
      
      // Wait for API call to complete
      await waitForNotificationApiCall(notificationPage.page, '/api/notifications/', 'DELETE');
      
      // Verify count decreased
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');
      expect(await notificationPage.getNotificationCount()).toBe(2);
      
      // Verify in database
      const totalCount = await countNotifications();
      expect(totalCount).toBe(2);
    });

    test('should mark all notifications as read', async () => {
      // Verify initial unread count
      expect(await notificationPage.getNotificationBadgeCount()).toBeGreaterThan(0);
      
      // Mark all as read
      await notificationPage.markAllNotificationsAsRead();
      
      // Wait for API calls to complete
      await notificationPage.page.waitForTimeout(1500);
      
      // Verify no unread notifications
      expect(await notificationPage.hasUnreadNotifications()).toBe(false);
      
      // Verify in database
      const unreadCount = await countUnreadNotifications();
      expect(unreadCount).toBe(0);
    });

    test('should delete all notifications', async () => {
      // Verify initial count
      expect(await notificationPage.getNotificationCount()).toBe(3);
      
      // Delete all notifications
      await notificationPage.deleteAllNotifications();
      
      // Wait for API calls to complete
      await notificationPage.page.waitForTimeout(1500);
      
      // Refresh and verify empty state
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');
      expect(await notificationPage.isNotificationCenterEmpty()).toBe(true);
      
      // Verify in database
      const totalCount = await countNotifications();
      expect(totalCount).toBe(0);
    });

    test('should handle notification link clicks', async () => {
      // Create notification with external link
      const linkNotification: NotificationInput = {
        title: 'External Link Test',
        message: 'Click to visit external site',
        type: 'info',
        link: 'https://example.com/external',
        isRead: false,
      };
      
      await createTestNotification(linkNotification);
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');
      
      // Open notification center
      await notificationPage.openNotificationCenter();
      
      // Find and verify link exists
      const details = await notificationPage.getNotificationDetails(0);
      expect(details.hasLink).toBe(true);
      
      // Note: In a real test, you might want to test link navigation
      // but for this test we'll just verify the link is present and clickable
      const notificationItems = await notificationPage.getNotificationItems();
      const link = notificationItems[0].locator('a[href]').first();
      expect(await link.isVisible()).toBe(true);
      expect(await link.getAttribute('href')).toBe('https://example.com/external');
    });
  });

  test.describe('Notification Permissions', () => {
    test('should show permission alert when notifications are not enabled', async () => {
      // Mock notification permission as default (not granted)
      await mockNotificationPermission(notificationPage.page, 'default');
      await mockServiceWorker(notificationPage.page);

      // Reload page to apply mocks
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Verify permission alert is visible
      expect(await notificationPage.isPermissionAlertVisible()).toBe(true);
    });

    test('should handle notification permission acceptance', async () => {
      // Mock notification permission as default initially
      await mockNotificationPermission(notificationPage.page, 'default');
      await mockServiceWorker(notificationPage.page);

      // Mock permission request to return granted
      await notificationPage.page.addInitScript(() => {
        Object.defineProperty(window, 'Notification', {
          value: class MockNotification {
            static permission = 'default';
            static requestPermission = async () => {
              MockNotification.permission = 'granted';
              return 'granted';
            };

            constructor(title: string, options?: NotificationOptions) {
              console.log('Mock notification created:', title, options);
            }
          },
          writable: true,
        });
      });

      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Click enable notifications
      await notificationPage.clickEnableNotifications();

      // Accept permissions in dialog
      await notificationPage.acceptNotificationPermissions();

      // Verify success message appears
      const snackbarMessage = await notificationPage.getPermissionSnackbarMessage();
      expect(snackbarMessage).toContain('enabled successfully');
    });

    test('should handle notification permission denial', async () => {
      // Mock notification permission as default initially
      await mockNotificationPermission(notificationPage.page, 'default');
      await mockServiceWorker(notificationPage.page);

      // Mock permission request to return denied
      await notificationPage.page.addInitScript(() => {
        Object.defineProperty(window, 'Notification', {
          value: class MockNotification {
            static permission = 'default';
            static requestPermission = async () => {
              MockNotification.permission = 'denied';
              return 'denied';
            };

            constructor(title: string, options?: NotificationOptions) {
              console.log('Mock notification created:', title, options);
            }
          },
          writable: true,
        });
      });

      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Click enable notifications
      await notificationPage.clickEnableNotifications();

      // Accept permissions in dialog (but it will be denied)
      await notificationPage.acceptNotificationPermissions();

      // Verify error message appears
      const snackbarMessage = await notificationPage.getPermissionSnackbarMessage();
      expect(snackbarMessage).toContain('permission denied');
    });

    test('should handle "Not Now" permission choice', async () => {
      // Mock notification permission as default
      await mockNotificationPermission(notificationPage.page, 'default');
      await mockServiceWorker(notificationPage.page);

      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Click enable notifications
      await notificationPage.clickEnableNotifications();

      // Decline permissions in dialog
      await notificationPage.declineNotificationPermissions();

      // Verify dialog is closed and alert is still visible
      expect(await notificationPage.permissionDialog.isVisible()).toBe(false);
      expect(await notificationPage.isPermissionAlertVisible()).toBe(true);
    });

    test('should hide permission alert when notifications are already granted', async () => {
      // Mock notification permission as granted
      await mockNotificationPermission(notificationPage.page, 'granted');
      await mockServiceWorker(notificationPage.page);

      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Verify permission alert is not visible
      expect(await notificationPage.isPermissionAlertVisible()).toBe(false);
    });

    test('should show unsupported message in unsupported browsers', async () => {
      // Mock unsupported browser (no service worker)
      await notificationPage.page.addInitScript(() => {
        // Remove service worker support
        delete (navigator as any).serviceWorker;

        // Mock unsupported notification
        Object.defineProperty(window, 'Notification', {
          value: undefined,
          writable: true,
        });
      });

      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Verify unsupported message is shown
      const unsupportedAlert = notificationPage.page.locator('.MuiAlert-root:has-text("not supported")');
      expect(await unsupportedAlert.isVisible()).toBe(true);
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Create test notification
      await createTestNotification({
        title: 'API Error Test',
        message: 'Test API error handling',
        type: 'info',
        isRead: false,
      });

      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Mock API error for mark as read
      await notificationPage.page.route('**/api/notifications/*/read', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      // Try to mark notification as read
      await notificationPage.openNotificationCenter();
      const markAsReadBtn = notificationPage.page.locator('svg[data-testid="TaskAltIcon"]').first();
      await markAsReadBtn.click();

      // Verify notification is still unread (API error should not change state)
      await notificationPage.page.waitForTimeout(1000);
      expect(await notificationPage.hasUnreadNotifications()).toBe(true);
    });

    test('should handle large numbers of notifications', async () => {
      // Create many notifications
      const manyNotifications: NotificationInput[] = [];
      for (let i = 0; i < 20; i++) {
        manyNotifications.push({
          title: `Notification ${i + 1}`,
          message: `This is notification number ${i + 1}`,
          type: i % 2 === 0 ? 'info' : 'success',
          isRead: i % 3 === 0, // Some read, some unread
        });
      }

      await createMultipleTestNotifications(manyNotifications);
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Verify all notifications are loaded
      expect(await notificationPage.getNotificationCount()).toBe(20);

      // Verify scrolling works in notification center
      await notificationPage.openNotificationCenter();
      const notificationList = notificationPage.notificationList;

      // Check if scrolling is available (overflow)
      const hasScroll = await notificationList.evaluate(el => {
        return el.scrollHeight > el.clientHeight;
      });

      // With 20 notifications, there should be scrolling
      expect(hasScroll).toBe(true);
    });

    test('should handle notifications with special characters', async () => {
      // Create notification with special characters
      const specialNotification: NotificationInput = {
        title: 'Special Characters: "Quotes" & <Tags> 🚀',
        message: 'Message with special chars: @#$%^&*()_+{}|:"<>?[]\\;\',./ and unicode: 你好 🎉',
        type: 'info',
        isRead: false,
      };

      await createTestNotification(specialNotification);
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Verify special characters are displayed correctly
      const details = await notificationPage.getNotificationDetails(0);
      expect(details.title).toContain('Special Characters');
      expect(details.title).toContain('🚀');
      expect(details.message).toContain('你好');
      expect(details.message).toContain('🎉');
    });

    test('should handle concurrent notification operations', async () => {
      // Create multiple notifications
      await createMultipleTestNotifications(SAMPLE_NOTIFICATIONS.slice(0, 3));
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Open notification center
      await notificationPage.openNotificationCenter();

      // Perform multiple operations simultaneously
      const operations = [
        notificationPage.markNotificationAsRead(0),
        notificationPage.deleteNotification(1),
        notificationPage.markNotificationAsRead(2),
      ];

      // Execute operations concurrently
      await Promise.all(operations);

      // Wait for all API calls to complete
      await notificationPage.page.waitForTimeout(2000);

      // Refresh and verify final state
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Should have 2 notifications left (one deleted)
      expect(await notificationPage.getNotificationCount()).toBe(2);
    });

    test('should maintain notification state during network interruptions', async () => {
      // Create test notification
      await createTestNotification({
        title: 'Network Test',
        message: 'Test network interruption handling',
        type: 'warning',
        isRead: false,
      });

      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Verify initial state
      expect(await notificationPage.getNotificationCount()).toBe(1);

      // Simulate network failure
      await notificationPage.page.route('**/api/notifications**', async route => {
        await route.abort('failed');
      });

      // Try to perform operation (should fail gracefully)
      await notificationPage.openNotificationCenter();
      const markAsReadBtn = notificationPage.page.locator('svg[data-testid="TaskAltIcon"]').first();
      await markAsReadBtn.click();

      // Wait and verify state hasn't changed due to network failure
      await notificationPage.page.waitForTimeout(1000);

      // Remove network mock and refresh
      await notificationPage.page.unroute('**/api/notifications**');
      await notificationPage.page.reload();
      await notificationPage.page.waitForLoadState('networkidle');

      // Verify notification is still there and unread
      expect(await notificationPage.getNotificationCount()).toBe(1);
      expect(await notificationPage.hasUnreadNotifications()).toBe(true);
    });
  });
});
