import { test, expect, Page } from '@playwright/test';
import { NotificationPage } from '@pages/NotificationPage';
import { truncateTables } from '@utils/dbCleanup';
import NotificationTestUtils, {
  createTestNotification,
  createMultipleTestNotifications,
  countNotifications,
  countUnreadNotifications,
  SAMPLE_NOTIFICATIONS,
  mockNotificationPermission,
  mockServiceWorker,

} from '@utils/notification-test-helpers';
import { LoginPage } from '@pages/LoginPage';
import { NotificationInput } from '@my-dashboard/types';
import { setupAuthenticatedSession } from '@utils/test-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('Notifications Test Suite', () => {
  let page: Page;
  let notificationPage: NotificationPage;

  test.beforeAll(async ({ browser }) => {
    await truncateTables(['notifications']);
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
      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;
      
      // Verify notifications are displayed
      expect(await notificationPage.getNotificationCount()).toBe(2);
      expect(await notificationPage.getNotificationBadgeCount()).toBe(2);
      
      // Verify notification content
      const firstNotification = await notificationPage.getNotificationDetails(0);
      expect(firstNotification.title).toContain('Test Error'); // Newest first
      expect(firstNotification.message).toContain('This is an error notification');
      expect(firstNotification.isRead).toBe(false);
    });

  });

  test.describe('Notification Interactions', () => {
    let notificationsIds: number[] = [];
    test.beforeEach(async () => {
      await truncateTables(['notifications']);
      // Create sample notifications for interaction tests
      notificationsIds = await createMultipleTestNotifications(SAMPLE_NOTIFICATIONS.slice(0, 3));
      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;
    });

    test('should mark individual notification as read', async () => {
      // Verify initial state
      expect(await notificationPage.getNotificationBadgeCount()).toBe(2);

      // Mark first notification as read
      await notificationPage.markNotificationAsRead(notificationsIds[1]);
      
      // Verify badge count decreased
      const newBadgeCount = await notificationPage.getNotificationBadgeCount();
      expect(newBadgeCount).toBe(1);
      
      // Verify in database
      const unreadCount = await countUnreadNotifications();
      expect(unreadCount).toBe(1);
      const totalCount = await countNotifications();
      expect(totalCount).toBe(3);
    });

    test('should delete individual notification', async () => {
      // Verify initial count
      expect(await notificationPage.getNotificationCount()).toBe(3);
      
      // Delete first notification
      await notificationPage.deleteNotification(notificationsIds[2]);
      
      // Verify count decreased
      expect(await notificationPage.getNotificationCount()).toBe(2);
      
      // Verify in database
      const totalCount = await countNotifications();
      expect(totalCount).toBe(2);
    });

    test('should mark all notifications as read', async () => {
      // Verify initial unread count
      expect(await notificationPage.getNotificationBadgeCount()).toBe(2);
      
      // Mark all as read
      await notificationPage.markAllNotificationsAsRead();
      
      // Verify no unread notifications
      expect(await notificationPage.getNotificationBadgeCount()).toBe(0);
      
      // Verify in database
      const unreadCount = await countUnreadNotifications();
      expect(unreadCount).toBe(0);
    });

    test('should delete all notifications', async () => {
      // Verify initial count
      expect(await notificationPage.getNotificationCount()).toBe(3);
      
      // Delete all notifications
      await notificationPage.deleteAllNotifications();
      
      // Refresh and verify empty state
      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;
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
      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;
      
      // Open notification center
      await notificationPage.openNotificationCenter();
      
      // Find and verify link exists
      await expect(notificationPage.notificationItems.nth(0)).toHaveCSS('cursor', 'pointer');
      
      // Note: In a real test, you might want to test link navigation
      // but for this test we'll just verify the link is present and clickable
      const notificationItems = await notificationPage.getNotificationItems();
      await notificationItems[0].click();

      // Validate that the browser navigates to the link
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        notificationItems[0].click(),
      ]);

      // Validate navigation to external link
      await expect(newPage).toHaveURL(linkNotification.link!);
      await newPage.close();
    });
  });

  test.describe('Notification Permissions', () => {
    test('should show permission alert when notifications are not enabled', async () => {
      // Mock notification permission as default (not granted)
      await mockNotificationPermission(notificationPage.page, 'default');
      await mockServiceWorker(notificationPage.page);

      // Reload page to apply mocks
      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;

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

      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;

      // Click enable notifications
      await notificationPage.clickEnableNotifications();

      // Accept permissions in dialog
      await notificationPage.acceptNotificationPermissions();

      // Verify success message appears

      // Verify permission alert is visible
      expect(await notificationPage.isPermissionAlertVisible()).toBe(false);
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

      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;

      // Click enable notifications
      await notificationPage.clickEnableNotifications();

      // Accept permissions in dialog (but it will be denied)
      await notificationPage.acceptNotificationPermissions();

      // Verify error message appears
      // TODO: Implement error message verification when UI is available
    });

    test('should handle "Not Now" permission choice', async () => {
      // Mock notification permission as default
      await mockNotificationPermission(notificationPage.page, 'default');
      await mockServiceWorker(notificationPage.page);

      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;

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

      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(page);
      await notificationPage.page.reload();
      await getAllNotificationRequest;

      // Verify permission alert is not visible
      expect(await notificationPage.isPermissionAlertVisible()).toBe(false);
    });
  });
});
