/**
 * Firebase Config Tests
 * 
 * Tests for Firebase configuration
 */

import { initializeFirebase } from '../../config/firebase-config';

// Mock firebase-admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(() => ({
    messaging: jest.fn(() => ({
      send: jest.fn(),
    })),
  })),
  credential: {
    cert: jest.fn(() => ({})),
  },
  apps: [],
}));

describe('Firebase Config', () => {
  let originalEnv: typeof process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = { ...process.env };
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initializeFirebase', () => {
    it('should initialize Firebase app', () => {
      const admin = initializeFirebase();
      expect(admin).toBeDefined();
    });

    it('should return existing app if already initialized', () => {
      const admin1 = initializeFirebase();
      const admin2 = initializeFirebase();
      expect(admin1).toBe(admin2);
    });

    it('should handle missing environment variables', () => {
      delete process.env.FIREBASE_PROJECT_ID;
      expect(() => initializeFirebase()).toThrow();
    });

    it('should initialize with service account path', () => {
      // Reset apps array to allow re-initialization
      const admin = require('firebase-admin');
      admin.apps.length = 0;

      process.env.FIREBASE_SERVICE_ACCOUNT_PATH = '/path/to/service-account.json';

      const result = initializeFirebase();
      expect(result).toBeDefined();
      expect(admin.credential.cert).toHaveBeenCalledWith('/path/to/service-account.json');
    });

    it('should initialize with environment variables when no service account path', () => {
      const admin = require('firebase-admin');
      admin.apps.length = 0;

      delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
      process.env.FIREBASE_PRIVATE_KEY = 'test-key';

      const result = initializeFirebase();
      expect(result).toBeDefined();
    });
  });
});

