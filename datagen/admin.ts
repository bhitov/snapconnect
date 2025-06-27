/**
 * Firebase Admin SDK configuration for datagen scripts
 * Hardcoded to use Firebase emulator for development
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Hardcoded emulator configuration
// Set client SDK environment variables
process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = 'localhost:9099';
process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL = 'http://localhost:9000?ns=snapconnect-d75c6';
process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'snapconnect-d75c6';
process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = 'default-bucket';
process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789012';

// Set Admin SDK environment variables
process.env.FIREBASE_AUTH_EMULATOR_HOST = '0.0.0.0:9099';
process.env.GCLOUD_PROJECT = 'snapconnect-d75c6';

console.log(`🔧 Firebase Admin SDK Configuration (Emulator):`);
console.log(`   • Project ID: snapconnect-d75c6`);
console.log(`   • Auth Emulator: 0.0.0.0:9099`);
console.log(`   • Database URL: http://localhost:9000?ns=snapconnect-d75c6`);

// Use applicationDefault for emulator (no credentials needed)
export const app = initializeApp({
  credential: applicationDefault(),
  databaseURL: 'http://localhost:9000?ns=snapconnect-d75c6-default-rtdb',
  projectId: 'snapconnect-d75c6'
});

export const db = getDatabase(app);