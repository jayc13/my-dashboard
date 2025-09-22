import { TestHelpers } from '../utils/test-helpers';

describe('Health Check Integration Tests', () => {
  let testHelpers: TestHelpers;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    
    // Wait for server to be ready before running tests
    await testHelpers.waitForServer();
  });

  describe('GET /health', () => {
    it('should return 200 status for health check', async () => {
      const httpClient = testHelpers.getHttpClient();
      const response = await httpClient.get('/health');
      
      expect(response.status).toBe(200);
    });

    it('should return valid health check response', async () => {
      const httpClient = testHelpers.getHttpClient();
      const response = await httpClient.getJson('/health');
      
      // Validate response structure
      testHelpers.validateResponseStructure(response, ['status']);
      expect(response.status).toBe('ok');
    });
  });

  describe('Server Connectivity', () => {
    it('should be able to connect to the server', async () => {
      const httpClient = testHelpers.getHttpClient();

      // This test ensures basic connectivity
      const response = await httpClient.get('/');

      // We expect any HTTP response (200, 404) - all indicate the server is responding
      // The important thing is that we get a response and don't get a connection error
      expect(response.status).toBe(404); // Nothing is hosted at root, so expect 404
      expect(response.status).toBeLessThan(600);
    });
  });
});
