import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Navigation and Layout functionality
 * Encapsulates all selectors and actions related to header navigation, sidebar, and routing
 */
export class NavigationPage {
  readonly page: Page;

  // Header elements
  readonly menuButton: Locator;
  readonly navigationDrawer: Locator;
  readonly logoutButton: Locator;

  // Navigation items
  readonly navHome: Locator;
  readonly navE2eDashboard: Locator;
  readonly navPullRequests: Locator;
  readonly navApps: Locator;

  // Notification center
  readonly notificationIcon: Locator;
  readonly notificationBadge: Locator;
  readonly notificationMenu: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.menuButton = page.locator('[data-testid="menu-button"]');
    this.navigationDrawer = page.locator('[data-testid="navigation-drawer"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');

    // Navigation items
    this.navHome = page.locator('[data-testid="nav-home"]');
    this.navE2eDashboard = page.locator('[data-testid="nav-e2e-dashboard"]');
    this.navPullRequests = page.locator('[data-testid="nav-pull-requests"]');
    this.navApps = page.locator('[data-testid="nav-apps"]');

    // Notification center
    this.notificationIcon = page.locator('[data-testid="notification-icon"]');
    this.notificationBadge = page.locator('[data-testid="notification-badge"]');
    this.notificationMenu = page.locator('[data-testid="notification-menu"]');
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  // Navigation actions
  async openNavigationDrawer() {
    await this.menuButton.click();
    await expect(this.navigationDrawer).toBeVisible();
  }

  async closeNavigationDrawer() {
    // Click outside the drawer or use close button
    await this.page.locator('[data-testid="sidebar_close-btn"]').click();
    await expect(this.navigationDrawer).not.toBeVisible();
  }

  async navigateToHome() {
    await this.openNavigationDrawer();
    await this.navHome.click();
    await this.page.waitForURL('/');
    await expect(this.navigationDrawer).not.toBeVisible();
  }

  async navigateToE2eDashboard() {
    await this.openNavigationDrawer();
    await this.navE2eDashboard.click();
    await this.page.waitForURL('/e2e-dashboard');
    await expect(this.navigationDrawer).not.toBeVisible();
  }

  async navigateToPullRequests() {
    await this.openNavigationDrawer();
    await this.navPullRequests.click();
    await this.page.waitForURL('/pull_requests');
    await expect(this.navigationDrawer).not.toBeVisible();
  }

  async navigateToApps() {
    await this.openNavigationDrawer();
    await this.navApps.click();
    await this.page.waitForURL('/apps');
    await expect(this.navigationDrawer).not.toBeVisible();
  }

  async logout() {
    await this.openNavigationDrawer();
    await this.logoutButton.click();
    // Should redirect to login page
    await this.page.waitForURL('/');
    await expect(this.page.locator('[data-testid="login-page"]')).toBeVisible();
  }

  // Notification actions
  async openNotificationCenter() {
    await this.notificationIcon.click();
    await expect(this.notificationMenu).toBeVisible();
  }

  async closeNotificationCenter() {
    // Click outside the menu
    await this.page.click('body');
    await expect(this.notificationMenu).not.toBeVisible();
  }

  async getNotificationBadgeCount(): Promise<number> {
    const badgeText = await this.notificationBadge.textContent();
    return badgeText ? parseInt(badgeText, 10) : 0;
  }

  // Verification methods
  async isNavigationDrawerVisible(): Promise<boolean> {
    return await this.navigationDrawer.isVisible();
  }

  async isNotificationMenuVisible(): Promise<boolean> {
    return await this.notificationMenu.isVisible();
  }

  async getCurrentPath(): Promise<string> {
    return this.page.url().split(this.page.url().split('/')[2])[1] || '/';
  }

  async isOnHomePage(): Promise<boolean> {
    return (await this.getCurrentPath()) === '/';
  }

  async isOnE2eDashboardPage(): Promise<boolean> {
    return (await this.getCurrentPath()) === '/e2e-dashboard';
  }

  async isOnPullRequestsPage(): Promise<boolean> {
    return (await this.getCurrentPath()) === '/pull_requests';
  }

  async isOnAppsPage(): Promise<boolean> {
    return (await this.getCurrentPath()) === '/apps';
  }

  async isOnLoginPage(): Promise<boolean> {
    return await this.page.locator('[data-testid="login-page"]').isVisible();
  }

  // Helper methods for navigation verification
  async verifyNavigationItem(itemName: string, isSelected: boolean = false) {
    const navItem = this.page.locator(`[data-testid="nav-${itemName.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(navItem).toBeVisible();
    
    if (isSelected) {
      await expect(navItem).toHaveClass(/selected/);
    }
  }

  async verifyAllNavigationItems() {
    await this.openNavigationDrawer();
    
    await this.verifyNavigationItem('home');
    await this.verifyNavigationItem('e2e-dashboard');
    await this.verifyNavigationItem('pull-requests');
    await this.verifyNavigationItem('apps');
    
    await this.closeNavigationDrawer();
  }

  // Page title verification
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async verifyPageTitle(expectedTitle: string) {
    const title = await this.getPageTitle();
    expect(title).toContain(expectedTitle);
  }

  // Breadcrumb or page header verification
  async getPageHeader(): Promise<string> {
    const header = this.page.locator('h1, h2, h3, h4').first();
    return await header.textContent() || '';
  }

  async verifyPageHeader(expectedHeader: string) {
    const header = await this.getPageHeader();
    expect(header).toContain(expectedHeader);
  }
}
