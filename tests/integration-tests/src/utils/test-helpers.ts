import { HttpClient } from './http-client';

export interface TestConfig {
  serverUrl?: string;
  timeout?: number;
}

export class TestHelpers {
  private httpClient: HttpClient;

  constructor(config: TestConfig = {}) {
    this.httpClient = new HttpClient({
      baseUrl: config.serverUrl || process.env.SERVER_URL || 'http://localhost:3000',
      timeout: config.timeout || 10000,
    });
  }

  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  // Helper to wait for server to be ready
  async waitForServer(maxAttempts: number = 30, intervalMs: number = 1000): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.httpClient.get('/health');
        if (response.ok) {
          console.log(`Server is ready after ${attempt} attempts`);
          return;
        }
      } catch {}

      if (attempt === maxAttempts) {
        throw new Error(`Server not ready after ${maxAttempts} attempts`);
      }

      await this.sleep(intervalMs);
    }
  }

  // Helper to sleep for a given number of milliseconds
  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper to generate random test data
  generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Helper to validate response structure
  validateResponseStructure(response: any, expectedKeys: string[]): void {
    for (const key of expectedKeys) {
      if (!(key in response)) {
        throw new Error(`Expected key '${key}' not found in response`);
      }
    }
  }

  // Helper to validate HTTP status codes
  expectStatus(response: { status: number }, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
  }
}
