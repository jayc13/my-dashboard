/**
 * Constants Tests
 * 
 * Tests for application constants including:
 * - API_BASE_URL configuration
 * - Environment variable handling
 * - Default values
 */

describe('Constants', () => {
  let API_BASE_URL: string;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API_BASE_URL', () => {
    it('should use API_URL from environment if set', () => {
      process.env.API_URL = 'http://custom-api:4000';
      
      const constants = require('../src/utils/constants');
      API_BASE_URL = constants.API_BASE_URL;

      expect(API_BASE_URL).toBe('http://custom-api:4000');
    });

    it('should use default localhost URL if API_URL not set', () => {
      delete process.env.API_URL;
      
      const constants = require('../src/utils/constants');
      API_BASE_URL = constants.API_BASE_URL;

      expect(API_BASE_URL).toBe('http://localhost:3000');
    });

    it('should handle empty string API_URL', () => {
      process.env.API_URL = '';
      
      const constants = require('../src/utils/constants');
      API_BASE_URL = constants.API_BASE_URL;

      expect(API_BASE_URL).toBe('http://localhost:3000');
    });

    it('should handle production URL', () => {
      process.env.API_URL = 'https://api.production.com';
      
      const constants = require('../src/utils/constants');
      API_BASE_URL = constants.API_BASE_URL;

      expect(API_BASE_URL).toBe('https://api.production.com');
    });

    it('should handle URL with port', () => {
      process.env.API_URL = 'http://localhost:8080';
      
      const constants = require('../src/utils/constants');
      API_BASE_URL = constants.API_BASE_URL;

      expect(API_BASE_URL).toBe('http://localhost:8080');
    });

    it('should handle URL with path', () => {
      process.env.API_URL = 'http://localhost:3000/api/v1';
      
      const constants = require('../src/utils/constants');
      API_BASE_URL = constants.API_BASE_URL;

      expect(API_BASE_URL).toBe('http://localhost:3000/api/v1');
    });
  });
});

export {};
