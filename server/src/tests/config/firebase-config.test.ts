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
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
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
  });
});

