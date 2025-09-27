import { Page, Locator } from '@playwright/test';
import { setupAuthenticatedSession } from '@utils/test-helpers';

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
    this.notificationIcon = page.locator('[data-testid="notification-icon"], button[aria-label*="notification"], .MuiIconButton-root:has(svg[data-testid="NotificationsIcon"])');
    this.notificationBadge = page.locator('.MuiBadge-badge, [data-testid="notification-badge"]');
    this.notificationMenu = page.locator('[role="menu"], .MuiMenu-paper, [data-testid="notification-menu"]');
    this.notificationList = page.locator('[data-testid="notification-list"], .notification-list');
    this.emptyNotificationMessage = page.locator('text="No notifications"');
    this.markAllAsReadButton = page.locator('text="Mark all as read", button:has-text("Mark all as read")');
    this.deleteAllButton = page.locator('text="Delete all", button:has-text("Delete all")');
    
    // Individual notification selectors
    this.notificationItems = page.locator('[data-testid="notification-item"], .notification-item, .MuiAlert-root');
    this.notificationTitle = page.locator('[data-testid="notification-title"], .notification-title, .MuiAlertTitle-root');
    this.notificationMessage = page.locator('[data-testid="notification-message"], .notification-message, .MuiAlert-message');
    this.notificationTime = page.locator('[data-testid="notification-time"], .notification-time');
    this.notificationLink = page.locator('[data-testid="notification-link"], .notification-link, a[href]');
    this.markAsReadButton = page.locator('[data-testid="mark-as-read"], button[aria-label*="mark"], svg[data-testid="TaskAltIcon"]').first();
    this.deleteButton = page.locator('[data-testid="delete-notification"], button[aria-label*="delete"], svg[data-testid="DeleteIcon"]').first();
    
    // Permission elements
    this.permissionAlert = page.locator('.MuiAlert-root:has-text("Enable push notifications"), [data-testid="permission-alert"]');
    this.enableNotificationsButton = page.locator('button:has-text("Enable"), [data-testid="enable-notifications"]');
    this.permissionDialog = page.locator('[role="dialog"]:has-text("Enable Push Notifications"), [data-testid="permission-dialog"]');
    this.enablePermissionButton = page.locator('button:has-text("Enable Notifications"), [data-testid="enable-permission"]');
    this.notNowButton = page.locator('button:has-text("Not Now"), [data-testid="not-now"]');
    this.permissionSnackbar = page.locator('.MuiSnackbar-root, [data-testid="permission-snackbar"]');
  }

  /**
   * Navigate to the dashboard and ensure authenticated
   */
  async goto(): Promise<void> {
    await setupAuthenticatedSession(this.page);
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open the notification center
   */
  async openNotificationCenter(): Promise<void> {
    await this.notificationIcon.click();
    await this.notificationMenu.waitFor({ state: 'visible' });
  }

  /**
   * Close the notification center
   */
  async closeNotificationCenter(): Promise<void> {
    // Click outside the menu to close it
    await this.page.click('body', { position: { x: 0, y: 0 } });
    await this.notificationMenu.waitFor({ state: 'hidden' });
  }

  /**
   * Get the notification badge count
   */
  async getNotificationBadgeCount(): Promise<number> {
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
  async getNotificationCount(): Promise<number> {
    await this.openNotificationCenter();
    const count = await this.notificationItems.count();
    await this.closeNotificationCenter();
    return count;
  }

  /**
   * Mark a specific notification as read by index
   */
  async markNotificationAsRead(index: number = 0): Promise<void> {
    await this.openNotificationCenter();
    const notification = this.notificationItems.nth(index);
    const markAsReadBtn = notification.locator('svg[data-testid="TaskAltIcon"]').first();
    await markAsReadBtn.click();
    await this.page.waitForTimeout(500); // Wait for API call
  }

  /**
   * Delete a specific notification by index
   */
  async deleteNotification(index: number = 0): Promise<void> {
    await this.openNotificationCenter();
    const notification = this.notificationItems.nth(index);
    const deleteBtn = notification.locator('svg[data-testid="DeleteIcon"]').first();
    await deleteBtn.click();
    await this.page.waitForTimeout(500); // Wait for API call
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await this.openNotificationCenter();
    if (await this.markAllAsReadButton.isVisible()) {
      await this.markAllAsReadButton.click();
      await this.page.waitForTimeout(1000); // Wait for API calls
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<void> {
    await this.openNotificationCenter();
    if (await this.deleteAllButton.isVisible()) {
      await this.deleteAllButton.click();
      await this.page.waitForTimeout(1000); // Wait for API calls
    }
  }

  /**
   * Get notification details by index
   */
  async getNotificationDetails(index: number = 0): Promise<{
    title: string;
    message: string;
    time?: string;
    hasLink: boolean;
    isRead: boolean;
  }> {
    await this.openNotificationCenter();
    const notification = this.notificationItems.nth(index);
    
    const title = await notification.locator('.MuiAlertTitle-root, [data-testid="notification-title"]').textContent() || '';
    const message = await notification.locator('.MuiAlert-message, [data-testid="notification-message"]').textContent() || '';
    const time = await notification.locator('[data-testid="notification-time"]').textContent() || undefined;
    const hasLink = await notification.locator('a[href]').count() > 0;
    
    // Check if notification is read (usually indicated by opacity or different styling)
    const opacity = await notification.evaluate(el => window.getComputedStyle(el).opacity);
    const isRead = parseFloat(opacity) < 1;
    
    return { title, message, time, hasLink, isRead };
  }

  /**
   * Click on a notification link
   */
  async clickNotificationLink(index: number = 0): Promise<void> {
    await this.openNotificationCenter();
    const notification = this.notificationItems.nth(index);
    const link = notification.locator('a[href]').first();
    await link.click();
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

  /**
   * Check if notification center has unread notifications
   */
  async hasUnreadNotifications(): Promise<boolean> {
    return await this.notificationBadge.isVisible();
  }

  /**
   * Wait for notification count to change
   */
  async waitForNotificationCountChange(expectedCount: number, timeout: number = 5000): Promise<void> {
    await this.page.waitForFunction(
      async (expectedCount) => {
        const icon = document.querySelector('[data-testid="notification-icon"], button[aria-label*="notification"], .MuiIconButton-root:has(svg[data-testid="NotificationsIcon"])');
        if (!icon) {
          return false;
        }
        
        await (icon as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const items = document.querySelectorAll('[data-testid="notification-item"], .notification-item, .MuiAlert-root');
        const actualCount = items.length;
        
        // Close the menu
        document.body.click();
        
        return actualCount === expectedCount;
      },
      expectedCount,
      { timeout },
    );
  }

  /**
   * Verify notification appears with specific content
   */
  async verifyNotificationExists(title: string, message: string): Promise<boolean> {
    await this.openNotificationCenter();
    const notifications = await this.getNotificationItems();
    
    for (const notification of notifications) {
      const notificationTitle = await notification.locator('.MuiAlertTitle-root, [data-testid="notification-title"]').textContent();
      const notificationMessage = await notification.locator('.MuiAlert-message, [data-testid="notification-message"]').textContent();
      
      if (notificationTitle?.includes(title) && notificationMessage?.includes(message)) {
        await this.closeNotificationCenter();
        return true;
      }
    }
    
    await this.closeNotificationCenter();
    return false;
  }
}
