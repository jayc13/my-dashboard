# Testing

This document describes the testing strategy, frameworks, and best practices used in the My Dashboard project.

## Testing Philosophy

- **Test early, test often** - Write tests as you develop
- **Test behavior, not implementation** - Focus on what the code does, not how
- **Maintain test quality** - Tests should be as well-written as production code
- **Fast feedback** - Tests should run quickly
- **Reliable tests** - Tests should be deterministic and not flaky

## Testing Pyramid

```
        /\
       /  \
      / E2E \
     /--------\
    /          \
   / Integration \
  /--------------\
 /                \
/   Unit Tests     \
--------------------
```

- **Unit Tests** (70%) - Test individual functions and components
- **Integration Tests** (20%) - Test interactions between modules
- **E2E Tests** (10%) - Test complete user workflows

## Testing Frameworks

### Unit Tests

**Client:**
- **Vitest** - Fast unit test framework
- **React Testing Library** - Test React components
- **@testing-library/jest-dom** - Custom matchers

**Server:**
- **Jest** - JavaScript testing framework
- **ts-jest** - TypeScript support for Jest

**Cron:**
- **Jest** - JavaScript testing framework
- **ts-jest** - TypeScript support

### Integration Tests

- **Jest** - Test runner
- **Supertest** - HTTP assertions (if needed)
- **Custom test helpers** - Shared utilities

### E2E Tests

- **Playwright** - Modern E2E testing framework
- **Multiple browsers** - Chrome, Firefox, Safari
- **Mobile testing** - Mobile Chrome, Mobile Safari

## Running Tests

### All Tests

```bash
# Run all tests across all workspaces
pnpm test

# Run tests in specific workspace
pnpm --filter client test
pnpm --filter server test
pnpm --filter cron test
```

### Unit Tests

**Client:**
```bash
cd client
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:ui             # UI mode
```

**Server:**
```bash
cd server
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
```

**Cron:**
```bash
cd cron
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
```

### Integration Tests

```bash
cd tests/integration-tests
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:verbose        # Verbose output
npm run test:report         # Generate HTML report
npm run test:coverage       # With coverage
```

### E2E Tests

```bash
cd tests/e2e-tests
npm test                    # Run all tests
npm run test:headed         # With browser UI
npm run test:debug          # Debug mode
npm run test:ui             # Playwright UI
npm run test:chromium       # Chrome only
npm run test:firefox        # Firefox only
npm run test:webkit         # Safari only
npm run test:mobile         # Mobile browsers
npm run report              # View test report
```

## Writing Unit Tests

### Client Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('should render user information', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });

  it('should not render edit button when onEdit is not provided', () => {
    render(<UserCard user={mockUser} />);
    
    const editButton = screen.queryByRole('button', { name: /edit/i });
    expect(editButton).not.toBeInTheDocument();
  });
});
```

### Server Function Tests

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { UserService } from './user.service';
import { NotFoundError } from '../errors';

describe('UserService', () => {
  let userService: UserService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };
    userService = new UserService(mockDb);
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, name: 'John Doe' };
      mockDb.query.mockResolvedValue([[mockUser]]);

      const result = await userService.getUser(1);

      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [1]
      );
    });

    it('should throw NotFoundError when user not found', async () => {
      mockDb.query.mockResolvedValue([[]]);

      await expect(userService.getUser(999))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
```

### Custom Hooks Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUser } from './useUser';

describe('useUser', () => {
  it('should fetch user data', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useUser(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUser(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeTruthy();
  });
});
```

## Writing Integration Tests

### API Integration Tests

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import { TestHelpers } from '../utils/test-helpers';

describe('User API Integration Tests', () => {
  let testHelpers: TestHelpers;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    await testHelpers.waitForServer();
  });

  describe('GET /api/users/:id', () => {
    it('should return user data', async () => {
      const httpClient = testHelpers.getHttpClient();
      const response = await httpClient.get('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: 1,
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    it('should return 404 for non-existent user', async () => {
      const httpClient = testHelpers.getHttpClient();
      
      try {
        await httpClient.get('/api/users/999999');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('POST /api/users', () => {
    it('should create new user', async () => {
      const httpClient = testHelpers.getHttpClient();
      const newUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const response = await httpClient.post('/api/users', newUser);

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(Number),
        ...newUser,
      });
    });

    it('should validate required fields', async () => {
      const httpClient = testHelpers.getHttpClient();
      
      try {
        await httpClient.post('/api/users', { name: 'John' });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain('email');
      }
    });
  });
});
```

## Writing E2E Tests

### Basic E2E Test

```typescript
import { test, expect } from '@playwright/test';
import { waitForNetworkIdle } from '../utils/test-helpers';

test.describe('User Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await waitForNetworkIdle(page);

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('/dashboard');
    
    // Verify successful login
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await waitForNetworkIdle(page);

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('.error-message'))
      .toContainText('Invalid credentials');
  });
});
```

### Page Object Pattern

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return this.page.locator('.error-message').textContent();
  }
}

// tests/login.test.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  
  await expect(page).toHaveURL('/dashboard');
});
```

## Test Configuration

### Client (Vitest)

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*'],
    },
  },
});
```

### Server (Jest)

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**',
  ],
  coverageDirectory: '.coverage-report',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testTimeout: 10000,
};
```

### E2E (Playwright)

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['github'], ['html']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-all-retries',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Best Practices

### General

- **Test behavior, not implementation** - Focus on what users see and do
- **Use descriptive test names** - Test names should explain what is being tested
- **Arrange-Act-Assert** - Structure tests clearly
- **One assertion per test** - Keep tests focused (when possible)
- **Avoid test interdependence** - Tests should run independently

### Mocking

```typescript
// ✅ Good - mock external dependencies
vi.mock('../services/api', () => ({
  fetchUser: vi.fn(),
}));

// ❌ Bad - testing implementation details
expect(component.state.internalCounter).toBe(5);
```

### Async Testing

```typescript
// ✅ Good - use async/await
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// ✅ Good - use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Test Data

```typescript
// ✅ Good - use factories or fixtures
const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  ...overrides,
});

// ❌ Bad - hardcoded data everywhere
const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
```

## Coverage Goals

- **Overall**: 80% minimum
- **Critical paths**: 100%
- **Utilities**: 90%+
- **UI Components**: 70%+

```bash
# Check coverage
pnpm --filter client test:coverage
pnpm --filter server test:coverage
```

## CI/CD Integration

Tests run automatically on:
- **Pre-push hook** - Unit tests
- **Pull requests** - All tests
- **Main branch** - All tests + E2E

## Next Steps

- [Coding Standards](./coding-standards.md) - Code style and conventions
- [CI/CD](./ci-cd.md) - Continuous integration and deployment
- [Troubleshooting](./troubleshooting.md) - Common issues

