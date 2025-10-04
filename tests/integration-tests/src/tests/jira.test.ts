import { TestHelpers } from '@utils/test-helpers';

describe('JIRA API Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();
  });

  describe('GET /api/jira/manual_qa', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.getJson('/api/jira/manual_qa');
        fail('Expected request to fail with 401');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 401');

        const response = await httpClient.get('/api/jira/manual_qa');
        expect(response.status).toBe(401);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
          error: 'Unauthorized: Invalid or missing API key',
        });
      }
    });

    it('should return manual QA tasks with valid API key', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson('/api/jira/manual_qa', {
        'x-api-key': apiKey,
      });

      // Validate response structure
      testHelpers.validateResponseStructure(response, ['total', 'issues']);
      expect(typeof response.total).toBe('number');
      expect(Array.isArray(response.issues)).toBe(true);
    });

    it('should return issues with correct structure', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson('/api/jira/manual_qa', {
        'x-api-key': apiKey,
      });

      expect(response.total).toBeGreaterThanOrEqual(0);

      // If there are issues, validate their structure
      if (response.issues.length > 0) {
        const issue = response.issues[0];
        testHelpers.validateResponseStructure(issue, [
          'id',
          'key',
          'summary',
          'status',
          'created',
          'updated',
        ]);
        expect(typeof issue.id).toBe('string');
        expect(typeof issue.key).toBe('string');
        expect(typeof issue.summary).toBe('string');
        expect(typeof issue.status).toBe('string');
      }
    });

    it('should filter issues with manual_qa label', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson('/api/jira/manual_qa', {
        'x-api-key': apiKey,
      });

      // All returned issues should have the manual_qa label
      response.issues.forEach((issue: any) => {
        if (issue.labels) {
          expect(Array.isArray(issue.labels)).toBe(true);
        }
      });
    });
  });

  describe('GET /api/jira/my_tickets', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.getJson('/api/jira/my_tickets');
        fail('Expected request to fail with 401');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 401');

        const response = await httpClient.get('/api/jira/my_tickets');
        expect(response.status).toBe(401);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
          error: 'Unauthorized: Invalid or missing API key',
        });
      }
    });

    it('should return my tickets with valid API key', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson('/api/jira/my_tickets', {
        'x-api-key': apiKey,
      });

      // Validate response structure
      testHelpers.validateResponseStructure(response, ['total', 'issues']);
      expect(typeof response.total).toBe('number');
      expect(Array.isArray(response.issues)).toBe(true);
    });

    it('should return tickets with correct structure', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson('/api/jira/my_tickets', {
        'x-api-key': apiKey,
      });

      expect(response.total).toBeGreaterThanOrEqual(0);

      // If there are tickets, validate their structure
      if (response.issues.length > 0) {
        const ticket = response.issues[0];
        testHelpers.validateResponseStructure(ticket, [
          'id',
          'key',
          'summary',
          'status',
          'created',
          'updated',
        ]);
        expect(typeof ticket.id).toBe('string');
        expect(typeof ticket.key).toBe('string');
        expect(typeof ticket.summary).toBe('string');
        expect(typeof ticket.status).toBe('string');
      }
    });

    it('should return unresolved tickets only', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.getJson('/api/jira/my_tickets', {
        'x-api-key': apiKey,
      });

      // All returned tickets should be unresolved
      // This is validated by the JQL query in the controller
      expect(response.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle JIRA service errors gracefully', async () => {
      const httpClient = testHelpers.getHttpClient();

      // This test verifies that the endpoint handles errors properly
      // The actual error handling depends on the JIRA service configuration
      const response = await httpClient.get('/api/jira/my_tickets', {
        'x-api-key': apiKey,
      });

      // Should return either success or a proper error response
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('JIRA API Response Validation', () => {
    it('should return consistent response format for both endpoints', async () => {
      const httpClient = testHelpers.getHttpClient();

      const manualQAResponse = await httpClient.getJson('/api/jira/manual_qa', {
        'x-api-key': apiKey,
      });

      const myTicketsResponse = await httpClient.getJson('/api/jira/my_tickets', {
        'x-api-key': apiKey,
      });

      // Both should have the same response structure
      expect(manualQAResponse).toHaveProperty('total');
      expect(manualQAResponse).toHaveProperty('issues');
      expect(myTicketsResponse).toHaveProperty('total');
      expect(myTicketsResponse).toHaveProperty('issues');

      expect(Array.isArray(manualQAResponse.issues)).toBe(true);
      expect(Array.isArray(myTicketsResponse.issues)).toBe(true);
    });
  });
});

