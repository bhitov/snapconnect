/**
 * Test script to verify Firebase emulator connection
 * Creates a user profile with a distinctive name to confirm data is being saved to emulator
 * Uses hardcoded emulator configuration
 */

import { createUserProfile } from './chatAdmin';
import { generateMinimalScenario } from './scenarioGenerator';


async function testEmulatorConnection() {
  await generateMinimalScenario({saveToFile: true}, true)
}

async function testEmulatorConnection2() {
  console.log('🧪 Testing Firebase Emulator Connection');
  console.log('=====================================\n');

  console.log(`🔧 Configuration (Hardcoded for Emulator):`);
  console.log(`   • Project ID: snapconnect-d75c6`);
  console.log(`   • Database URL: http://localhost:9000?ns=snapconnect-d75c6`);
  console.log(`   • Auth Emulator: 0.0.0.0:9099`);
  console.log(`   • Using Emulator: ✅ Always\n`);

  try {
    // Create a test user with a very distinctive name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testUsername = `test_emulator_user_${timestamp}`;
    const testDisplayName = `🧪 Test Emulator User ${timestamp}`;

    console.log(`👤 Creating test user:`);
    console.log(`   • Username: ${testUsername}`);
    console.log(`   • Display Name: ${testDisplayName}`);
    console.log(`   • Email: ${testUsername}@example.com\n`);

    const userId = await createUserProfile({
      username: testUsername,
      displayName: testDisplayName,
      bio: `Test user created at ${new Date().toISOString()} to verify emulator connection`
    });

    console.log('✅ SUCCESS! User created successfully in emulator');
    console.log(`   • User ID: ${userId}`);
    console.log(`   • Username: ${testUsername}`);
    console.log(`   • Display Name: ${testDisplayName}`);
    
    console.log('\n🎯 Verification Steps:');
    console.log('   1. Open Firebase Emulator UI: http://localhost:4000');
    console.log('   2. Go to Realtime Database');
    console.log(`   3. Look for user: ${userId}`);
    console.log(`   4. Verify username mapping: ${testUsername}`);
    console.log(`   5. Check namespace: snapconnect-d75c6`);

    console.log('\n🔐 Test Account Credentials:');
    console.log(`   • Email: ${testUsername}@example.com`);
    console.log('   • Password: pass123word');

  } catch (error) {
    console.error('❌ ERROR: Failed to create test user');
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        console.log('\n💡 Possible solutions:');
        console.log('   1. Make sure Firebase emulator is running: firebase emulators:start');
        console.log('   2. Check that emulator is accessible on localhost:9000');
        console.log('   3. Verify emulator UI is at: http://localhost:4000');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testEmulatorConnection().catch(console.error);
}

export { testEmulatorConnection }; 