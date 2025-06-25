/**
 * @file debug.ts
 * @description Firebase debugging utilities for troubleshooting connection issues.
 * Helps diagnose network and emulator connectivity problems.
 */

import { Platform } from 'react-native';

import { auth, database, storage, functions } from './config';
import { isDev } from '../../utils/isDev';

/**
 * Test Firebase services connectivity
 */
export async function testFirebaseConnectivity(): Promise<void> {
  console.log('🔍 Testing Firebase connectivity...');
  console.log('🌐 Platform:', Platform.OS);
  console.log('🔧 Development mode:', isDev());

  try {
    // Test Auth service
    console.log('Testing Auth service...');
    const authApp = auth.app;
    console.log('✅ Auth service initialized:', !!authApp);
    console.log('🔗 Auth config:', auth.config);

    // Test Database service
    console.log('Testing Database service...');
    const dbApp = database.app;
    console.log('✅ Database service initialized:', !!dbApp);

    // Test Storage service
    console.log('Testing Storage service...');
    const storageApp = storage.app;
    console.log('✅ Storage service initialized:', !!storageApp);

    // Test Functions service
    console.log('Testing Functions service...');
    const functionsApp = functions.app;
    console.log('✅ Functions service initialized:', !!functionsApp);

    console.log('✅ All Firebase services connectivity test completed');
  } catch (error) {
    console.error('❌ Firebase connectivity test failed:', error);
  }
}

/**
 * Check network connectivity for Android emulator
 */
export async function checkNetworkConnectivity(): Promise<void> {
  if (Platform.OS !== 'android') {
    console.log('ℹ️ Network check skipped - not Android platform');
    return;
  }

  console.log('🌐 Checking Android emulator network connectivity...');

  try {
    // Test connectivity to common endpoints
    const testUrls = [
      'https://www.google.com',
      'https://firebase.googleapis.com',
      'http://10.0.2.2:9099', // Firebase Auth emulator
      'http://10.0.2.2:9000', // Firebase Database emulator
    ];

    for (const url of testUrls) {
      try {
        console.log(`Testing connection to: ${url}`);
        const response = await fetch(url, {
          method: 'HEAD',
        });
        console.log(`✅ ${url} - Status: ${response.status}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`❌ ${url} - Failed:`, errorMessage);
      }
    }
  } catch (error) {
    console.error('❌ Network connectivity check failed:', error);
  }
}

/**
 * Get emulator URLs for current platform
 */
export function getEmulatorUrls(): Record<string, string> {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

  return {
    auth: `http://${host}:9099`,
    database: `http://${host}:9000`,
    storage: `http://${host}:9199`,
    functions: `http://${host}:5001`,
    ui: `http://${host}:4000`,
  };
}

/**
 * Print emulator connection info
 */
export function printEmulatorInfo(): void {
  const urls = getEmulatorUrls();

  console.log('🔧 Firebase Emulator URLs:');
  Object.entries(urls).forEach(([service, url]) => {
    console.log(`  ${service}: ${url}`);
  });

  console.log('\n📱 Android Emulator Network Info:');
  console.log('  Host machine: 10.0.2.2');
  console.log('  Emulator localhost: 127.0.0.1');
  console.log('  Router/Gateway: 10.0.2.1');
}

/**
 * Complete Firebase debugging suite
 */
export async function runFirebaseDebug(): Promise<void> {
  console.log('\n🚀 Starting Firebase Debug Suite...\n');

  printEmulatorInfo();
  console.log('\n');

  await testFirebaseConnectivity();
  console.log('\n');

  await checkNetworkConnectivity();
  console.log('\n');

  console.log('✅ Firebase debug suite completed');
}
