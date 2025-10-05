import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError';
import { Logger } from '../utils/logger';

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
    timestamp: string;
    path: string;
    method: string;
    requestId?: string;
  };
}

/**
 * Check if error is an operational error (expected/handled)
 */
function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Log error with context
 */
function logError(error: Error, req: Request): void {
  const errorLog = {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
  };

  // Log validation errors as debug (expected user input errors)
  if (error instanceof ValidationError) {
    Logger.debug('Validation error', errorLog);
  } else if (isOperationalError(error)) {
    Logger.warn('Operational error', errorLog);
  } else {
    Logger.error('Unexpected error', errorLog);
  }
}

/**
 * Handle database errors
 */
function handleDatabaseError(error: Error): AppError {
  const message = error.message.toLowerCase();

  // Foreign key constraint
  if (message.includes('foreign key constraint')) {
    return new AppError(
      'Invalid reference: Related resource does not exist',
      400,
      true,
      'FOREIGN_KEY_CONSTRAINT',
    );
  }

  // Unique constraint
  if (message.includes('unique constraint') || message.includes('duplicate')) {
    return new AppError(
      'Resource already exists',
      409,
      true,
      'DUPLICATE_RESOURCE',
    );
  }

  // Not null constraint
  if (message.includes('not null constraint')) {
    return new AppError(
      'Missing required field',
      400,
      true,
      'MISSING_REQUIRED_FIELD',
    );
  }

  // Default database error
  return new AppError(
    'Database operation failed',
    500,
    true,
    'DATABASE_ERROR',
  );
}

/**
 * Handle JSON parsing errors
 */
function handleJsonError(error: Error): AppError {
  return new AppError(
    'Invalid JSON in request body',
    400,
    true,
    'INVALID_JSON',
    { originalMessage: error.message },
  );
}

/**
 * Convert unknown errors to AppError
 */
function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for specific error types
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return handleJsonError(error);
    }

    // Database errors (check common patterns)
    if (
      error.message.includes('constraint') ||
      error.message.includes('duplicate') ||
      error.message.includes('SQLITE') ||
      error.message.includes('MySQL')
    ) {
      return handleDatabaseError(error);
    }

    // Generic error conversion
    return new AppError(
      error.message || 'An unexpected error occurred',
      500,
      false,
      'INTERNAL_ERROR',
    );
  }

  // Unknown error type
  return new AppError(
    'An unexpected error occurred',
    500,
    false,
    'UNKNOWN_ERROR',
  );
}

/**
 * Build error response
 */
function buildErrorResponse(error: AppError, req: Request): ErrorResponse {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: isDevelopment ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: req.get('x-request-id'),
    },
  };
}

/**
 * Global error handler middleware
 * This should be the last middleware in the chain
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  // Normalize error to AppError
  const error = normalizeError(err);

  // Log error with context
  logError(error, req);

  // Build and send error response
  const errorResponse = buildErrorResponse(error, req);

  // Set appropriate status code
  res.status(error.statusCode);

  // Send JSON response
  res.json(errorResponse);
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
  Logger.error('Unhandled Promise Rejection', {
    reason,
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
  });

  // In production, you might want to:
  // 1. Log to external service (e.g., Sentry, DataDog)
  // 2. Send alerts
  // 3. Gracefully shutdown if critical
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException(error: Error): void {
  Logger.error('Uncaught Exception', {
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
  });

  // In production, you should:
  // 1. Log to external service
  // 2. Send alerts
  // 3. Gracefully shutdown the process

  // Exit process after logging
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}