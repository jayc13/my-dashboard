/**
 * Logger Tests
 *
 * Tests for Logger utility
 */

import { Logger } from '../../utils/logger';

describe('Logger', () => {
  describe('Logger methods', () => {
    it('should have info method', () => {
      expect(typeof Logger.info).toBe('function');
      Logger.info('Test info message');
    });

    it('should have error method', () => {
      expect(typeof Logger.error).toBe('function');
      Logger.error('Test error message');
    });

    it('should have warn method', () => {
      expect(typeof Logger.warn).toBe('function');
      Logger.warn('Test warning message');
    });

    it('should have debug method', () => {
      expect(typeof Logger.debug).toBe('function');
      Logger.debug('Test debug message');
    });

    it('should have http method', () => {
      expect(typeof Logger.http).toBe('function');
      Logger.http('Test http message');
    });

    it('should handle metadata', () => {
      Logger.info('Test with metadata', { key: 'value' });
      Logger.error('Test with metadata', { key: 'value' });
      Logger.warn('Test with metadata', { key: 'value' });
      Logger.debug('Test with metadata', { key: 'value' });
      Logger.http('Test with metadata', { key: 'value' });
    });
  });
});

