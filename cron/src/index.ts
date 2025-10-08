import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import config from 'config';
import runReportE2EJob from '@/jobs/report-e2e.job';
import pullRequestsManagementJob from '@/jobs/pull-requests-management.job';
import manualTicketsReminderJob from '@/jobs/manualTicketsReminder.job';
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
    pullRequestsManagement: config.get<string>('jobs.pull_requests_management.schedule'),
    manualTicketsReminder: config.get<string>('jobs.manual_tickets_reminder.schedule'),
  };
}

/**
 * Initialize and schedule all cron jobs
 */
function initializeCronJobs() {
  const schedules = getSchedules();

  console.log(`Starting E2E Report cron job with schedule: ${schedules.reportE2E}`);
  // Schedule the E2E report job
  cron.schedule(schedules.reportE2E, async () => {
    console.log(`Running E2E Report job at ${new Date().toISOString()}`);
    await runReportE2EJob();
  });

  console.log(`Starting Pull Requests Management cron job with schedule: ${schedules.pullRequestsManagement}`);
  // Schedule the unified PR management job (combines is-pr-approved, pr-reminder, and delete-merged-prs)
  cron.schedule(schedules.pullRequestsManagement, async () => {
    console.log(`Running Pull Requests Management job at ${new Date().toISOString()}`);
    await pullRequestsManagementJob();
  });

  console.log(`Starting checking for Manual Testing tickets job with schedule: ${schedules.manualTicketsReminder}`);
  // Schedule the manual tickets reminder job
  cron.schedule(schedules.manualTicketsReminder, async () => {
    console.log(`Checking if there are Manual Testing to do today: ${new Date().toISOString()}`);
    await manualTicketsReminderJob();
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
