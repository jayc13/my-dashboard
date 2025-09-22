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
          apiKey: 'invalid-key'
        });
        fail('Expected request to fail with 401');
      } catch (error) {
        expect(String(error)).toContain('HTTP 401');
      }
    });

    it('should return 200 for valid API key', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.post('/api/auth/validate', {
        apiKey: apiKey
      });

      expect(response.status).toBe(200);
    });

    it('should return valid authentication response', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.postJson('/api/auth/validate', {
        apiKey: apiKey
      });

      testHelpers.validateResponseStructure(response, ['valid', 'message']);
      expect(response.valid).toBe(true);
    });
  });

  describe('API Key Protection', () => {
    const protectedEndpoints = [
      '/api/apps',
      '/api/to_do_list',
      '/api/pull_requests',
      '/api/notifications',
      '/api/e2e_reports',
      '/api/jira',
      '/api/fcm/tokens',
      '/api/internal/files'
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`should protect ${endpoint} without API key`, async () => {
        const httpClient = testHelpers.getHttpClient();
        
        const response = await httpClient.get(endpoint);
        expect(response.status).toBe(401);
      });

      it(`should allow access to ${endpoint} with valid API key`, async () => {
        const httpClient = testHelpers.getHttpClient();
        
        const response = await httpClient.get(endpoint, {
          'x-api-key': apiKey
        });
        
        // Should not be 401 (unauthorized)
        expect(response.status).not.toBe(401);
        // Should be a valid HTTP status (200, 404, 500, etc.)
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(600);
      });
    });
  });
});
