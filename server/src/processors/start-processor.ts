#!/usr/bin/env node

/**
 * Start Processors
 *
 * This script starts all processors that listen for Redis messages:
 * - E2E Report Processor: Generates E2E test reports
 * - Notification Processor: Creates notifications
 * - Pull Request Processor: Handles pull request operations
 *
 * Usage:
 *   npm run processor
 *   or
 *   node dist/processor/start-processor.js
 */

import { E2EReportProcessor } from './e2e_report.processor';
import { NotificationProcessor } from './notification.processor';
import { PullRequestProcessor } from './pull-request.processor';
import { testRedisConnection } from '../config/redis';
import { testMySQLConnection } from '../db/mysql';
import { Logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

let e2eProcessor: E2EReportProcessor | null = null;
let notificationProcessor: NotificationProcessor | null = null;
let pullRequestProcessor: PullRequestProcessor | null = null;

/**
 * Start all processors
 */
export async function startProcessor() {
  Logger.debug('='.repeat(60));
  Logger.debug('Starting Processors');
  Logger.debug('='.repeat(60));

  try {
    // Test connections
    Logger.debug('[Startup] Testing connections...');

    const redisOk = await testRedisConnection();
    if (!redisOk) {
      throw new Error('Redis connection failed');
    }

    const mysqlOk = await testMySQLConnection();
    if (!mysqlOk) {
      throw new Error('MySQL connection failed');
    }

    Logger.debug('[Startup] All connections successful');

    // Start E2E Report Processor
    Logger.debug('[Startup] Starting E2E Report Processor...');
    e2eProcessor = E2EReportProcessor.getInstance();
    await e2eProcessor.start();
    Logger.debug('[Startup] E2E Report Processor started');

    // Start Notification Processor
    Logger.debug('[Startup] Starting Notification Processor...');
    notificationProcessor = NotificationProcessor.getInstance();
    await notificationProcessor.start();
    Logger.debug('[Startup] Notification Processor started');

    // Start Pull Request Processor
    Logger.debug('[Startup] Starting Pull Request Processor...');
    pullRequestProcessor = PullRequestProcessor.getInstance();
    await pullRequestProcessor.start();
    Logger.debug('[Startup] Pull Request Processor started');

    Logger.debug('[Startup] All processors are running');
    Logger.debug('='.repeat(60));
  } catch (error) {
    Logger.error('[Startup] Failed to start processors', { error });
  }
}

