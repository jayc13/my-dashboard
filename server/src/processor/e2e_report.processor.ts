import { DateTime } from 'luxon';
import { getRedisSubscriber, getRedisClient } from '../config/redis';
import { E2ERunReportService } from '../services/e2e_run_report.service';
import { AppService } from '../services/app.service';
import { CypressDashboardAPI } from '../services/cypress.service';
import { CypressRun } from '@my-dashboard/types/e2e';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Message payload for E2E report generation
 */
export interface E2EReportMessage {
  date: string; // ISO date string in 'YYYY-MM-DD' format
  requestId?: string; // Optional request ID for tracking
  retryCount?: number; // Number of retry attempts
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
  private client: ReturnType<typeof getRedisClient>;
  private isProcessing: boolean = false;
  private readonly CHANNEL_NAME = 'e2e:report:generate';
  private readonly QUEUE_NAME = 'e2e:report:queue';
  private readonly RETRY_QUEUE_NAME = 'e2e:report:retry';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5000; // 5 seconds base delay

  private constructor() {
    this.subscriber = getRedisSubscriber();
    this.client = getRedisClient();
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
    console.log('[E2E Report Processor] Starting...');

    // Subscribe to the channel
    await this.subscriber.subscribe(this.CHANNEL_NAME);
    console.log(`[E2E Report Processor] Subscribed to channel: ${this.CHANNEL_NAME}`);

    // Handle incoming messages
    this.subscriber.on('message', async (channel, message) => {
      if (channel === this.CHANNEL_NAME) {
        await this.handleMessage(message);
      }
    });

    // Also process any existing messages in the queue
    this.processQueue();

    // Start retry queue processor
    this.processRetryQueue();

    console.log('[E2E Report Processor] Started successfully');
  }

  /**
   * Stop the processor
   */
  public async stop(): Promise<void> {
    console.log('[E2E Report Processor] Stopping...');
    await this.subscriber.unsubscribe(this.CHANNEL_NAME);
    console.log('[E2E Report Processor] Stopped');
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: string): Promise<void> {
    try {
      const payload: E2EReportMessage = JSON.parse(message);
      console.log('[E2E Report Processor] Received message:', payload);

      // Add to queue for processing
      await this.client.rpush(this.QUEUE_NAME, message);
      console.log(`[E2E Report Processor] Added to queue: ${payload.date}`);

      // Process the queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    } catch (error) {
      console.error('[E2E Report Processor] Error handling message:', error);
    }
  }

  /**
   * Process messages from the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (true) {
        // Get next message from queue
        const message = await this.client.lpop(this.QUEUE_NAME);

        if (!message) {
          // Queue is empty
          break;
        }

        try {
          const payload: E2EReportMessage = JSON.parse(message);
          await this.generateReport(payload);
        } catch (error) {
          console.error('[E2E Report Processor] Error processing message:', error);

          // Retry logic
          try {
            const payload: E2EReportMessage = JSON.parse(message);
            const retryCount = payload.retryCount || 0;

            if (retryCount < this.MAX_RETRIES) {
              // Schedule retry with exponential backoff
              await this.scheduleRetry(payload, retryCount, error);
            } else {
              // Max retries reached, move to dead letter queue
              console.error(`[E2E Report Processor] Max retries (${this.MAX_RETRIES}) reached for date: ${payload.date}`);
              await this.handleFailedMessage(message, error);
            }
          } catch (parseError) {
            // If we can't parse the message, send to dead letter queue
            console.error('[E2E Report Processor] Failed to parse message for retry:', parseError);
            await this.handleFailedMessage(message, error);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Schedule a retry with exponential backoff
   */
  private async scheduleRetry(payload: E2EReportMessage, currentRetryCount: number, error: unknown): Promise<void> {
    const retryCount = currentRetryCount + 1;
    const retryPayload: E2EReportMessage = {
      ...payload,
      retryCount,
    };

    // Calculate delay with exponential backoff: 5s, 10s, 20s
    const delayMs = this.RETRY_DELAY_MS * Math.pow(2, currentRetryCount);
    const retryAt = Date.now() + delayMs;

    // Store in sorted set with score as timestamp
    const retryData = {
      payload: retryPayload,
      retryAt,
      error: error instanceof Error ? error.message : String(error),
    };

    await this.client.zadd(this.RETRY_QUEUE_NAME, retryAt, JSON.stringify(retryData));

    const delaySeconds = Math.round(delayMs / 1000);
    console.log(`[E2E Report Processor] Retry ${retryCount}/${this.MAX_RETRIES} scheduled for date: ${payload.date} in ${delaySeconds}s`);
  }

  /**
   * Process retry queue - check for messages ready to retry
   */
  private async processRetryQueue(): Promise<void> {
    const processRetries = async () => {
      try {
        const now = Date.now();

        // Get messages that are ready to retry (score <= now)
        const messages = await this.client.zrangebyscore(
          this.RETRY_QUEUE_NAME,
          '-inf',
          now.toString(),
          'LIMIT',
          0,
          10, // Process up to 10 retries at a time
        );

        for (const message of messages) {
          try {
            const retryData = JSON.parse(message);
            const { payload } = retryData;

            // Remove from retry queue
            await this.client.zrem(this.RETRY_QUEUE_NAME, message);

            // Add back to main queue for processing
            await this.client.rpush(this.QUEUE_NAME, JSON.stringify(payload));
            console.log(`[E2E Report Processor] Moving retry to main queue: ${payload.date} (retry ${payload.retryCount}/${this.MAX_RETRIES})`);

            // Trigger queue processing
            if (!this.isProcessing) {
              this.processQueue();
            }
          } catch (error) {
            console.error('[E2E Report Processor] Error processing retry message:', error);
            // Remove invalid message from retry queue
            await this.client.zrem(this.RETRY_QUEUE_NAME, message);
          }
        }
      } catch (error) {
        console.error('[E2E Report Processor] Error in retry queue processor:', error);
      }
    };

    // Check retry queue every 2 seconds
    setInterval(processRetries, 2000);

    // Process immediately on start
    processRetries();
  }

