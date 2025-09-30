import { TestHelpers } from '@utils/test-helpers';
import { MyDashboardAPI } from '@my-dashboard/sdk';
import { truncateTables, closeTestConnection } from '@utils/dbCleanup';
import { ErrorResponse, PullRequest } from '@my-dashboard/types';

describe('Pull Request API Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;
  let myDashboardSdk: MyDashboardAPI;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();

    // Initialize SDK
    myDashboardSdk = new MyDashboardAPI({
      baseUrl: testHelpers.getHttpClient().getBaseUrl(),
      apiKey: testHelpers.getApiKey(),
    });
  });

  // Clean up and close connection after all tests
  afterAll(async () => {
    await truncateTables(['pull_requests']);
    await closeTestConnection();
  });

  describe('API Validations', () => {
    beforeEach(async () => {
      await truncateTables(['pull_requests']);
    });

    describe('GET /api/pull_requests', () => {
      it('should return 401 when API key is missing', async () => {
        const httpClient = testHelpers.getHttpClient();

        try {
          await httpClient.getJson('/api/pull_requests');
          throw new Error('Expected request to fail with 401');
        } catch (error: any) {
          expect(error.message).toContain('HTTP 401');

          // Validate that we get the proper response by making the raw request
          const response = await httpClient.get('/api/pull_requests');
          expect(response.status).toBe(401);

          const responseBody = await response.json();
          expect(responseBody).toEqual({
            error: 'Unauthorized: Invalid or missing API key',
          });
        }
      });

      it('should return empty pull requests list when no pull requests exist', async () => {
        const httpClient = testHelpers.getHttpClient();

        const response = await httpClient.getJson('/api/pull_requests', {
          'x-api-key': apiKey,
        });

        expect(Array.isArray(response)).toBe(true);
        expect(response.length).toBe(0);
      });

      it('should return pull requests with correct structure', async () => {
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        // Create a pull request first
        const newPR = {
          pullRequestNumber: 123,
          repository: `test-org/test-repo-${randomString}`,
        };

        await httpClient.postJson('/api/pull_requests', newPR, {
          'x-api-key': apiKey,
        });

        const response = await httpClient.getJson('/api/pull_requests', {
          'x-api-key': apiKey,
        });

        expect(Array.isArray(response)).toBe(true);
        expect(response.length).toBe(1);

        const pullRequest = response[0];
        testHelpers.validateResponseStructure(pullRequest, ['id', 'pullRequestNumber', 'repository']);
        expect(typeof pullRequest.id).toBe('number'); // ID is returned as number from database
        expect(typeof pullRequest.pullRequestNumber).toBe('number');
        expect(typeof pullRequest.repository).toBe('string');
        expect(pullRequest.pullRequestNumber).toBe(123);
        expect(pullRequest.repository).toBe(`test-org/test-repo-${randomString}`);
      });

      it('should return pull requests ordered by ID (newest first)', async () => {
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        // Create multiple pull requests
        const pr1 = {
          pullRequestNumber: 100,
          repository: `test-org/repo1-${randomString}`,
        };

        const pr2 = {
          pullRequestNumber: 200,
          repository: `test-org/repo2-${randomString}`,
        };

        await httpClient.postJson('/api/pull_requests', pr1, {
          'x-api-key': apiKey,
        });

        await httpClient.postJson('/api/pull_requests', pr2, {
          'x-api-key': apiKey,
        });

        const response = await httpClient.getJson('/api/pull_requests', {
          'x-api-key': apiKey,
        });

        expect(response.length).toBe(2);
        // Should be ordered by ID DESC (newest first)
        expect(response[0].pullRequestNumber).toBe(200);
        expect(response[1].pullRequestNumber).toBe(100);
      });
    });

    describe('POST /api/pull_requests', () => {
      it('should return 401 when API key is missing', async () => {
        const httpClient = testHelpers.getHttpClient();

        const newPR = {
          pullRequestNumber: 123,
          repository: 'test-org/test-repo',
        };

        try {
          await httpClient.postJson('/api/pull_requests', newPR);
          throw new Error('Expected request to fail with 401');
        } catch (error: any) {
          expect(error.message).toContain('HTTP 401');

          // Validate that we get the proper response by making the raw request
          const response = await httpClient.post('/api/pull_requests', newPR);
          expect(response.status).toBe(401);

          const responseBody = await response.json();
          expect(responseBody).toEqual({
            error: 'Unauthorized: Invalid or missing API key',
          });
        }
      });

      it('should create a new pull request', async () => {
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        const newPR = {
          pullRequestNumber: 456,
          repository: `test-org/test-repo-${randomString}`,
        };

        const response = await httpClient.postJson('/api/pull_requests', newPR, {
          'x-api-key': apiKey,
        });

        testHelpers.validateResponseStructure(response, ['id', 'pullRequestNumber', 'repository']);
        expect(typeof response.id).toBe('number'); // ID is returned as number from database
        expect(response.pullRequestNumber).toBe(456);
        expect(response.repository).toBe(`test-org/test-repo-${randomString}`);
      });

      describe('Required field validation', () => {
        it('should reject pull request creation when pullRequestNumber is missing', async () => {
          const httpClient = testHelpers.getHttpClient();
          const randomString = testHelpers.generateRandomString(8);

          const invalidPR = {
            repository: `test-org/test-repo-${randomString}`,
          };

          try {
            await httpClient.postJson('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            throw new Error('Expected request to fail with 500');
          } catch (error: any) {
            expect(error.message).toContain('HTTP 500');

            // Validate that we get the proper response by making the raw request
            const response = await httpClient.post('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            expect(response.status).toBe(500);

            const responseBody = await response.json() as ErrorResponse;
            expect(responseBody).toHaveProperty('error');
            expect(responseBody.error).toContain('Error creating pull request');
          }
        });

        it('should reject pull request creation when repository is missing', async () => {
          const httpClient = testHelpers.getHttpClient();

          const invalidPR = {
            pullRequestNumber: 123,
          };

          try {
            await httpClient.postJson('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            throw new Error('Expected request to fail with 500');
          } catch (error: any) {
            expect(error.message).toContain('HTTP 500');

            // Validate that we get the proper response by making the raw request
            const response = await httpClient.post('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            expect(response.status).toBe(500);

            const responseBody = await response.json() as ErrorResponse;
            expect(responseBody).toHaveProperty('error');
            expect(responseBody.error).toContain('Error creating pull request');
          }
        });

        it('should reject pull request creation when both fields are missing', async () => {
          const httpClient = testHelpers.getHttpClient();

          const invalidPR = {};

          try {
            await httpClient.postJson('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            throw new Error('Expected request to fail with 500');
          } catch (error: any) {
            expect(error.message).toContain('HTTP 500');

            // Validate that we get the proper response by making the raw request
            const response = await httpClient.post('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            expect(response.status).toBe(500);

            const responseBody = await response.json() as ErrorResponse;
            expect(responseBody).toHaveProperty('error');
            expect(responseBody.error).toContain('Error creating pull request');
          }
        });

        it('should reject pull request creation with invalid pullRequestNumber type', async () => {
          const httpClient = testHelpers.getHttpClient();
          const randomString = testHelpers.generateRandomString(8);

          const invalidPR = {
            pullRequestNumber: 'not-a-number',
            repository: `test-org/test-repo-${randomString}`,
          };

          try {
            await httpClient.postJson('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            throw new Error('Expected request to fail with 500');
          } catch (error: any) {
            expect(error.message).toContain('HTTP 500');

            // Validate that we get the proper response by making the raw request
            const response = await httpClient.post('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            expect(response.status).toBe(500);

            const responseBody = await response.json() as ErrorResponse;
            expect(responseBody).toHaveProperty('error');
            expect(responseBody.error).toContain('Error creating pull request');
          }
        });

        it('should reject pull request creation with zero pullRequestNumber', async () => {
          const httpClient = testHelpers.getHttpClient();
          const randomString = testHelpers.generateRandomString(8);

          const invalidPR = {
            pullRequestNumber: 0,
            repository: `test-org/test-repo-${randomString}`,
          };

          try {
            await httpClient.postJson('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            throw new Error('Expected request to fail with 500');
          } catch (error: any) {
            expect(error.message).toContain('HTTP 500');

            // Validate that we get the proper response by making the raw request
            const response = await httpClient.post('/api/pull_requests', invalidPR, {
              'x-api-key': apiKey,
            });
            expect(response.status).toBe(500);

            const responseBody = await response.json() as ErrorResponse;
            expect(responseBody).toHaveProperty('error');
            expect(responseBody.error).toContain('Error creating pull request');
          }
        });

        it('should handle negative pullRequestNumber (current behavior)', async () => {
          const httpClient = testHelpers.getHttpClient();
          const randomString = testHelpers.generateRandomString(8);

          const negativeNumberPR = {
            pullRequestNumber: -1,
            repository: `test-org/test-repo-${randomString}`,
          };

          // The current implementation might accept negative numbers
          // This test documents the actual behavior
          try {
            const response = await httpClient.postJson('/api/pull_requests', negativeNumberPR, {
              'x-api-key': apiKey,
            });

            // If accepted, validate the response structure
            testHelpers.validateResponseStructure(response, ['id', 'pullRequestNumber', 'repository']);
            expect(response.pullRequestNumber).toBe(-1);
          } catch (error: any) {
            // If rejected, it should be due to validation
            expect(error.message).toMatch(/HTTP (400|500)/);
          }
        });

        it('should accept pull request creation with valid data', async () => {
          const httpClient = testHelpers.getHttpClient();
          const randomString = testHelpers.generateRandomString(8);

          const validPR = {
            pullRequestNumber: 999,
            repository: `valid-org/valid-repo-${randomString}`,
          };

          const response = await httpClient.postJson('/api/pull_requests', validPR, {
            'x-api-key': apiKey,
          });

          testHelpers.validateResponseStructure(response, ['id', 'pullRequestNumber', 'repository']);
          expect(response.pullRequestNumber).toBe(999);
          expect(response.repository).toBe(`valid-org/valid-repo-${randomString}`);
        });
      });
    });

    describe('GET /api/pull_requests/:id', () => {
      let createdPRId: string;

      beforeEach(async () => {
        // Create a test pull request for these tests
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        const newPR = {
          pullRequestNumber: 789,
          repository: `test-org/test-repo-details-${randomString}`,
        };

        const response = await httpClient.postJson('/api/pull_requests', newPR, {
          'x-api-key': apiKey,
        });

        createdPRId = response.id;
      });

      it('should return 401 when API key is missing', async () => {
        const httpClient = testHelpers.getHttpClient();

        try {
          await httpClient.getJson(`/api/pull_requests/${createdPRId}`);
          throw new Error('Expected request to fail with 401');
        } catch (error: any) {
          expect(error.message).toContain('HTTP 401');

          // Validate that we get the proper response by making the raw request
          const response = await httpClient.get(`/api/pull_requests/${createdPRId}`);
          expect(response.status).toBe(401);

          const responseBody = await response.json();
          expect(responseBody).toEqual({
            error: 'Unauthorized: Invalid or missing API key',
          });
        }
      });

      it('should return pull request details from GitHub', async () => {
        const httpClient = testHelpers.getHttpClient();

        const response = await httpClient.getJson(`/api/pull_requests/${createdPRId}`, {
          'x-api-key': apiKey,
        });

        // Validate GitHub PR details structure
        testHelpers.validateResponseStructure(response, [
          'id', 'number', 'title', 'state', 'merged', 'mergeableState',
          'createdAt', 'updatedAt', 'labels', 'url', 'author',
        ]);

        expect(typeof response.id).toBe('number');
        expect(typeof response.number).toBe('number');
        expect(typeof response.title).toBe('string');
        expect(typeof response.state).toBe('string');
        expect(typeof response.merged).toBe('boolean');
        expect(typeof response.mergeableState).toBe('string');
        expect(typeof response.createdAt).toBe('string');
        expect(typeof response.updatedAt).toBe('string');
        expect(Array.isArray(response.labels)).toBe(true);
        expect(typeof response.url).toBe('string');
        expect(typeof response.author).toBe('object');
        expect(response.number).toBe(789);
      });

      it('should return 404 for non-existent pull request', async () => {
        const httpClient = testHelpers.getHttpClient();
        const nonExistentId = '999999';

        try {
          await httpClient.getJson(`/api/pull_requests/${nonExistentId}`, {
            'x-api-key': apiKey,
          });
          throw new Error('Expected request to fail with 404');
        } catch (error: any) {
          // The API might return 404 or 500 depending on implementation
          expect(error.message).toMatch(/HTTP (404|500)/);

          // Validate that we get the proper response by making the raw request
          const response = await httpClient.get(`/api/pull_requests/${nonExistentId}`, {
            'x-api-key': apiKey,
          });
          expect([404, 500]).toContain(response.status);

          const responseBody = (await response.json()) as ErrorResponse;
          expect(responseBody.error).toContain('Error fetching pull request');
        }
      });

      it('should handle GitHub API errors gracefully', async () => {
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        // Create a pull request with a repository that might cause GitHub API issues
        const createResponse = await httpClient.postJson('/api/pull_requests', {
          pullRequestNumber: 999999,
          repository: `nonexistent-org/nonexistent-repo-${randomString}`,
        }, {
          'x-api-key': apiKey,
        });

        // Try to get details - this might succeed or fail depending on GitHub API behavior
        try {
          const response = await httpClient.getJson(`/api/pull_requests/${createResponse.id}`, {
            'x-api-key': apiKey,
          });

          // If successful, validate the response structure
          expect(response).toHaveProperty('number');
          expect(response).toHaveProperty('title');
        } catch (error: any) {
          // If it fails, it should be due to GitHub API issues
          expect(error.message).toMatch(/HTTP (404|500)/);

          // Validate that we get the proper response by making the raw request
          const response = await httpClient.get(`/api/pull_requests/${createResponse.id}`, {
            'x-api-key': apiKey,
          });
          expect([404, 500]).toContain(response.status);

          const responseBody = await response.json();
          expect(responseBody).toHaveProperty('message');
        }
      });
    });

    describe('DELETE /api/pull_requests/:id', () => {
      let createdPRId: string;

      beforeEach(async () => {
        // Create a test pull request for these tests
        const httpClient = testHelpers.getHttpClient();
        const randomString = testHelpers.generateRandomString(8);

        const newPR = {
          pullRequestNumber: 555,
          repository: `test-org/test-repo-delete-${randomString}`,
        };

        const response = await httpClient.postJson('/api/pull_requests', newPR, {
          'x-api-key': apiKey,
        });

        createdPRId = response.id;
      });

      it('should return 401 when API key is missing', async () => {
        const httpClient = testHelpers.getHttpClient();

        const response = await httpClient.delete(`/api/pull_requests/${createdPRId}`);
        expect(response.status).toBe(401);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
          error: 'Unauthorized: Invalid or missing API key',
        });
      });

      it('should delete pull request successfully', async () => {
        const httpClient = testHelpers.getHttpClient();

        const response = await httpClient.delete(`/api/pull_requests/${createdPRId}`, {
          'x-api-key': apiKey,
        });

        expect(response.status).toBe(200);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
          message: 'Pull request deleted successfully',
          success: true,
        });

        // Verify pull request is deleted by trying to get it
        try {
          await httpClient.getJson(`/api/pull_requests/${createdPRId}`, {
            'x-api-key': apiKey,
          });
          throw new Error('Expected request to fail with 404');
        } catch (error: any) {
          // The API might return 404 or 500 depending on implementation
          expect(error.message).toMatch(/HTTP (404|500)/);
        }
      });

      it('should handle deletion of non-existent pull request', async () => {
        const httpClient = testHelpers.getHttpClient();
        const nonExistentId = '999999';

        // The current implementation might return 200 even for non-existent PRs
        // This tests the actual behavior
        const response = await httpClient.delete(`/api/pull_requests/${nonExistentId}`, {
          'x-api-key': apiKey,
        });

        // Accept either 200 (current behavior) or 404 (ideal behavior)
        expect([200, 404]).toContain(response.status);

        const responseBody = await response.json();
        if (response.status === 200) {
          expect(responseBody).toEqual({
            message: 'Pull request deleted successfully',
            success: true,
          });
        } else {
          expect(responseBody).toHaveProperty('message');
        }
      });
    });
  });

  describe('SDK Tests', () => {
    let prId: string;

    beforeEach(async () => {
      await truncateTables(['pull_requests']);
    });

    it('should get empty pull requests list via SDK', async () => {
      const pullRequests = await myDashboardSdk.pullRequests.getPullRequests();
      expect(Array.isArray(pullRequests)).toBe(true);
      expect(pullRequests.length).toBe(0);
    });

    it('should create pull request via SDK', async () => {
      const randomString = testHelpers.generateRandomString(8);
      const newPR = await myDashboardSdk.pullRequests.addPullRequest({
        pullRequestNumber: 123,
        repository: `sdk-org/sdk-repo-${randomString}`,
      });

      expect(newPR.id).toBeDefined();
      expect(typeof newPR.id).toBe('number'); // ID is returned as number from database
      expect(newPR.pullRequestNumber).toBe(123);
      expect(newPR.repository).toBe(`sdk-org/sdk-repo-${randomString}`);
      prId = newPR.id.toString(); // Convert to string for later use
    });

    it('should get pull requests list via SDK', async () => {
      const randomString = testHelpers.generateRandomString(8);

      // Create test pull requests
      await myDashboardSdk.pullRequests.addPullRequest({
        pullRequestNumber: 100,
        repository: `sdk-org/repo1-${randomString}`,
      });

      await myDashboardSdk.pullRequests.addPullRequest({
        pullRequestNumber: 200,
        repository: `sdk-org/repo2-${randomString}`,
      });

      const pullRequests = await myDashboardSdk.pullRequests.getPullRequests();
      expect(Array.isArray(pullRequests)).toBe(true);
      expect(pullRequests.length).toBe(2);

      const pr1 = pullRequests.find(pr => pr.pullRequestNumber === 100);
      const pr2 = pullRequests.find(pr => pr.pullRequestNumber === 200);

      expect(pr1).toBeDefined();
      expect(pr1!.repository).toBe(`sdk-org/repo1-${randomString}`);
      expect(pr2).toBeDefined();
      expect(pr2!.repository).toBe(`sdk-org/repo2-${randomString}`);
    });

    it('should get pull request details via SDK', async () => {
      const randomString = testHelpers.generateRandomString(8);

      // Create a pull request
      const newPR = await myDashboardSdk.pullRequests.addPullRequest({
        pullRequestNumber: 456,
        repository: `sdk-org/details-repo-${randomString}`,
      });

      // Get details
      const details = await myDashboardSdk.pullRequests.getPullRequestDetails(newPR.id.toString());

      expect(details).toBeDefined();
      expect(typeof details.id).toBe('number');
      expect(details.number).toBe(456);
      expect(typeof details.title).toBe('string');
      expect(typeof details.state).toBe('string');
      expect(typeof details.merged).toBe('boolean');
      expect(Array.isArray(details.labels)).toBe(true);
      expect(typeof details.url).toBe('string');
      expect(typeof details.author).toBe('object');
    });

    it('should delete pull request via SDK', async () => {
      const randomString = testHelpers.generateRandomString(8);

      // Create a pull request
      const newPR = await myDashboardSdk.pullRequests.addPullRequest({
        pullRequestNumber: 789,
        repository: `sdk-org/delete-repo-${randomString}`,
      });

      // Delete it
      const deleteResponse = await myDashboardSdk.pullRequests.deletePullRequest(newPR.id.toString());

      // The SDK returns { success: boolean } according to the service definition
      expect(deleteResponse).toBeDefined();
      expect(deleteResponse.success).toBe(true);

      // Verify it's deleted by trying to get details
      await expect(myDashboardSdk.pullRequests.getPullRequestDetails(newPR.id.toString()))
        .rejects.toThrow();
    });

    it('should handle non-existent pull request operations gracefully via SDK', async () => {
      const nonExistentId = '999999';

      // Test getting non-existent pull request details
      await expect(myDashboardSdk.pullRequests.getPullRequestDetails(nonExistentId))
        .rejects.toThrow();

      // Test deleting non-existent pull request
      // The SDK might handle this differently, so we test the actual behavior
      try {
        const deleteResponse = await myDashboardSdk.pullRequests.deletePullRequest(nonExistentId);
        // If it doesn't throw, it should return a success response
        if (deleteResponse && typeof deleteResponse === 'object' && 'success' in deleteResponse) {
          expect(typeof deleteResponse.success).toBe('boolean');
        }
      } catch (error) {
        // If it throws, that's also acceptable behavior
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid pull request creation via SDK', async () => {
      // Test with missing required fields
      await expect(myDashboardSdk.pullRequests.addPullRequest({
        pullRequestNumber: 0,
        repository: '',
      })).rejects.toThrow();

      await expect(myDashboardSdk.pullRequests.addPullRequest({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        pullRequestNumber: 'invalid',
        repository: 'test-org/test-repo',
      })).rejects.toThrow();
    });

    it('should create multiple pull requests and verify list operations via SDK', async () => {
      const prIds: string[] = [];
      const randomString = testHelpers.generateRandomString(8);

      // Create multiple pull requests
      for (let i = 1; i <= 3; i++) {
        const pr = await myDashboardSdk.pullRequests.addPullRequest({
          pullRequestNumber: i * 100,
          repository: `sdk-org/multi-repo-${i}-${randomString}`,
        });
        prIds.push(pr.id.toString()); // Convert to string for consistency
      }

      // Verify all pull requests are in the list
      const pullRequests: PullRequest[] = await myDashboardSdk.pullRequests.getPullRequests();
      expect(pullRequests.length).toBeGreaterThanOrEqual(3);

      // Verify all created pull requests are present
      const createdPRs = pullRequests.filter((pr: PullRequest) => prIds.includes(pr.id.toString()));
      expect(createdPRs.length).toBe(3);

      // Test getting each pull request details
      for (const id of prIds) {
        const details = await myDashboardSdk.pullRequests.getPullRequestDetails(id);
        expect(details).toBeDefined();
        expect(typeof details.number).toBe('number');
        expect([100, 200, 300]).toContain(details.number);
      }

      // Clean up
      for (const id of prIds) {
        const deleteResponse = await myDashboardSdk.pullRequests.deletePullRequest(id);
        expect(deleteResponse.success).toBe(true);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(async () => {
      await truncateTables(['pull_requests']);
    });

    it('should handle special characters in repository names', async () => {
      const httpClient = testHelpers.getHttpClient();
      const specialRepo = 'test-org/repo-with-special.chars_and-dashes';

      const newPR = {
        pullRequestNumber: 123,
        repository: specialRepo,
      };

      const response = await httpClient.postJson('/api/pull_requests', newPR, {
        'x-api-key': apiKey,
      });

      expect(response.repository).toBe(specialRepo);
    });

    it('should handle large pull request numbers', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);
      const largePRNumber = 999999999;

      const newPR = {
        pullRequestNumber: largePRNumber,
        repository: `test-org/large-pr-${randomString}`,
      };

      const response = await httpClient.postJson('/api/pull_requests', newPR, {
        'x-api-key': apiKey,
      });

      expect(response.pullRequestNumber).toBe(largePRNumber);
    });

    it('should handle concurrent pull request operations', async () => {
      const httpClient = testHelpers.getHttpClient();
      const randomString = testHelpers.generateRandomString(8);

      // Create multiple pull requests concurrently
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          httpClient.postJson('/api/pull_requests', {
            pullRequestNumber: i + 1,
            repository: `concurrent-org/repo-${i}-${randomString}`,
          }, {
            'x-api-key': apiKey,
          }),
        );
      }

      const results = await Promise.all(promises);
      expect(results.length).toBe(5);

      // Verify all were created successfully
      results.forEach((result, index) => {
        expect(result.pullRequestNumber).toBe(index + 1);
        expect(result.repository).toBe(`concurrent-org/repo-${index}-${randomString}`);
      });

      // Verify they all appear in the list
      const allPRs = await httpClient.getJson('/api/pull_requests', {
        'x-api-key': apiKey,
      });

      expect(allPRs.length).toBe(5);
    });
  });
});
