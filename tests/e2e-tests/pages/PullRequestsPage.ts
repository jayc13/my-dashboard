import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Pull Requests Page
 * Encapsulates all selectors and actions related to Pull Requests functionality
 */
export class PullRequestsPage {
  readonly page: Page;

  // Main container
  readonly pullRequestsPage: Locator;
  readonly addPrButton: Locator;
  readonly addPrButtonEmpty: Locator;
  readonly emptyState: Locator;

  // Add PR Dialog
  readonly addPrDialog: Locator;
  readonly prUrlInput: Locator;
  readonly prCancelButton: Locator;
  readonly prAddButton: Locator;

  // Delete PR Dialog
  readonly deletePrDialog: Locator;
  readonly prDeleteCancelButton: Locator;
  readonly prDeleteConfirmButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main container
    this.pullRequestsPage = page.locator('[data-testid="pull-requests-page"]');
    this.addPrButton = page.locator('[data-testid="add-pr-button"]');
    this.addPrButtonEmpty = page.locator('[data-testid="add-pr-button-empty"]');
    this.emptyState = page.locator('[data-testid="pr-empty-state"]');

    // Add PR Dialog
    this.addPrDialog = page.locator('[data-testid="add-pr-dialog"]');
    this.prUrlInput = page.locator('[data-testid="pr-url-input"] input');
    this.prCancelButton = page.locator('[data-testid="pr-cancel-button"]');
    this.prAddButton = page.locator('[data-testid="pr-add-button"]');

    // Delete PR Dialog
    this.deletePrDialog = page.locator('[data-testid="delete-pr-dialog"]');
    this.prDeleteCancelButton = page.locator('[data-testid="pr-delete-cancel-button"]');
    this.prDeleteConfirmButton = page.locator('[data-testid="pr-delete-confirm-button"]');
  }

  async goto() {
    await this.page.goto('/pull_requests');
    await expect(this.pullRequestsPage).toBeVisible();
  }

  // Helper methods for PR cards
  getPrCard(prId: string): Locator {
    return this.page.locator(`[data-testid="pr-card-${prId}"]`);
  }

  getPrCopyButton(prId: string): Locator {
    return this.page.locator(`[data-testid="pr-copy-button-${prId}"]`);
  }

  getPrDeleteButton(prId: string): Locator {
    return this.page.locator(`[data-testid="pr-delete-button-${prId}"]`);
  }

  // Actions
  async openAddPrDialog() {
    const button = await this.addPrButton.isVisible() ? this.addPrButton : this.addPrButtonEmpty;
    await button.click();
    await expect(this.addPrDialog).toBeVisible();
  }

  async fillPrUrl(url: string) {
    await this.prUrlInput.fill(url);
  }

  async submitAddPr() {
    await this.prAddButton.click();
  }

  async cancelAddPr() {
    await this.prCancelButton.click();
    await expect(this.addPrDialog).not.toBeVisible();
  }

  async addPullRequest(url: string) {
    await this.openAddPrDialog();
    await this.fillPrUrl(url);
    await this.submitAddPr();
    await expect(this.addPrDialog).not.toBeVisible();
  }

  async copyPrUrl(prId: string) {
    await this.getPrCopyButton(prId).click();
  }

  async deletePr(prId: string) {
    await this.getPrDeleteButton(prId).click();
    await expect(this.deletePrDialog).toBeVisible();
    await this.prDeleteConfirmButton.click();
    await expect(this.deletePrDialog).not.toBeVisible();
  }

  async cancelDeletePr(prId: string) {
    await this.getPrDeleteButton(prId).click();
    await expect(this.deletePrDialog).toBeVisible();
    await this.prDeleteCancelButton.click();
    await expect(this.deletePrDialog).not.toBeVisible();
  }

  // Verification methods
  async isPrCardVisible(prId: string): Promise<boolean> {
    return await this.getPrCard(prId).isVisible();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async getPrCount(): Promise<number> {
    const prCards = this.page.locator('[data-testid^="pr-card-"]');
    return await prCards.count();
  }

  async waitForPrAdded(initialCount: number) {
    await this.page.waitForFunction(
      (count) => {
        const prCards = document.querySelectorAll('[data-testid^="pr-card-"]');
        return prCards.length > count;
      },
      initialCount,
      { timeout: 10000 },
    );
  }

  async waitForPrRemoved(initialCount: number) {
    await this.page.waitForFunction(
      (count) => {
        const prCards = document.querySelectorAll('[data-testid^="pr-card-"]');
        return prCards.length < count;
      },
      initialCount,
      { timeout: 10000 },
    );
  }

  async getAllPrCards() {
    return await this.page.locator('[data-testid^="pr-card-"]').all();
  }

  // Validation helpers
  async validatePrUrlError(expectedError: string) {
    const errorText = await this.page.locator('.MuiFormHelperText-root.Mui-error').textContent();
    expect(errorText).toContain(expectedError);
  }

  async isAddButtonDisabled(): Promise<boolean> {
    return await this.prAddButton.isDisabled();
  }
}
