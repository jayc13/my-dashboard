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




