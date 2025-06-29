import { coachAnalyzeAI } from '../src/coach-ai';
import { mockData } from './mock-data';

async function testAnalyze() {
  console.log('🧪 Testing coachAnalyzeAI...\n');

  // Test 1: Balanced relationship
  console.log('Test 1: Balanced relationship (5:1 ratio)');
  const balanced = mockData.BALANCED_ROMANTIC;
  const result1 = await coachAnalyzeAI(
    { ...balanced.data, parentMessages: balanced.context.parentMessages },
    balanced.context
  );
  console.log('Response:', result1);
  console.log('\n---\n');

  // Test 2: Struggling relationship
  console.log('Test 2: Struggling relationship (1.5:1 ratio)');
  const struggling = mockData.STRUGGLING_ROMANTIC;
  const result2 = await coachAnalyzeAI(
    { ...struggling.data, parentMessages: struggling.context.parentMessages },
    struggling.context
  );
  console.log('Response:', result2);
  console.log('\n---\n');

  // Test 3: High conflict
  console.log('Test 3: High conflict relationship (0.5:1 ratio)');
  const conflict = mockData.HIGH_CONFLICT_ROMANTIC;
  const result3 = await coachAnalyzeAI(
    { ...conflict.data, parentMessages: conflict.context.parentMessages },
    conflict.context
  );
  console.log('Response:', result3);
  console.log('\n---\n');

  // Test 4: Positive but superficial
  console.log('Test 4: Positive but superficial (10:1 ratio, low depth)');
  const superficial = mockData.SUPERFICIAL_ROMANTIC;
  const result4 = await coachAnalyzeAI(
    { ...superficial.data, parentMessages: superficial.context.parentMessages },
    superficial.context
  );
  console.log('Response:', result4);
  console.log('\n---\n');

  console.log('✅ All tests complete!');
}

// Run the tests
testAnalyze().catch(console.error);