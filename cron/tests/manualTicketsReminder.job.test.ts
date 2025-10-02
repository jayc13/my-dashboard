/**
 * Manual Tickets Reminder Job Tests
 * 
 * Tests for the manual tickets reminder job including:
 * - Job execution
 * - Basic functionality
 * - Error handling
 */

describe('Manual Tickets Reminder Job', () => {
  let manualTicketsReminderJob: () => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    const jobModule = require('../src/jobs/manualTicketsReminder.job');
    manualTicketsReminderJob = jobModule.default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Job Execution', () => {
    it('should execute without errors', async () => {
      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
    });

    it('should log checking message', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await manualTicketsReminderJob();

      expect(consoleSpy).toHaveBeenCalledWith('Checking for Manual Testing tickets...');
    });

    it('should complete successfully', async () => {
      const result = await manualTicketsReminderJob();

      expect(result).toBeUndefined();
    });
  });

  describe('Job Behavior', () => {
    it('should be a function', () => {
      expect(typeof manualTicketsReminderJob).toBe('function');
    });

    it('should return a promise', () => {
      const result = manualTicketsReminderJob();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should be callable multiple times', async () => {
      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
    });
  });
});

export {};
