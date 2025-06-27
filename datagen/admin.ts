/**
 * Firebase Admin SDK configuration for datagen scripts
 * Sets up authenticated connection to Firebase services
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// For CI / local dev you usually export FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT! || '{}') as ServiceAccount;

export const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.DB_URL || ''                   // prod URL (ignored by emulator)
});

export const db = getDatabase(app);                  // modular API (v10+)  :contentReference[oaicite:3]{index=3}