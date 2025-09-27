import { Page } from '@playwright/test';

/**
 * Common test utilities and helper functions
 */

export function getSecurityKey(): string {
  const securityKey = process.env.API_SECURITY_KEY;
  if (!securityKey) {
    throw new Error('API_SECURITY_KEY environment variable is not set.');
  }
  return securityKey;
}

/**
 * Authentication test data and utilities
 */
export const AUTH_TEST_DATA = {
  validApiKey: () => getSecurityKey(),
  emptyValues: ['', '   ', '\t', '\n'],
  specialCharacters: [
    '!@#$%^&*()',
    '<script>alert("xss")</script>',
    'SELECT * FROM users;',
    '../../etc/passwd',
    'null',
    'undefined',
  ],
} as const;

/**
 * Check if localStorage is available on the current page
 */
export async function isLocalStorageAvailable(page: Page): Promise<boolean> {
  try {
    return await page.evaluate(() => {
      try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Ensure localStorage is available, navigate to app if needed
 */
export async function ensureLocalStorageAvailable(page: Page, baseURL: string = '/'): Promise<void> {
  const isAvailable = await isLocalStorageAvailable(page);

  if (!isAvailable) {
    console.log('localStorage not available, navigating to app...');
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    const isNowAvailable = await isLocalStorageAvailable(page);
    if (!isNowAvailable) {
      throw new Error('localStorage is still not available after navigating to the app. Check if the app is running correctly.');
    }
  }
}

/**
 * Clear browser storage and cookies
 */
export async function clearBrowserData(page: Page): Promise<void> {
  // Clear cookies first (always available)
  await page.context().clearCookies();

  // Only clear localStorage/sessionStorage if available
  const hasLocalStorage = await isLocalStorageAvailable(page);
  if (hasLocalStorage) {
    try {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (error) {
      console.warn('Could not clear localStorage/sessionStorage:', error);
    }
  }

  // Clear any IndexedDB data if your app uses it
  try {
    await page.evaluate(() => {
      if ('indexedDB' in window) {
        try {
          // Check if databases() method is available and accessible
          if (indexedDB.databases && typeof indexedDB.databases === 'function') {
            indexedDB.databases().then(databases => {
              databases.forEach(db => {
                if (db.name) {
                  indexedDB.deleteDatabase(db.name);
                }
              });
            }).catch(err => {
              console.warn('Could not enumerate IndexedDB databases:', err);
            });
          }
        } catch (err) {
          console.warn('IndexedDB access denied:', err);
        }
      }
    });
  } catch (error) {
    console.warn('Could not clear IndexedDB:', error);
  }
}

/**
 * Set up authenticated session by storing valid API key
 */
export async function setupAuthenticatedSession(page: Page): Promise<void> {
  const apiKey = getSecurityKey();

  // Ensure we're on a page that supports localStorage
  const hasLocalStorage = await isLocalStorageAvailable(page);
  if (!hasLocalStorage) {
    throw new Error('localStorage is not available on the current page. Make sure you navigate to your app first.');
  }

  await page.evaluate((key) => {
    localStorage.setItem('dashboard_api_key', key);
  }, apiKey);
}

/**
 * Set localStorage item
 */
export async function setLocalStorageItem(page: Page, key: string, value: string): Promise<void> {
  const hasLocalStorage = await isLocalStorageAvailable(page);
  if (!hasLocalStorage) {
    throw new Error('localStorage is not available on the current page');
  }

  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
  }, { key, value });
}

/**
 * Get localStorage item
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  const hasLocalStorage = await isLocalStorageAvailable(page);
  if (!hasLocalStorage) {
    return null;
  }

  try {
    return await page.evaluate((key) => {
      return localStorage.getItem(key);
    }, key);
  } catch (error) {
    console.warn(`Could not get localStorage item '${key}':`, error);
    return null;
  }
}

/**
 * Remove localStorage item
 */
export async function removeLocalStorageItem(page: Page, key: string): Promise<void> {
  const hasLocalStorage = await isLocalStorageAvailable(page);
  if (!hasLocalStorage) {
    return;
  }

  try {
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, key);
  } catch (error) {
    console.warn(`Could not remove localStorage item '${key}':`, error);
  }
}

/**
 * Get all localStorage data
 */
export async function getAllLocalStorage(page: Page): Promise<Record<string, string>> {
  const hasLocalStorage = await isLocalStorageAvailable(page);
  if (!hasLocalStorage) {
    return {};
  }

  try {
    return await page.evaluate(() => {
      const storage: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          storage[key] = localStorage.getItem(key) || '';
        }
      }
      return storage;
    });
  } catch (error) {
    console.warn('Could not get all localStorage data:', error);
    return {};
  }
}

/**
 * Set multiple localStorage items at once
 */
export async function setMultipleLocalStorageItems(page: Page, items: Record<string, string>): Promise<void> {
  const hasLocalStorage = await isLocalStorageAvailable(page);
  if (!hasLocalStorage) {
    throw new Error('localStorage is not available on the current page');
  }

  try {
    await page.evaluate((items) => {
      Object.entries(items).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    }, items);
  } catch (error) {
    console.warn('Could not set multiple localStorage items:', error);
    throw error;
  }
}

/**
 * Mock network responses for testing
 */
export async function mockAuthValidationResponse(
  page: Page,
  response: { valid: boolean; error?: string },
): Promise<void> {
  await page.route('**/api/auth/validate', async route => {
    await route.fulfill({
      status: response.valid ? 200 : 401,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Mock network failure for testing error scenarios
 */
export async function mockNetworkFailure(page: Page): Promise<void> {
  await page.route('**/api/auth/validate', async route => {
    await route.abort('failed');
  });
}

/**
 * Wait for all network requests to complete
 */
export async function waitForNetworkIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Check if an element exists without throwing an error
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fill a form field and wait for any validation
 */
export async function fillField(page: Page, selector: string, value: string): Promise<void> {
  await page.fill(selector, value);
  // Wait for any validation or debounced updates
  await page.waitForTimeout(300);
}

/**
 * Click an element and wait for navigation if it occurs
 */
export async function clickAndWait(page: Page, selector: string): Promise<void> {
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click(selector),
  ]);
}

/**
 * Scroll to an element and ensure it's in view
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
}

/**
 * Get text content from multiple elements
 */
export async function getTextFromElements(page: Page, selector: string): Promise<string[]> {
  const elements = page.locator(selector);
  const count = await elements.count();
  const texts: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const text = await elements.nth(i).textContent();
    texts.push(text?.trim() || '');
  }
  
  return texts;
}

/**
 * Wait for a specific number of elements to be present
 */
export async function waitForElementCount(
  page: Page, 
  selector: string, 
  expectedCount: number, 
  timeout: number = 5000,
): Promise<void> {
  await page.waitForFunction(
    ({ selector, expectedCount }) => {
      const elements = document.querySelectorAll(selector);
      return elements.length === expectedCount;
    },
    { selector, expectedCount },
    { timeout },
  );
}

/**
 * Type definitions for common test data
 */
export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

export interface TestConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

/**
 * Common selectors used across tests
 */
export const SELECTORS = {
  navigation: 'nav, .navbar, [role="navigation"]',
  loading: '.loading, .spinner, [data-testid="loading"]',
  error: '.error, .not-found, [data-testid="error"]',
  content: 'main, .content, .dashboard-content',
  widgets: '.widget, .card, .dashboard-item',
  forms: {
    input: 'input',
    button: 'button',
    submit: 'button[type="submit"], input[type="submit"]',
    form: 'form',
  },
} as const;
