import { Page } from '@playwright/test';

/**
 * Utility functions for E2E Dashboard testing
 */

/**
 * E2E Test Data Generators
 */
export class E2EDataGenerator {
  /**
   * Generate a mock E2E report summary
   */
  static mockReportSummary(overrides?: Partial<{
    id: number;
    date: string;
    status: 'ready' | 'pending' | 'failed';
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    successRate: number;
  }>) {
    const defaults = {
      id: 1,
      date: new Date().toISOString().split('T')[0],
      status: 'ready' as const,
      totalRuns: 100,
      passedRuns: 85,
      failedRuns: 15,
      successRate: 0.85,
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Generate a mock E2E report detail for an app
   */
  static mockReportDetail(overrides?: Partial<{
    id: number;
    reportSummaryId: number;
    appId: number;
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    successRate: number;
    lastRunStatus: 'passed' | 'failed';
    lastFailedRunAt: string | null;
    lastRunAt: string;
    app: {
      id: number;
      name: string;
      code: string;
      pipelineUrl: string | null;
      e2eTriggerConfiguration: string | null;
      watching: boolean;
    };
  }>) {
    const defaults = {
      id: 1,
      reportSummaryId: 1,
      appId: 1,
      totalRuns: 10,
      passedRuns: 8,
      failedRuns: 2,
      successRate: 0.8,
      lastRunStatus: 'passed' as const,
      lastFailedRunAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      lastRunAt: new Date().toISOString(),
      app: {
        id: 1,
        name: 'Test App',
        code: 'test-app',
        pipelineUrl: 'https://example.com/pipeline',
        e2eTriggerConfiguration: '{"branch":"main"}',
        watching: true,
      },
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Generate a complete detailed E2E report
   */
  static mockDetailedReport(options?: {
    summaryOverrides?: Parameters<typeof E2EDataGenerator.mockReportSummary>[0];
    detailsCount?: number;
    detailsOverrides?: Array<Parameters<typeof E2EDataGenerator.mockReportDetail>[0]>;
  }) {
    const summary = E2EDataGenerator.mockReportSummary(options?.summaryOverrides);
    const detailsCount = options?.detailsCount ?? 3;
    const details = Array.from({ length: detailsCount }, (_, i) => {
      const override = options?.detailsOverrides?.[i] || {};
      return E2EDataGenerator.mockReportDetail({
        id: i + 1,
        appId: i + 1,
        app: {
          id: i + 1,
          name: `Test App ${i + 1}`,
          code: `test-app-${i + 1}`,
          pipelineUrl: `https://example.com/pipeline/${i + 1}`,
          e2eTriggerConfiguration: '{"branch":"main"}',
          watching: true,
        },
        ...override,
      });
    });

    return {
      summary,
      details,
    };
  }

  /**
   * Generate report with all tests passing
   */
  static mockAllPassingReport() {
    return E2EDataGenerator.mockDetailedReport({
      summaryOverrides: {
        totalRuns: 50,
        passedRuns: 50,
        failedRuns: 0,
        successRate: 1.0,
      },
      detailsCount: 5,
      detailsOverrides: Array.from({ length: 5 }, () => ({
        totalRuns: 10,
        passedRuns: 10,
        failedRuns: 0,
        successRate: 1.0,
        lastRunStatus: 'passed' as const,
        lastFailedRunAt: null,
      })),
    });
  }

  /**
   * Generate report with some failures
   */
  static mockReportWithFailures(failureCount: number = 2) {
    const totalApps = 5;
    const detailsOverrides = Array.from({ length: totalApps }, (_, i) => {
      const hasFailed = i < failureCount;
      const lastRunStatus: 'passed' | 'failed' = hasFailed ? 'failed' : 'passed';
      return {
        totalRuns: 10,
        passedRuns: hasFailed ? 7 : 10,
        failedRuns: hasFailed ? 3 : 0,
        successRate: hasFailed ? 0.7 : 1.0,
        lastRunStatus,
        lastFailedRunAt: hasFailed ? new Date().toISOString() : null,
      };
    });

    const totalRuns = totalApps * 10;
    const failedRuns = failureCount * 3;
    const passedRuns = totalRuns - failedRuns;

    return E2EDataGenerator.mockDetailedReport({
      summaryOverrides: {
        totalRuns,
        passedRuns,
        failedRuns,
        successRate: passedRuns / totalRuns,
      },
      detailsCount: totalApps,
      detailsOverrides,
    });
  }

  /**
   * Generate empty report (no test results)
   */
  static mockEmptyReport() {
    return {
      summary: E2EDataGenerator.mockReportSummary({
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      }),
      details: [],
    };
  }

  /**
   * Generate pending report
   */
  static mockPendingReport() {
    return {
      summary: E2EDataGenerator.mockReportSummary({
        status: 'pending',
        totalRuns: 0,
        passedRuns: 0,
        failedRuns: 0,
        successRate: 0,
      }),
      details: [],
      message: 'Generating report... This may take a few minutes.',
    };
  }
}

/**
 * E2E Test Utilities
 */
export class E2ETestUtils {
  /**
   * Intercept GET E2E report API call
   */
  static async interceptGetE2EReport(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/e2e_run_report') && response.request().method() === 'GET',
    );
  }

  /**
   * Intercept GET app last status API call
   */
  static async interceptGetAppLastStatus(page: Page, summaryId: number, appId: number) {
    return page.waitForResponse(
      response =>
        response.url().includes(`/api/e2e_run_report/${summaryId}/${appId}`) &&
        response.request().method() === 'GET',
    );
  }

  /**
   * Intercept POST trigger manual run API call
   */
  static async interceptTriggerManualRun(page: Page) {
    return page.waitForResponse(
      response => response.url().includes('/api/e2e_manual_runs') && response.request().method() === 'POST',
    );
  }

  /**
   * Mock E2E report API response
   */
  static async mockE2EReportResponse(page: Page, reportData: unknown) {
    await page.route('**/api/e2e_run_report*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(reportData),
      });
    });
  }

  /**
   * Mock E2E report API error
   */
  static async mockE2EReportError(page: Page, statusCode: number = 500) {
    await page.route('**/api/e2e_run_report*', async (route) => {
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
  }

  /**
   * Wait for metrics to be visible
   */
  static async waitForMetrics(page: Page) {
    await page.locator('text=Total Runs').waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Wait for project cards to load
   */
  static async waitForProjectCards(page: Page) {
    await page.locator('[data-project-card]').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Calculate expected success rate
   */
  static calculateSuccessRate(passed: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return passed / total;
  }

  /**
   * Format success rate as percentage string
   */
  static formatSuccessRate(rate: number): string {
    return `${(rate * 100).toFixed(2)}%`;
  }
}

export default E2ETestUtils;

