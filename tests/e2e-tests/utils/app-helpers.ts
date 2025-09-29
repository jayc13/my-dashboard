import { Page } from '@playwright/test';



class ApplicationTestUtils {
  /**
   * Wait for GET all apps API request to complete
   */
  static async interceptListApps(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/apps') && response.request().method() === 'GET',
    );
  }

  /**
   * Wait for POST create app API request to complete
   */
  static async interceptCreateApp(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/apps') && response.request().method() === 'POST',
    );
  }

  /**
   * Wait for PUT edit app API request to complete
   */
  static async interceptEditApp(page: Page, id: number) {
    return page.waitForResponse(
      response => response.url().includes(`/api/apps/${id}`) && response.request().method() === 'PUT',
    );
  }

  /**
   * Wait for DELETE app API request to complete
   */
  static async interceptDeleteApp(page: Page, id: number) {
    return page.waitForResponse(
      response => response.url().includes(`/api/apps/${id}`) && response.request().method() === 'DELETE',
    );
  }

  /**
   * Wait for GET app by ID API request to complete
   */
  static async interceptGetAppById(page: Page, id: number) {
    return page.waitForResponse(
      response => response.url().includes(`/api/apps/${id}`) && response.request().method() === 'GET',
    );
  }

  /**
   * Wait for GET app by code API request to complete
   */
  static async interceptGetAppByCode(page: Page, code: string) {
    return page.waitForResponse(
      response => response.url().includes(`/api/apps/code/${code}`) && response.request().method() === 'GET',
    );
  }
}

export default ApplicationTestUtils;