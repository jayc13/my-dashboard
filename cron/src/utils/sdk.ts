import type { MyDashboardAPI } from '@my-dashboard/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

let sdkInstance: MyDashboardAPI | null = null;
let sdkPromise: Promise<MyDashboardAPI> | null = null;

/**
 * Get or create the SDK instance
 * @returns MyDashboardAPI instance
 */
export async function getSDK(): Promise<MyDashboardAPI> {
  if (sdkInstance) {
    return sdkInstance;
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = (async () => {
    const { MyDashboardAPI } = await import('@my-dashboard/sdk');

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

    return sdkInstance;
  })();

  return sdkPromise;
}

