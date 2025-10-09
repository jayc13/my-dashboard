import { DateTime } from 'luxon';
import { getRedisSubscriber, getRedisClient } from '../config/redis';
import { E2ERunReportService } from '../services/e2e_run_report.service';
import { AppService } from '../services/app.service';
import { CypressDashboardAPI } from '../services/cypress.service';
import { CypressRun, E2EReportMessage } from '@my-dashboard/types/e2e';
import { Logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export interface CypressAppReportData {
  appId: number;
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  successRate: number;
  lastRunStatus: string;
  lastFailedRunAt: string | null;
  lastRunAt: string;
}

interface FetchCypressDataOptions {
  appIds?: number[];
}

/**
 * E2E Report Processor
 *
 * This processor listens to Redis messages and generates E2E reports
 * using the E2ERunReportService.
 */
export class E2EReportProcessor {
  private static instance: E2EReportProcessor;
  private subscriber: ReturnType<typeof getRedisSubscriber>;
  private readonly CHANNEL_NAME = 'e2e:report:generate';

  private constructor() {
    this.subscriber = getRedisSubscriber();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): E2EReportProcessor {
    if (!E2EReportProcessor.instance) {
      E2EReportProcessor.instance = new E2EReportProcessor();
    }
    return E2EReportProcessor.instance;
  }

  /**
   * Start listening for messages
   */
  public async start(): Promise<void> {
    Logger.debug('[E2E Report Processor] Starting...');

    // Subscribe to the channel
    await this.subscriber.subscribe(this.CHANNEL_NAME);
    Logger.debug('[E2E Report Processor] Subscribed to channel', { channel: this.CHANNEL_NAME });

    // Handle incoming messages
    this.subscriber.on('message', async (channel, message) => {
      if (channel === this.CHANNEL_NAME) {
        await this.handleMessage(message);
      }
    });

    Logger.debug('[E2E Report Processor] Started successfully');
  }

  /**
   * Stop the processor
   */
  public async stop(): Promise<void> {
    Logger.debug('[E2E Report Processor] Stopping...');
    await this.subscriber.unsubscribe(this.CHANNEL_NAME);
    Logger.debug('[E2E Report Processor] Stopped');
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: string): Promise<void> {
    try {
      const payload: E2EReportMessage = JSON.parse(message);
      Logger.debug('[E2E Report Processor] Received message', { payload });

      await this.generateReport(payload);
    } catch (error) {
      Logger.error('[E2E Report Processor] Error handling message', { error });
    }
  }

  /**
   * Generate E2E report for the given date
   */
  private async generateReport(payload: E2EReportMessage): Promise<void> {
    const { date, requestId } = payload;
    const logPrefix = requestId ? `[${requestId}]` : '';

    Logger.debug(`${logPrefix} [E2E Report Processor] Generating report for date`, { date });

    try {
      // Check if summary already exists
      let summary = await E2ERunReportService.getSummaryByDate(date);

      if (summary) {
        // If summary exists and is ready, skip processing
        if (summary.status === 'ready') {
          Logger.debug(`${logPrefix} [E2E Report Processor] Summary already exists and is ready, skipping`, { date });
          return;
        }
        Logger.debug(`${logPrefix} [E2E Report Processor] Summary already exists, updating`, { date });
      } else {
        // Create new summary with pending status
        summary = await E2ERunReportService.createSummary({
          date,
          status: 'pending',
          totalRuns: 0,
          passedRuns: 0,
          failedRuns: 0,
          successRate: 0,
        });

        if (!summary) {
          throw new Error('Failed to create summary');
        }

        Logger.debug(`${logPrefix} [E2E Report Processor] Created summary`, { summaryId: summary.id });
      }

      // Fetch data from Cypress API
      const reportData = await E2EReportProcessor.fetchCypressData(date);
      Logger.debug(`${logPrefix} [E2E Report Processor] Fetched apps data`, { appsCount: reportData.length });

      // Delete existing details for this summary
      await E2ERunReportService.deleteDetailsBySummaryId(summary.id);

      // Create details for each app
      let totalRuns = 0;
      let totalPassed = 0;
      let totalFailed = 0;

      for (const appData of reportData) {
        const detail = await E2ERunReportService.createDetail({
          reportSummaryId: summary.id,
          appId: appData.appId,
          totalRuns: appData.totalRuns,
          passedRuns: appData.passedRuns,
          failedRuns: appData.failedRuns,
          successRate: appData.successRate,
          lastRunStatus: appData.lastRunStatus as 'passed' | 'failed',
          lastFailedRunAt: appData.lastFailedRunAt ? appData.lastFailedRunAt : null,
          lastRunAt: appData.lastRunAt,
        });

        if (detail) {
          totalRuns += appData.totalRuns;
          totalPassed += appData.passedRuns;
          totalFailed += appData.failedRuns;
          Logger.debug(`${logPrefix} [E2E Report Processor] Created detail for app`, { appId: appData.appId });
        }
      }

      // Update summary with totals
      const successRate = totalRuns > 0 ? totalPassed / totalRuns : 0;
      await E2ERunReportService.updateSummary(summary.id, {
        status: 'ready',
        totalRuns,
        passedRuns: totalPassed,
        failedRuns: totalFailed,
        successRate,
      });

      Logger.debug(`${logPrefix} [E2E Report Processor] Report generated successfully`, {
        date,
        totalRuns,
        passed: totalPassed,
        failed: totalFailed,
        successRate: `${(successRate * 100).toFixed(2)}%`,
      });

    } catch (error) {
      Logger.error(`${logPrefix} [E2E Report Processor] Error generating report`, { error });
      // Don't throw - just log the error and continue
    }
  }

  /**
   * Fetch Cypress data for the given date
   */
  static async fetchCypressData(date: string, options?: FetchCypressDataOptions): Promise<Array<CypressAppReportData>> {
    const apiKey = process.env.CYPRESS_API_KEY;

    const {
      appIds,
    } = options || {};

    if (!apiKey) {
      throw new Error('CYPRESS_API_KEY environment variable is not set');
    }

    let requestedApplications;

    if (!appIds) {
      // Get watching apps from database
      Logger.debug('[E2E Report Processor] No app IDs provided, fetching all watching apps');
      requestedApplications = await AppService.getWatching();
    } else {
      const receivedApps = await Promise.all(appIds.map(async appId => AppService.getById(appId)));
      requestedApplications = receivedApps.filter(app => app !== null) as NonNullable<typeof receivedApps[number]>[];
    }

    if (!requestedApplications || requestedApplications.length === 0) {
      Logger.warn('[E2E Report Processor] No watching apps found');
      return [];
    }

    const projectNames = requestedApplications.map(app => app.name);

    const api = new CypressDashboardAPI(apiKey);

    // Calculate date range (14 days back from the target date)
    const targetDate = new Date(date);
    const startDate = DateTime.fromJSDate(targetDate).minus({ days: 14 }).toJSDate();

    Logger.debug('[E2E Report Processor] Fetching data for projects', {
      projectsCount: projectNames.length,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: date,
    });

    // Fetch data from Cypress API
    const projectData = await api.getDailyRunsPerProject({
      projects: projectNames,
      startDate: DateTime.fromJSDate(startDate).toUTC().toFormat('yyyy-LL-dd'),
      endDate: DateTime.fromJSDate(targetDate).toUTC().toFormat('yyyy-LL-dd'),
    });

    // Group results by project
    const groupedResults: Record<string, CypressRun[]> = {};
    for (const result of projectData) {
      const projectName = result['project_name'] || 'unknown';
      if (!groupedResults[projectName]) {
        groupedResults[projectName] = [];
      }
      groupedResults[projectName].push(result);
    }

    // Process data for each app
    const results = [];

    for (const projectName in groupedResults) {
      const app = requestedApplications.find(n => n.name === projectName);
      if (!app || !app.id) {
        Logger.warn('[E2E Report Processor] App not found for project', { projectName });
        continue;
      }

      const runs = groupedResults[projectName];

      // Group by run_number
      const runsByNumber: Record<string, CypressRun[]> = {};
      for (const run of runs) {
        const runNumber = run['run_number'];
        if (!runNumber) {
          continue;
        }
        if (!runsByNumber[runNumber]) {
          runsByNumber[runNumber] = [];
        }
        runsByNumber[runNumber].push(run);
      }

      let passedRuns = 0;
      let failedRuns = 0;
      let lastFailedRunAt: string | null = null;
      let lastRunAt: string = DateTime.utc().toISO();
      let lastRunStatus = 'noTests';

      const sortedRunNumbers = Object.keys(runsByNumber).sort((a, b) => parseInt(b) - parseInt(a));

      for (const runNumber of sortedRunNumbers) {
        const runGroup = runsByNumber[runNumber];
        const status = this.getRunStatus(runGroup);

        if (status === 'passed') {
          passedRuns++;
        } else {
          failedRuns++;
          if (!lastFailedRunAt && runGroup.length > 0) {
            lastFailedRunAt = runGroup[0].created_at;
          }
        }
      }

      if (sortedRunNumbers.length > 0) {
        const lastRunGroup = runsByNumber[sortedRunNumbers[0]];
        lastRunStatus = this.getRunStatus(lastRunGroup);
        if (lastRunGroup.length > 0) {
          lastRunAt = lastRunGroup[0].created_at;
        }
      }

      const totalRuns = passedRuns + failedRuns;
      const successRate = totalRuns > 0 ? passedRuns / totalRuns : 0;

      results.push({
        appId: app.id,
        totalRuns,
        passedRuns,
        failedRuns,
        successRate,
        lastRunStatus,
        lastFailedRunAt,
        lastRunAt,
      });
    }

    return results;
  }

  /**
   * Determine run status from a group of runs
   */
  static getRunStatus(runs: CypressRun[]): string {
    return runs
      .filter((run) => run.status !== 'noTests')
      .every(r => r.status === 'passed') ? 'passed' : 'failed';
  }

}

/**
 * Publish a message to generate an E2E report
 */
export async function publishE2EReportRequest(date: string, requestId?: string): Promise<void> {
  const client = getRedisClient();
  const message: E2EReportMessage = {
    date,
    requestId,
  };

  await client.publish('e2e:report:generate', JSON.stringify(message));
  Logger.debug('[E2E Report Publisher] Published report request', { date });
}
