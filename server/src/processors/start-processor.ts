#!/usr/bin/env node

/**
 * Start E2E Report Processor
 * 
 * This script starts the E2E report processor that listens for Redis messages
 * and generates reports using the E2ERunReportService.
 * 
 * Usage:
 *   npm run processor
 *   or
 *   node dist/processor/start-processor.js
 */

import { E2EReportProcessor } from './e2e_report.processor';
import { testRedisConnection } from '../config/redis';
import { testMySQLConnection } from '../db/mysql';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

let processor: E2EReportProcessor | null = null;

/**
 * Start the startProcessor
 */
export async function startProcessor() {
  console.log('='.repeat(60));
  console.log('E2E Report Processor');
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

    // Start processor
    processor = E2EReportProcessor.getInstance();
    await processor.start();

    console.log('\n[Startup] Processor is running.\n');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('[Startup] Failed to start processor:', error);
  }
}

