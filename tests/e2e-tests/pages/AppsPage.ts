import { Page, Locator, expect } from '@playwright/test';
import ApplicationTestUtils from '@utils/app-helpers';

/**
 * Page Object Model for the Apps Management Page
 * Encapsulates all selectors and actions related to Apps functionality
 */
export class AppsPage {
  readonly page: Page;

  // Main container
  readonly appsPage: Locator;
  readonly addAppButton: Locator;
  readonly searchInput: Locator;
  readonly watchingFilter: Locator;
  readonly dataGrid: Locator;

  // App Dialog
  readonly appDialog: Locator;
  readonly appNameInput: Locator;
  readonly appCodeInput: Locator;
  readonly appPipelineUrlInput: Locator;
  readonly appE2eConfigInput: Locator;
  readonly appWatchingSwitch: Locator;
  readonly appCancelButton: Locator;
  readonly appSubmitButton: Locator;

  // Delete Confirmation Dialog
  readonly deleteAppDialog: Locator;
  readonly appDeleteCancelButton: Locator;
  readonly appDeleteConfirmButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main container
    this.appsPage = page.locator('[data-testid="apps-page"]');
    this.addAppButton = page.locator('[data-testid="add-app-button"]');
    this.searchInput = page.locator('[data-testid="apps-search-input"] input');
    this.watchingFilter = page.locator('[data-testid="apps-watching-filter"] input');
    this.dataGrid = page.locator('[data-testid="apps-data-grid"]');

    // App Dialog
    this.appDialog = page.locator('[data-testid="app-dialog"]');
    this.appNameInput = page.locator('[data-testid="app-name-input"] input');
    this.appCodeInput = page.locator('[data-testid="app-code-input"] input');
    this.appPipelineUrlInput = page.locator('[data-testid="app-pipeline-url-input"] input');
    this.appE2eConfigInput = page.locator('[data-testid="app-e2e-config-input"] textarea:not([readonly])');
    this.appWatchingSwitch = page.locator('[data-testid="app-watching-switch"] input');
    this.appCancelButton = page.locator('[data-testid="app-cancel-button"]');
    this.appSubmitButton = page.locator('[data-testid="app-submit-button"]');

