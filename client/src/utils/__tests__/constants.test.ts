import { describe, it, expect } from 'vitest';
import { WEBSITE_LOGO, API_KEY_STORAGE_KEY, NAVIGATION_ITEMS, API_BASE_URL } from '../constants';

describe('constants', () => {
  describe('WEBSITE_LOGO', () => {
    it('should export the correct logo path', () => {
      expect(WEBSITE_LOGO).toBe('/logo.png');
    });
  });

  describe('API_KEY_STORAGE_KEY', () => {
    it('should export the correct storage key', () => {
      expect(API_KEY_STORAGE_KEY).toBe('dashboard_api_key');
    });
  });

  describe('NAVIGATION_ITEMS', () => {
    it('should export navigation items array', () => {
      expect(NAVIGATION_ITEMS).toBeDefined();
      expect(Array.isArray(NAVIGATION_ITEMS)).toBe(true);
      expect(NAVIGATION_ITEMS.length).toBeGreaterThan(0);
    });

    it('should have correct navigation item structure', () => {
      NAVIGATION_ITEMS.forEach(item => {
        expect(item).toHaveProperty('text');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('path');
        expect(typeof item.text).toBe('string');
        expect(typeof item.path).toBe('string');
      });
    });

    it('should include expected navigation items', () => {
      const paths = NAVIGATION_ITEMS.map(item => item.path);
      expect(paths).toContain('/');
      expect(paths).toContain('/e2e-dashboard');
      expect(paths).toContain('/pull_requests');
      expect(paths).toContain('/apps');
    });
  });

  describe('API_BASE_URL', () => {
    it('should be defined and be a string', () => {
      expect(API_BASE_URL).toBeDefined();
      expect(typeof API_BASE_URL).toBe('string');
      // The actual value depends on environment variables and is tested
      // through integration tests
    });
  });
});
