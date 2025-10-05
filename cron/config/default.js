'use strict';
require('dotenv').config();


module.exports = {
  jobs: {
    report_e2e: {
      schedule: process.env.E2E_REPORT_CRON_SCHEDULE || '0 9 * * *', // Daily at 9AM
    },
    is_pr_approved: {
      schedule: process.env.IS_PR_APPROVED_CRON_SCHEDULE || '0 9 * * 1-5', // Daily at 9AM on weekdays
    },
    manual_tickets_reminder: {
      schedule: process.env.MANUAL_TICKETS_REMINDER_SCHEDULE || '0 9 * * 1-5', // Daily at 9AM on weekdays
    },
    pr_reminder: {
      schedule: process.env.PR_REMINDER_SCHEDULE || '0 10 * * 1-5', // Daily at 10AM on weekdays
    },
  },
};