# Error Handling Guide

This document describes the error handling patterns and best practices used in the My Dashboard Server.

## Table of Contents

- [Overview](#overview)
- [Custom Error Classes](#custom-error-classes)
- [Validation Utilities](#validation-utilities)
- [Error Handler Middleware](#error-handler-middleware)
- [Controller Patterns](#controller-patterns)
- [Error Response Format](#error-response-format)
- [Best Practices](#best-practices)

## Overview

The server implements a comprehensive error handling system with:

- **Custom error classes** for different HTTP status codes
- **Validation utilities** for common validation patterns
- **Centralized error handler** middleware
- **Consistent error response format** across all endpoints
- **Proper error logging** with request context

## Custom Error Classes

All custom errors extend the base `AppError` class located in `src/errors/AppError.ts`.

### Available Error Classes

| Error Class | Status Code | Use Case |
|------------|-------------|----------|
| `ValidationError` | 400 | Invalid input data, validation failures |
| `UnauthorizedError` | 401 | Authentication failures |
| `ForbiddenError` | 403 | Authorization failures |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource conflicts (e.g., duplicate entries) |
| `UnprocessableEntityError` | 422 | Semantic errors |
| `TooManyRequestsError` | 429 | Rate limiting |
| `InternalServerError` | 500 | Generic server errors |
| `ServiceUnavailableError` | 503 | Service unavailable |
| `DatabaseError` | 500 | Database operation failures |
| `ExternalServiceError` | 502 | External service failures |

### Usage Example

```typescript
import { NotFoundError, ValidationError } from '../errors/AppError';

// Not found error
throw new NotFoundError('Todo', id);

// Validation error with details
throw new ValidationError('Invalid input', [{
  field: 'email',
  message: 'Email is required',
  code: 'REQUIRED_FIELD',
}]);

// Database error
throw new DatabaseError('Failed to create user', originalError);
```

## Validation Utilities

Located in `src/utils/validation.ts`, these utilities provide reusable validation functions.

### Available Validators

#### `validateId(value, fieldName)`
Validates that a value is a positive integer ID.

```typescript
const id = validateId(req.params.id, 'id');
```

#### `validateRequiredFields(data, fields)`
Validates that required fields are present and not empty.

```typescript
validateRequiredFields(req.body, ['name', 'email']);
```

#### `validateJSON(value, fieldName)`
Validates that a string is valid JSON.

```typescript
const parsed = validateJSON(jsonString, 'configuration');
```

#### `validateAndSanitizeString(value, fieldName, options)`
Validates and sanitizes string input with options for min/max length and required.

```typescript
const name = validateAndSanitizeString(req.body.name, 'name', {
  required: true,
  min: 2,
  max: 100,
});
```

#### Other Validators
- `validateStringLength(value, fieldName, options)`
- `validateEmail(email, fieldName)`
- `validateURL(url, fieldName)`
- `validateDate(date, fieldName)`
- `validateBoolean(value, fieldName)`
- `validateEnum(value, allowedValues, fieldName)`
- `validateArray(value, fieldName, options)`

## Error Handler Middleware

The global error handler is located in `src/middleware/error_handler.ts`.

### Features

- **Automatic error normalization**: Converts all errors to `AppError` instances
- **Database error detection**: Recognizes common database errors (foreign key, unique constraint, etc.)
- **JSON parsing error detection**: Handles malformed JSON in request bodies
- **Detailed logging**: Logs errors with full request context
- **Environment-aware responses**: Includes stack traces only in development
- **Structured error responses**: Consistent JSON format for all errors

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Todo with id '123' not found",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "details": null,
    "timestamp": "2024-01-20T10:30:00.000Z",
    "path": "/api/to_do_list/123",
    "method": "GET",
    "requestId": "abc-123-def"
  }
}
```

## Controller Patterns

### Basic Pattern

All controllers should follow this pattern:

```typescript
import { Request, Response, NextFunction } from 'express';
import { NotFoundError, ValidationError, DatabaseError } from '../errors/AppError';
import { validateId, validateRequiredFields } from '../utils/validation';

export class MyController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate input
      const id = validateId(req.params.id, 'id');
      
      // 2. Fetch data
      const item = await MyService.getById(id);
      
      // 3. Check if found
      if (!item) {
        throw new NotFoundError('Item', id);
      }
      
      // 4. Return success response
      res.json({ success: true, data: item });
    } catch (err) {
      // 5. Pass errors to error handler
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate required fields
      validateRequiredFields(req.body, ['name', 'email']);
      
      // 2. Validate and sanitize individual fields
      const name = validateAndSanitizeString(req.body.name, 'name', {
        required: true,
        max: 255,
      });
      
      // 3. Create resource
      const item = await MyService.create({ name });
      
      // 4. Return success response
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      // 5. Handle specific errors
      if (err instanceof ValidationError) {
        next(err);
      } else {
        next(new DatabaseError('Failed to create item', err as Error));
      }
    }
  }
}
```

### Key Points

1. **Always use `next(error)`** to pass errors to the error handler
2. **Validate input early** before any business logic
3. **Use specific error classes** for different scenarios
4. **Return consistent response format** with `{ success: true, data: ... }`
5. **Wrap database operations** in try-catch and convert to `DatabaseError`

## Validation Middleware

Located in `src/middleware/validation.middleware.ts`, these middleware functions can be used in routes.

### Available Middleware

#### `validateIdParam(paramName)`
Validates route parameter is a valid ID.

```typescript
router.get('/:id', validateIdParam('id'), controller.getById);
```

#### `validateRequiredBodyFields(fields)`
Validates required fields in request body.

```typescript
router.post('/', validateRequiredBodyFields(['name', 'email']), controller.create);
```

#### `validateBodyNotEmpty`
Ensures request body is not empty.

```typescript
router.post('/', validateBodyNotEmpty, controller.create);
```

#### `validatePaginationParams(defaultLimit, maxLimit)`
Validates and normalizes pagination parameters.

```typescript
router.get('/', validatePaginationParams(50, 100), controller.list);
```

#### `asyncHandler(fn)`
Wraps async route handlers to catch errors automatically.

```typescript
router.get('/', asyncHandler(async (req, res) => {
  const items = await MyService.getAll();
  res.json({ success: true, data: items });
}));
```

## Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good
const id = validateId(req.params.id, 'id');
const name = validateAndSanitizeString(req.body.name, 'name', { required: true });

// ❌ Bad
const id = Number(req.params.id);
const name = req.body.name;
```

### 2. Use Specific Error Classes

```typescript
// ✅ Good
throw new NotFoundError('User', userId);
throw new ValidationError('Invalid email format');
throw new ConflictError('Email already exists');

// ❌ Bad
throw new Error('User not found');
res.status(404).json({ error: 'Not found' });
```

### 3. Always Use next() for Errors

```typescript
// ✅ Good
try {
  // ... logic
} catch (err) {
  next(err);
}

// ❌ Bad
try {
  // ... logic
} catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Internal error' });
}
```

### 4. Provide Detailed Error Information

```typescript
// ✅ Good
throw new ValidationError('Invalid input', [{
  field: 'email',
  message: 'Email must be a valid email address',
  code: 'INVALID_EMAIL',
  value: email,
}]);

// ❌ Bad
throw new ValidationError('Invalid input');
```

### 5. Return Consistent Response Format

```typescript
// ✅ Good
res.json({ success: true, data: items });
res.status(201).json({ success: true, data: newItem });

// ❌ Bad
res.json(items);
res.status(201).json(newItem);
```

## Testing Error Handling

When testing endpoints, verify:

1. **Correct status codes** are returned
2. **Error response format** is consistent
3. **Validation errors** include field details
4. **Not found errors** return 404
5. **Database errors** are properly wrapped

Example test:

```typescript
describe('GET /api/todos/:id', () => {
  it('should return 404 for non-existent todo', async () => {
    const response = await request(app)
      .get('/api/todos/999')
      .expect(404);
    
    expect(response.body).toMatchObject({
      success: false,
      error: {
        message: expect.stringContaining('not found'),
        code: 'NOT_FOUND',
        statusCode: 404,
      },
    });
  });
  
  it('should return 400 for invalid ID', async () => {
    const response = await request(app)
      .get('/api/todos/invalid')
      .expect(400);
    
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

## Migration Guide

To update existing controllers:

1. Add `NextFunction` to handler parameters
2. Import error classes and validation utilities
3. Replace manual validation with utility functions
4. Replace `res.status().json()` error responses with `throw` statements
5. Use `next(error)` in catch blocks
6. Update success responses to include `{ success: true, data: ... }`

Before:
```typescript
async getById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const item = await Service.getById(id);
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}
```

After:
```typescript
async getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateId(req.params.id, 'id');
    const item = await Service.getById(id);
    if (!item) {
      throw new NotFoundError('Item', id);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}
```

