/**
 * Base API Client
 * 
 * Provides core HTTP request functionality with retry logic, error handling,
 * and authentication for all API services.
 */

import { APIError, NetworkError, ConfigurationError } from './errors';
import { SDKConfig, RequestOptions } from '@my-dashboard/types';

/**
 * Base API client with core HTTP functionality
 */
export abstract class BaseClient {
  protected config: Required<SDKConfig>;

  constructor(config: SDKConfig) {
    // Validate configuration
    if (!config.baseUrl) {
      throw new ConfigurationError('baseUrl is required');
    }
    if (!config.apiKey) {
      throw new ConfigurationError('apiKey is required');
    }

    // Set defaults
    this.config = {
      timeout: 30000,
      retries: 3,
      userAgent: 'MyDashboardSDK/1.0.0',
      ...config,
    };

    // Normalize base URL
    this.config.baseUrl = this.config.baseUrl.replace(/\/$/, '');
  }

  /**
   * Make an HTTP request with retry logic
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        return await this.makeRequest<T>(url, options);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication or client errors (except rate limiting)
        if (error instanceof APIError && !error.isRetryable()) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === this.config.retries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        let delay: number;
        if (error instanceof APIError && error.status === 429) {
          // Use server-provided retry delay for rate limiting
          delay = error.getRetryDelay() || this.calculateBackoffDelay(attempt);
        } else {
          delay = this.calculateBackoffDelay(attempt);
        }

        console.log(`API request failed (attempt ${attempt}/${this.config.retries}), retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Make a single HTTP request
   */
  private async makeRequest<T>(url: string, options: RequestOptions): Promise<T> {
    const { method = 'GET', headers = {}, body, params, timeout } = options;

    // Build URL with query parameters
    const requestUrl = new URL(url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          requestUrl.searchParams.set(key, String(value));
        }
      });
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'x-api-key': this.config.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': this.config.userAgent,
      ...headers,
    };

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body,
    };

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout || this.config.timeout);

      const response = await fetch(requestUrl.toString(), {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different status codes
      if (response.status === 401) {
        throw new APIError(401, 'Invalid API key - check your credentials');
      }

      if (response.status === 403) {
        throw new APIError(403, 'Access forbidden - insufficient permissions');
      }

      if (response.status === 404) {
        throw new APIError(404, 'Resource not found');
      }

      if (response.status === 429) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await response.json().catch(() => ({})) as any;
        const retryAfter = data.retryAfter || 60;
        throw new APIError(429, `Rate limited - retry after ${retryAfter} seconds`, data);
      }

      if (response.status >= 500) {
        throw new APIError(response.status, 'Server error - please try again later');
      }

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorData = await response.json().catch(() => ({})) as any;

        // Extract error message and details from new format { success: false, error: { message: ..., details: [...] } }
        let errorMessage = 'Unknown error';
        let errorDetails = undefined;

        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (typeof errorData.error === 'object') {
            errorMessage = errorData.error.message || 'Unknown error';
            // Pass the full error object as APIErrorDetails
            errorDetails = errorData.error;
          }
        }

        throw new APIError(response.status, errorMessage, errorDetails);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json = await response.json() as any;

      // Extract data from new response format { success: true, data: ... }
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data as T;
      }

      return json as T;

    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      // Handle network errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (error instanceof TypeError || (error as any).name === 'AbortError') {
        throw new NetworkError(`Network error: ${(error as Error).message}`, error as Error);
      }

      // Handle other errors
      throw new APIError(0, `Request failed: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const delay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    return Math.round(delay + jitter);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the current configuration
   */
  public getConfig(): Readonly<Required<SDKConfig>> {
    return { ...this.config };
  }

  /**
   * Update the API key
   */
  public setApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new ConfigurationError('apiKey cannot be empty');
    }
    this.config.apiKey = apiKey;
  }

  /**
   * Update the base URL
   */
  public setBaseUrl(baseUrl: string): void {
    if (!baseUrl) {
      throw new ConfigurationError('baseUrl cannot be empty');
    }
    this.config.baseUrl = baseUrl.replace(/\/$/, '');
  }
}
