import { randomUUID } from 'crypto';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

import {
  getCoachChatId,
  createCoachConversation,
  saveTextMessage,
  getRecentMessages,
  getAllMessages,
  getRecentMessagesWithUserInfo,
  getAllMessagesWithUserInfo,
  formatMessagesForContext,
  formatMessagesWithUserInfoForContext,
  getUserInfo,
  type UserInfo,
  type TextMessage,
  type TextMessageWithUserInfo,
} from './db';
import {
  queryConversationMessages,
  analyzeConversationStats,
  formatPineconeMessages,
  DIM,
} from './pinecone';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { generateEmbeddings, cosineSimilarity } from './openai';
import { 
  coachAnalyzeAI, 
  coachReplyAI, 
  coachRatioAI, 
  coachHorsemenAI, 
  coachLoveMapAI 
} from './coach-ai';
import type { FetchedData } from './types';

const RECENT_PARENT = 50; // last 50 msgs

// Love Map topics for analysis - these will be embedded and searched
const LOVE_MAP_TOPICS = [
  'dreams and aspirations',
  'childhood memories',
  'fears and worries',
  'favorite activities',
  'family relationships',
  'work and career goals',
  'values and beliefs',
  'hobbies and interests',
  'future plans together',
  'personal growth goals',
];


// Define interfaces for request data
interface StartCoachChatData {
  parentCid: string;
}

interface CoachReplyData {
  coachCid: string;
  parentCid: string;
  userText: string;
}

interface CoachAnalyzeData {
  coachCid: string;
  parentCid: string;
  n?: number;
}

interface CoachRatioData {
  coachCid: string;
  parentCid: string;
}

interface CoachHorsemenData {
  coachCid: string;
  parentCid: string;
}

interface CoachLoveMapData {
  coachCid: string;
  parentCid: string;
}

/**
 * Fetch all required data for coach operations
 * Always fetches coach messages and last 100 parent messages
 */
export async function fetchAllRequiredData(
  request: CallableRequest<{ coachCid?: string; parentCid?: string }>
): Promise<FetchedData> {
  const data = await validateCoachParams(request);
  const result: FetchedData = { ...data };
  
  // Always fetch coach messages
  result.coachMessages = await getAllMessages(data.coachCid);
  
  // Always fetch last 100 parent messages with user info
  result.parentMessages = await getRecentMessagesWithUserInfo(data.parentCid, 100);
  
  return result;
}

/**
 * Validate common parameters for coach functions
 */
export async function validateCoachParams(
  request: CallableRequest<{ coachCid?: string; parentCid?: string }>
): Promise<{ uid: string; coachCid: string; parentCid: string; displayName: string; username: string }> {
  const uid = request.auth?.uid;
  const { coachCid, parentCid } = request.data;

  if (!uid || !coachCid || !parentCid) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }

  const userInfo = await getUserInfo(uid);
  if (!userInfo) {
    throw new HttpsError('not-found', 'User not found');
  }

  return { uid, coachCid, parentCid, displayName: userInfo.displayName, username: userInfo.username };
}

/**
 * Send a coach message and save it to the database
 */
export async function sendCoachMessage(
  coachCid: string,
  text: string
): Promise<void> {
  await saveTextMessage({
    conversationId: coachCid,
    senderId: 'coach',
    text,
    createdAt: Date.now(),
  });
}



//--------------------------------------------------------------------------
// 1) startCoachChat  (creates one coach chat per parentCid per user)
//--------------------------------------------------------------------------
export const startCoachChat = onCall<StartCoachChatData>(async request => {
  const { data } = request;
  const uid = request.auth?.uid;
  const { parentCid } = data;

  if (!uid || !parentCid)
    throw new HttpsError('invalid-argument', 'auth/parentCid');

  // Does coach chat already exist?
  const existingCoachCid = await getCoachChatId(uid, parentCid);
  if (existingCoachCid) return { coachCid: existingCoachCid };

  // Create new conversation
  const coachCid = randomUUID();
  const now = Date.now();
  await createCoachConversation(coachCid, uid, parentCid, now);

  // First "hello" from the coach
  await sendCoachMessage(
    coachCid,
    "Hi! I'm your relationship coach. Ask me anything or choose an option from the menu. TEST"
  );

  return { coachCid };
});

//--------------------------------------------------------------------------
// 2) coachReply  (fires for every user message in the coach chat)
//--------------------------------------------------------------------------
export const coachReply = onCall<CoachReplyData>(async request => {
  const { data } = request;
  const uid = request.auth?.uid;
  const { coachCid, parentCid, userText } = data;

  if (!uid || !coachCid || !parentCid || !userText)
    throw new HttpsError('invalid-argument', 'missing params');

  const now = Date.now();
  // store the user's message first
  await saveTextMessage({
    conversationId: coachCid,
    senderId: uid,
    text: userText,
    createdAt: now,
  });

  // Fetch conversation data
  const fetchedData = await fetchAllRequiredData(request);

  // Get stats from parent chat (Pinecone)
  const parentMsgs = await queryConversationMessages(parentCid, RECENT_PARENT);
  const stats = analyzeConversationStats(parentMsgs.matches);

  // Generate response
  const reply = await coachReplyAI(fetchedData, { userText, stats });

  // persist coach message
  await sendCoachMessage(coachCid, reply);

  return { reply };
});

