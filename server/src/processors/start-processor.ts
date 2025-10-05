#!/usr/bin/env node

/**
 * Start Processors
 *
 * This script starts all processors that listen for Redis messages:
 * - E2E Report Processor: Generates E2E test reports
 * - Notification Processor: Creates notifications
 *
 * Usage:
 *   npm run processor
 *   or
 *   node dist/processor/start-processor.js
 */

import { E2EReportProcessor } from './e2e_report.processor';
import { NotificationProcessor } from './notification.processor';
import { testRedisConnection } from '../config/redis';
import { testMySQLConnection } from '../db/mysql';
import { Logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

let e2eProcessor: E2EReportProcessor | null = null;
let notificationProcessor: NotificationProcessor | null = null;

/**
 * Start all processors
 */
export async function startProcessor() {
  Logger.info('='.repeat(60));
  Logger.info('Starting Processors');
  Logger.info('='.repeat(60));

  try {
    // Test connections
    Logger.info('[Startup] Testing connections...');

    const redisOk = await testRedisConnection();
    if (!redisOk) {
      throw new Error('Redis connection failed');
    }

    const mysqlOk = await testMySQLConnection();
    if (!mysqlOk) {
      throw new Error('MySQL connection failed');
    }

    Logger.info('[Startup] All connections successful');

    // Start E2E Report Processor
    Logger.info('[Startup] Starting E2E Report Processor...');
    e2eProcessor = E2EReportProcessor.getInstance();
    await e2eProcessor.start();
    Logger.info('[Startup] E2E Report Processor started');

    // Start Notification Processor
    Logger.info('[Startup] Starting Notification Processor...');
    notificationProcessor = NotificationProcessor.getInstance();
    await notificationProcessor.start();
    Logger.info('[Startup] Notification Processor started');

    Logger.info('[Startup] All processors are running');
    Logger.info('='.repeat(60));
  } catch (error) {
    Logger.error('[Startup] Failed to start processors', { error });
  }
}

