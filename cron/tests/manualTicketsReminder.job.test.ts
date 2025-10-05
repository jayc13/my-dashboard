/**
 * Manual Tickets Reminder Job Tests
 *
 * Tests for the manual tickets reminder job including:
 * - Job execution
 * - Basic functionality
 * - Error handling
 * - SDK mocking
 * - Notification publishing
 */

// Mock SDK
const mockGetManualQATasks = jest.fn();

jest.mock('../src/utils/sdk', () => ({
  getSDK: jest.fn(() => ({
    jira: {
      getManualQATasks: mockGetManualQATasks,
    },
  })),
}));

// Mock publishNotificationRequest
const mockPublishNotificationRequest = jest.fn();
jest.mock('../src/services/notification.service', () => ({
  publishNotificationRequest: mockPublishNotificationRequest,
}));

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
    it('should execute without errors when no tickets found', async () => {
      mockGetManualQATasks.mockResolvedValueOnce({ issues: [], total: 0 });

      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
    });

    it('should log checking message', async () => {
      mockGetManualQATasks.mockResolvedValueOnce({ issues: [], total: 0 });

      const consoleSpy = jest.spyOn(console, 'log');

      await manualTicketsReminderJob();

      expect(consoleSpy).toHaveBeenCalledWith('Checking for Manual Testing tickets...');
    });

    it('should complete successfully', async () => {
      mockGetManualQATasks.mockResolvedValueOnce({ issues: [], total: 0 });

      const result = await manualTicketsReminderJob();

      expect(result).toBeUndefined();
    });
  });

  describe('Job Behavior', () => {
    it('should be a function', () => {
      expect(typeof manualTicketsReminderJob).toBe('function');
    });

    it('should return a promise', () => {
      mockGetManualQATasks.mockResolvedValueOnce({ issues: [], total: 0 });

      const result = manualTicketsReminderJob();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should be callable multiple times', async () => {
      mockGetManualQATasks.mockResolvedValue({ issues: [], total: 0 });

      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
    });
  });

  describe('SDK Fetch', () => {
    it('should fetch manual QA tickets from SDK', async () => {
      mockGetManualQATasks.mockResolvedValueOnce({ issues: [], total: 0 });

      await manualTicketsReminderJob();

      expect(mockGetManualQATasks).toHaveBeenCalled();
    });

    it('should handle SDK response with issues', async () => {
      const mockIssues = [
        { id: '1', key: 'TEST-1', summary: 'Test issue 1' },
        { id: '2', key: 'TEST-2', summary: 'Test issue 2' },
      ];

      mockGetManualQATasks.mockResolvedValueOnce({ issues: mockIssues, total: 2 });

      mockPublishNotificationRequest.mockResolvedValueOnce(undefined);

      await manualTicketsReminderJob();

      expect(mockGetManualQATasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notification Publishing', () => {
    it('should not publish notification when no tickets found', async () => {
      mockGetManualQATasks.mockResolvedValueOnce({ issues: [], total: 0 });

      await manualTicketsReminderJob();

      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
    });

    it('should publish notification when tickets found', async () => {
      const mockIssues = [
        { id: '1', key: 'TEST-1', summary: 'Test issue 1' },
      ];

      mockGetManualQATasks.mockResolvedValueOnce({ issues: mockIssues, total: 1 });

      mockPublishNotificationRequest.mockResolvedValueOnce(undefined);

      await manualTicketsReminderJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledWith({
        title: 'Manual Testing Tickets - Reminder',
        message: 'There is 1 ticket that needs attention.',
        type: 'warning',
        link: '/',
      });
    });

    it('should publish notification with plural message for multiple tickets', async () => {
      const mockIssues = [
        { id: '1', key: 'TEST-1', summary: 'Test issue 1' },
        { id: '2', key: 'TEST-2', summary: 'Test issue 2' },
        { id: '3', key: 'TEST-3', summary: 'Test issue 3' },
      ];

      mockGetManualQATasks.mockResolvedValueOnce({ issues: mockIssues, total: 3 });

      mockPublishNotificationRequest.mockResolvedValueOnce(undefined);

      await manualTicketsReminderJob();

      expect(mockPublishNotificationRequest).toHaveBeenCalledWith({
        title: 'Manual Testing Tickets - Reminder',
        message: 'There are 3 tickets that need attention.',
        type: 'warning',
        link: '/',
      });
    });

    it('should handle notification publishing errors', async () => {
      const mockIssues = [
        { id: '1', key: 'TEST-1', summary: 'Test issue 1' },
      ];

      mockGetManualQATasks.mockResolvedValueOnce({ issues: mockIssues, total: 1 });

      mockPublishNotificationRequest.mockRejectedValueOnce(new Error('Redis connection failed'));

      await expect(manualTicketsReminderJob()).rejects.toThrow('Redis connection failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle SDK fetch errors', async () => {
      mockGetManualQATasks.mockRejectedValueOnce(new Error('Network error'));

      await expect(manualTicketsReminderJob()).rejects.toThrow('Network error');
    });

    it('should handle SDK response errors', async () => {
      mockGetManualQATasks.mockRejectedValueOnce(new Error('Invalid response'));

      await expect(manualTicketsReminderJob()).rejects.toThrow('Invalid response');
    });
  });
});

export {};
