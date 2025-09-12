// Firebase Admin SDK configuration for server-side
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    // You can either use a service account key file or environment variables
    // Option 1: Using service account key file (recommended for development)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    // Option 2: Using environment variables (recommended for production)
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    try {
      if (serviceAccountPath) {
        // Use service account key file
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      } else if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
        // Use environment variables
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      } else {
        throw new Error('Firebase configuration is missing. Please provide either FIREBASE_SERVICE_ACCOUNT_PATH or the required environment variables.');
      }
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw error;
    }
  }
  
  return admin;
};

export { initializeFirebase };
export default admin;
