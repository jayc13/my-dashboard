import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import config from 'config';
import runReportE2EJob from '@/jobs/report-e2e.job';
import isPrApprovedJob from '@/jobs/is-pr-approved.job';
import manualTicketsReminderJob from '@/jobs/manualTicketsReminder.job';
import prReminderJob from '@/jobs/pr-reminder.job';
import { testRedisConnection } from '@/utils/redis';
import { getSDK } from '@/utils/sdk';

dotenv.config({ quiet: true });

/**
 * Get cron schedules from config
 * Lazy loading to avoid node-config strict mode warnings
 */
function getSchedules() {
  return {
    reportE2E: config.get<string>('jobs.report_e2e.schedule'),
    isPrApproved: config.get<string>('jobs.is_pr_approved.schedule'),
    manualTicketsReminder: config.get<string>('jobs.manual_tickets_reminder.schedule'),
    prReminder: config.get<string>('jobs.pr_reminder.schedule'),
  };
}

/**
 * Initialize and schedule all cron jobs
 */
function initializeCronJobs() {
  const schedules = getSchedules();

  console.log(`Starting E2E Report cron job with schedule: ${schedules.reportE2E}`);
  // Schedule the report job
  cron.schedule(schedules.reportE2E, async () => {
    console.log(`Running E2E Report job at ${new Date().toISOString()}`);
    await runReportE2EJob();
  });

  console.log(`Starting checking for PRs approved cron job with schedule: ${schedules.isPrApproved}`);
  // Schedule the report job
  cron.schedule(schedules.isPrApproved, async () => {
    console.log(`Checking if there are PRs approved at ${new Date().toISOString()}`);
    await isPrApprovedJob();
  });

  console.log(`Starting checking for Manual Testing tickets job with schedule: ${schedules.manualTicketsReminder}`);
  // Schedule the report job
  cron.schedule(schedules.manualTicketsReminder, async () => {
    console.log(`Checking if there are Manual Testing to do today: ${new Date().toISOString()}`);
    await manualTicketsReminderJob();
  });

  console.log(`Starting PR reminder job with schedule: ${schedules.prReminder}`);
  // Schedule the PR reminder job
  cron.schedule(schedules.prReminder, async () => {
    console.log(`Checking for old PRs at ${new Date().toISOString()}`);
    await prReminderJob();
  });
}

const healthCheckAPI = async () => {
  console.log('API Health Check started');
  try {
    const sdk = await getSDK();
    const health = await sdk.health.getHealthStatus();
    if (health.status === 'ok') {
      console.log('Connection to API successful');
    } else {
      console.log('Connection to API failure');
    }
  } catch (error) {
    console.error('API Health Check failed:', error);
    console.log('Connection to API failure');
  }
};

const validateRedisConnection = async () => {
  const isConnectionSuccessful = await testRedisConnection();
  if (isConnectionSuccessful) {
    console.log('Redis connection successful');
  } else {
    console.log('Redis connection failure');
  }
};

// Initialize cron jobs
initializeCronJobs();

// Run health checks
healthCheckAPI().then();
validateRedisConnection().then();
