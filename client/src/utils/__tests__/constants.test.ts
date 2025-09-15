import { vi } from 'vitest';

describe('constants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module cache to ensure fresh imports
    vi.resetModules();
    // Reset mock environment
    delete import.meta.env.VITE_API_URL;
  });

  describe('WEBSITE_LOGO', () => {
    it('should export the correct logo path', async () => {
      const { WEBSITE_LOGO } = await import('../constants');
      expect(WEBSITE_LOGO).toBe('/logo.png');
    });
  });

  describe('API_BASE_URL', () => {
    it('should use environment variable when available', async () => {
      import.meta.env.VITE_API_URL = 'https://api.production.com';

      const { API_BASE_URL } = await import('../constants');
      expect(API_BASE_URL).toBe('https://api.production.com');
    });

    it('should use default localhost when environment variable is not set', async () => {
      const { API_BASE_URL } = await import('../constants');
      expect(API_BASE_URL).toBe('http://localhost:3000');
    });

    it('should use default localhost when environment variable is empty', async () => {
      import.meta.env.VITE_API_URL = '';

      const { API_BASE_URL } = await import('../constants');
      expect(API_BASE_URL).toBe('http://localhost:3000');
    });
  });
});
