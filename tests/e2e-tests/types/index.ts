
// Extend Playwright's Page interface with custom methods
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeAccessible(): R;
      toHavePerformanceScore(threshold: number): R;
    }
  }
}

// Custom error types
export class TestTimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'TestTimeoutError';
  }
}

export class ElementNotFoundError extends Error {
  constructor(selector: string) {
    super(`Element not found: ${selector}`);
    this.name = 'ElementNotFoundError';
  }
}

export class NavigationError extends Error {
  constructor(url: string, public statusCode?: number) {
    super(`Navigation failed to ${url}${statusCode ? ` (${statusCode})` : ''}`);
    this.name = 'NavigationError';
  }
}
