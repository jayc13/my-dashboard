/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
  }
}

/**
 * 401 Unauthorized - Authentication errors
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden - Authorization errors
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found - Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string | number) {
    const message = id 
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, true, 'NOT_FOUND');
  }
}

/**
 * 409 Conflict - Resource conflict errors
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true, 'CONFLICT');
  }
}

/**
 * 422 Unprocessable Entity - Semantic errors
 */
export class UnprocessableEntityError extends AppError {
  constructor(message: string = 'Unprocessable entity', details?: unknown) {
    super(message, 422, true, 'UNPROCESSABLE_ENTITY', details);
  }
}

/**
 * 429 Too Many Requests - Rate limiting errors
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429, true, 'TOO_MANY_REQUESTS', { retryAfter });
  }
}

/**
 * 500 Internal Server Error - Generic server errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super(message, 500, true, 'INTERNAL_SERVER_ERROR', details);
  }
}

/**
 * 503 Service Unavailable - Service unavailable errors
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, true, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Database error wrapper
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    super(
      message,
      500,
      true,
      'DATABASE_ERROR',
      originalError ? { originalMessage: originalError.message } : undefined,
    );
  }
}

/**
 * External service error wrapper
 */
export class ExternalServiceError extends AppError {
  constructor(
    serviceName: string,
    message: string = 'External service error',
    originalError?: Error,
  ) {
    super(
      `${serviceName}: ${message}`,
      502,
      true,
      'EXTERNAL_SERVICE_ERROR',
      originalError ? { originalMessage: originalError.message } : undefined,
    );
  }
}

