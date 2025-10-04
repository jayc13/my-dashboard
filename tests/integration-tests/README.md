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
    ├── health.test.ts         # Health check endpoint tests
    ├── auth.test.ts           # Authentication and API key tests
    ├── apps.test.ts           # Applications API tests
    ├── todos.test.ts          # To-Do List API tests
    └── pull-requests.test.ts  # Pull Requests API tests
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

# Run tests with JUnit XML and HTML reports
npm run test:report

# Run tests with coverage report
npm run test:coverage

# Run development server check
npm run dev

# Run API proxy validator
npm run proxy-validator
```

### Test Reports

When running `npm run test:report`, the following reports are generated in the `test-results/` directory:

- **`junit.xml`** - JUnit XML format report (useful for CI/CD systems like Jenkins, CircleCI, GitHub Actions)
- **`test-report.html`** - HTML report with detailed test results, console logs, and failure messages

The reports are automatically generated after each test run and include:
- Test suite and test case names
- Pass/fail status for each test
- Execution time
- Error messages and stack traces for failures
- Console output from tests

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

### Local Development

1. **Start your server in test mode** (if not already running):
   ```bash
   cd ../../server
   # Copy the test environment configuration
   cp .env.test .env
   npm run dev
   ```

2. **Run the integration tests**:
   ```bash
   cd ../tests/integration-tests
   API_SECURITY_KEY=test-api-key-for-integration-tests npm test
   ```

The tests will automatically wait for the server to be ready before executing.

**Important**: Make sure to restore your original `.env` file in the server directory after running tests if you need the production configuration.

## Adding New Tests

1. Create a new test file in `src/tests/` with the `.test.ts` extension
2. Import the necessary utilities from `../utils/`
3. Write your tests using Jest syntax
4. Use the `HttpClient` for making HTTP requests
5. Use `TestHelpers` for common testing utilities

## Test Coverage

The integration tests cover the following API endpoints and functionality:

### Health Check (`health.test.ts`)
- Server connectivity and health endpoint validation
- Basic server response testing

### Authentication (`auth.test.ts`)
- API key validation endpoint testing
- Protected endpoint access control
- Authentication error handling

### Applications API (`apps.test.ts`)
- CRUD operations for applications
- Application listing and filtering
- Data validation and error handling

### To-Do List API (`todos.test.ts`)
- CRUD operations for to-do items
- Data validation and required field checking
- Status updates and completion tracking

### Pull Requests API (`pull-requests.test.ts`)
- Pull request tracking and management
- GitHub integration testing
- Error handling for external API calls

## Example Test

See `src/tests/health.test.ts` for a basic example, or `src/tests/apps.test.ts` for a complete CRUD API testing example that demonstrates:
- Creating, reading, updating, and deleting resources
- Data validation and error handling
- Proper TypeScript types and test structure
- API key authentication testing
