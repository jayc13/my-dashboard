import { TestHelpers } from '@utils/test-helpers';

describe('Apps API Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();
  });

  describe('GET /api/apps', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      await expect(httpClient.getJson('/api/apps')).rejects.toThrow('HTTP 401');
    });

    it('should return apps list', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson('/api/apps', {
        'x-api-key': apiKey
      });

      expect(Array.isArray(response)).toBe(true);
    });

    it('should return apps with correct structure', async () => {
      const httpClient = testHelpers.getHttpClient();
      
      const response = await httpClient.getJson('/api/apps', {
        'x-api-key': apiKey
      });
      
      if (response.length > 0) {
        const app = response[0];
        testHelpers.validateResponseStructure(app, ['id', 'name', 'code']);
        expect(typeof app.id).toBe('number');
        expect(typeof app.name).toBe('string');
        expect(typeof app.code).toBe('string');
      }
    });
  });

  describe('POST /api/apps', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      const newApp = {
        name: 'Test App',
        code: 'test-app',
        pipeline_url: 'https://example.com/pipeline',
        watching: true
      };

      await expect(httpClient.postJson('/api/apps', newApp)).rejects.toThrow('HTTP 401');
    });

    it('should create a new app', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);

      const newApp = {
        name: `Test App ${randomString}`,
        code: `test-app-${randomString}`,
        pipeline_url: 'https://example.com/pipeline',
        watching: true
      };
      
      const response = await httpClient.postJson('/api/apps', newApp, {
        'x-api-key': apiKey
      });
      
      testHelpers.validateResponseStructure(response, ['id']);
      expect(typeof response.id).toBe('number');
      expect(response.id).toBeGreaterThan(0);
    });

    it('should reject app creation without required fields', async () => {
      const httpClient = testHelpers.getHttpClient();
      
      const invalidApp = {
        pipeline_url: 'https://example.com/pipeline'
        // Missing name and code
      };
      
      await expect(httpClient.postJson('/api/apps', invalidApp, {
        'x-api-key': apiKey
      })).rejects.toThrow('HTTP 400');
    });
  });

  describe('GET /api/apps/:id', () => {
    let createdAppId: number;

    beforeAll(async () => {
      // Create a test app for these tests
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);
      
      const newApp = {
        name: `Test App for ID Tests ${randomString}`,
        code: `test-app-id-${randomString}`,
        watching: false
      };
      
      const response = await httpClient.postJson('/api/apps', newApp, {
        'x-api-key': apiKey
      });
      
      createdAppId = response.id;
    });

    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      await expect(httpClient.getJson(`/api/apps/${createdAppId}`)).rejects.toThrow('HTTP 401');
    });

    it('should return app by ID', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson(`/api/apps/${createdAppId}`, {
        'x-api-key': apiKey
      });

      testHelpers.validateResponseStructure(response, ['id', 'name', 'code']);
      expect(response.id).toBe(createdAppId);
    });

    it('should return 404 for non-existent app', async () => {
      const httpClient = testHelpers.getHttpClient();
      const nonExistentId = 999999;
      
      await expect(httpClient.getJson(`/api/apps/${nonExistentId}`, {
        'x-api-key': apiKey
      })).rejects.toThrow('HTTP 404');
    });
  });

  describe('GET /api/apps/code/:code', () => {
    let createdAppCode: string;

    beforeAll(async () => {
      // Create a test app for these tests
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);
      createdAppCode = `test-app-code-${randomString}`;
      
      const newApp = {
        name: `Test App for Code Tests ${randomString}`,
        code: createdAppCode,
        watching: false
      };
      
      await httpClient.postJson('/api/apps', newApp, {
        'x-api-key': apiKey
      });
    });

    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      await expect(httpClient.getJson(`/api/apps/code/${createdAppCode}`)).rejects.toThrow('HTTP 401');
    });

    it('should return app by code', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson(`/api/apps/code/${createdAppCode}`, {
        'x-api-key': apiKey
      });

      testHelpers.validateResponseStructure(response, ['id', 'name', 'code']);
      expect(response.code).toBe(createdAppCode);
    });

    it('should return 404 for non-existent app code', async () => {
      const httpClient = testHelpers.getHttpClient();
      const nonExistentCode = 'non-existent-app-code';
      
      await expect(httpClient.getJson(`/api/apps/code/${nonExistentCode}`, {
        'x-api-key': apiKey
      })).rejects.toThrow('HTTP 404');
    });
  });
});
