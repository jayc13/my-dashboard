import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the E2E Dashboard Page
 * Encapsulates all selectors and actions related to E2E test results functionality
 */
export class E2EPage {
  readonly page: Page;

  // Main container
  readonly e2ePage: Locator;
  readonly pageTitle: Locator;
  readonly refreshButton: Locator;
  readonly errorAlert: Locator;
  readonly loadingBackdrop: Locator;

  // General Metrics
  readonly metricsGrid: Locator;
  readonly totalRunsMetric: Locator;
  readonly passedMetric: Locator;
  readonly failedMetric: Locator;
  readonly passingRateMetric: Locator;

  // Test Results Per App
  readonly testResultsContainer: Locator;
  readonly projectCards: Locator;
  readonly noTestResultsMessage: Locator;
  readonly allTestsPassingMessage: Locator;
  readonly pagination: Locator;

  // Context Menu
  readonly contextMenu: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main container
    this.e2ePage = page.locator('[data-testid="e2e-page"]');
    this.pageTitle = page.locator('h2:has-text("E2E Tests")');
    this.refreshButton = page.locator('button[aria-label="Refresh"]');
    this.errorAlert = page.locator('[role="alert"]');
    this.loadingBackdrop = page.locator('[class*="MuiBackdrop-root"]');

    // General Metrics - using more specific selectors
    this.metricsGrid = page.locator('[data-testid="e2e-page"]').locator('> div > div > div').first();
    this.totalRunsMetric = page.locator('text=Total Runs').locator('..');
    this.passedMetric = page.locator('text=Passed').locator('..');
    this.failedMetric = page.locator('text=Failed').locator('..');
    this.passingRateMetric = page.locator('text=Passing Rate').locator('..');

    // Test Results Per App
    this.testResultsContainer = page.locator('[data-testid="e2e-page"]');
    this.projectCards = page.locator('[data-project-card]');
    this.noTestResultsMessage = page.locator('text=No test results available');
    this.allTestsPassingMessage = page.locator('text=All tests are passing');
    this.pagination = page.locator('[role="navigation"]').filter({ hasText: /^1/ });

