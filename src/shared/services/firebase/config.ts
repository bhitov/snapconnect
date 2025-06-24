/**
 * @file config.ts
 * @description Firebase configuration and initialization for SnapConnect.
 * Provides Firebase services with proper environment handling.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import {
  getDatabase,
  Database,
  connectDatabaseEmulator,
} from 'firebase/database';
import {
  getFunctions,
  Functions,
  connectFunctionsEmulator,
} from 'firebase/functions';
import {
  getStorage,
  FirebaseStorage,
  connectStorageEmulator,
} from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'snapconnect-demo.firebaseapp.com',
  databaseURL:
    process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://snapconnect-demo-default-rtdb.firebaseio.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'snapconnect-demo',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'snapconnect-demo.appspot.com',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef',
};

// Initialize Firebase app
let app: FirebaseApp;
let auth: Auth;
let database: Database;
let storage: FirebaseStorage;
let functions: Functions;

/**
 * Initialize Firebase services
 */
function initializeFirebase(): void {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
    storage = getStorage(app);
    functions = getFunctions(app);

    console.log('🔥 Firebase initialized successfully');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    console.log('🌐 Platform:', Platform.OS);

    // Connect to emulators in development
    // if (__DEV__) {
      connectToEmulators();
    // }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw new Error('Firebase initialization failed');
  }
}

/**
 * Connect to Firebase emulators for development
 */
function connectToEmulators(): void {
  try {
    // Use 10.0.2.2 for Android emulator, localhost for iOS simulator and web
    // const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    const host = '10.0.2.2';

    console.log(`🔧 Connecting to Firebase emulators on ${host}`);

    // Connect to emulators - only works on first connection
    connectAuthEmulator(auth, `http://${host}:9099`);
    connectDatabaseEmulator(database, host, 9000);
    connectStorageEmulator(storage, host, 9199);
    connectFunctionsEmulator(functions, host, 5001);

    console.log('✅ Connected to Firebase emulators successfully');
    console.log(
      `🚀 Development mode: Using local Firebase emulators on ${host}`
    );
  } catch (error) {
    console.warn(
      '⚠️ Failed to connect to emulators (this is normal if not running locally):',
      error
    );
  }
}

/**
 * Get Firebase configuration info
 */
export function getFirebaseConfig() {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    databaseURL: firebaseConfig.databaseURL,
    storageBucket: firebaseConfig.storageBucket,
    isDev: __DEV__,
  };
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'demo-api-key'
  );
}

// Initialize Firebase on import
initializeFirebase();

// Export Firebase services
export { app, auth, database, storage, functions };
export { firebaseConfig };
