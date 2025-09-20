# Testing Guide

This guide outlines the testing strategies, frameworks, and best practices used in My Dashboard to ensure code quality, reliability, and maintainability.

## 🎯 Testing Philosophy

### Testing Pyramid
My Dashboard follows the testing pyramid approach:

1. **Unit Tests (70%)** - Fast, isolated tests for individual functions/components
2. **Integration Tests (20%)** - Tests for component interactions and API endpoints
3. **End-to-End Tests (10%)** - Full user workflow tests

### Testing Principles
- **Fast Feedback**: Tests should run quickly to enable rapid development
- **Reliable**: Tests should be deterministic and not flaky
- **Maintainable**: Tests should be easy to understand and modify
- **Comprehensive**: Critical paths should have good test coverage
- **Isolated**: Tests should not depend on external services or other tests

## 🧪 Testing Frameworks

### Frontend Testing (Client)
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for tests
- **Playwright**: End-to-end testing (planned)

### Backend Testing (Server)
- **Jest**: Unit and integration testing
- **Supertest**: HTTP assertion library for API testing
- **SQLite**: In-memory database for testing
- **Test Containers**: Database testing with Docker (planned)

## 📝 Unit Testing

### React Component Testing
```typescript
// UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('UserCard', () => {
  it('should render user information', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
  
  it('should not render edit button when onEdit is not provided', () => {
    render(<UserCard user={mockUser} />);
    
    const editButton = screen.queryByRole('button', { name: /edit/i });
    expect(editButton).not.toBeInTheDocument();
  });
});
```

### Custom Hook Testing
```typescript
// useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUser } from './useUser';
import * as userService from '../services/userService';

jest.mock('../services/userService');
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('useUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should fetch user data successfully', async () => {
    const mockUser = { id: 1, name: 'John', email: 'john@example.com' };
    mockUserService.fetchUser.mockResolvedValue({ success: true, data: mockUser });
    
    const { result } = renderHook(() => useUser(1));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
  });
  
  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch user');
    mockUserService.fetchUser.mockResolvedValue({ success: false, error: mockError });
    
    const { result } = renderHook(() => useUser(1));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBe(null);
    expect(result.current.error).toEqual(mockError);
  });
});
```

### Service Layer Testing
```typescript
// UserService.test.ts
import { UserService } from './UserService';
import { UserRepository } from '../repositories/UserRepository';
import { ValidationError } from '../errors/ValidationError';

jest.mock('../repositories/UserRepository');
const MockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    mockUserRepository = new MockUserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService(mockUserRepository);
  });
  
  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const expectedUser = { id: 1, ...userData, createdAt: new Date() };
      
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);
      
      const result = await userService.createUser(userData);
      
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
    
    it('should throw ValidationError when email already exists', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const existingUser = { id: 2, ...userData, createdAt: new Date() };
      
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      
      await expect(userService.createUser(userData))
        .rejects
        .toThrow(ValidationError);
      
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

## 🔗 Integration Testing

### API Endpoint Testing
```typescript
// users.integration.test.ts
import request from 'supertest';
import { createApp } from '../app';
import { createTestDatabase } from '../test-utils/database';
import { seedTestData } from '../test-utils/seeds';

