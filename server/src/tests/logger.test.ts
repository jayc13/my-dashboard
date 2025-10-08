/**
 * Logger Tests
 * 
 * Tests for Logger utility
 */

import { Logger } from '../utils/logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('info', () => {
    it('should log info message', () => {
      Logger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log info message with metadata', () => {
      Logger.info('Test info message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      Logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error message with metadata', () => {
      Logger.error('Test error message', { key: 'value' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      Logger.warn('Test warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log warning message with metadata', () => {
      Logger.warn('Test warning message', { key: 'value' });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      Logger.debug('Test debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should log debug message with metadata', () => {
      Logger.debug('Test debug message', { key: 'value' });
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  describe('http', () => {
    it('should log http message', () => {
      Logger.http('Test http message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log http message with metadata', () => {
      Logger.http('Test http message', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});

