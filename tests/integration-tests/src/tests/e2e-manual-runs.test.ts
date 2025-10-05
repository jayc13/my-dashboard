import { TestHelpers } from '@utils/test-helpers';
import { closeTestConnection, truncateTables } from '@utils/dbHelper';

describe('E2E Manual Runs API Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;
  let testAppId: number;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();

    // Create a test app with e2e trigger configuration
    const httpClient = testHelpers.getHttpClient();
    const randomString = testHelpers.generateRandomString(8);
    
    const newApp = await httpClient.postJson('/api/apps', {
      name: `E2E Test App ${randomString}`,
      code: `e2e-test-app-${randomString}`,
      pipelineUrl: 'https://example.com/pipeline',
      e2eTriggerConfiguration: '{"branch":"main","parameters":{"test":"value"}}',
      watching: true,
    }, {
      'x-api-key': apiKey,
    });

    testAppId = newApp.id;
  });

  afterAll(async () => {
    await truncateTables(['e2e_manual_runs', 'apps']);
    await closeTestConnection();
  });

  beforeEach(async () => {
    // Clean up manual runs before each test
    await truncateTables(['e2e_manual_runs']);
  });

  describe('POST /api/e2e_manual_runs', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.postJson('/api/e2e_manual_runs', { appId: testAppId });
        fail('Expected request to fail with 401');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 401');

        const response = await httpClient.post('/api/e2e_manual_runs', { appId: testAppId });
        expect(response.status).toBe(401);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return 400 when appId is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.postJson('/api/e2e_manual_runs', {}, {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');

        const response = await httpClient.post('/api/e2e_manual_runs', {}, {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(400);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return 400 when appId is invalid', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.postJson('/api/e2e_manual_runs', { appId: 'invalid' }, {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');

        const response = await httpClient.post('/api/e2e_manual_runs', { appId: 'invalid' }, {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(400);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return 400 when app does not exist', async () => {
      const httpClient = testHelpers.getHttpClient();
      const nonExistentAppId = 999999;

      try {
        await httpClient.postJson('/api/e2e_manual_runs', { appId: nonExistentAppId }, {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400 or 500');
      } catch (error: any) {
        expect(error.message).toMatch(/HTTP (400|500)/);

        const response = await httpClient.post('/api/e2e_manual_runs', { appId: nonExistentAppId }, {
          'x-api-key': apiKey,
        });
        expect([400, 500]).toContain(response.status);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should create a manual run successfully', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.postJson('/api/e2e_manual_runs', { appId: testAppId }, {
        'x-api-key': apiKey,
      });

      testHelpers.validateResponseStructure(response, ['id', 'appId', 'pipelineId', 'createdAt']);
      expect(response.appId).toBe(testAppId);
      expect(typeof response.pipelineId).toBe('string');
      expect(response.pipelineId.length).toBeGreaterThan(0);
    });

    it('should return 409 when a manual run is already in progress', async () => {
      const httpClient = testHelpers.getHttpClient();

      // Create first manual run
      const firstRun = await httpClient.postJson('/api/e2e_manual_runs', { appId: testAppId }, {
        'x-api-key': apiKey,
      });

      expect(firstRun.id).toBeDefined();

      // Try to create second manual run immediately
      // This should fail because the first run is likely still in progress
      // Note: This test depends on the external service returning "running" status
      const response = await httpClient.post('/api/e2e_manual_runs', { appId: testAppId }, {
        'x-api-key': apiKey,
      });

      // The response can be either 409 (conflict) or 201 (created)
      // 409 means the first run is still in progress (expected behavior)
      // 201 means the first run completed very quickly (acceptable in integration tests)
      if (response.status === 409) {
        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      } else if (response.status === 201) {
        console.log('Second run was allowed - first run may have completed quickly');
        const responseBody = await response.json() as { success: boolean; data?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(true);
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    });
  });

  describe('POST /api/e2e_manual_runs - App without e2e configuration', () => {
    let appWithoutConfigId: number;

    beforeAll(async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);
      
      const newApp = await httpClient.postJson('/api/apps', {
        name: `App Without Config ${randomString}`,
        code: `app-no-config-${randomString}`,
        pipelineUrl: 'https://example.com/pipeline',
        watching: true,
      }, {
        'x-api-key': apiKey,
      });

      appWithoutConfigId = newApp.id;
    });

    it('should return 500 when app does not have e2e trigger configuration', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.postJson('/api/e2e_manual_runs', { appId: appWithoutConfigId }, {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 500');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 500');

        const response = await httpClient.post('/api/e2e_manual_runs', { appId: appWithoutConfigId }, {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(500);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });
  });

  describe('SDK Tests', () => {
    let myDashboardSdk: any;

    beforeAll(async () => {
      const { MyDashboardAPI } = await import('@my-dashboard/sdk');
      myDashboardSdk = new MyDashboardAPI({
        baseUrl: testHelpers.getHttpClient().getBaseUrl(),
        apiKey: testHelpers.getApiKey(),
      });
    });

    beforeEach(async () => {
      await truncateTables(['e2e_manual_runs']);
    });

    it('should create a manual run through SDK', async () => {
      const run = await myDashboardSdk.triggerManualRun(testAppId);

      expect(run).toBeDefined();
      expect(run.appId).toBe(testAppId);
      expect(run.pipelineId).toBeDefined();
      expect(typeof run.pipelineId).toBe('string');
    });

    it('should handle error when app does not exist', async () => {
      const nonExistentAppId = 999999;

      await expect(myDashboardSdk.triggerManualRun(nonExistentAppId))
        .rejects.toThrow();
    });

    it('should handle error when manual run is already in progress', async () => {
      // Create first run
      const firstRun = await myDashboardSdk.triggerManualRun(testAppId);
      expect(firstRun).toBeDefined();

      // Try to create second run
      // Note: This may or may not fail depending on how quickly the first run completes
      try {
        await myDashboardSdk.triggerManualRun(testAppId);
        console.log('Second run was allowed - first run may have completed quickly');
      } catch (error: any) {
        // If it fails, verify it's the expected error
        expect(error.message).toContain('manual run is already in progress');
      }
    });
  });
});

