/**
 * Configuration Tests
 *
 * Tests for the cron job configuration including:
 * - Default schedules
 * - Environment variable overrides
 * - Schedule format validation
 */

describe('Cron Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear module cache to reload config
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Default Schedules', () => {
    it('should have default schedule for E2E report job', () => {
      delete process.env.E2E_REPORT_CRON_SCHEDULE;
      
      const config = require('../config/default');
      
      expect(config.jobs.report_e2e.schedule).toBe('0 9 * * *');
    });

    it('should have default schedule for PR management job', () => {
      delete process.env.PR_MANAGEMENT_SCHEDULE;
      
      const config = require('../config/default');
      
      expect(config.jobs.pull_requests_management.schedule).toBe('0 9 * * 1-5');
    });

    it('should have default schedule for manual tickets reminder job', () => {
      delete process.env.MANUAL_TICKETS_REMINDER_SCHEDULE;
      
      const config = require('../config/default');
      
      expect(config.jobs.manual_tickets_reminder.schedule).toBe('0 9 * * 1-5');
    });

    it('should have default schedule for delete completed todos job', () => {
      delete process.env.DELETE_COMPLETED_TODOS_SCHEDULE;
      
      const config = require('../config/default');
      
      expect(config.jobs.delete_completed_todos.schedule).toBe('0 2 * * 0');
    });
  });

  describe('Environment Variable Overrides', () => {
    it('should use environment variable for E2E report schedule', () => {
      process.env.E2E_REPORT_CRON_SCHEDULE = '0 10 * * *';
      
      const config = require('../config/default');
      
      expect(config.jobs.report_e2e.schedule).toBe('0 10 * * *');
    });

    it('should use environment variable for PR management schedule', () => {
      process.env.PR_MANAGEMENT_SCHEDULE = '0 11 * * *';
      
      const config = require('../config/default');
      
      expect(config.jobs.pull_requests_management.schedule).toBe('0 11 * * *');
    });

    it('should use environment variable for manual tickets reminder schedule', () => {
      process.env.MANUAL_TICKETS_REMINDER_SCHEDULE = '0 12 * * *';
      
      const config = require('../config/default');
      
      expect(config.jobs.manual_tickets_reminder.schedule).toBe('0 12 * * *');
    });

    it('should use environment variable for delete completed todos schedule', () => {
      process.env.DELETE_COMPLETED_TODOS_SCHEDULE = '0 3 * * 1';
      
      const config = require('../config/default');
      
      expect(config.jobs.delete_completed_todos.schedule).toBe('0 3 * * 1');
    });
  });

  describe('Configuration Structure', () => {
    it('should have jobs object', () => {
      const config = require('../config/default');
      
      expect(config).toHaveProperty('jobs');
      expect(typeof config.jobs).toBe('object');
    });

    it('should have all required job configurations', () => {
      const config = require('../config/default');
      
      expect(config.jobs).toHaveProperty('report_e2e');
      expect(config.jobs).toHaveProperty('pull_requests_management');
      expect(config.jobs).toHaveProperty('manual_tickets_reminder');
      expect(config.jobs).toHaveProperty('delete_completed_todos');
    });

    it('should have schedule property for each job', () => {
      const config = require('../config/default');
      
      expect(config.jobs.report_e2e).toHaveProperty('schedule');
      expect(config.jobs.pull_requests_management).toHaveProperty('schedule');
      expect(config.jobs.manual_tickets_reminder).toHaveProperty('schedule');
      expect(config.jobs.delete_completed_todos).toHaveProperty('schedule');
    });

    it('should export a valid module', () => {
      const config = require('../config/default');
      
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });
  });

  describe('Schedule Format Validation', () => {
    it('should have valid cron expression for E2E report (daily at 9AM)', () => {
      const config = require('../config/default');
      const schedule = config.jobs.report_e2e.schedule;
      
      // Cron format: minute hour day month weekday
      const parts = schedule.split(' ');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toBe('0'); // minute
      expect(parts[1]).toBe('9'); // hour
    });

    it('should have valid cron expression for PR management (weekdays at 9AM)', () => {
      const config = require('../config/default');
      const schedule = config.jobs.pull_requests_management.schedule;
      
      const parts = schedule.split(' ');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toBe('0'); // minute
      expect(parts[1]).toBe('9'); // hour
      expect(parts[4]).toBe('1-5'); // weekdays
    });

    it('should have valid cron expression for manual tickets reminder (weekdays at 9AM)', () => {
      const config = require('../config/default');
      const schedule = config.jobs.manual_tickets_reminder.schedule;
      
      const parts = schedule.split(' ');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toBe('0'); // minute
      expect(parts[1]).toBe('9'); // hour
      expect(parts[4]).toBe('1-5'); // weekdays
    });

    it('should have valid cron expression for delete completed todos (Sundays at 2AM)', () => {
      const config = require('../config/default');
      const schedule = config.jobs.delete_completed_todos.schedule;
      
      const parts = schedule.split(' ');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toBe('0'); // minute
      expect(parts[1]).toBe('2'); // hour
      expect(parts[4]).toBe('0'); // Sunday
    });
  });

  describe('Schedule Semantics', () => {
    it('should schedule E2E report daily', () => {
      const config = require('../config/default');
      const schedule = config.jobs.report_e2e.schedule;
      
      const parts = schedule.split(' ');
      expect(parts[2]).toBe('*'); // every day
      expect(parts[3]).toBe('*'); // every month
    });

    it('should schedule PR management on weekdays only', () => {
      const config = require('../config/default');
      const schedule = config.jobs.pull_requests_management.schedule;
      
      const parts = schedule.split(' ');
      expect(parts[4]).toBe('1-5'); // Monday to Friday
    });

    it('should schedule manual tickets reminder on weekdays only', () => {
      const config = require('../config/default');
      const schedule = config.jobs.manual_tickets_reminder.schedule;
      
      const parts = schedule.split(' ');
      expect(parts[4]).toBe('1-5'); // Monday to Friday
    });

    it('should schedule delete completed todos weekly on Sundays', () => {
      const config = require('../config/default');
      const schedule = config.jobs.delete_completed_todos.schedule;
      
      const parts = schedule.split(' ');
      expect(parts[4]).toBe('0'); // Sunday
      expect(parts[2]).toBe('*'); // every week
    });
  });

  describe('Multiple Environment Variables', () => {
    it('should handle multiple environment variables simultaneously', () => {
      process.env.E2E_REPORT_CRON_SCHEDULE = '0 8 * * *';
      process.env.PR_MANAGEMENT_SCHEDULE = '0 10 * * 1-5';
      process.env.MANUAL_TICKETS_REMINDER_SCHEDULE = '0 11 * * 1-5';
      process.env.DELETE_COMPLETED_TODOS_SCHEDULE = '0 4 * * 0';
      
      const config = require('../config/default');
      
      expect(config.jobs.report_e2e.schedule).toBe('0 8 * * *');
      expect(config.jobs.pull_requests_management.schedule).toBe('0 10 * * 1-5');
      expect(config.jobs.manual_tickets_reminder.schedule).toBe('0 11 * * 1-5');
      expect(config.jobs.delete_completed_todos.schedule).toBe('0 4 * * 0');
    });

    it('should use defaults for unset environment variables', () => {
      process.env.E2E_REPORT_CRON_SCHEDULE = '0 8 * * *';
      delete process.env.PR_MANAGEMENT_SCHEDULE;
      delete process.env.MANUAL_TICKETS_REMINDER_SCHEDULE;
      delete process.env.DELETE_COMPLETED_TODOS_SCHEDULE;
      
      const config = require('../config/default');
      
      expect(config.jobs.report_e2e.schedule).toBe('0 8 * * *');
      expect(config.jobs.pull_requests_management.schedule).toBe('0 9 * * 1-5');
      expect(config.jobs.manual_tickets_reminder.schedule).toBe('0 9 * * 1-5');
      expect(config.jobs.delete_completed_todos.schedule).toBe('0 2 * * 0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string environment variables', () => {
      process.env.DELETE_COMPLETED_TODOS_SCHEDULE = '';
      
      const config = require('../config/default');
      
      // Empty string is falsy, so should use default
      expect(config.jobs.delete_completed_todos.schedule).toBe('0 2 * * 0');
    });

    it('should handle whitespace-only environment variables', () => {
      process.env.DELETE_COMPLETED_TODOS_SCHEDULE = '   ';
      
      const config = require('../config/default');
      
      // Whitespace is truthy, so it will be used (even if invalid)
      expect(config.jobs.delete_completed_todos.schedule).toBe('   ');
    });

    it('should preserve custom cron expressions from environment', () => {
      // Every 15 minutes
      process.env.DELETE_COMPLETED_TODOS_SCHEDULE = '*/15 * * * *';
      
      const config = require('../config/default');
      
      expect(config.jobs.delete_completed_todos.schedule).toBe('*/15 * * * *');
    });
  });
});

export {};

