import { TestHelpers } from '@utils/test-helpers';

describe('Authentication Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();
  });

  describe('POST /api/auth/validate', () => {
    it('should return 400 for missing API key', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.postJson('/api/auth/validate', {});
        fail('Expected request to fail with 400');
      } catch (error) {
        expect(String(error)).toContain('HTTP 400');
      }
    });

    it('should return 401 for invalid API key', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.postJson('/api/auth/validate', {
          apiKey: 'invalid-key',
        });
        fail('Expected request to fail with 401');
      } catch (error) {
        expect(String(error)).toContain('HTTP 401');
      }
    });

    it('should return 200 for valid API key', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.post('/api/auth/validate', {
        apiKey: apiKey,
      });

      expect(response.status).toBe(200);
    });

    it('should return valid authentication response', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.postJson('/api/auth/validate', {
        apiKey: apiKey,
      });

      testHelpers.validateResponseStructure(response, ['valid', 'message']);
      expect(response.valid).toBe(true);
    });
  });

  describe('SDK Tests', () => {
    let myDashboardSdk: any;

    beforeAll(async () => {
      // Initialize SDK
      const { MyDashboardAPI } = await import('@my-dashboard/sdk');
      myDashboardSdk = new MyDashboardAPI({
        baseUrl: testHelpers.getHttpClient().getBaseUrl(),
        apiKey: testHelpers.getApiKey(),
      });
    });

    it('Validate current API key through SDK', async () => {
      const result = await myDashboardSdk.auth.validateCurrentApiKey();
      expect(result.valid).toBe(true);
      expect(typeof result.message).toBe('string');
    });

    it('Validate specific API key through SDK', async () => {
      const result = await myDashboardSdk.auth.validateApiKey(apiKey);
      expect(result.valid).toBe(true);
      expect(typeof result.message).toBe('string');
    });

    it('Validate invalid API key through SDK', async () => {
      await expect(myDashboardSdk.auth.validateApiKey('invalid-key'))
        .rejects.toThrow();
    });

    it('Test SDK API key update functionality', async () => {
      // Test that we can update the API key
      const originalApiKey = apiKey;

      // This should work with the original key
      const result1 = await myDashboardSdk.auth.validateCurrentApiKey();
      expect(result1.valid).toBe(true);

      // Update to an invalid key
      myDashboardSdk.setApiKey('invalid-key');

      // This should now fail
      await expect(myDashboardSdk.auth.validateCurrentApiKey())
        .rejects.toThrow();

      // Restore the original key
      myDashboardSdk.setApiKey(originalApiKey);

      // This should work again
      const result2 = await myDashboardSdk.auth.validateCurrentApiKey();
      expect(result2.valid).toBe(true);
    });

    it('Test SDK base URL update functionality', async () => {
      const originalBaseUrl = testHelpers.getHttpClient().getBaseUrl();

      // This should work with the original URL
      const result1 = await myDashboardSdk.auth.validateCurrentApiKey();
      expect(result1.valid).toBe(true);

      // Update to an invalid URL
      myDashboardSdk.setBaseUrl('http://invalid-url:9999');

      // This should now fail due to connection error
      await expect(myDashboardSdk.auth.validateCurrentApiKey())
        .rejects.toThrow();

      // Restore the original URL
      myDashboardSdk.setBaseUrl(originalBaseUrl);

      // This should work again
      const result2 = await myDashboardSdk.auth.validateCurrentApiKey();
      expect(result2.valid).toBe(true);
    });
  });
});
