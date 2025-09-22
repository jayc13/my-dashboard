/**
 * Error handling for My Dashboard SDK
 */

/**
 * Custom error class for API-related errors
 */
export class APIError extends Error {
  public readonly status: number;
  public readonly response?: any;

  constructor(status: number, message: string, response?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }

  /**
   * Check if the error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if the error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if the error is retryable
   */
  isRetryable(): boolean {
    // Don't retry on client errors except rate limiting
    if (this.isClientError() && this.status !== 429) {
      return false;
    }
    
    // Retry on server errors and rate limiting
    return this.isServerError() || this.status === 429;
  }

  /**
   * Get retry delay for rate limiting
   */
  getRetryDelay(): number {
    if (this.status === 429 && this.response?.retryAfter) {
      return this.response.retryAfter * 1000; // Convert to milliseconds
    }
    return 0;
  }
}

/**
 * Network error for connection issues
 */
export class NetworkError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Configuration error for invalid SDK configuration
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}
