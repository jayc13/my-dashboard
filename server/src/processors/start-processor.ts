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
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

let e2eProcessor: E2EReportProcessor | null = null;
let notificationProcessor: NotificationProcessor | null = null;

/**
 * Start all processors
 */
export async function startProcessor() {
  console.log('='.repeat(60));
  console.log('Starting Processors');
  console.log('='.repeat(60));

  try {
    // Test connections
    console.log('\n[Startup] Testing connections...');

    const redisOk = await testRedisConnection();
    if (!redisOk) {
      throw new Error('Redis connection failed');
    }

    const mysqlOk = await testMySQLConnection();
    if (!mysqlOk) {
      throw new Error('MySQL connection failed');
    }

    console.log('[Startup] All connections successful\n');

    // Start E2E Report Processor
    console.log('[Startup] Starting E2E Report Processor...');
    e2eProcessor = E2EReportProcessor.getInstance();
    await e2eProcessor.start();
    console.log('[Startup] E2E Report Processor started\n');

    // Start Notification Processor
    console.log('[Startup] Starting Notification Processor...');
    notificationProcessor = NotificationProcessor.getInstance();
    await notificationProcessor.start();
    console.log('[Startup] Notification Processor started\n');

    console.log('[Startup] All processors are running.\n');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('[Startup] Failed to start processors:', error);
  }
}