describe('Users API', () => {
  let app: Express.Application;
  let testDb: Database;
  
  beforeAll(async () => {
    testDb = await createTestDatabase();
    app = createApp(testDb);
  });
  
  afterAll(async () => {
    await testDb.close();
  });
  
  beforeEach(async () => {
    await testDb.clear();
    await seedTestData(testDb);
  });
  
  describe('GET /api/users', () => {
    it('should return list of users with valid API key', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-api-key', 'test-api-key')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('email');
    });
    
    it('should return 401 without API key', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('API key required');
    });
  });
  
  describe('POST /api/users', () => {
    it('should create new user with valid data', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('x-api-key', 'test-api-key')
        .send(userData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(userData);
      expect(response.body.data.id).toBeDefined();
    });
    
    it('should return 400 with invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email format
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('x-api-key', 'test-api-key')
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});
```

### Database Integration Testing
```typescript
// UserRepository.integration.test.ts
import { UserRepository } from './UserRepository';
import { createTestDatabase } from '../test-utils/database';

describe('UserRepository Integration', () => {
  let userRepository: UserRepository;
  let testDb: Database;
  
  beforeAll(async () => {
    testDb = await createTestDatabase();
    userRepository = new UserRepository(testDb);
  });
  
  afterAll(async () => {
    await testDb.close();
  });
  
  beforeEach(async () => {
    await testDb.clear();
  });
  
  describe('create and findById', () => {
    it('should create user and retrieve by ID', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      const createdUser = await userRepository.create(userData);
      expect(createdUser.id).toBeDefined();
      expect(createdUser.name).toBe(userData.name);
      expect(createdUser.email).toBe(userData.email);
      
      const foundUser = await userRepository.findById(createdUser.id);
      expect(foundUser).toEqual(createdUser);
    });
  });
  
  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      
      await userRepository.create(userData);
      const foundUser = await userRepository.findByEmail(userData.email);
      
      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(userData.email);
    });
    
    it('should return null for non-existent email', async () => {
      const foundUser = await userRepository.findByEmail('nonexistent@example.com');
      expect(foundUser).toBe(null);
    });
  });
});
```

## 🌐 API Mocking

### MSW Setup for Frontend Tests
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
        ],
      })
    );
  }),
  
  rest.post('/api/users', (req, res, ctx) => {
    const userData = req.body as any;
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: { id: 3, ...userData, createdAt: new Date().toISOString() },
      })
    );
  }),
  
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === '999') {
      return res(
        ctx.status(404),
        ctx.json({ success: false, error: 'User not found' })
      );
    }
    
    return res(
      ctx.json({
        success: true,
        data: { id: Number(id), name: 'John Doe', email: 'john@example.com' },
      })
    );
  }),
];
```

```typescript
// test-utils/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 🎭 End-to-End Testing

### Playwright Setup (Planned)
```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });
  
  test('should display list of users', async ({ page }) => {
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-card"]')).toHaveCount(2);
  });
  
  test('should create new user', async ({ page }) => {
    await page.click('[data-testid="add-user-button"]');
    await page.fill('[data-testid="user-name-input"]', 'New User');
    await page.fill('[data-testid="user-email-input"]', 'newuser@example.com');
    await page.click('[data-testid="save-user-button"]');
    
    await expect(page.locator('text=User created successfully')).toBeVisible();
    await expect(page.locator('[data-testid="user-card"]')).toHaveCount(3);
  });
  
  test('should edit existing user', async ({ page }) => {
    await page.click('[data-testid="user-card"]:first-child [data-testid="edit-button"]');
    await page.fill('[data-testid="user-name-input"]', 'Updated Name');
    await page.click('[data-testid="save-user-button"]');
    
    await expect(page.locator('text=User updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Name')).toBeVisible();
  });
});
```

## 🛠️ Test Utilities

### Database Test Utilities
```typescript
// test-utils/database.ts
import { Database } from 'sqlite3';
import { promisify } from 'util';

export async function createTestDatabase(): Promise<Database> {
  const db = new Database(':memory:');
  
  // Run migrations
  await runMigrations(db);
  
  return db;
}

export async function seedTestData(db: Database): Promise<void> {
  const users = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Doe', email: 'jane@example.com' },
  ];
  
  for (const user of users) {
    await db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [user.name, user.email]
    );
  }
}
```

### Component Test Utilities
```typescript
// test-utils/render.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialEntries = ['/'], ...renderOptions } = options;
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
```

## 📊 Test Coverage

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/test-utils/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test UserService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"
```

## 🚀 Continuous Integration

### GitHub Actions Test Configuration
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 📋 Testing Checklist

### Before Writing Tests
- [ ] Understand the requirements and expected behavior
- [ ] Identify edge cases and error scenarios
- [ ] Plan test structure and organization
- [ ] Set up necessary mocks and test data

### Writing Good Tests
- [ ] Use descriptive test names that explain the scenario
- [ ] Follow Arrange-Act-Assert pattern
- [ ] Test one thing at a time
- [ ] Include both positive and negative test cases
- [ ] Mock external dependencies appropriately
- [ ] Use appropriate assertions

### Test Maintenance
- [ ] Keep tests simple and focused
- [ ] Update tests when requirements change
- [ ] Remove or update obsolete tests
- [ ] Refactor tests to reduce duplication
- [ ] Monitor test performance and flakiness

This testing guide ensures comprehensive test coverage and maintains high code quality throughout the My Dashboard project.
