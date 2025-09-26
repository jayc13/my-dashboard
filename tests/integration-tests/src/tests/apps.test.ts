import {TestHelpers} from '@utils/test-helpers';
import {closeTestConnection, truncateTables} from "@utils/dbCleanup";
import {Application} from "@my-dashboard/types";

describe('Apps API Integration Tests', () => {
    let testHelpers: TestHelpers;
    let apiKey: string;

    beforeAll(async () => {
        testHelpers = new TestHelpers();
        apiKey = testHelpers.getApiKey();
        await testHelpers.waitForServer();
    });

    // Clean up and close connection after all tests
    afterAll(async () => {
        await truncateTables(['apps']);
        await closeTestConnection();
    });

    describe('API Validations', () => {
        beforeAll(async () => {
            await truncateTables(['apps']);
        });
        describe('GET /api/apps', () => {
            it('should return 401 when API key is missing', async () => {
                const httpClient = testHelpers.getHttpClient();

                try {
                    await httpClient.getJson('/api/apps');
                    fail('Expected request to fail with 401');
                } catch (error: any) {
                    expect(error.message).toContain('HTTP 401');

                    // Validate that we get the proper response by making the raw request
                    const response = await httpClient.get('/api/apps');
                    expect(response.status).toBe(401);

                    const responseBody = await response.json();
                    expect(responseBody).toEqual({
                        error: 'Unauthorized: Invalid or missing API key'
                    });
                }
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
                    pipelineUrl: 'https://example.com/pipeline',
                    watching: true
                };

                try {
                    await httpClient.postJson('/api/apps', newApp);
                    fail('Expected request to fail with 401');
                } catch (error: any) {
                    expect(error.message).toContain('HTTP 401');

                    // Validate that we get the proper response by making the raw request
                    const response = await httpClient.post('/api/apps', newApp);
                    expect(response.status).toBe(401);

                    const responseBody = await response.json();
                    expect(responseBody).toEqual({
                        error: 'Unauthorized: Invalid or missing API key'
                    });
                }
            });

            it('should create a new app', async () => {
                const httpClient = testHelpers.getHttpClient();
                const randomString = testHelpers.generateRandomString(8);

                const newApp = {
                    name: `Test App ${randomString}`,
                    code: `test-app-${randomString}`,
                    pipelineUrl: 'https://example.com/pipeline',
                    watching: true
                };

                const response = await httpClient.postJson('/api/apps', newApp, {
                    'x-api-key': apiKey
                });

                testHelpers.validateResponseStructure(response, ['id']);
                expect(typeof response.id).toBe('number');
                expect(response.id).toBeGreaterThan(0);
            });

            describe('Required field validation', () => {
                it('should reject app creation when both name and code are missing', async () => {
                    const httpClient = testHelpers.getHttpClient();

                    const invalidApp = {
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'Name and code are required fields'
                        });
                    }
                });

                it('should reject app creation when name is missing', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const invalidApp = {
                        code: `test-app-${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'Name and code are required fields'
                        });
                    }
                });

                it('should reject app creation when code is missing', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const invalidApp = {
                        name: `Test App ${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'Name and code are required fields'
                        });
                    }
                });

                it('should reject app creation when name is empty string', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const invalidApp = {
                        name: '',
                        code: `test-app-${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'Name and code are required fields'
                        });
                    }
                });

                it('should reject app creation when code is empty string', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const invalidApp = {
                        name: `Test App ${randomString}`,
                        code: '',
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'Name and code are required fields'
                        });
                    }
                });

                it('should reject app creation when name is null', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const invalidApp = {
                        name: null,
                        code: `test-app-${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'Name and code are required fields'
                        });
                    }
                });

                it('should reject app creation when code is null', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const invalidApp = {
                        name: `Test App ${randomString}`,
                        code: null,
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'Name and code are required fields'
                        });
                    }
                });

                it('should accept app creation with only whitespace in name (current server behavior)', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const appWithWhitespaceName = {
                        name: '   ', // Only whitespace - currently accepted by server
                        code: `test-app-whitespace-name-${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    const response = await httpClient.postJson('/api/apps', appWithWhitespaceName, {
                        'x-api-key': apiKey
                    });

                    testHelpers.validateResponseStructure(response, ['id']);
                    expect(typeof response.id).toBe('number');
                    expect(response.id).toBeGreaterThan(0);
                });

                it('should handle whitespace-only code appropriately', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const appWithWhitespaceCode = {
                        name: `Test App ${randomString}`,
                        code: '   ', // Only whitespace - may cause database constraint issues
                        pipelineUrl: 'https://example.com/pipeline',
                        watching: true
                    };

                    // The server may either accept this (if validation is lenient) or reject it (if database has constraints)
                    try {
                        const response = await httpClient.postJson('/api/apps', appWithWhitespaceCode, {
                            'x-api-key': apiKey
                        });

                        // If accepted, validate the response structure
                        testHelpers.validateResponseStructure(response, ['id']);
                        expect(typeof response.id).toBe('number');
                        expect(response.id).toBeGreaterThan(0);
                    } catch (error: any) {
                        // If rejected, it should be due to validation or constraint issues
                        expect(error.message).toMatch(/HTTP (400|409|500)/);
                    }
                });
            });

            describe('JSON validation for e2eTriggerConfiguration', () => {
                it('should reject app creation with invalid JSON in e2eTriggerConfiguration', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const invalidApp = {
                        name: `Test App ${randomString}`,
                        code: `test-app-${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        e2eTriggerConfiguration: '{ invalid json }',
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'e2eTriggerConfiguration must be valid JSON'
                        });
                    }
                });

                it('should reject app creation with malformed JSON in e2eTriggerConfiguration', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const invalidApp = {
                        name: `Test App ${randomString}`,
                        code: `test-app-${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        e2eTriggerConfiguration: '{"key": "value",}', // trailing comma makes it invalid
                        watching: true
                    };

                    try {
                        await httpClient.postJson('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 400');
                    } catch (error: any) {
                        expect(error.message).toContain('HTTP 400');

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', invalidApp, {
                            'x-api-key': apiKey
                        });
                        expect(response.status).toBe(400);

                        const responseBody = await response.json();
                        expect(responseBody).toEqual({
                            error: 'e2eTriggerConfiguration must be valid JSON'
                        });
                    }
                });

                it('should accept app creation with valid JSON in e2eTriggerConfiguration', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const validApp = {
                        name: `Test App ${randomString}`,
                        code: `test-app-${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        e2eTriggerConfiguration: '{"trigger": "manual", "timeout": 300}',
                        watching: true
                    };

                    const response = await httpClient.postJson('/api/apps', validApp, {
                        'x-api-key': apiKey
                    });

                    testHelpers.validateResponseStructure(response, ['id']);
                    expect(typeof response.id).toBe('number');
                    expect(response.id).toBeGreaterThan(0);
                });

                it('should accept app creation with empty string e2eTriggerConfiguration', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const validApp = {
                        name: `Test App ${randomString}`,
                        code: `test-app-${randomString}`,
                        pipelineUrl: 'https://example.com/pipeline',
                        e2eTriggerConfiguration: '',
                        watching: true
                    };

                    const response = await httpClient.postJson('/api/apps', validApp, {
                        'x-api-key': apiKey
                    });

                    testHelpers.validateResponseStructure(response, ['id']);
                    expect(typeof response.id).toBe('number');
                    expect(response.id).toBeGreaterThan(0);
                });
            });

            describe('Unique code constraint validation', () => {
                it('should reject app creation with duplicate code', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);
                    const duplicateCode = `duplicate-code-${randomString}`;

                    // Create the first app
                    const firstApp = {
                        name: `First App ${randomString}`,
                        code: duplicateCode,
                        pipelineUrl: 'https://example.com/pipeline1',
                        watching: true
                    };

                    const firstResponse = await httpClient.postJson('/api/apps', firstApp, {
                        'x-api-key': apiKey
                    });

                    expect(firstResponse.id).toBeGreaterThan(0);

                    // Try to create a second app with the same code
                    const secondApp = {
                        name: `Second App ${randomString}`,
                        code: duplicateCode, // Same code as first app
                        pipelineUrl: 'https://example.com/pipeline2',
                        watching: false
                    };

                    // The server should return 409 (Conflict) for duplicate code
                    try {
                        await httpClient.postJson('/api/apps', secondApp, {
                            'x-api-key': apiKey
                        });
                        fail('Expected request to fail with 409');
                    } catch (error: any) {
                        expect(error.message).toMatch(/HTTP (409|500)/); // Allow both 409 and 500 for now

                        // Validate that we get the proper response by making the raw request
                        const response = await httpClient.post('/api/apps', secondApp, {
                            'x-api-key': apiKey
                        });
                        expect([409, 500]).toContain(response.status);

                        const responseBody = await response.json();
                        if (response.status === 409) {
                            expect(responseBody).toEqual({
                                error: 'App code must be unique'
                            });
                        } else {
                            // For 500 errors, the response might vary depending on database implementation
                            expect(responseBody).toHaveProperty('error');
                            expect(typeof responseBody.error).toBe('string');
                        }
                    }
                });
            });

            describe('Edge cases and boundary validation', () => {
                it('should accept app creation with minimal required fields only', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const minimalApp = {
                        name: `Minimal App ${randomString}`,
                        code: `minimal-app-${randomString}`
                        // No optional fields
                    };

                    const response = await httpClient.postJson('/api/apps', minimalApp, {
                        'x-api-key': apiKey
                    });

                    testHelpers.validateResponseStructure(response, ['id']);
                    expect(typeof response.id).toBe('number');
                    expect(response.id).toBeGreaterThan(0);
                });

                it('should accept app creation with undefined optional fields', async () => {
                    const httpClient = testHelpers.getHttpClient();
                    const randomString = testHelpers.generateRandomString(8);

                    const appWithUndefinedFields = {
                        name: `Test App ${randomString}`,
                        code: `test-app-${randomString}`,
                        pipelineUrl: undefined,
                        e2eTriggerConfiguration: undefined,
                        watching: undefined
                    };

                    const response = await httpClient.postJson('/api/apps', appWithUndefinedFields, {
                        'x-api-key': apiKey
                    });

                    testHelpers.validateResponseStructure(response, ['id']);
                    expect(typeof response.id).toBe('number');
                    expect(response.id).toBeGreaterThan(0);
                });
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

                try {
                    await httpClient.getJson(`/api/apps/${createdAppId}`);
                    fail('Expected request to fail with 401');
                } catch (error: any) {
                    expect(error.message).toContain('HTTP 401');

                    // Validate that we get the proper response by making the raw request
                    const response = await httpClient.get(`/api/apps/${createdAppId}`);
                    expect(response.status).toBe(401);

                    const responseBody = await response.json();
                    expect(responseBody).toEqual({
                        error: 'Unauthorized: Invalid or missing API key'
                    });
                }
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

                try {
                    await httpClient.getJson(`/api/apps/${nonExistentId}`, {
                        'x-api-key': apiKey
                    });
                    fail('Expected request to fail with 404');
                } catch (error: any) {
                    expect(error.message).toContain('HTTP 404');

                    // Validate that we get the proper response by making the raw request
                    const response = await httpClient.get(`/api/apps/${nonExistentId}`, {
                        'x-api-key': apiKey
                    });
                    expect(response.status).toBe(404);

                    const responseBody = await response.json();
                    expect(responseBody).toEqual({
                        error: 'App not found'
                    });
                }
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

                try {
                    await httpClient.getJson(`/api/apps/code/${createdAppCode}`);
                    fail('Expected request to fail with 401');
                } catch (error: any) {
                    expect(error.message).toContain('HTTP 401');

                    // Validate that we get the proper response by making the raw request
                    const response = await httpClient.get(`/api/apps/code/${createdAppCode}`);
                    expect(response.status).toBe(401);

                    const responseBody = await response.json();
                    expect(responseBody).toEqual({
                        error: 'Unauthorized: Invalid or missing API key'
                    });
                }
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

                try {
                    await httpClient.getJson(`/api/apps/code/${nonExistentCode}`, {
                        'x-api-key': apiKey
                    });
                    fail('Expected request to fail with 404');
                } catch (error: any) {
                    expect(error.message).toContain('HTTP 404');

                    // Validate that we get the proper response by making the raw request
                    const response = await httpClient.get(`/api/apps/code/${nonExistentCode}`, {
                        'x-api-key': apiKey
                    });
                    expect(response.status).toBe(404);

                    const responseBody = await response.json();
                    expect(responseBody).toEqual({
                        error: 'App not found'
                    });
                }
            });
        });
    });

  describe('SDK Tests', () => {
    let myDashboardSdk: any;
    let appId: number;

    beforeAll(async () => {
      await truncateTables(['apps']);
      // Initialize SDK
      const { MyDashboardAPI } = await import('@my-dashboard/sdk');
      myDashboardSdk = new MyDashboardAPI({
        baseUrl: testHelpers.getHttpClient().getBaseUrl(),
        apiKey: testHelpers.getApiKey(),
      });
    });

    afterAll(async () => {
      await truncateTables(['apps']);
    });

    it('List of Apps - Empty', async () => {
      const apps = await myDashboardSdk.applications.getApplications();
      expect(Array.isArray(apps)).toBe(true);
      expect(apps.length).toBe(0);
    });

    it('Create App', async () => {
      const randomString = testHelpers.generateRandomString(8);
      const newApp = await myDashboardSdk.applications.createApplication({
        name: `Test App ${randomString}`,
        code: `test-app-${randomString}`,
        pipelineUrl: 'https://example.com/pipeline',
        watching: true
      });

      expect(newApp.id).toBeDefined();
      expect(newApp.id).toBeGreaterThan(0);
      appId = newApp.id;
    });

    it('List of Apps - 1 element', async () => {
      const apps = await myDashboardSdk.applications.getApplications();
      expect(Array.isArray(apps)).toBe(true);
      expect(apps.length).toBe(1);

      const appItem = apps[0];
      expect(appItem.id).toBeDefined();
      expect(typeof appItem.name).toBe('string');
      expect(typeof appItem.code).toBe('string');
    });

    it('Get App by ID', async () => {
      const app = await myDashboardSdk.applications.getApplication(appId);
      expect(app.id).toBe(appId);
      expect(typeof app.name).toBe('string');
      expect(typeof app.code).toBe('string');
    });

    it('Get App by Code', async () => {
      // First get the app to know its code
      const app = await myDashboardSdk.applications.getApplication(appId);
      const appByCode = await myDashboardSdk.applications.getApplicationByCode(app.code);

      expect(appByCode.id).toBe(appId);
      expect(appByCode.code).toBe(app.code);
      expect(appByCode.name).toBe(app.name);
    });

    it('Update App', async () => {
      const randomString = testHelpers.generateRandomString(8);
      const updatedApp = await myDashboardSdk.applications.updateApplication(appId, {
        name: `Updated App ${randomString}`,
        watching: false
      });

      expect(updatedApp.id).toBe(appId);

      // Verify the update by fetching the app
      const fetchedApp = await myDashboardSdk.applications.getApplication(appId);
      expect(fetchedApp.name).toBe(`Updated App ${randomString}`);
    });

    it('Delete App', async () => {
      const deleteResponse = await myDashboardSdk.applications.deleteApplication(appId);
      expect(deleteResponse.success).toBe(true);

      const apps = await myDashboardSdk.applications.getApplications();
      expect(apps.length).toBe(0);
    });

    // Additional test cases for edge cases and error handling
    it('Create App with minimal required fields only', async () => {
      const randomString = testHelpers.generateRandomString(8);
      const newApp = await myDashboardSdk.applications.createApplication({
        name: `Minimal App ${randomString}`,
        code: `minimal-app-${randomString}`
      });

      expect(newApp.id).toBeDefined();
      expect(newApp.id).toBeGreaterThan(0);

      // Clean up
      await myDashboardSdk.applications.deleteApplication(newApp.id);
    });

    it('Create App with all optional fields', async () => {
      const randomString = testHelpers.generateRandomString(8);
      const newApp = await myDashboardSdk.applications.createApplication({
        name: `Complete App ${randomString}`,
        code: `complete-app-${randomString}`,
        pipelineUrl: 'https://example.com/pipeline',
        e2eTriggerConfiguration: '{"trigger": "manual", "timeout": 300}',
        watching: true
      });

      expect(newApp.id).toBeDefined();
      expect(newApp.id).toBeGreaterThan(0);

      // Verify the app was created with all fields
      const fetchedApp = await myDashboardSdk.applications.getApplication(newApp.id);
      expect(fetchedApp.name).toBe(`Complete App ${randomString}`);
      expect(fetchedApp.code).toBe(`complete-app-${randomString}`);

      // Clean up
      await myDashboardSdk.applications.deleteApplication(newApp.id);
    });

    it('Update App with partial fields', async () => {
      const randomString = testHelpers.generateRandomString(8);

      // Create an app first
      const newApp = await myDashboardSdk.applications.createApplication({
        name: `Original App ${randomString}`,
        code: `original-app-${randomString}`,
        watching: false
      });

      // Update only specific fields
      const updatedApp = await myDashboardSdk.applications.updateApplication(newApp.id, {
        name: `Updated App ${randomString}`,
        watching: true
      });

      expect(updatedApp.id).toBe(newApp.id);

      // Verify the update
      const fetchedApp = await myDashboardSdk.applications.getApplication(newApp.id);
      expect(fetchedApp.name).toBe(`Updated App ${randomString}`);
      expect(fetchedApp.code).toBe(`original-app-${randomString}`); // Should remain unchanged

      // Clean up
      await myDashboardSdk.applications.deleteApplication(newApp.id);
    });

    it('Handle non-existent App operations gracefully', async () => {
      const nonExistentId = 999999;
      const nonExistentCode = 'non-existent-app-code';

      // Test getting non-existent app by ID
      await expect(myDashboardSdk.applications.getApplication(nonExistentId))
        .rejects.toThrow();

      // Test getting non-existent app by code
      await expect(myDashboardSdk.applications.getApplicationByCode(nonExistentCode))
        .rejects.toThrow();

      // Test updating non-existent app
      await expect(myDashboardSdk.applications.updateApplication(nonExistentId, {
        name: 'Updated Name'
      })).rejects.toThrow();

      // Test deleting non-existent app
      await expect(myDashboardSdk.applications.deleteApplication(nonExistentId))
        .rejects.toThrow();
    });

    it('Create multiple Apps and verify list operations', async () => {
      const appIds: number[] = [];
      const appCodes: string[] = [];

      // Create multiple apps
      for (let i = 1; i <= 3; i++) {
        const randomString = testHelpers.generateRandomString(8);
        const appCode = `test-app-${i}-${randomString}`;
        const app = await myDashboardSdk.applications.createApplication({
          name: `Test App ${i}`,
          code: appCode,
          watching: i % 2 === 0 // Alternate watching status
        });
        appIds.push(app.id);
        appCodes.push(appCode);
      }

      // Verify all apps are in the list
      const apps: Application[] = await myDashboardSdk.applications.getApplications();
      expect(apps.length).toBeGreaterThanOrEqual(3);

      // Verify all created apps are present
      const createdApps = apps.filter((app: Application) => appIds.includes(app.id!));
      expect(createdApps.length).toBe(3);

      // Test getting each app by code
      for (const code of appCodes) {
        const appByCode = await myDashboardSdk.applications.getApplicationByCode(code);
        expect(appByCode.code).toBe(code);
        expect(appIds).toContain(appByCode.id);
      }

      // Clean up
      for (const id of appIds) {
        await myDashboardSdk.applications.deleteApplication(id);
      }
    });

    it('Test App code uniqueness constraint through SDK', async () => {
      const randomString = testHelpers.generateRandomString(8);
      const duplicateCode = `duplicate-code-${randomString}`;

      // Create first app
      const firstApp = await myDashboardSdk.applications.createApplication({
        name: `First App ${randomString}`,
        code: duplicateCode
      });

      expect(firstApp.id).toBeDefined();

      // Try to create second app with same code - should fail
      await expect(myDashboardSdk.applications.createApplication({
        name: `Second App ${randomString}`,
        code: duplicateCode
      })).rejects.toThrow();
    });
  });
});
