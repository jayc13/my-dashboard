import { Page } from '@playwright/test';
import { NotificationInput } from '@my-dashboard/types';
import { wait } from '@utils/test-helpers';
import { getTestConnection } from './database-connection';


/**
 * Create test notification directly in database
 */
export async function createTestNotification(notification: NotificationInput): Promise<number> {
  try {
    const conn = await getTestConnection();
    const result = await conn.execute(
      'INSERT INTO notifications (title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?)',
      [
        notification.title,
        notification.message,
        notification.type,
        notification.link || null,
        notification.isRead ? 1 : 0,
      ],
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result[0] as any).insertId;
  } catch (error) {
    console.error('Error creating test notification:', error);
    throw error;
  }
}

/**
 * Create multiple test notifications
 */
export async function createMultipleTestNotifications(notifications: NotificationInput[]): Promise<number[]> {
  const ids: number[] = [];
  for (const notification of notifications) {
    const id = await createTestNotification(notification);
    await wait(1000); // Wait 1 second between creations to ensure different timestamps
    ids.push(id);
  }
  return ids;
}

export async function countNotifications(): Promise<number> {
  try {
    const conn = await getTestConnection();
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM notifications');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rows as any)[0].count;
  } catch (error) {
    console.error('Error counting notifications:', error);
    throw error;
  }
}

export async function countUnreadNotifications(): Promise<number> {
  try {
    const conn = await getTestConnection();
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rows as any)[0].count;
  } catch (error) {
    console.error('Error counting notifications:', error);
    throw error;
  }
}

/**
 * Mock browser notification permission
 */
export async function mockNotificationPermission(page: Page, permission: 'granted' | 'denied' | 'default'): Promise<void> {
  await page.addInitScript((permission) => {
    // Mock Notification API
    Object.defineProperty(window, 'Notification', {
      value: class MockNotification {
        static permission = permission;
        static requestPermission = async () => permission;

        constructor(title: string, options?: NotificationOptions) {
          console.log('Mock notification created:', title, options);
        }
      },
      writable: true,
    });
  }, permission);
}

/**
 * Mock service worker for FCM testing
 */
export async function mockServiceWorker(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Mock service worker registration
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: async () => ({
          active: { state: 'activated' },
          installing: null,
          waiting: null,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
        ready: Promise.resolve({
          active: { state: 'activated' },
          installing: null,
          waiting: null,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
        getRegistration: async () => ({
          active: { state: 'activated' },
          installing: null,
          waiting: null,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      writable: true,
    });
  });
}

/**
 * Sample test notification data
 */
export const SAMPLE_NOTIFICATIONS: NotificationInput[] = [
  {
    title: 'E2E Test Completed',
    message: 'Your E2E tests have completed successfully with 15 passing tests.',
    type: 'success',
    link: 'https://example.com/test-results/123',
    isRead: false,
  },
  {
    title: 'Build Failed',
    message: 'The build for branch feature/notifications has failed. Please check the logs.',
    type: 'error',
    link: 'https://example.com/build/456',
    isRead: false,
  },
  {
    title: 'Deployment Ready',
    message: 'Your application is ready for deployment to staging environment.',
    type: 'info',
    isRead: true,
  },
  {
    title: 'High Memory Usage',
    message: 'Memory usage is above 85%. Consider optimizing your application.',
    type: 'warning',
    link: 'https://example.com/monitoring/789',
    isRead: false,
  },
  {
    title: 'Security Update Available',
    message: 'A security update is available for your dependencies. Update recommended.',
    type: 'warning',
    isRead: false,
  },
];

class NotificationTestUtils {
  /**
   * Wait for GET all notifications API request to complete
   */
  static async interceptGetAllNotifications(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/notifications') && response.request().method() === 'GET',
    );
  }

  /**
   * Wait for PATCH mark as read API request to complete
   */
  static async interceptMarkAsRead(page: Page, notificationId: number) {
    return page.waitForResponse(
      response => response.url().includes(`/api/notifications/${notificationId}/read`) &&
                 response.request().method() === 'PATCH',
    );
  }

  /**
   * Wait for DELETE notification API request to complete
   */
  static async interceptDeleteNotification(page: Page, notificationId: number) {
    return page.waitForResponse(
      response => response.url().includes(`/api/notifications/${notificationId}`) &&
                 response.request().method() === 'DELETE',
    );
  }

  /**
   * Wait for multiple DELETE requests (for delete all functionality)
   */
  static async interceptDeleteAllNotifications(page: Page, expectedCount: number) {
    const responses = [];
    for (let i = 0; i < expectedCount; i++) {
      responses.push(
        page.waitForResponse(
          response => response.url().includes('/api/notifications/') &&
                     response.request().method() === 'DELETE',
        ),
      );
    }
    return Promise.all(responses);
  }

  /**
   * Wait for multiple PATCH requests (for mark all as read functionality)
   */
  static async interceptMarkAllAsRead(page: Page, expectedCount: number) {
    const responses = [];
    for (let i = 0; i < expectedCount; i++) {
      responses.push(
        page.waitForResponse(
          response => response.url().includes('/api/notifications/') &&
                     response.url().includes('/read') &&
                     response.request().method() === 'PATCH',
        ),
      );
    }
    return Promise.all(responses);
  }
}

export default NotificationTestUtils;