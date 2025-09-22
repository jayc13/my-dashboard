/**
 * Authentication Service
 * 
 * Provides methods for API key validation and authentication.
 */

import { BaseClient } from '../base-client';
import { 
  AuthValidationRequest,
  AuthValidationResponse
} from '../types';

/**
 * Authentication service
 */
export class AuthService extends BaseClient {
  /**
   * Validate an API key
   * @param apiKey API key to validate
   * @returns Promise resolving to validation response
   */
  public async validateApiKey(apiKey: string): Promise<AuthValidationResponse> {
    const request: AuthValidationRequest = { apiKey };
    return this.request<AuthValidationResponse>('/api/auth/validate', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        // Don't use the instance API key for validation
        'x-api-key': '',
      },
    });
  }

  /**
   * Validate the current API key
   * @returns Promise resolving to validation response
   */
  public async validateCurrentApiKey(): Promise<AuthValidationResponse> {
    return this.validateApiKey(this.config.apiKey);
  }
}