  /**
   * Generate E2E report for the given date
   */
  private async generateReport(payload: E2EReportMessage): Promise<void> {
    const { date, requestId, retryCount = 0 } = payload;
    const logPrefix = requestId ? `[${requestId}]` : '';
    const retryInfo = retryCount > 0 ? ` (Retry ${retryCount}/${this.MAX_RETRIES})` : '';

    console.log(`${logPrefix} [E2E Report Processor] Generating report for date: ${date}${retryInfo}`);

    try {
      // Check if summary already exists
      let summary = await E2ERunReportService.getSummaryByDate(date);

      if (summary) {
        // If summary exists and is ready, skip processing
        if (summary.status === 'ready') {
          console.log(`${logPrefix} [E2E Report Processor] Summary already exists and is ready for ${date}, skipping...`);
          return;
        }
        console.log(`${logPrefix} [E2E Report Processor] Summary already exists for ${date}, updating...`);
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

        console.log(`${logPrefix} [E2E Report Processor] Created summary with ID: ${summary.id}`);
      }

      // Fetch data from Cypress API
      const reportData = await this.fetchCypressData(date);
      console.log(`${logPrefix} [E2E Report Processor] Fetched ${reportData.length} apps data`);

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
          lastRunStatus: appData.lastRunStatus,
          lastFailedRunAt: appData.lastFailedRunAt ? DateTime.fromISO(appData.lastFailedRunAt).toISODate() : null,
          lastRunAt: DateTime.fromISO(appData.lastRunAt).toISODate()!,
        });

        if (detail) {
          totalRuns += appData.totalRuns;
          totalPassed += appData.passedRuns;
          totalFailed += appData.failedRuns;
          console.log(`${logPrefix} [E2E Report Processor] Created detail for app ${appData.appId}`);
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

      console.log(`${logPrefix} [E2E Report Processor] Report generated successfully for ${date}`);
      console.log(`${logPrefix} [E2E Report Processor] Total runs: ${totalRuns}, Passed: ${totalPassed}, Failed: ${totalFailed}, Success rate: ${(successRate * 100).toFixed(2)}%`);

    } catch (error) {
      console.error(`${logPrefix} [E2E Report Processor] Error generating report:`, error);

      // Update summary status to failed
      const summary = await E2ERunReportService.getSummaryByDate(date);
      if (summary) {
        await E2ERunReportService.updateSummary(summary.id, {
          status: 'failed',
        });
      }

      throw error;
    }
  }

  /**
   * Fetch Cypress data for the given date
   */
  private async fetchCypressData(date: string): Promise<Array<{
    appId: number;
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    successRate: number;
    lastRunStatus: string;
    lastFailedRunAt: string | null;
    lastRunAt: string;
  }>> {
    const apiKey = process.env.CYPRESS_API_KEY;

    if (!apiKey) {
      throw new Error('CYPRESS_API_KEY environment variable is not set');
    }

    // Get watching apps from database
    const watchingApps = await AppService.getWatching();

    if (watchingApps.length === 0) {
      console.log('[E2E Report Processor] No watching apps found');
      return [];
    }

    const projectNames = watchingApps.map(app => app.name);
    const api = new CypressDashboardAPI(apiKey);

    // Calculate date range (14 days back from the target date)
    const targetDate = new Date(date);
    const startDate = DateTime.fromJSDate(targetDate).minus({ days: 14 }).toJSDate();

    console.log(`[E2E Report Processor] Fetching data for ${projectNames.length} projects from ${startDate.toISOString().slice(0, 10)} to ${date}`);

    // Fetch data from Cypress API
    const projectData = await api.getDailyRunsPerProject({
      projects: projectNames,
      startDate: DateTime.fromJSDate(startDate).toUTC().toISO()!,
      endDate: DateTime.fromJSDate(targetDate).toUTC().toISO()!,
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
      const app = watchingApps.find(a => a.name === projectName);
      if (!app || !app.id) {
        console.warn(`[E2E Report Processor] App not found for project: ${projectName}`);
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
  private getRunStatus(runs: CypressRun[]): string {
    return runs
      .filter((run) => run.status !== 'noTests')
      .every(r => r.status === 'passed') ? 'passed' : 'failed';
  }

  /**
   * Handle failed message processing
   */
  private async handleFailedMessage(message: string, error: unknown): Promise<void> {
    const deadLetterQueue = 'e2e:report:failed';

    try {
      // Parse message to get retry count
      let retryCount = 0;
      let date = 'unknown';
      try {
        const payload: E2EReportMessage = JSON.parse(message);
        retryCount = payload.retryCount || 0;
        date = payload.date;
      } catch (parseError) {
        // Ignore parse errors, use defaults
        console.error(parseError);
      }

      const failedMessage = {
        message,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        retryCount,
        date,
        timestamp: new Date().toISOString(),
      };

      await this.client.rpush(deadLetterQueue, JSON.stringify(failedMessage));
      console.log(`[E2E Report Processor] Added failed message to dead letter queue (date: ${date}, retries: ${retryCount})`);
    } catch (err) {
      console.error('[E2E Report Processor] Error adding to dead letter queue:', err);
    }
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
  console.log(`[E2E Report Publisher] Published report request for date: ${date}`);
}
