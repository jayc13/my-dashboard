/**
 * Manual Tickets Reminder Job Tests
 *
 * Tests for the manual tickets reminder job including:
 * - Job execution
 * - Basic functionality
 * - Error handling
 * - API fetch mocking
 * - Notification publishing
 */

// Mock apiFetch
const mockApiFetch = jest.fn();
jest.mock('../src/utils/helpers', () => ({
  apiFetch: mockApiFetch,
}));

// Mock publishNotificationRequest
const mockPublishNotificationRequest = jest.fn();
jest.mock('../src/jobs/notification.job', () => ({
  publishNotificationRequest: mockPublishNotificationRequest,
}));

jest.mock('../src/utils/constants', () => ({
  API_BASE_URL: 'http://localhost:3000',
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
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: [] }),
      });

      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
    });

    it('should log checking message', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: [] }),
      });

      const consoleSpy = jest.spyOn(console, 'log');

      await manualTicketsReminderJob();

      expect(consoleSpy).toHaveBeenCalledWith('Checking for Manual Testing tickets...');
    });

    it('should complete successfully', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: [] }),
      });

      const result = await manualTicketsReminderJob();

      expect(result).toBeUndefined();
    });
  });

  describe('Job Behavior', () => {
    it('should be a function', () => {
      expect(typeof manualTicketsReminderJob).toBe('function');
    });

    it('should return a promise', () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: [] }),
      });

      const result = manualTicketsReminderJob();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should be callable multiple times', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: [] }),
      });

      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
      await expect(manualTicketsReminderJob()).resolves.not.toThrow();
    });
  });

  describe('API Fetch', () => {
    it('should fetch manual QA tickets from API', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: [] }),
      });

      await manualTicketsReminderJob();

      expect(mockApiFetch).toHaveBeenCalledWith('http://localhost:3000/api/jira/manual_qa');
    });

    it('should handle API response with issues', async () => {
      const mockIssues = [
        { id: 1, key: 'TEST-1', summary: 'Test issue 1' },
        { id: 2, key: 'TEST-2', summary: 'Test issue 2' },
      ];

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: mockIssues }),
      });

      mockPublishNotificationRequest.mockResolvedValueOnce(undefined);

      await manualTicketsReminderJob();

      expect(mockApiFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notification Publishing', () => {
    it('should not publish notification when no tickets found', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: [] }),
      });

      await manualTicketsReminderJob();

      expect(mockPublishNotificationRequest).not.toHaveBeenCalled();
    });

    it('should publish notification when tickets found', async () => {
      const mockIssues = [
        { id: 1, key: 'TEST-1', summary: 'Test issue 1' },
      ];

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: mockIssues }),
      });

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
        { id: 1, key: 'TEST-1', summary: 'Test issue 1' },
        { id: 2, key: 'TEST-2', summary: 'Test issue 2' },
        { id: 3, key: 'TEST-3', summary: 'Test issue 3' },
      ];

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: mockIssues }),
      });

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
        { id: 1, key: 'TEST-1', summary: 'Test issue 1' },
      ];

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: mockIssues }),
      });

      mockPublishNotificationRequest.mockRejectedValueOnce(new Error('Redis connection failed'));

      await expect(manualTicketsReminderJob()).rejects.toThrow('Redis connection failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle API fetch errors', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(manualTicketsReminderJob()).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(manualTicketsReminderJob()).rejects.toThrow('Invalid JSON');
    });
  });
});

export {};
