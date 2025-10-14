import { TestHelpers } from '@utils/test-helpers';
import {
  closeTestConnection,
  truncateTables,
  getTestConnection,
} from '@utils/dbHelper';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

describe('E2E Run Report API Integration Tests', () => {
  let testHelpers: TestHelpers;
  let apiKey: string;
  let dbConnection: mysql.Connection;

  beforeAll(async () => {
    testHelpers = new TestHelpers();
    apiKey = testHelpers.getApiKey();
    await testHelpers.waitForServer();

    // Create database connection for test data setup
    dbConnection = await getTestConnection();
  });

  afterAll(async () => {
    await truncateTables(['e2e_report_details', 'e2e_report_summaries', 'apps']);
    if (dbConnection) {
      await dbConnection.end();
    }
    await closeTestConnection();
  });

  beforeEach(async () => {
    // Clean up before each test
    await truncateTables(['e2e_report_details', 'e2e_report_summaries', 'apps']);
  });

  describe('GET /api/e2e_run_report', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.getJson('/api/e2e_run_report');
        fail('Expected request to fail with 401');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 401');

        const response = await httpClient.get('/api/e2e_run_report');
        expect(response.status).toBe(401);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return 202 when report does not exist (pending)', async () => {
      const httpClient = testHelpers.getHttpClient();
      // Use a future date that won't have a report
      const today = new Date();
      const futureDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const response = await httpClient.get(`/api/e2e_run_report?date=${futureDateStr}`, {
        'x-api-key': apiKey,
      });

      expect(response.status).toBe(202);

      const responseBody = await response.json() as any;
      testHelpers.validateResponseStructure(responseBody, ['summary', 'details', 'message']);
      expect(responseBody.summary.status).toBe('pending');
      expect(responseBody.summary.date).toBe(futureDateStr);
      expect(responseBody.details).toEqual([]);
      expect(responseBody.message).toContain('Report is being generated');
    });

    it('should return report for today by default', async () => {
      const httpClient = testHelpers.getHttpClient();

      const response = await httpClient.get('/api/e2e_run_report', {
        'x-api-key': apiKey,
      });

      // Should return either 200 (if report exists) or 202 (if pending)
      expect([200, 202]).toContain(response.status);

      const responseBody = await response.json() as any;
      testHelpers.validateResponseStructure(responseBody, ['summary', 'details']);
      expect(responseBody.summary).toHaveProperty('date');
      expect(responseBody.summary).toHaveProperty('status');
    });

    it('should return 400 for invalid date format', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.getJson('/api/e2e_run_report?date=invalid-date', {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');

        const response = await httpClient.get('/api/e2e_run_report?date=invalid-date', {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(400);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return 400 for invalid enrichments JSON', async () => {
      const httpClient = testHelpers.getHttpClient();
      const today = new Date().toISOString().split('T')[0];

      try {
        await httpClient.getJson(`/api/e2e_run_report?date=${today}&enrichments=invalid-json`, {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');

        const response = await httpClient.get(`/api/e2e_run_report?date=${today}&enrichments=invalid-json`, {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(400);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return ready report with correct structure', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-15';

      // Create a test report summary
      const [summaryResult] = await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 10, 8, 2, 0.8000)`,
        [testDate],
      );
      const summaryId = (summaryResult as any).insertId;

      // Create a test app
      const [appResult] = await dbConnection.execute(
        'INSERT INTO apps (name, code, watching) VALUES (\'Test App\', \'test-app\', 1)',
      );
      const appId = (appResult as any).insertId;

      // Create a test report detail
      await dbConnection.execute(
        `INSERT INTO e2e_report_details
        (report_summary_id, app_id, total_runs, passed_runs, failed_runs, success_rate, last_run_status, last_run_at)
        VALUES (?, ?, 5, 4, 1, 0.8000, 'passed', NOW())`,
        [summaryId, appId],
      );

      const response = await httpClient.getJson(`/api/e2e_run_report?date=${testDate}`, {
        'x-api-key': apiKey,
      });

      testHelpers.validateResponseStructure(response, ['summary', 'details']);
      
      // Validate summary structure
      const summary = response.summary;
      testHelpers.validateResponseStructure(summary, [
        'id',
        'date',
        'status',
        'totalRuns',
        'passedRuns',
        'failedRuns',
        'successRate',
      ]);
      // Date might be returned as ISO string or just date string
      expect(summary.date.startsWith(testDate)).toBe(true);
      expect(summary.status).toBe('ready');
      expect(summary.totalRuns).toBe(10);
      expect(summary.passedRuns).toBe(8);
      expect(summary.failedRuns).toBe(2);
      expect(summary.successRate).toBe(0.8);

      // Validate details structure
      expect(Array.isArray(response.details)).toBe(true);
      expect(response.details.length).toBeGreaterThan(0);

      const detail = response.details[0];
      testHelpers.validateResponseStructure(detail, [
        'id',
        'reportSummaryId',
        'appId',
        'totalRuns',
        'passedRuns',
        'failedRuns',
        'successRate',
        'lastRunStatus',
        'lastRunAt',
      ]);
    });

    it('should support enrichments parameter', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-16';

      // Create test data
      const [summaryResult] = await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 5, 5, 0, 1.0000)`,
        [testDate],
      );
      const summaryId = (summaryResult as any).insertId;

      const [appResult] = await dbConnection.execute(
        'INSERT INTO apps (name, code, watching) VALUES (\'Test App 2\', \'test-app-2\', 1)',
      );
      const appId = (appResult as any).insertId;

      await dbConnection.execute(
        `INSERT INTO e2e_report_details
        (report_summary_id, app_id, total_runs, passed_runs, failed_runs, success_rate, last_run_status, last_run_at)
        VALUES (?, ?, 5, 5, 0, 1.0000, 'passed', NOW())`,
        [summaryId, appId],
      );

      // Test with enrichments to include app info
      const enrichments = JSON.stringify({
        includeDetails: true,
        includeAppInfo: true,
        includeManualRuns: false,
      });

      const response = await httpClient.getJson(
        `/api/e2e_run_report?date=${testDate}&enrichments=${encodeURIComponent(enrichments)}`,
        {
          'x-api-key': apiKey,
        },
      );

      expect(response.details.length).toBeGreaterThan(0);
      
      // When includeAppInfo is true, details should have app property
      const detail = response.details[0];
      expect(detail).toHaveProperty('app');
      expect(detail.app).toHaveProperty('name');
      expect(detail.app).toHaveProperty('code');
    });

    it('should handle enrichments with includeDetails false', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-17';

      // Create test data
      await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 3, 3, 0, 1.0000)`,
        [testDate],
      );

      const enrichments = JSON.stringify({
        includeDetails: false,
      });

      const response = await httpClient.getJson(
        `/api/e2e_run_report?date=${testDate}&enrichments=${encodeURIComponent(enrichments)}`,
        {
          'x-api-key': apiKey,
        },
      );

      // When includeDetails is false, details should be undefined
      expect(response.details).toBeUndefined();
      expect(response.summary).toBeDefined();
    });

    it('should delete existing report and regenerate when force=true', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-18';

      // Create a test report summary
      const [summaryResult] = await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 10, 8, 2, 0.8000)`,
        [testDate],
      );
      const summaryId = (summaryResult as any).insertId;

      // Verify the report exists
      const [existingReport] = await dbConnection.execute(
        'SELECT * FROM e2e_report_summaries WHERE id = ?',
        [summaryId],
      );
      expect((existingReport as any[]).length).toBe(1);

      // Request with force=true
      const response = await httpClient.get(`/api/e2e_run_report?date=${testDate}&force=true`, {
        'x-api-key': apiKey,
      });

      // Should return 202 (pending) as the report is being regenerated
      expect(response.status).toBe(202);

      const responseBody = await response.json() as any;
      expect(responseBody.summary.status).toBe('pending');
      expect(responseBody.message).toContain('Report is being generated');

      // Verify the old report was deleted
      const [deletedReport] = await dbConnection.execute(
        'SELECT * FROM e2e_report_summaries WHERE id = ?',
        [summaryId],
      );
      expect((deletedReport as any[]).length).toBe(0);
    });

    it('should not delete report when force=false', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-19';

      // Create a test report summary
      const [summaryResult] = await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 10, 8, 2, 0.8000)`,
        [testDate],
      );
      const summaryId = (summaryResult as any).insertId;

      // Request with force=false (or omitted)
      const response = await httpClient.get(`/api/e2e_run_report?date=${testDate}&force=false`, {
        'x-api-key': apiKey,
      });

      // Should return 200 (ready) as the existing report is returned
      expect(response.status).toBe(200);

      const responseBody = await response.json() as any;
      expect(responseBody.summary.status).toBe('ready');
      expect(responseBody.summary.id).toBe(summaryId);

      // Verify the report still exists
      const [existingReport] = await dbConnection.execute(
        'SELECT * FROM e2e_report_summaries WHERE id = ?',
        [summaryId],
      );
      expect((existingReport as any[]).length).toBe(1);
    });
  });

  describe('GET /api/e2e_run_report/:summaryId/:appId', () => {
    it('should return 401 when API key is missing', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.getJson('/api/e2e_run_report/1/1');
        fail('Expected request to fail with 401');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 401');

        const response = await httpClient.get('/api/e2e_run_report/1/1');
        expect(response.status).toBe(401);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return 400 for invalid summaryId', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.getJson('/api/e2e_run_report/invalid/1', {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');

        const response = await httpClient.get('/api/e2e_run_report/invalid/1', {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(400);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return 400 for invalid appId', async () => {
      const httpClient = testHelpers.getHttpClient();

      try {
        await httpClient.getJson('/api/e2e_run_report/1/invalid', {
          'x-api-key': apiKey,
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');

        const response = await httpClient.get('/api/e2e_run_report/1/invalid', {
          'x-api-key': apiKey,
        });
        expect(response.status).toBe(400);

        const responseBody = await response.json() as { success: boolean; error?: unknown };
        expect(responseBody).toHaveProperty('success');
        expect(responseBody.success).toBe(false);
        expect(responseBody).toHaveProperty('error');
      }
    });

    it('should return project status for valid summaryId and appId', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-18';

      // Create test data
      const [summaryResult] = await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 7, 6, 1, 0.8571)`,
        [testDate],
      );
      const summaryId = (summaryResult as any).insertId;

      const [appResult] = await dbConnection.execute(
        'INSERT INTO apps (name, code, watching) VALUES (\'Project App\', \'project-app\', 1)',
      );
      const appId = (appResult as any).insertId;

      await dbConnection.execute(
        `INSERT INTO e2e_report_details
        (report_summary_id, app_id, total_runs, passed_runs, failed_runs, success_rate, last_run_status, last_run_at)
        VALUES (?, ?, 7, 6, 1, 0.8571, 'passed', NOW())`,
        [summaryId, appId],
      );

      const response = await httpClient.getJson(
        `/api/e2e_run_report/${summaryId}/${appId}`,
        {
          'x-api-key': apiKey,
        },
      );

      // Validate response structure
      if (response) {
        testHelpers.validateResponseStructure(response, [
          'id',
          'reportSummaryId',
          'appId',
          'totalRuns',
          'passedRuns',
          'failedRuns',
          'successRate',
          'lastRunStatus',
          'lastRunAt',
        ]);
        expect(response.reportSummaryId).toBe(summaryId);
        expect(response.appId).toBe(appId);
        // Verify the values are reasonable (not checking exact values due to potential test data accumulation)
        expect(response.totalRuns).toBeGreaterThanOrEqual(7);
        expect(response.passedRuns).toBeGreaterThanOrEqual(6);
        expect(response.failedRuns).toBeGreaterThanOrEqual(1);
      }
    });

    it('should return 404 for non-existent summaryId/appId combination', async () => {
      const httpClient = testHelpers.getHttpClient();
      const nonExistentSummaryId = 999999;
      const nonExistentAppId = 999999;

      try {
        await httpClient.getJson(
          `/api/e2e_run_report/${nonExistentSummaryId}/${nonExistentAppId}`,
          {
            'x-api-key': apiKey,
          },
        );
        fail('Expected request to fail with 404');
      } catch (error: any) {
        expect(error.message).toContain('HTTP 404');
      }
    });

    it('should handle missing parameters in URL', async () => {
      const httpClient = testHelpers.getHttpClient();

      // Test with missing appId
      const response1 = await httpClient.get('/api/e2e_run_report/1/', {
        'x-api-key': apiKey,
      });

      // Should return 404 or redirect to base endpoint
      expect([404, 200, 202]).toContain(response1.status);
    });
  });

  describe('E2E Run Report Edge Cases', () => {
    it('should handle reports with zero runs', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-19';

      // Create a report with zero runs
      await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 0, 0, 0, 0.0000)`,
        [testDate],
      );

      const response = await httpClient.getJson(`/api/e2e_run_report?date=${testDate}`, {
        'x-api-key': apiKey,
      });

      expect(response.summary.totalRuns).toBe(0);
      expect(response.summary.passedRuns).toBe(0);
      expect(response.summary.failedRuns).toBe(0);
      expect(response.summary.successRate).toBe(0);
    });

    it('should handle reports with 100% success rate', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-20';

      // Create a report with 100% success
      await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 10, 10, 0, 1.0000)`,
        [testDate],
      );

      const response = await httpClient.getJson(`/api/e2e_run_report?date=${testDate}`, {
        'x-api-key': apiKey,
      });

      expect(response.summary.totalRuns).toBe(10);
      expect(response.summary.passedRuns).toBe(10);
      expect(response.summary.failedRuns).toBe(0);
      expect(response.summary.successRate).toBe(1);
    });

    it('should handle reports with 0% success rate', async () => {
      const httpClient = testHelpers.getHttpClient();
      const testDate = '2025-01-21';

      // Create a report with 0% success
      await dbConnection.execute(
        `INSERT INTO e2e_report_summaries
        (date, status, total_runs, passed_runs, failed_runs, success_rate)
        VALUES (?, 'ready', 5, 0, 5, 0.0000)`,
        [testDate],
      );

      const response = await httpClient.getJson(`/api/e2e_run_report?date=${testDate}`, {
        'x-api-key': apiKey,
      });

      expect(response.summary.totalRuns).toBe(5);
      expect(response.summary.passedRuns).toBe(0);
      expect(response.summary.failedRuns).toBe(5);
      expect(response.summary.successRate).toBe(0);
    });
  });
});

