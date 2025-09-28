import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Jira functionality on the Tasks page
 * Encapsulates all selectors and actions related to Jira ticket display and interaction
 */
export class JiraPage {
  readonly page: Page;

  // Main container
  readonly tasksPage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tasksPage = page.locator('[data-testid="tasks-page"]');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.tasksPage).toBeVisible();
  }

  // Jira List helpers
  getJiraList(listName: string): Locator {
    const normalizedName = listName.toLowerCase().replace(/\s+/g, '-');
    return this.page.locator(`[data-testid="jira-list-${normalizedName}"]`);
  }

  getJiraListTitle(listName: string): Locator {
    const normalizedName = listName.toLowerCase().replace(/\s+/g, '-');
    return this.page.locator(`[data-testid="jira-list-title-${normalizedName}"]`);
  }

  getJiraListRefreshButton(listName: string): Locator {
    const normalizedName = listName.toLowerCase().replace(/\s+/g, '-');
    return this.page.locator(`[data-testid="jira-list-refresh-${normalizedName}"]`);
  }

  getJiraListContainer(listName: string): Locator {
    const normalizedName = listName.toLowerCase().replace(/\s+/g, '-');
    return this.page.locator(`[data-testid="jira-list-container-${normalizedName}"]`);
  }

  getJiraListLoading(listName: string): Locator {
    const normalizedName = listName.toLowerCase().replace(/\s+/g, '-');
    return this.page.locator(`[data-testid="jira-list-loading-${normalizedName}"]`);
  }

  getJiraListError(listName: string): Locator {
    const normalizedName = listName.toLowerCase().replace(/\s+/g, '-');
    return this.page.locator(`[data-testid="jira-list-error-${normalizedName}"]`);
  }

  getJiraListEmpty(listName: string): Locator {
    const normalizedName = listName.toLowerCase().replace(/\s+/g, '-');
    return this.page.locator(`[data-testid="jira-list-empty-${normalizedName}"]`);
  }

  // Jira Card helpers
  getJiraCard(ticketKey: string): Locator {
    return this.page.locator(`[data-testid="jira-card-${ticketKey}"]`);
  }

  getJiraCardKey(ticketKey: string): Locator {
    return this.page.locator(`[data-testid="jira-card-key-${ticketKey}"]`);
  }

  getJiraCardStatus(ticketKey: string): Locator {
    return this.page.locator(`[data-testid="jira-card-status-${ticketKey}"]`);
  }

  getJiraCardSummary(ticketKey: string): Locator {
    return this.page.locator(`[data-testid="jira-card-summary-${ticketKey}"]`);
  }

  getJiraCardPriority(ticketKey: string): Locator {
    return this.page.locator(`[data-testid="jira-card-priority-${ticketKey}"]`);
  }

  // Actions
  async refreshJiraList(listName: string) {
    const refreshButton = this.getJiraListRefreshButton(listName);
    await refreshButton.click();
  }

  async clickJiraCard(ticketKey: string) {
    const card = this.getJiraCard(ticketKey);
    await card.click();
  }

  // Verification methods
  async isJiraListVisible(listName: string): Promise<boolean> {
    return await this.getJiraList(listName).isVisible();
  }

  async isJiraListLoading(listName: string): Promise<boolean> {
    return await this.getJiraListLoading(listName).isVisible();
  }

  async isJiraListError(listName: string): Promise<boolean> {
    return await this.getJiraListError(listName).isVisible();
  }

  async isJiraListEmpty(listName: string): Promise<boolean> {
    return await this.getJiraListEmpty(listName).isVisible();
  }

  async getJiraListTicketCount(listName: string): Promise<number> {
    const container = this.getJiraListContainer(listName);
    const cards = container.locator('[data-testid^="jira-card-"]');
    return await cards.count();
  }

  async isJiraCardVisible(ticketKey: string): Promise<boolean> {
    return await this.getJiraCard(ticketKey).isVisible();
  }

  async getJiraCardData(ticketKey: string): Promise<{
    key: string;
    status: string;
    summary: string;
  }> {
    return {
      key: await this.getJiraCardKey(ticketKey).textContent() || '',
      status: await this.getJiraCardStatus(ticketKey).textContent() || '',
      summary: await this.getJiraCardSummary(ticketKey).textContent() || '',
    };
  }

  async getAllJiraCards(listName: string): Promise<Locator[]> {
    const container = this.getJiraListContainer(listName);
    return await container.locator('[data-testid^="jira-card-"]').all();
  }

  async waitForJiraListLoaded(listName: string) {
    // Wait for loading to disappear
    await expect(this.getJiraListLoading(listName)).not.toBeVisible({ timeout: 10000 });
    
    // Wait for either content or empty/error state
    await this.page.waitForFunction(
      (name) => {
        const normalizedName = name.toLowerCase().replace(/\s+/g, '-');
        const container = document.querySelector(`[data-testid="jira-list-container-${normalizedName}"]`);
        const error = document.querySelector(`[data-testid="jira-list-error-${normalizedName}"]`);
        const empty = document.querySelector(`[data-testid="jira-list-empty-${normalizedName}"]`);
        
        return container || error || empty;
      },
      listName,
      { timeout: 10000 },
    );
  }

  // Test data helpers
  async getManualTestingTickets(): Promise<string[]> {
    const cards = await this.getAllJiraCards('Manual Testing');
    const ticketKeys: string[] = [];
    
    for (const card of cards) {
      const testId = await card.getAttribute('data-testid');
      if (testId) {
        const key = testId.replace('jira-card-', '');
        ticketKeys.push(key);
      }
    }
    
    return ticketKeys;
  }

  async getMyTickets(): Promise<string[]> {
    const cards = await this.getAllJiraCards('My Tickets');
    const ticketKeys: string[] = [];
    
    for (const card of cards) {
      const testId = await card.getAttribute('data-testid');
      if (testId) {
        const key = testId.replace('jira-card-', '');
        ticketKeys.push(key);
      }
    }
    
    return ticketKeys;
  }

  // Validation helpers
  async verifyJiraListStructure(listName: string) {
    await expect(this.getJiraList(listName)).toBeVisible();
    await expect(this.getJiraListTitle(listName)).toBeVisible();
    await expect(this.getJiraListRefreshButton(listName)).toBeVisible();
  }

  async verifyJiraCardStructure(ticketKey: string) {
    await expect(this.getJiraCard(ticketKey)).toBeVisible();
    await expect(this.getJiraCardKey(ticketKey)).toBeVisible();
    await expect(this.getJiraCardStatus(ticketKey)).toBeVisible();
    await expect(this.getJiraCardSummary(ticketKey)).toBeVisible();
    await expect(this.getJiraCardPriority(ticketKey)).toBeVisible();
  }

  async verifyJiraCardClickable(ticketKey: string) {
    const card = this.getJiraCard(ticketKey);
    await expect(card).toHaveCSS('cursor', 'pointer');
  }
}
