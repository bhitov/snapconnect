/**
 * Scenario Runner - Easy execution of different test scenarios
 * Run with: npx tsx datagen/runScenario.ts
 */

import { config } from './config';
import { generateScenario } from './scenarioGenerator';

async function main() {
  console.log('🚀 Starting AI-powered scenario generation...\n');

  // Check for OpenAI API key
  if (!config.OPENAI_API_KEY) {
    console.log(
      '⚠️  OpenAI API key not found. Set OPENAI_API_KEY environment variable for AI-generated conversations.'
    );
    console.log('    Falling back to simple placeholder messages.\n');
  } else {
    console.log(
      '🤖 OpenAI API key found. Will generate realistic conversations with ChatGPT.\n'
    );
  }

  try {
    // You can customize these settings
    const scenarioConfig = {
      totalUsers: 20,
      messagesPerConversation: 25,
      groupChatSize: 6,
      useAI: true,
      saveToFile: true, // Save conversations to JSON file
    };

    console.log('📋 Configuration:');
    console.log(`   • Total Users: ${scenarioConfig.totalUsers}`);
    console.log(
      `   • Messages per Conversation: ${scenarioConfig.messagesPerConversation}`
    );
    console.log(`   • Group Chat Size: ${scenarioConfig.groupChatSize}`);
    console.log(
      `   • AI Generation: ${scenarioConfig.useAI ? 'Enabled' : 'Disabled'}`
    );
    console.log(
      `   • Save to JSON: ${scenarioConfig.saveToFile ? 'Enabled' : 'Disabled'}\n`
    );

    const result = await generateScenario(scenarioConfig);

    console.log('\n🎉 Scenario generation completed successfully!');
    console.log('\n📝 Key Users Created:');
    console.log(
      `   Primary User: ${result.primaryUser.displayName} (@${result.primaryUser.username})`
    );
    console.log(
      `   Primary Partner: ${result.primaryPartner.displayName} (@${result.primaryPartner.username})`
    );
    console.log(
      `   Secondary User: ${result.secondaryUser.displayName} (@${result.secondaryUser.username})`
    );
    console.log(
      `   Secondary Partner: ${result.secondaryPartner.displayName} (@${result.secondaryPartner.username})`
    );
    console.log(`   Additional Users: ${result.remainingUsers.length}`);

    console.log('\n💬 Conversations Created:');
    console.log(
      `   ❤️  Healthy Relationship: ${result.primaryUser.displayName} ↔ ${result.primaryPartner.displayName}`
    );
    console.log(
      `   💔 Unhealthy Relationship: ${result.secondaryUser.displayName} ↔ ${result.secondaryPartner.displayName}`
    );
    console.log(`   🤝 Friend Chats: 2 conversations`);
    console.log(`   👥 Group Chats: 2 groups`);

    console.log('\n🔐 Authentication Info:');
    console.log('   All users can login with:');
    console.log('   • Email: [username]@example.com');
    console.log('   • Password: pass123word');
    console.log(
      `   Example: ${result.primaryUser.username}@example.com / pass123word`
    );
  } catch (error) {
    console.error('❌ Scenario generation failed:', error);
    process.exit(1);
  }
}

// Run the scenario if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
