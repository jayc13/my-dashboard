import { Page, Locator } from '@playwright/test';
import { setupAuthenticatedSession } from '@utils/test-helpers';
import NotificationTestUtils from '@utils/notification-test-helpers';

/**
 * Page Object Model for Notification functionality
 */
export class NotificationPage {
  readonly page: Page;

  // Notification Center Elements
  readonly notificationIcon: Locator;
  readonly notificationBadge: Locator;
  readonly notificationMenu: Locator;
  readonly notificationList: Locator;
  readonly emptyNotificationMessage: Locator;
  readonly markAllAsReadButton: Locator;
  readonly deleteAllButton: Locator;

  // Individual Notification Elements
  readonly notificationItems: Locator;
  readonly notificationTitle: Locator;
  readonly notificationMessage: Locator;
  readonly notificationTime: Locator;
  readonly notificationLink: Locator;
  readonly markAsReadButton: Locator;
  readonly deleteButton: Locator;

  // Notification Permission Elements
  readonly permissionAlert: Locator;
  readonly enableNotificationsButton: Locator;
  readonly permissionDialog: Locator;
  readonly enablePermissionButton: Locator;
  readonly notNowButton: Locator;
  readonly permissionSnackbar: Locator;

  constructor(page: Page) {
    this.page = page;

    // Notification Center selectors
    this.notificationIcon = page.locator('[data-testid="notification-icon"]');
    this.notificationBadge = page.locator('[data-testid="notification-badge"] > span');
    this.notificationMenu = page.locator('[data-testid="notification-menu"]');
    this.notificationList = page.locator('[data-testid="notification-list"]');
    this.emptyNotificationMessage = page.locator('[data-testid="empty-notifications"]');
    this.markAllAsReadButton = page.locator('[data-testid="mark-all-as-read"]');
    this.deleteAllButton = page.locator('[data-testid="delete-all"]');

    // Individual notification selectors
    this.notificationItems = page.locator('[data-testid="notification-list"] > div > div');
    this.notificationTitle = page.locator('[data-testid^="notification-title-"]');
    this.notificationMessage = page.locator('[data-testid^="notification-message-"]');
    this.notificationTime = page.locator('[data-testid^="notification-time-"]');
    this.notificationLink = page.locator('[data-testid="notification-link"], .notification-link, a[href]');
    this.markAsReadButton = page.locator('[data-testid^="mark-as-read-"]').first();
    this.deleteButton = page.locator('[data-testid^="delete-notification-"]').first();

    // Permission elements
    this.permissionAlert = page.locator('[data-testid="permission-alert"]');
    this.enableNotificationsButton = page.locator('[data-testid="enable-notifications"]');
    this.permissionDialog = page.locator('[data-testid="permission-dialog"]');
    this.enablePermissionButton = page.locator('[data-testid="enable-permission"]');
    this.notNowButton = page.locator('[data-testid="not-now"]');
    this.permissionSnackbar = page.locator('[data-testid="permission-snackbar"]');
  }

  /**
   * Navigate to the dashboard and ensure authenticated
   */
  async goto(): Promise<void> {
    await setupAuthenticatedSession(this.page);
    const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(this.page);
    await this.page.goto('/');
    await getAllNotificationRequest;
  }

  /**
   * Open the notification center
   */
  async openNotificationCenter(): Promise<void> {
    if (!(await this.notificationMenu.isVisible())) {
      await this.notificationIcon.click();
    }
    await this.notificationMenu.waitFor({ state: 'visible' });
  }

  /**
   * Close the notification center
   */
  async closeNotificationCenter(): Promise<void> {
    // Click outside the menu to close it
    await this.page.click('body', { position: { x: 0, y: 0 }, force: true });
    await this.notificationMenu.waitFor({ state: 'hidden' });
  }

  /**
   * Check if notification badge is invisible
   */
  async isNotificationBadgeInvisible(): Promise<boolean> {
    return await this.notificationBadge.evaluate(el =>
      el.classList.contains('MuiBadge-invisible'),
    );
  }

