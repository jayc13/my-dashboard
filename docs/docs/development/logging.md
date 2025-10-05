# Logging Guide

This document describes the logging system used in the My Dashboard server application.

## Overview

The server uses [Winston](https://github.com/winstonjs/winston) as the logging library, providing structured logging with different log levels and environment-based configuration.

## Log Levels

The application supports the following log levels (in order of severity):

1. **error** (0) - Error messages for critical issues
2. **warn** (1) - Warning messages for potential problems
3. **info** (2) - Informational messages about application flow
4. **http** (3) - HTTP request logs
5. **debug** (4) - Detailed debug information (includes validation errors)

## Configuration

### Environment Variables

- `LOG_LEVEL` - Sets the minimum log level (default: based on NODE_ENV)
- `NODE_ENV` - Determines default log level if LOG_LEVEL is not set

### Default Log Levels by Environment

- **production**: `info` - Logs info, warn, and error messages
- **development**: `debug` - Logs all messages including debug
- **test**: `error` - Only logs error messages

### Example Configuration

```bash
# .env file
LOG_LEVEL=debug
NODE_ENV=development
```

## Usage

### Basic Usage

Import the Logger utility:

```typescript
import { Logger } from '../utils/logger';
```

### Logging Methods

#### Error Logging
Use for critical errors that need immediate attention:

```typescript
Logger.error('Database connection failed', { 
  error: err, 
  database: 'mysql' 
});
```

#### Warning Logging
Use for potential issues that don't stop execution:

```typescript
Logger.warn('API rate limit approaching', { 
  currentRate: 95, 
  limit: 100 
});
```

#### Info Logging
Use for important application events:

```typescript
Logger.info('Server started', { 
  port: 3000, 
  environment: 'production' 
});
```

#### HTTP Logging
Use for HTTP request/response logging:

```typescript
Logger.http('API request received', { 
  method: 'GET', 
  path: '/api/users' 
});
```

#### Debug Logging
Use for detailed debugging information:

```typescript
Logger.debug('Processing user data', {
  userId: 123,
  step: 'validation'
});
```

**Note:** Validation errors are automatically logged at the debug level by the error handler middleware. This is because validation errors are expected user input errors and don't require immediate attention in production logs.

### Structured Logging

Always include relevant context as metadata:

```typescript
// Good - includes context
Logger.error('Failed to fetch user', { 
  userId: 123, 
  error: err 
});

// Bad - no context
Logger.error('Failed to fetch user');
```

### Child Loggers

Create child loggers with default metadata for consistent context:

```typescript
const serviceLogger = Logger.child({ service: 'UserService' });

serviceLogger.info('User created', { userId: 123 });
// Logs: { service: 'UserService', userId: 123, message: 'User created' }
```

## Output Format

### Console Output (Development)

Colorized, human-readable format:

```
2025-10-05 12:34:56 [info]: Server started { "port": 3000, "environment": "development" }
2025-10-05 12:34:57 [error]: Database error { "error": "Connection timeout" }
```

### File Output (Production)

JSON format for easy parsing and analysis:

```json
{
  "timestamp": "2025-10-05T12:34:56.789Z",
  "level": "error",
  "message": "Database error",
  "error": "Connection timeout"
}
```

## Log Files (Production Only)

In production, logs are written to files in the `logs/` directory:

- `logs/error.log` - Error level logs only
- `logs/combined.log` - All log levels

Files are automatically rotated:
- Maximum file size: 5MB
- Maximum files kept: 5

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Error - for failures that need attention
Logger.error('Payment processing failed', { orderId, error });

// Warn - for recoverable issues
Logger.warn('Cache miss, fetching from database', { key });

// Info - for important business events
Logger.info('User registered', { userId, email });

// Debug - for development/troubleshooting (includes validation errors)
Logger.debug('Cache hit', { key, ttl });
```

**Note on Validation Errors:** The error handler middleware automatically logs `ValidationError` instances at the debug level. This keeps production logs clean while still providing visibility during development.

### 2. Include Relevant Context

```typescript
// Good
Logger.error('API request failed', {
  endpoint: '/api/users',
  method: 'POST',
  statusCode: 500,
  error: err
});

// Bad
Logger.error('Request failed');
```

### 3. Don't Log Sensitive Information

```typescript
// Bad - logs password
Logger.info('User login', { email, password });

// Good - no sensitive data
Logger.info('User login', { email });
```

### 4. Use Structured Data

```typescript
// Good - structured metadata
Logger.info('Order processed', {
  orderId: 123,
  amount: 99.99,
  currency: 'USD'
});

// Bad - string interpolation
Logger.info(`Order ${orderId} processed for $${amount}`);
```

### 5. Log Errors with Stack Traces

```typescript
try {
  await processOrder(orderId);
} catch (error) {
  // Winston automatically includes stack traces for Error objects
  Logger.error('Order processing failed', { orderId, error });
  throw error;
}
```

## Migration from console.log

If you're updating existing code, replace console methods with Logger:

```typescript
// Before
console.log('Server started on port', port);
console.error('Error:', error);
console.warn('Warning:', message);

// After
Logger.info('Server started', { port });
Logger.error('Error occurred', { error });
Logger.warn('Warning', { message });
```

## Testing

In tests, the Logger is automatically mocked to reduce noise. You can verify logging calls:

```typescript
import { Logger } from '../utils/logger';

test('should log error on failure', async () => {
  await failingFunction();
  
  expect(Logger.error).toHaveBeenCalledWith(
    'Operation failed',
    expect.objectContaining({ error: expect.any(Error) })
  );
});
```

## Troubleshooting

### Logs not appearing

1. Check `LOG_LEVEL` environment variable
2. Verify `NODE_ENV` is set correctly
3. Ensure log level is appropriate for the message

### Too many logs

1. Increase `LOG_LEVEL` to reduce verbosity
2. In production, set `LOG_LEVEL=info` or `LOG_LEVEL=warn`

### Log files not created

1. Ensure the application has write permissions
2. Check that `NODE_ENV=production` is set
3. Verify the `logs/` directory exists or can be created

## Additional Resources

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Log Levels Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)

