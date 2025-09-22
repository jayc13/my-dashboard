# Integration Tests

This directory contains integration tests for the My Dashboard server using TypeScript, Jest, and node-fetch.

## Setup

The integration tests are configured with:
- **TypeScript** for type safety and modern JavaScript features
- **Jest** as the testing framework
- **node-fetch** for making HTTP requests to the server
- **ts-jest** for TypeScript support in Jest

## Project Structure

```
src/
├── index.ts              # Main entry point
├── setup.ts              # Jest setup file
├── utils/
│   ├── http-client.ts    # HTTP client wrapper around node-fetch
│   └── test-helpers.ts   # Common test utilities
└── tests/
    └── health.test.ts    # Example health check tests
```

## Configuration Files

- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest testing configuration
- `package.json` - Dependencies and scripts

## Available Scripts

```bash
# Build TypeScript files
npm run build

# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run development server check
npm run dev

# Run API proxy validator
npm run proxy-validator
```

## Writing Tests

### Basic Test Structure

```typescript
import { TestHelpers } from '../utils/test-helpers';

describe('Your Feature Tests', () => {
  let testHelpers: TestHelpers;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    await testHelpers.waitForServer();
  });

  it('should test something', async () => {
    const httpClient = testHelpers.getHttpClient();
    const response = await httpClient.get('/your-endpoint');
    
    expect(response.status).toBe(200);
  });
});
```

### Using the HTTP Client

The `HttpClient` class provides convenient methods for making HTTP requests:

```typescript
const httpClient = testHelpers.getHttpClient();

// GET request
const response = await httpClient.get('/api/endpoint');

// POST request with JSON body
const postResponse = await httpClient.post('/api/endpoint', { data: 'value' });

// GET request with JSON parsing
const data = await httpClient.getJson<YourType>('/api/endpoint');

// POST request with JSON body and response parsing
const result = await httpClient.postJson<ResponseType>('/api/endpoint', { data: 'value' });
```

### Test Helpers

The `TestHelpers` class provides utilities for common testing tasks:

```typescript
// Wait for server to be ready
await testHelpers.waitForServer();

// Generate random test data
const randomString = testHelpers.generateRandomString(10);
const randomEmail = testHelpers.generateRandomEmail();

// Validate response structure
testHelpers.validateResponseStructure(response, ['id', 'name', 'email']);

// Check HTTP status
testHelpers.expectStatus(response, 200);
```

## Environment Variables

You can configure the integration tests using environment variables:

- `SERVER_URL` - Base URL of the server to test (default: `http://localhost:3000`)
- `API_SECURITY_KEY` - Security key for API authentication (required for protected endpoints)
- `NODE_ENV` - Set to `test` during test execution

## Running Tests

1. **Start your server** (if not already running):
   ```bash
   cd ../../server
   npm run dev
   ```

2. **Run the integration tests**:
   ```bash
   npm test
   ```

The tests will automatically wait for the server to be ready before executing.

## Adding New Tests

1. Create a new test file in `src/tests/` with the `.test.ts` extension
2. Import the necessary utilities from `../utils/`
3. Write your tests using Jest syntax
4. Use the `HttpClient` for making HTTP requests
5. Use `TestHelpers` for common testing utilities

## Example Test

See `src/tests/health.test.ts` for a complete example of integration tests that:
- Check server connectivity
- Validate health check endpoint
- Use proper TypeScript types
- Follow testing best practices
