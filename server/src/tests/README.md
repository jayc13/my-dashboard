# Testing Guide

This directory contains tests for the Cypress Dashboard server, specifically focusing on the FileSystem functionality.

## Test Files

### 1. Service Tests (`file_system.service.test.ts`)
Tests the core `FileSystemService` functionality including:
- Directory listing
- File deletion with safety checks
- Path traversal protection
- Protected file detection

### 2. Controller Tests (`file_system.controller.test.ts`)
Tests the HTTP controller layer including:
- Request/response handling
- Error status codes
- Parameter validation
- Integration with service layer

### 3. Manual Test Runner (`manual-test.ts`)
A standalone test runner that doesn't require Jest dependencies. Can be run directly with ts-node.

## Running Tests

### Option 1: Jest Tests (Recommended)
First install the required dependencies:
```bash
npm install --save-dev jest @types/jest ts-jest
```

Then run the tests:
```bash
npm test
```

### Option 2: Manual Tests (No Dependencies Required)
Run the manual test suite:
```bash
npm run test:manual
```

Or run directly:
```bash
npx ts-node src/tests/manual-test.ts
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Uses ts-jest preset for TypeScript support
- Configured for Node.js environment
- Includes coverage reporting
- Sets up test timeout and file patterns

### Test Setup (`setup.ts`)
- Mocks console methods to reduce test noise
- Sets test environment variables
- Mocks dotenv to prevent loading .env during tests

## Test Coverage

The tests cover:

### ✅ Security Features
- Path traversal attack prevention
- Protected file detection
- Extension-based filtering
- Directory safety checks

### ✅ Core Functionality
- Directory listing with metadata
- File and directory deletion
- Error handling and status codes
- Environment configuration

### ✅ Edge Cases
- Non-existent paths
- Invalid parameters
- Protected directories with nested files
- Various file types and extensions

## Test Data

Tests use temporary directories created in the system temp folder to avoid affecting real data. All test data is automatically cleaned up after tests complete.

## Continuous Integration

To integrate with CI/CD pipelines, ensure the following npm scripts are available:
- `npm test` - Run all Jest tests
- `npm run test:manual` - Run manual tests (fallback option)
- `npm run build` - Build before testing

## Adding New Tests

When adding new functionality:

1. **Service Tests**: Add tests to `file_system.service.test.ts` for business logic
2. **Controller Tests**: Add tests to `file_system.controller.test.ts` for HTTP handling
3. **Manual Tests**: Update `manual-test.ts` for integration testing without dependencies

Follow the existing patterns for:
- Test setup and teardown
- Temporary directory creation
- Error assertion patterns
- Mock usage in controller tests
