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
├── apps-management.spec.ts         # Apps management CRUD operations tests
├── e2e-dashboard.spec.ts           # E2E Dashboard page tests (NEW)
├── jira-integration.spec.ts        # Jira integration tests
├── navigation.spec.ts              # Navigation and routing tests
├── notifications.spec.ts           # Notification center tests
├── pull-requests.spec.ts           # Pull requests management tests
└── to-do-list.spec.ts              # To-do list functionality tests

pages/
├── AppsPage.ts                     # Page object model for apps management
├── E2EPage.ts                      # Page object model for E2E dashboard (NEW)
├── JiraPage.ts                     # Page object model for Jira functionality
├── LoginPage.ts                    # Page object model for login functionality
├── NavigationPage.ts               # Page object model for navigation
├── NotificationPage.ts             # Page object model for notifications
├── PullRequestsPage.ts             # Page object model for pull requests
└── ToDoPage.ts                     # Page object model for to-do list

utils/
├── app-helpers.ts                  # Application test utilities
├── database-connection.ts          # Database connection utilities
├── dbCleanup.ts                    # Database cleanup utilities
├── e2e-test-helpers.ts             # E2E dashboard test utilities (NEW)
├── notification-test-helpers.ts    # Notification test utilities
├── pull-request-test-helpers.ts    # Pull request test utilities
├── test-helpers.ts                 # Common utilities and type definitions
└── todo-test-helpers.ts            # To-do list test utilities
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

### E2E Dashboard Tests

The E2E Dashboard test suite (`e2e-dashboard.spec.ts`) provides comprehensive coverage of the E2E test results page:

#### Test Coverage
- ✅ **Page Load and Navigation**
  - Page loads successfully
  - Direct URL navigation
  - Page title and elements visibility

- ✅ **General Metrics Display**
  - All four metric cards (Total Runs, Passed, Failed, Passing Rate)
  - Metric values and formatting
  - Loading skeletons during data fetch

- ✅ **Test Results Per App**
  - Project cards display with correct information
  - Pass/fail counts and success rates
  - Links to Cypress Cloud dashboard
  - Empty states (no results, all passing)

- ✅ **Refresh Functionality**
  - Global refresh button
  - Individual project card refresh
  - API request handling

- ✅ **Pagination**
  - Pagination visibility for large datasets
  - Page navigation
  - Current page indicator

- ✅ **Context Menu**
  - Right-click context menu
  - Menu options and actions
  - Close on outside click

- ✅ **Data Accuracy**
  - Consistency between metrics and cards
  - Only failed projects shown in list
  - Correct calculations

- ✅ **Error Handling**
  - API error display
  - Error messages

- ✅ **Loading States**
  - Loading backdrop for pending reports
  - Skeleton loaders

- ✅ **Responsive Design**
  - Mobile viewport (375x667)
  - Tablet viewport (768x1024)
  - Desktop viewport

- ✅ **Accessibility**
  - ARIA labels
  - Heading hierarchy
  - Keyboard navigation

- ✅ **Performance**
  - Page load time
  - Efficient handling of large datasets

#### Running E2E Dashboard Tests
```bash
# Run only E2E dashboard tests
npm test e2e-dashboard

# Run specific E2E dashboard test
npm run test:specific "should display all four metric cards"

# Run with UI mode for debugging
npm run test:ui -- e2e-dashboard
```

#### Page Object Model
The `E2EPage` class provides methods for interacting with the E2E Dashboard:

```typescript
import { E2EPage } from '@pages/E2EPage';

// Navigate to page
await e2ePage.goto();

// Get metrics
const metrics = await e2ePage.getAllMetrics();

// Get project card data
const cardData = await e2ePage.getProjectCardData('My App');

// Refresh data
await e2ePage.clickRefresh();
```

#### Test Utilities
The `E2EDataGenerator` and `E2ETestUtils` classes provide utilities for testing:

```typescript
import { E2EDataGenerator, E2ETestUtils } from '@utils/e2e-test-helpers';

// Generate mock data
const report = E2EDataGenerator.mockDetailedReport();
const allPassing = E2EDataGenerator.mockAllPassingReport();

// Mock API responses
await E2ETestUtils.mockE2EReportResponse(page, report);

// Intercept API calls
const request = E2ETestUtils.interceptGetE2EReport(page);
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