//--------------------------------------------------------------------------
// 3) coachAnalyze  (triggered from dropdown)
//--------------------------------------------------------------------------
export const coachAnalyze = onCall<CoachAnalyzeData>(async request => {
  const { n = 30 } = request.data;
  
  // Fetch all required data including parent messages
  const data = await fetchAllRequiredData(request);

  // Query conversation and analyze stats
  const res = await queryConversationMessages(data.parentCid, n);
  const stats = analyzeConversationStats(res.matches);

  // Call pure function for testing
  const summary = await coachAnalyzeAI(data, { stats });

  await sendCoachMessage(data.coachCid, summary);
  return { ok: true };
});

//--------------------------------------------------------------------------
// 4) coachRatio - Positive/Negative Ratio Analysis
//--------------------------------------------------------------------------
export const coachRatio = onCall<CoachRatioData>(async request => {
  const { uid, coachCid, parentCid } = await validateCoachParams(request);

  // Query Pinecone for sentiment analysis
  const res = await queryConversationMessages(parentCid, 100);
  const stats = analyzeConversationStats(res.matches);
  
  const total = stats.totalMessages;
  const posPercent = total > 0 ? ((stats.positive / total) * 100).toFixed(1) : '0';
  const negPercent = total > 0 ? ((stats.negative / total) * 100).toFixed(1) : '0';
  const neuPercent = total > 0 ? ((stats.neutral / total) * 100).toFixed(1) : '0';

  const data = await validateCoachParams(request);
  
  const analysis = await coachRatioAI(data, { 
    stats, 
    total, 
    posPercent, 
    negPercent, 
    neuPercent 
  });

  await sendCoachMessage(coachCid, analysis);
  return { ok: true };
});

//--------------------------------------------------------------------------
// 5) coachHorsemen - Four Horsemen Analysis
//--------------------------------------------------------------------------
export const coachHorsemen = onCall<CoachHorsemenData>(async request => {
  const data = await validateCoachParams(request);
  const { uid, coachCid, parentCid } = data;

  // Query Pinecone for horsemen analysis
  const res = await queryConversationMessages(parentCid, 100);
  const stats = analyzeConversationStats(res.matches);
  
  const horsemanTotal = stats.horsemen.criticism + stats.horsemen.contempt + stats.horsemen.defensiveness;
  const horsemanPercent =
    stats.totalMessages > 0
      ? ((horsemanTotal / stats.totalMessages) * 100).toFixed(1)
      : '0';
  
  const analysis = await coachHorsemenAI(data, { 
    stats, 
    horsemanTotal, 
    horsemanPercent 
  });

  await sendCoachMessage(coachCid, analysis);
  return { ok: true };
});

//--------------------------------------------------------------------------
// 6) coachLoveMap - Love Map Questions with Topic Analysis
//--------------------------------------------------------------------------
export const coachLoveMap = onCall<CoachLoveMapData>(async request => {
  const data = await validateCoachParams(request);
  const { coachCid, parentCid } = data;

  // Fetch conversation data
  const fetchedData = await fetchAllRequiredData(request);

  // Query Pinecone to analyze topic coverage
  const res = await queryConversationMessages(parentCid, 100);

  // Generate embeddings for all love map topics
  const topicEmbeddings = await generateEmbeddings(LOVE_MAP_TOPICS);
  const topicEmbeddingsMap = topicEmbeddings.map(({ text, embedding }) => ({
    topic: text,
    embedding,
  }));

  // Calculate similarity scores for each topic against conversation messages
  const topicScores: { [key: string]: number } = {};

  topicEmbeddingsMap.forEach(({ topic, embedding: topicEmbedding }) => {
    let totalSimilarity = 0;
    let messageCount = 0;

    res.matches.forEach(match => {
      if (match.values && match.values.length === DIM) {
        const similarity = cosineSimilarity(topicEmbedding, match.values);
        totalSimilarity += similarity;
        messageCount++;
      }
    });

    // Average similarity score for this topic
    topicScores[topic] = messageCount > 0 ? totalSimilarity / messageCount : 0;
  });

  console.log('💕 Love Map Topic Scores:', topicScores);

  // Get bottom half of topics (least discussed based on semantic similarity)
  const sortedTopics = Object.entries(topicScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5); // Bottom 5 topics

  console.log('💕 Least Discussed Topics:', sortedTopics);

  // Randomly select one from bottom half
  const selectedTopicData =
    sortedTopics[Math.floor(Math.random() * sortedTopics.length)];
  const selectedTopic = selectedTopicData ? selectedTopicData[0] : 'general';

  const response = await coachLoveMapAI(fetchedData, { 
    selectedTopic, 
    topicScore: topicScores[selectedTopic] || 0 
  });

  await sendCoachMessage(coachCid, response);
  return { ok: true };
});