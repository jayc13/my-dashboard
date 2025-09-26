import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import config from 'config';
// import runReportE2EJob from './jobs/report-e2e.job';
// import isPrApprovedJob from './jobs/is-pr-approved.job';
// import manualTicketsReminderJob from './jobs/manualTicketsReminder.job';
import cleanUpDataFilesJob from './jobs/clean-up-data-files.job';

dotenv.config({ quiet: true });

// Get cron schedule from config
// const reportE2ESchedule: string = config.get('jobs.report_e2e.schedule');
// const isPrApprovedSchedule: string = config.get('jobs.is_pr_approved.schedule');
// const manualTicketsReminderSchedule: string = config.get('jobs.manual_tickets_reminder.schedule');
const cleanUpDataFilesSchedule: string = config.get('jobs.clean_up_old_reports.schedule');


/*console.log(`Starting E2E Report cron job with schedule: ${reportE2ESchedule}`);
// Schedule the report job
cron.schedule(reportE2ESchedule, async () => {
  console.log(`Running E2E Report job at ${new Date().toISOString()}`);
  await runReportE2EJob();
});*/

/*console.log(`Starting checking for PRs approved cron job with schedule: ${isPrApprovedSchedule}`);
// Schedule the report job
cron.schedule(isPrApprovedSchedule, async () => {
  console.log(`Checking if there are PRs approved at ${new Date().toISOString()}`);
  await isPrApprovedJob();
});*/

/*console.log(`Starting checking for Manual Testing tickets job with schedule: ${isPrApprovedSchedule}`);
// Schedule the report job
cron.schedule(manualTicketsReminderSchedule, async () => {
  console.log(`Checking if there are Manual Testing to do today: ${new Date().toISOString()}`);
  await manualTicketsReminderJob();
});*/

console.log(`Starting clean up of old E2E reports the : ${cleanUpDataFilesSchedule}`);
// Schedule the report job
cron.schedule(cleanUpDataFilesSchedule, async () => {
  console.log(`Removing old reports and data files: ${new Date().toISOString()}`);
  await cleanUpDataFilesJob();
});

const healthCheckAPI = async () => {
  console.log('API Health Check started');
  const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
  console.log(`API Base URL: ${API_BASE_URL}`);
  const result = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (result.ok) {
    console.log('Connection to API successful');
  } else {
    console.log('Connection to API failure');
  }
};

healthCheckAPI().then();
