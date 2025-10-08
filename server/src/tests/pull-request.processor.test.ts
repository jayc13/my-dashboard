/**
 * Pull Request Processor Tests
 * 
 * Tests for PullRequestProcessor
 */

import { PullRequestProcessor } from '../processors/pull-request.processor';

// Mock dependencies
jest.mock('../config/redis', () => ({
  getRedisSubscriber: jest.fn(() => ({
    subscribe: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  })),
}));

jest.mock('../services/pull_request.service');

describe('PullRequestProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PullRequestProcessor.getInstance();
      const instance2 = PullRequestProcessor.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('start', () => {
    it('should start listening for messages', async () => {
      const processor = PullRequestProcessor.getInstance();
      const mockRedis = require('../config/redis').getRedisSubscriber();

      await processor.start();

      expect(mockRedis.subscribe).toHaveBeenCalledWith('pull-request:delete');
      expect(mockRedis.on).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  describe('stop', () => {
    it('should stop listening for messages', async () => {
      const processor = PullRequestProcessor.getInstance();
      const mockRedis = require('../config/redis').getRedisSubscriber();

      await processor.stop();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });
});

