import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

// Firebase config object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// VAPID key for web push notifications - you'll need to generate this in Firebase Console
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Lazy initialization to avoid issues in test environment
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

const initializeFirebase = () => {
  if (typeof window === 'undefined' || import.meta.env.VITEST) {
    // Don't initialize in server-side rendering or test environment
    return null;
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

const getMessagingInstance = () => {
  if (typeof window === 'undefined' || import.meta.env.VITEST) {
    // Don't initialize in server-side rendering or test environment
    return null;
  }

  const firebaseApp = initializeFirebase();
  if (!firebaseApp) {
    return null;
  }

  if (!messaging) {
    try {
      messaging = getMessaging(firebaseApp);
    } catch {
      return null;
    }
  }
  return messaging;
};

export { getMessagingInstance as messaging, vapidKey, getToken, onMessage, initializeFirebase };
