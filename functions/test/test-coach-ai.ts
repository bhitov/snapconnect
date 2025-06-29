import {
  coachAnalyzeAI,
  coachReplyAI,
  coachRatioAI,
  coachHorsemenAI,
  coachLoveMapAI,
  coachBidsAI,
  coachRuptureRepairAI,
} from '../src/coach-ai';
import { mockData } from './mock-data';

// Test configuration - toggle which tests to run
const TEST_CONFIG = {
  coachAnalyzeAI: false,
  coachReplyAI: false,
  coachRatioAI: false,
  coachHorsemenAI: false,
  coachLoveMapAI: false,
  coachBidsAI: true,
  coachRuptureRepairAI: true,
};

async function testAllCoachFunctions() {
  console.log('🧪 Testing all coach AI functions...\n');

  // Test scenarios
  const scenarios = [
    {
      name: 'Balanced relationship',
      data: mockData.BALANCED_ROMANTIC,
    } as const,
    {
      name: 'High conflict relationship',
      data: mockData.HIGH_CONFLICT_ROMANTIC,
    } as const,
  ] as const;

  // Test 1: coachAnalyzeAI
  if (TEST_CONFIG.coachAnalyzeAI) {
    console.log('=== TEST 1: coachAnalyzeAI ===\n');
    for (const scenario of scenarios) {
      console.log(`Testing ${scenario.name}:`);
      const result = await coachAnalyzeAI(
        scenario.data.data,
        scenario.data.context
      );
      console.log('Response:', result);
      console.log('\n---\n');
    }
  }

  // Test 2: coachReplyAI
  if (TEST_CONFIG.coachReplyAI) {
    console.log('=== TEST 2: coachReplyAI ===\n');

    for (const scenario of scenarios) {
      console.log(`Testing ${scenario.name}:`);
      const userText = 'Do you think I"m doing a good job?';

      const result = await coachReplyAI(scenario.data.data, {
        userText,
        stats: scenario.data.context.stats,
      });
      console.log('Response:', result);
      console.log('\n---\n');
    }
  }

  // Test 3: coachRatioAI
  if (TEST_CONFIG.coachRatioAI) {
    console.log('=== TEST 3: coachRatioAI ===\n');
    for (const scenario of scenarios) {
      console.log(`Testing ${scenario.name}:`);
      const stats = scenario.data.context.stats;
      const total = stats.totalMessages;
      const posPercent =
        total > 0 ? ((stats.positive / total) * 100).toFixed(1) : '0';
      const negPercent =
        total > 0 ? ((stats.negative / total) * 100).toFixed(1) : '0';
      const neuPercent =
        total > 0 ? ((stats.neutral / total) * 100).toFixed(1) : '0';

      const result = await coachRatioAI(scenario.data.data, {
        stats,
        total,
        posPercent,
        negPercent,
        neuPercent,
      });
      console.log('Response:', result);
      console.log('\n---\n');
    }
  }

  // Test 4: coachHorsemenAI
  if (TEST_CONFIG.coachHorsemenAI) {
    console.log('=== TEST 4: coachHorsemenAI ===\n');
    for (const scenario of scenarios) {
      console.log(`Testing ${scenario.name}:`);
      const stats = scenario.data.context.stats;
      const horsemanTotal =
        stats.horsemen.criticism +
        stats.horsemen.contempt +
        stats.horsemen.defensiveness +
        stats.horsemen.stonewalling;
      const horsemanPercent =
        stats.totalMessages > 0
          ? ((horsemanTotal / stats.totalMessages) * 100).toFixed(1)
          : '0';

      const result = await coachHorsemenAI(scenario.data.data, {
        stats,
        horsemanTotal,
        horsemanPercent,
      });
      console.log('Response:', result);
      console.log('\n---\n');
    }
  }

  // Test 5: coachLoveMapAI
  if (TEST_CONFIG.coachLoveMapAI) {
    console.log('=== TEST 5: coachLoveMapAI ===\n');
    const topics = ['dreams and aspirations', 'childhood memories'];
    const topicScores = [0.234, 0.156];

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`Testing ${scenario!.name}:`);
      console.log(`Selected topic: "${topics[i]}" (score: ${topicScores[i]})`);

      // Add some coach history for context

      const result = await coachLoveMapAI(scenario!.data.data, {
        selectedTopic: topics[i]!,
        topicScore: topicScores[i]!,
      });
      console.log('Response:', result);
      console.log('\n---\n');
    }
  }

  // Test 6: coachBidsAI
  if (TEST_CONFIG.coachBidsAI) {
    console.log('=== TEST 6: coachBidsAI ===\n');
    for (const scenario of scenarios) {
      console.log(`Testing ${scenario.name}:`);

      const result = await coachBidsAI(scenario.data.data);
      console.log('Response:', result);
      console.log('\n---\n');
    }
  }

  // Test 7: coachRuptureRepairAI
  if (TEST_CONFIG.coachRuptureRepairAI) {
    console.log('=== TEST 7: coachRuptureRepairAI ===\n');
    for (const scenario of scenarios) {
      console.log(`Testing ${scenario.name}:`);

      const result = await coachRuptureRepairAI(scenario.data.data);
      console.log('Response:', result);
      console.log('\n---\n');
    }
  }

  console.log('✅ All tests complete!');
}

// Run the tests
testAllCoachFunctions().catch(console.error);
