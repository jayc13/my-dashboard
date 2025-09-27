import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Login Page
 * Encapsulates all selectors and actions related to authentication
 */
export class LoginPage {
  readonly page: Page;
  readonly pageContainer: Locator;
  readonly apiKeyInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main container for the login page
    this.pageContainer = page.locator('[data-testid="login-page"]');
    
    // Form elements
    this.apiKeyInput = page.locator('[data-testid="api-key-input"] input').first();
    this.submitButton = page.locator('[data-testid="submit-button"]');

    // UI elements
    this.errorAlert = page.locator('[data-testid="error-alert"]');
  }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the login page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await expect(this.pageContainer).toBeVisible();
    await expect(this.apiKeyInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    // Wait for any initial loading to complete
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill the API key input field
   */
  async fillApiKey(apiKey: string): Promise<void> {
    await this.apiKeyInput.fill(apiKey);
  }

  /**
   * Clear the API key input field
   */
  async clearApiKey(): Promise<void> {
    await this.apiKeyInput.clear();
  }

  /**
   * Click the submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async getAuthRequestPromise() {
    return this.page.waitForResponse(
      response => response.url().includes('/api/auth/validate') && response.request().method() === 'POST',
    );
  }

  /**
   * Submit the login form with the provided API key
   */
  async login(apiKey: string): Promise<void> {
    await this.fillApiKey(apiKey);

    // Start waiting for the API response before clicking submit
    const validateResponsePromise = this.getAuthRequestPromise();

    await this.clickSubmit();

    // Wait for validate request to be processed
    await validateResponsePromise;
  }

  /**
   * Wait for and return error message
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorAlert).toBeVisible();
    return await this.errorAlert.textContent() || '';
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Get the current value of the API key input
   */
  async getApiKeyValue(): Promise<string> {
    return await this.apiKeyInput.inputValue();
  }
  /**
   * Verify that the user is redirected after successful login
   */
  async verifySuccessfulLogin(): Promise<void> {
    await this.pageContainer.waitFor({ state: 'detached', timeout: 10000 });
    const dashboardVisible = await this.isDashboardVisible();
    expect(dashboardVisible, 'The user was not redirected to the dashboard').toBe(true);
  }

  async isPageVisible(): Promise<boolean> {
    return this.pageContainer.isVisible();
  }

  /**
   * Check if the page shows the dashboard (successful authentication)
   */
  async isDashboardVisible(): Promise<boolean> {
    try {
      // TODO: Implement a more robust check for dashboard visibility
      await this.page.waitForSelector('[data-testid="tasks-page"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Perform a complete login flow and verify success
   */
  async performSuccessfulLogin(apiKey: string): Promise<void> {
    await this.login(apiKey);
    await this.verifySuccessfulLogin();
  }

  /**
   * Perform login and expect failure
   */
  async performFailedLogin(apiKey: string, expectedError?: string): Promise<void> {
    await this.login(apiKey);

    const hasError = await this.hasErrorMessage();
    expect(hasError).toBe(true);
    
    if (expectedError) {
      const errorMessage = await this.getErrorMessage();
      expect(errorMessage).toContain(expectedError);
    }
    
    // Verify we're still on the login page
    await expect(this.apiKeyInput).toBeVisible();
  }
}
