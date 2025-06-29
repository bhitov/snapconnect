import { resolve } from 'path';

import { config } from 'dotenv';
import { initializeApp } from 'firebase-admin/app';

// Load environment variables from root project directory
config({ path: resolve(__dirname, '../../.env.local') });
console.log('hey');

initializeApp(); // auto-detects emulator or prod
console.log('ho');

// Import and re-export coach functions
import {
  startCoachChat,
  coachReply,
  coachAnalyze,
  coachRatio,
  coachHorsemen,
  coachLoveMap,
  coachBids,
  coachRuptureRepair,
} from './coach';

import { coachAnalyzeAI } from './coach-ai';

// Re-export coach functions
export {
  startCoachChat,
  coachReply,
  coachAnalyze,
  coachRatio,
  coachHorsemen,
  coachLoveMap,
  coachBids,
  coachRuptureRepair,
  coachAnalyzeAI,
};
