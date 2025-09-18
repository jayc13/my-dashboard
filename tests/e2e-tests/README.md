# E2E Tests with Playwright (TypeScript)

This directory contains end-to-end tests for the dashboard application using Playwright with TypeScript.

## Setup

1. Install dependencies:
   ```bash
   npm install --registry=https://registry.npmjs.org/
   ```

2. Install browsers:
   ```bash
   npm run install-browsers
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values, especially API_SECURITY_KEY
   ```

## Running Tests

### Basic Commands

- **Run all tests**: `npm test`
- **Run tests in headed mode**: `npm run test:headed`
- **Debug tests**: `npm run test:debug`
- **Run tests with UI mode**: `npm run test:ui`
- **Run specific tests**: `npm run test:specific "test name"`
- **Run tests in parallel**: `npm run test:parallel`
- **Run tests serially**: `npm run test:serial`

### Browser-specific Tests

- **Chrome only**: `npm run test:chromium`
- **Firefox only**: `npm run test:firefox`
- **Safari only**: `npm run test:webkit`
- **Mobile browsers**: `npm run test:mobile`

### Development

- **Type check**: `npm run type-check`
- **Clean test artifacts**: `npm run clean`

### Reports

- **Show test report**: `npm run report`

## Test Structure

```
tests/
├── authentication.spec.ts          # Core authentication functionality tests
├── authentication-security.spec.ts # Security-focused authentication tests
├── example.spec.ts                 # Basic application tests
├── dashboard.spec.ts               # Dashboard-specific functionality tests
├── navigation.spec.ts              # Navigation and routing tests
├── forms.spec.ts                   # Form interaction tests
└── ...                             # Additional test files

pages/
└── LoginPage.ts                    # Page object model for login functionality

utils/
└── test-helpers.ts                 # Common utilities and type definitions
```

## Configuration

The Playwright configuration is in `playwright.config.js`. Key settings:

- **Base URL**: `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Reporter**: Spec reporter for clean console output
- **Screenshots**: Taken on test failure
- **Videos**: Recorded on test failure
- **Traces**: Collected on retry

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { waitForNetworkIdle, SELECTORS } from '../utils/test-helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await waitForNetworkIdle(page);
    await expect(page).toHaveTitle(/Expected Title/);
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for network idle** before assertions: `await page.waitForLoadState('networkidle')`
3. **Use descriptive test names** that explain what is being tested
4. **Group related tests** using `test.describe()`
5. **Use beforeEach** for common setup steps
6. **Take screenshots** for visual verification when needed

### Authentication Tests

The test suite includes comprehensive authentication testing:

#### Core Authentication Tests (`authentication.spec.ts`)
- ✅ Login form UI validation
- ✅ Valid API key authentication
- ✅ Invalid API key rejection
- ✅ Empty/whitespace input handling
- ✅ Session persistence across reloads
- ✅ Loading states and error messages
- ✅ Form validation and UX
- ✅ Accessibility features

#### Security Tests (`authentication-security.spec.ts`)
- ✅ XSS prevention
- ✅ SQL injection protection
- ✅ Path traversal protection
- ✅ Rate limiting handling
- ✅ Session security
- ✅ Information disclosure prevention
- ✅ Input sanitization

#### Running Authentication Tests
```bash
# Run only authentication tests
npm test authentication

# Run security tests
npm test authentication-security

# Run specific authentication test
npm run test:specific "should successfully authenticate"
```

### Environment Variables

- `API_SECURITY_KEY`: Valid API key for testing (must match server config)
- `BASE_URL`: Base URL for the application (default: http://localhost:3000)
- `API_URL`: Backend API URL (default: http://localhost:3000)
- `CI`: Set to true in CI environments for different retry/worker settings

## CI Integration

The tests are configured to work well in CI environments:

- Retries failed tests 2 times in CI
- Uses single worker in CI for stability
- Fails build if `test.only` is accidentally left in code

## Debugging

1. **Use headed mode**: `npm run test:headed`
2. **Use debug mode**: `npm run test:debug`
3. **Use UI mode**: `npm run test:ui`
4. **Check screenshots and videos** in `test-results/` directory
5. **Use traces** for detailed debugging information
