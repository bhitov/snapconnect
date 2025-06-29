import { initializeApp } from 'firebase-admin/app'; // auto-detects emulator or prod

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
  coachACR,
  coachSharedInterests,
  coachTopicChampion,
  coachFriendshipCheckin,
  coachGroupEnergy,
  coachTopicVibeCheck,
} from './coach';
import { coachAnalyzeAI } from './coach-ai';
import { onTextMessageCreatedRTDB } from './ingestMessage';

// Load environment variables from root project directory

initializeApp();

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
  coachACR,
  coachSharedInterests,
  coachTopicChampion,
  coachFriendshipCheckin,
  coachGroupEnergy,
  coachTopicVibeCheck,
  coachAnalyzeAI,
  onTextMessageCreatedRTDB,
};
