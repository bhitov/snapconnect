import { initializeApp } from 'firebase-admin/app';

// Load environment variables from root project directory

initializeApp(); // auto-detects emulator or prod

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
import { onTextMessageCreatedRTDB } from './ingestMessage';
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
  coachACR,
  coachSharedInterests,
  coachTopicChampion,
  coachFriendshipCheckin,
  coachGroupEnergy,
  coachTopicVibeCheck,
  coachAnalyzeAI,
  onTextMessageCreatedRTDB,
};
