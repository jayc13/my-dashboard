/**
 * Logger Tests
 *
 * Tests for Logger utility
 */

// Need to unmock Logger for this test file
jest.unmock('../../utils/logger');

describe('Logger', () => {
  // Import logger after unmocking
  let Logger: any;

  beforeAll(() => {
    // Import the actual logger module
    Logger = require('../../utils/logger').Logger;
  });

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
      Logger.error('Test with metadata', { error: new Error('test') });
      Logger.warn('Test with metadata', { key: 'value' });
      Logger.debug('Test with metadata', { key: 'value' });
      Logger.http('Test with metadata', { key: 'value' });
    });

    it('should create child logger', () => {
      const childLogger = Logger.child({ module: 'test' });
      expect(childLogger).toBeDefined();
      expect(typeof childLogger).toBe('object');
    });

    it('should get winston logger instance', () => {
      const winstonLogger = Logger.getWinstonLogger();
      expect(winstonLogger).toBeDefined();
      expect(typeof winstonLogger).toBe('object');
      expect(winstonLogger.level).toBeDefined();
    });
  });

  describe('Log level configuration', () => {
    it('should have a log level configured', () => {
      const winstonLogger = Logger.getWinstonLogger();
      expect(winstonLogger.level).toBeDefined();
      expect(typeof winstonLogger.level).toBe('string');
    });

    it('should have transports configured', () => {
      const winstonLogger = Logger.getWinstonLogger();
      expect(winstonLogger.transports).toBeDefined();
      expect(Array.isArray(winstonLogger.transports)).toBe(true);
      expect(winstonLogger.transports.length).toBeGreaterThan(0);
    });

    it('should use info level in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      delete process.env.LOG_LEVEL;

      jest.isolateModules(() => {
        const { Logger: TestLogger } = require('../../utils/logger');
        const winstonLogger = TestLogger.getWinstonLogger();
        expect(winstonLogger.level).toBe('info');
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should use error level in test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.NODE_ENV = 'test';
      delete process.env.LOG_LEVEL;

      jest.isolateModules(() => {
        const { Logger: TestLogger } = require('../../utils/logger');
        const winstonLogger = TestLogger.getWinstonLogger();
        expect(winstonLogger.level).toBe('error');
      });

      process.env.NODE_ENV = originalEnv;
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      }
    });

    it('should use debug level in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      delete process.env.LOG_LEVEL;

      jest.isolateModules(() => {
        const { Logger: TestLogger } = require('../../utils/logger');
        const winstonLogger = TestLogger.getWinstonLogger();
        expect(winstonLogger.level).toBe('debug');
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should use custom LOG_LEVEL when set', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'warn';

      jest.isolateModules(() => {
        const { Logger: TestLogger } = require('../../utils/logger');
        const winstonLogger = TestLogger.getWinstonLogger();
        expect(winstonLogger.level).toBe('warn');
      });

      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });
  });

  describe('Error handling with stack traces', () => {
    it('should handle errors with stack traces', () => {
      const error = new Error('Test error with stack');
      // This should trigger the stack trace formatting
      Logger.error('Error with stack', { error });
      expect(true).toBe(true); // Just verify it doesn't throw
    });
  });
});