    // Context Menu
    this.contextMenu = page.locator('[role="menu"]');
  }

  /**
   * Navigate to the E2E Dashboard page
   */
  async goto(): Promise<void> {
    await this.page.goto('/e2e-dashboard');
    await expect(this.e2ePage).toBeVisible();
  }

  /**
   * Wait for the page to load
   */
  async waitForPageLoad(): Promise<void> {
    await expect(this.e2ePage).toBeVisible();
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * Check if error alert is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return this.errorAlert.isVisible();
  }

  /**
   * Check if loading backdrop is visible
   */
  async isLoadingBackdropVisible(): Promise<boolean> {
    try {
      await this.loadingBackdrop.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click the refresh button
   */
  async clickRefresh(): Promise<void> {
    await this.refreshButton.click();
  }

  /**
   * Get metric value by label
   */
  async getMetricValue(label: string): Promise<string> {
    const metricCard = this.page.locator(`text=${label}`).locator('..').locator('..');
    const valueElement = metricCard.locator('[class*="MuiTypography"]').filter({ hasText: /^[0-9]/ }).first();
    const text = await valueElement.textContent();
    return text || '';
  }

  /**
   * Get all metric values
   */
  async getAllMetrics(): Promise<{
    totalRuns: string;
    passed: string;
    failed: string;
    passingRate: string;
  }> {
    return {
      totalRuns: await this.getMetricValue('Total Runs'),
      passed: await this.getMetricValue('Passed'),
      failed: await this.getMetricValue('Failed'),
      passingRate: await this.getMetricValue('Passing Rate'),
    };
  }

  /**
   * Check if metrics are visible
   */
  async areMetricsVisible(): Promise<boolean> {
    try {
      await expect(this.totalRunsMetric).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the count of project cards displayed
   */
  async getProjectCardCount(): Promise<number> {
    return this.projectCards.count();
  }

  /**
   * Get project card by name
   */
  getProjectCard(projectName: string): Locator {
    return this.page.locator(`[data-project-card="${projectName}"]`);
  }

  /**
   * Check if a specific project card is visible
   */
  async isProjectCardVisible(projectName: string): Promise<boolean> {
    return this.getProjectCard(projectName).isVisible();
  }

  /**
   * Get project card data
   */
  async getProjectCardData(projectName: string): Promise<{
    name: string;
    passedRuns: string;
    failedRuns: string;
    successRate: string;
    lastRunStatus: 'passed' | 'failed';
  }> {
    const card = this.getProjectCard(projectName);
    await expect(card).toBeVisible();

    const passedRuns = await card.locator('svg[data-testid="CheckCircleIcon"]').locator('..').locator('+ p').textContent();
    const failedRuns = await card.locator('svg[data-testid="CancelIcon"]').locator('..').locator('+ p').textContent();
    const successRate = await card.locator('[class*="MuiTypography"]').filter({ hasText: /%$/ }).textContent();
    
    // Determine last run status by checking which icon is present
    const hasPassedIcon = await card.locator('svg[data-testid="CheckCircleOutlineIcon"]').isVisible().catch(() => false);
    const lastRunStatus = hasPassedIcon ? 'passed' : 'failed';

    return {
      name: projectName,
      passedRuns: passedRuns || '0',
      failedRuns: failedRuns || '0',
      successRate: successRate || '0%',
      lastRunStatus,
    };
  }

  /**
   * Click refresh button on a specific project card
   */
  async refreshProjectCard(projectName: string): Promise<void> {
    const card = this.getProjectCard(projectName);
    const refreshButton = card.locator('button[title="Refresh last run status"]');
    await refreshButton.click();
  }

  /**
   * Right-click on a project card to open context menu
   */
  async openProjectContextMenu(projectName: string): Promise<void> {
    const card = this.getProjectCard(projectName);
    await card.click({ button: 'right' });
    await expect(this.contextMenu).toBeVisible();
  }

  /**
   * Check if "No test results" message is visible
   */
  async isNoTestResultsVisible(): Promise<boolean> {
    return this.noTestResultsMessage.isVisible();
  }

  /**
   * Check if "All tests passing" message is visible
   */
  async isAllTestsPassingVisible(): Promise<boolean> {
    return this.allTestsPassingMessage.isVisible();
  }

  /**
   * Check if pagination is visible
   */
  async isPaginationVisible(): Promise<boolean> {
    try {
      await this.pagination.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current page number from pagination
   */
  async getCurrentPage(): Promise<number> {
    const activeButton = this.pagination.locator('button[aria-current="true"]');
    const pageText = await activeButton.textContent();
    return parseInt(pageText || '1', 10);
  }

  /**
   * Navigate to a specific page
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.pagination.locator(`button:has-text("${pageNumber}")`);
    await pageButton.click();
    await this.page.waitForTimeout(500); // Wait for page transition
  }

  /**
   * Get total number of pages
   */
  async getTotalPages(): Promise<number> {
    const buttons = this.pagination.locator('button[aria-label*="page"]');
    const count = await buttons.count();
    return count;
  }

  /**
   * Click on project name link to open Cypress dashboard
   */
  async clickProjectLink(projectName: string): Promise<void> {
    const card = this.getProjectCard(projectName);
    const link = card.locator('a');
    await link.click();
  }

  /**
   * Wait for data to load (no loading state)
   */
  async waitForDataLoad(): Promise<void> {
    // Wait for either metrics or empty state to be visible
    await Promise.race([
      this.totalRunsMetric.waitFor({ state: 'visible', timeout: 10000 }),
      this.noTestResultsMessage.waitFor({ state: 'visible', timeout: 10000 }),
      this.allTestsPassingMessage.waitFor({ state: 'visible', timeout: 10000 }),
    ]);
  }

  /**
   * Check if metrics show loading skeletons
   */
  async areMetricsLoading(): Promise<boolean> {
    const skeleton = this.page.locator('[class*="MuiSkeleton"]').first();
    return skeleton.isVisible();
  }
}