    // Delete Confirmation Dialog
    this.deleteAppDialog = page.locator('[data-testid="delete-app-dialog"]');
    this.appDeleteCancelButton = page.locator('[data-testid="app-delete-cancel-button"]');
    this.appDeleteConfirmButton = page.locator('[data-testid="app-delete-confirm-button"]');
  }

  async goto() {
    await this.page.goto('/apps');
    await expect(this.appsPage).toBeVisible();
  }

  // Dialog actions
  async openAddAppDialog() {
    await this.addAppButton.click();
    await expect(this.appDialog).toBeVisible();
  }

  async fillAppForm(appData: {
    name?: string;
    code?: string;
    pipelineUrl?: string;
    e2eConfig?: string;
    watching?: boolean;
  }) {
    if (appData.name !== undefined) {
      await this.appNameInput.fill(appData.name);
    }
    if (appData.code !== undefined) {
      await this.appCodeInput.fill(appData.code);
    }
    if (appData.pipelineUrl !== undefined) {
      await this.appPipelineUrlInput.fill(appData.pipelineUrl);
    }
    if (appData.e2eConfig !== undefined) {
      await this.appE2eConfigInput.fill(appData.e2eConfig);
    }
    if (appData.watching !== undefined) {
      const isChecked = await this.appWatchingSwitch.isChecked();
      if (isChecked !== appData.watching) {
        await this.appWatchingSwitch.click();
      }
    }
  }

  async submitAppForm() {
    await this.appSubmitButton.click();
    await expect(this.appDialog).not.toBeVisible();
  }

  async cancelAppForm() {
    await this.appCancelButton.click();
    await expect(this.appDialog).not.toBeVisible();
  }

  async createApp(appData: {
    name: string;
    code: string;
    pipelineUrl?: string;
    e2eConfig?: string;
    watching?: boolean;
  }) {
    await this.openAddAppDialog();
    await this.fillAppForm(appData);

    // Set up intercept for create app API call
    const getAllAppsRequest = ApplicationTestUtils.interceptListApps(this.page);
    const createAppRequest = ApplicationTestUtils.interceptCreateApp(this.page);
    await this.submitAppForm();

    // Wait for the API call to complete
    await Promise.all([getAllAppsRequest, createAppRequest]);
  }

  // DataGrid actions
  async getAppRowByCode(code: string): Promise<Locator> {
    return this.page.locator(`[data-testid="apps-data-grid"] div.app-row-${code}[role="row"]`);
  }

  async editApp(code: string) {
    const row = await this.getAppRowByCode(code);
    await row.locator('[data-testid="EditIcon"]').click();
    await expect(this.appDialog).toBeVisible();
  }

  async editAppById(appId: number) {
    await (await this.getAppEditButton(appId)).click();
    await expect(this.appDialog).toBeVisible();
  }

  async submitEditApp(appId: number) {
    // Set up intercept for edit app API call
    const getAllAppsRequest = ApplicationTestUtils.interceptListApps(this.page);
    const editAppRequest = ApplicationTestUtils.interceptEditApp(this.page, appId);
    await this.submitAppForm();

    // Wait for the API call to complete
    await Promise.all([getAllAppsRequest, editAppRequest]);
  }

  async getAppDeleteButton(appId: number): Promise<Locator> {
    return this.page.locator(`[data-testid="app-delete-button-${appId}"]`);
  }

  async getAppEditButton(appId: number): Promise<Locator> {
    return this.page.locator(`[data-testid="app-edit-button-${appId}"]`);
  }

  async deleteApp(appId: number) {
    await (await this.getAppDeleteButton(appId)).click();
    await expect(this.deleteAppDialog).toBeVisible();

    // Set up intercept for delete app API call
    const getAllAppsRequest = ApplicationTestUtils.interceptListApps(this.page);
    const deleteAppRequest = ApplicationTestUtils.interceptDeleteApp(this.page, appId);

    await this.appDeleteConfirmButton.click();
    await expect(this.deleteAppDialog).not.toBeVisible();

    // Wait for the API call to complete
    await Promise.all([getAllAppsRequest, deleteAppRequest]);
  }

  async cancelDeleteApp(appId: number) {
    await (await this.getAppDeleteButton(appId)).click();
    await expect(this.deleteAppDialog).toBeVisible();
    await this.appDeleteCancelButton.click();
    await expect(this.deleteAppDialog).not.toBeVisible();
  }

  // Search and filter actions
  async searchApps(query: string) {
    await this.searchInput.fill(query);
    // Wait a moment for the search to take effect (client-side filtering)
    await this.page.waitForTimeout(300);
  }

  async toggleWatchingFilter() {
    await this.watchingFilter.click();
    // Wait a moment for the filter to take effect (client-side filtering)
    await this.page.waitForTimeout(300);
  }

  async setWatchingFilter(enabled: boolean) {
    const isChecked = await this.watchingFilter.isChecked();
    if (isChecked !== enabled) {
      await this.watchingFilter.click();
      // Wait a moment for the filter to take effect (client-side filtering)
      await this.page.waitForTimeout(300);
    }
  }

  async getWatchingFilterState(): Promise<boolean> {
    return await this.watchingFilter.isChecked();
  }

  // Verification methods
  async getAppCount(): Promise<number> {
    const rows = this.dataGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    return await rows.count();
  }

  async isAppVisible(code: string): Promise<boolean> {
    const row = await this.getAppRowByCode(code);
    return await row.isVisible();
  }

  async getAppData(code: string): Promise<{
    id: number;
    name: string;
    code: string;
    pipelineUrl: string;
    e2eConfig: boolean;
    watching: boolean;
  }> {
    const row = await this.getAppRowByCode(code);
    const cells = row.locator('[role="gridcell"]');

    return {
      id: parseInt(await cells.nth(0).textContent() || '0'),
      name: await cells.nth(1).textContent() || '',
      code: await cells.nth(2).textContent() || '',
      pipelineUrl: await cells.nth(3).textContent() || '',
      e2eConfig: (await cells.nth(4).textContent() || '').includes('Configured'),
      watching: await cells.nth(5).locator('[data-testid="VisibilityIcon"]').isVisible(),
    };
  }

  async getDialogTitle(): Promise<string> {
    return await this.appDialog.locator('.MuiDialogTitle-root').textContent() || '';
  }
}
