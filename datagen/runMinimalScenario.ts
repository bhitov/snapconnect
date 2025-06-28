/**
 * Runner for minimal scenario generation
 * Creates only primary user and their partner with their conversation
 */

import { config } from './config';
import { generateMinimalScenario } from './scenarioGenerator';

async function main() {
  console.log('🚀 Minimal Scenario Generator');
  console.log('============================\n');

  // Check OpenAI API key
  const hasOpenAI = !!config.OPENAI_API_KEY;
  console.log(
    `🔑 OpenAI API Key: ${hasOpenAI ? '✅ Found' : '❌ Not found (will use simple messages)'}`
  );

  try {
    // You can customize these settings
    const scenarioConfig = {
      messagesPerConversation: 15, // Fewer messages for minimal scenario
      useAI: true, // Enable AI-generated conversations (requires OPENAI_API_KEY)
      saveToFile: true, // Save conversation to JSON file
    };

    console.log('📋 Configuration:');
    console.log(
      `   • Messages per Conversation: ${scenarioConfig.messagesPerConversation}`
    );
    console.log(
      `   • AI Generation: ${scenarioConfig.useAI ? 'Enabled' : 'Disabled'}`
    );
    console.log(
      `   • Save to JSON: ${scenarioConfig.saveToFile ? 'Enabled' : 'Disabled'}\n`
    );

    const result = await generateMinimalScenario(scenarioConfig);

    console.log('\n🎉 Minimal scenario generation completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Users created: ${result.summary.totalUsers}`);
    console.log(`   • Conversations: ${result.summary.totalConversations}`);
    console.log(`   • Total messages: ${result.summary.totalMessages}`);

    console.log('\n👥 Generated Users:');
    console.log(
      `   • ${result.users.primary.displayName} (${result.users.primary.username})`
    );
    console.log(
      `   • ${result.users.partner.displayName} (${result.users.partner.username})`
    );

    if (scenarioConfig.saveToFile) {
      console.log('\n💾 Data saved to: datagen/data/minimal-conversation.json');
    }

    console.log('\n🔐 Test Account Credentials:');
    console.log('   All accounts use password: pass123word');
    console.log(`   • ${result.users.primary.email}`);
    console.log(`   • ${result.users.partner.email}`);
  } catch (error) {
    console.error('❌ Error generating minimal scenario:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runMinimalScenario };
