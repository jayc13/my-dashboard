# Error Handling Examples

This document provides practical examples of the improved error handling system.

## Table of Contents

- [Before and After Comparison](#before-and-after-comparison)
- [Common Use Cases](#common-use-cases)
- [Error Response Examples](#error-response-examples)
- [Validation Examples](#validation-examples)

## Before and After Comparison

### Example 1: Get By ID

**Before:**
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

**After:**
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

**Benefits:**
- ✅ Cleaner code with less boilerplate
- ✅ Consistent error responses
- ✅ Better error messages
- ✅ Type-safe validation
- ✅ Centralized error handling

### Example 2: Create Resource

**Before:**
```typescript
async create(req: Request, res: Response) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const item = await Service.create({ name, email });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    if (err.message.includes('duplicate')) {
      res.status(409).json({ error: 'Already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create' });
    }
  }
}
```

**After:**
```typescript
async create(req: Request, res: Response, next: NextFunction) {
  try {
    validateRequiredFields(req.body, ['name', 'email']);
    
    const name = validateAndSanitizeString(req.body.name, 'name', {
      required: true,
      max: 255,
    });
    
    const email = validateAndSanitizeString(req.body.email, 'email', {
      required: true,
      max: 255,
    });
    
    validateEmail(email!, 'email');
    
    const item = await Service.create({ name: name!, email: email! });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err instanceof ValidationError) {
      next(err);
    } else {
      next(new DatabaseError('Failed to create item', err as Error));
    }
  }
}
```

**Benefits:**
- ✅ Comprehensive validation
- ✅ Input sanitization
- ✅ Detailed error messages
- ✅ Proper error classification
- ✅ Security improvements

## Common Use Cases

### 1. Validating Route Parameters

```typescript
// Using validation utility
async getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateId(req.params.id, 'id');
    // ... rest of logic
  } catch (err) {
    next(err);
  }
}

// Using middleware
router.get('/:id', validateIdParam('id'), controller.getById);
```

### 2. Validating Required Fields

```typescript
async create(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate all required fields at once
    validateRequiredFields(req.body, ['name', 'email', 'password']);
    
    // ... rest of logic
  } catch (err) {
    next(err);
  }
}

// Or using middleware
router.post('/', 
  validateRequiredBodyFields(['name', 'email', 'password']),
  controller.create
);
```

### 3. Validating and Sanitizing Strings

```typescript
async create(req: Request, res: Response, next: NextFunction) {
  try {
    const name = validateAndSanitizeString(req.body.name, 'name', {
      required: true,
      min: 2,
      max: 100,
    });
    
    const description = validateAndSanitizeString(req.body.description, 'description', {
      required: false,
      max: 500,
    });
    
    // ... rest of logic
  } catch (err) {
    next(err);
  }
}
```

### 4. Validating JSON Configuration

```typescript
async create(req: Request, res: Response, next: NextFunction) {
  try {
    const { config } = req.body;
    
    if (config) {
      const parsed = validateJSON(config, 'config');
      // Use parsed object
    }
    
    // ... rest of logic
  } catch (err) {
    next(err);
  }
}
```

### 5. Handling Not Found

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

### 6. Handling Database Errors

```typescript
async create(req: Request, res: Response, next: NextFunction) {
  try {
    // ... validation
    
    const item = await Service.create(data);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err instanceof ValidationError) {
      next(err);
    } else {
      next(new DatabaseError('Failed to create item', err as Error));
    }
  }
}
```

### 7. Handling External Service Errors

```typescript
async getPullRequestDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateId(req.params.id, 'id');
    const pr = await PRService.getById(id);
    
    if (!pr) {
      throw new NotFoundError('Pull Request', id);
    }
    
    const details = await GitHubService.getPRDetails(pr.repo, pr.number);
    res.json({ success: true, data: details });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
      next(err);
    } else {
      next(new ExternalServiceError('GitHub', 'Failed to fetch PR details', err as Error));
    }
  }
}
```

## Error Response Examples

### 1. Validation Error

**Request:**
```http
POST /api/todos
Content-Type: application/json

{
  "description": "Some description"
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Missing or invalid required fields",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "title",
        "message": "title is required",
        "code": "REQUIRED_FIELD"
      }
    ],
    "timestamp": "2024-01-20T10:30:00.000Z",
    "path": "/api/todos",
    "method": "POST"
  }
}
```

### 2. Not Found Error

**Request:**
```http
GET /api/todos/999
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Todo with id '999' not found",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2024-01-20T10:30:00.000Z",
    "path": "/api/todos/999",
    "method": "GET"
  }
}
```

### 3. Invalid ID Error

**Request:**
```http
GET /api/todos/invalid
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid id",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "id",
        "message": "id must be a positive integer",
        "code": "INVALID_ID",
        "value": "invalid"
      }
    ],
    "timestamp": "2024-01-20T10:30:00.000Z",
    "path": "/api/todos/invalid",
    "method": "GET"
  }
}
```

### 4. Conflict Error

**Request:**
```http
POST /api/apps
Content-Type: application/json

{
  "name": "My App",
  "code": "existing-code"
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "App code must be unique",
    "code": "CONFLICT",
    "statusCode": 409,
    "timestamp": "2024-01-20T10:30:00.000Z",
    "path": "/api/apps",
    "method": "POST"
  }
}
```

### 5. Invalid JSON Error

**Request:**
```http
POST /api/apps
Content-Type: application/json

{
  "name": "My App",
  "code": "my-app",
  "e2eTriggerConfiguration": "{ invalid json }"
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid JSON in e2eTriggerConfiguration",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "e2eTriggerConfiguration",
        "message": "e2eTriggerConfiguration must be valid JSON",
        "code": "INVALID_JSON",
        "value": "{ invalid json }"
      }
    ],
    "timestamp": "2024-01-20T10:30:00.000Z",
    "path": "/api/apps",
    "method": "POST"
  }
}
```

### 6. Success Response

**Request:**
```http
GET /api/todos/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete documentation",
    "description": "Write comprehensive docs",
    "link": "https://github.com/...",
    "dueDate": "2024-01-25T00:00:00.000Z",
    "isCompleted": false
  }
}
```

## Validation Examples

### String Validation

```typescript
// Required string with max length
const name = validateAndSanitizeString(req.body.name, 'name', {
  required: true,
  max: 255,
});

// Optional string with min and max length
const description = validateAndSanitizeString(req.body.description, 'description', {
  required: false,
  min: 10,
  max: 1000,
});
```

### Email Validation

```typescript
const email = validateAndSanitizeString(req.body.email, 'email', {
  required: true,
  max: 255,
});

validateEmail(email!, 'email');
```

### URL Validation

```typescript
const url = validateAndSanitizeString(req.body.url, 'url', {
  required: false,
  max: 500,
});

if (url) {
  validateURL(url, 'url');
}
```

### Date Validation

```typescript
const dueDate = req.body.dueDate;

if (dueDate) {
  const parsedDate = validateDate(dueDate, 'dueDate');
  // Use parsedDate
}
```

### Enum Validation

```typescript
const status = validateEnum(
  req.body.status,
  ['pending', 'active', 'completed'],
  'status'
);
```

### Array Validation

```typescript
const tags = validateArray(req.body.tags, 'tags', {
  minLength: 1,
  maxLength: 10,
});
```

## Tips and Best Practices

1. **Always validate input early** in the controller before any business logic
2. **Use specific error classes** for different scenarios
3. **Provide detailed error information** to help API consumers
4. **Sanitize user input** to prevent injection attacks
5. **Use consistent response format** across all endpoints
6. **Log errors with context** for debugging
7. **Don't expose sensitive information** in error messages
8. **Use middleware for common validations** to reduce boilerplate
9. **Test error scenarios** to ensure proper error handling
10. **Document error responses** in API documentation

