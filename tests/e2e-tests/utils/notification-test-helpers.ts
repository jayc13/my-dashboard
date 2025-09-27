import { Page } from '@playwright/test';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { NotificationInput } from '@my-dashboard/types';

// Load environment variables
dotenv.config({ quiet: true });

/**
 * Database connection for notification test helpers
 */
let testConnection: mysql.Connection | null = null;

async function getTestConnection(): Promise<mysql.Connection> {
  if (!testConnection) {
    const config: mysql.ConnectionOptions = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'test_db',
      charset: 'utf8mb4',
      timezone: '+00:00',
    };

    try {
      testConnection = await mysql.createConnection(config);
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      throw error;
    }
  }

  return testConnection;
}


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
 * Wait for notification API call to complete
 */
export async function waitForNotificationApiCall(page: Page, endpoint: string, method: string = 'GET'): Promise<void> {
  await page.waitForResponse(response =>
    response.url().includes(endpoint) &&
    response.request().method() === method &&
    response.status() < 400,
  );
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
    createdAt: '',
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


