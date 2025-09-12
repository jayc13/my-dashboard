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
    clean_up_old_reports: {
      schedule: process.env.CLEAN_UP_OLD_REPORTS_CRON_SCHEDULE || '0 3 * * 0', // Weekly at 3AM on Sundays
    },
  },
};