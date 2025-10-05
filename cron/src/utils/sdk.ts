import { MyDashboardAPI } from '@my-dashboard/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

let sdkInstance: MyDashboardAPI | null = null;

/**
 * Get or create the SDK instance
 * @returns MyDashboardAPI instance
 */
export function getSDK(): MyDashboardAPI {
  if (!sdkInstance) {
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const apiKey = process.env.API_SECURITY_KEY;

    if (!apiKey) {
      throw new Error('API_SECURITY_KEY environment variable is required');
    }

    sdkInstance = new MyDashboardAPI({
      baseUrl,
      apiKey,
      retries: 3,
      timeout: 30000,
    });
  }

  return sdkInstance;
}