  /**
   * Get the notification badge count
   */
  async getNotificationBadgeCount(): Promise<number> {
    if (await this.isNotificationBadgeInvisible()) {
      return 0;
    }
    try {
      const badgeText = await this.notificationBadge.textContent();
      return badgeText ? parseInt(badgeText, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Check if notification center is empty
   */
  async isNotificationCenterEmpty(): Promise<boolean> {
    await this.openNotificationCenter();
    const isEmpty = await this.emptyNotificationMessage.isVisible();
    await this.closeNotificationCenter();
    return isEmpty;
  }

  /**
   * Get all notification items
   */
  async getNotificationItems(): Promise<Locator[]> {
    await this.openNotificationCenter();
    const count = await this.notificationItems.count();
    const items: Locator[] = [];
    for (let i = 0; i < count; i++) {
      items.push(this.notificationItems.nth(i));
    }
    return items;
  }

  /**
   * Get notification count
   */
  async getNotificationCount(closeNotificationCenter: boolean = false): Promise<number> {
    await this.openNotificationCenter();
    const count = await this.notificationItems.count();
    if (closeNotificationCenter) {
      await this.closeNotificationCenter();
    }
    return count;
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(closeNotificationCenter: boolean = false): Promise<number> {
    await this.openNotificationCenter();
    const items = await this.getNotificationItems();
    let unreadCount = 0;

    for (const item of items) {
      // Check if the notification has a mark-as-read button (indicates it's unread)
      const markAsReadBtn = item.locator('[data-testid^="mark-as-read-"]');
      if (await markAsReadBtn.count() > 0) {
        unreadCount++;
      }
    }

    if (closeNotificationCenter) {
      await this.closeNotificationCenter();
    }
    return unreadCount;
  }

  /**
   * Mark a specific notification as read by index
   */
  async markNotificationAsRead(notificationsId: number): Promise<void> {
    await this.openNotificationCenter();
    const markAsReadBtn = this.page.locator(`[data-testid="mark-as-read-${notificationsId}"]`).first();

    if (await markAsReadBtn.count() === 0) {
      // Notification is already read or does not exist
      return;
    }

    // Set up API intercept before clicking
    const responsePromise = NotificationTestUtils.interceptMarkAsRead(this.page, notificationsId);
    await markAsReadBtn.click();
    await responsePromise; // Wait for API call to complete
  }

  /**
   * Delete a specific notification by index
   */
  async deleteNotification(notificationsId: number): Promise<void> {
    await this.openNotificationCenter();
    const markAsReadBtn = this.page.locator(`[data-testid="delete-notification-${notificationsId}"]`).first();

    if (await markAsReadBtn.count() === 0) {
      // Notification is already read or does not exist
      return;
    }

    // Set up API intercept before clicking
    const responsePromise = NotificationTestUtils.interceptDeleteNotification(this.page, notificationsId);
    await this.page.locator(`[data-testid="notification-alert-${notificationsId}"]`).hover();
    await markAsReadBtn.click();
    await responsePromise; // Wait for API call to complete
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await this.openNotificationCenter();
    if (await this.markAllAsReadButton.isVisible()) {
      // Get the count of unread notifications to know how many API calls to expect
      const unreadCount = await this.getUnreadNotificationCount(false);

      // Set up API intercept before clicking
      const markAllAsReadRequest = NotificationTestUtils.interceptMarkAllAsRead(this.page, unreadCount);
      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(this.page);
      await this.markAllAsReadButton.click();
      await Promise.all([
        markAllAsReadRequest,
        getAllNotificationRequest,
      ]);
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<void> {
    await this.openNotificationCenter();
    if (await this.deleteAllButton.isVisible()) {
      // Get the count of notifications to know how many API calls to expect
      const notificationCount = await this.getNotificationCount();
      await this.closeNotificationCenter();
      await this.openNotificationCenter();

      // Set up API intercept before clicking
      const interceptDeleteAllNotifications = NotificationTestUtils.interceptDeleteAllNotifications(this.page, notificationCount);
      const getAllNotificationRequest = NotificationTestUtils.interceptGetAllNotifications(this.page);
      await this.deleteAllButton.click();
      await Promise.all([
        interceptDeleteAllNotifications,
        getAllNotificationRequest,
      ]); // Wait for all API calls to complete
    }
  }

  /**
   * Get notification details by index
   */
  async getNotificationDetails(index: number = 0): Promise<{
    title: string;
    message: string;
    time?: string;
    isRead: boolean;
  }> {
    await this.openNotificationCenter();
    const notification = this.notificationItems.nth(index);

    const title = await notification.locator('[data-testid^="notification-title-"]').textContent() || '';
    const message = await notification.locator('[data-testid^="notification-message-"]').textContent() || '';
    const time = await notification.locator('[data-testid^="notification-time-"]').textContent() || undefined;


    // Check if notification is read (usually indicated by opacity or different styling)
    const opacity = await notification.evaluate(el => window.getComputedStyle(el).opacity);
    const isRead = parseFloat(opacity) < 1;

    return { title, message, time, isRead };
  }

  /**
   * Check if permission alert is visible
   */
  async isPermissionAlertVisible(): Promise<boolean> {
    return await this.permissionAlert.isVisible();
  }

  /**
   * Click enable notifications button in alert
   */
  async clickEnableNotifications(): Promise<void> {
    await this.enableNotificationsButton.click();
    await this.permissionDialog.waitFor({ state: 'visible' });
  }

  /**
   * Accept notification permissions in dialog
   */
  async acceptNotificationPermissions(): Promise<void> {
    await this.enablePermissionButton.click();
    await this.permissionDialog.waitFor({ state: 'hidden' });
  }

  /**
   * Decline notification permissions in dialog
   */
  async declineNotificationPermissions(): Promise<void> {
    await this.notNowButton.click();
    await this.permissionDialog.waitFor({ state: 'hidden' });
  }

  /**
   * Wait for permission snackbar and get its message
   */
  async getPermissionSnackbarMessage(): Promise<string> {
    await this.permissionSnackbar.waitFor({ state: 'visible' });
    return await this.permissionSnackbar.textContent() || '';
  }

}
