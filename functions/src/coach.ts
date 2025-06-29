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
  areUsersPartners,
  getConversation,
  type UserInfo,
  type TextMessage,
  type TextMessageWithUserInfo,
  type Conversation,
} from './db';
import {
  queryConversationMessages,
  analyzeConversationStats,
  formatPineconeMessages,
  DIM,
  getTopicSentiment,
} from './pinecone';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { generateEmbeddings, cosineSimilarity } from './openai';
import {
  coachAnalyzeAI,
  coachReplyAI,
  coachRatioAI,
  coachHorsemenAI,
  coachLoveMapAI,
  coachBidsAI,
  coachRuptureRepairAI,
  coachACRAI,
  coachSharedInterestsAI,
  coachTopicChampionAI,
  coachFriendshipCheckinAI,
  coachGroupEnergyAI,
  aiTopicVibeCheck,
  INITIAL_MESSAGE,
  TOPIC_VIBE_TOPICS,
} from './coach-ai';
import type { FetchedData, RelationshipType } from './types';

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

// Interest categories for platonic shared interests analysis
const INTEREST_CATEGORIES = [
  'sports and fitness activities',
  'movies and TV shows',
  'music and concerts',
  'books and reading',
  'video games and gaming',
  'cooking and restaurants',
  'travel and adventures',
  'art and creativity',
  'technology and gadgets',
  'outdoor activities and nature',
  'board games and puzzles',
  'volunteering and social causes',
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

interface CoachBidsData {
  coachCid: string;
  parentCid: string;
}

interface CoachRuptureRepairData {
  coachCid: string;
  parentCid: string;
}

interface CoachACRData {
  coachCid: string;
  parentCid: string;
}

interface CoachSharedInterestsData {
  coachCid: string;
  parentCid: string;
}

interface CoachTopicChampionData {
  coachCid: string;
  parentCid: string;
}

interface CoachFriendshipCheckinData {
  coachCid: string;
  parentCid: string;
}

interface CoachGroupEnergyData {
  coachCid: string;
  parentCid: string;
}

async function getRelationshipTypeFromParentCid(
  parentCid: string
): Promise<RelationshipType> {
  const conversation = await getConversation(parentCid);
  const participants = conversation?.participants || [];
  if (participants.length >= 3) {
    return 'group' as const;
  } else if (participants.length === 2) {
    // Check if the two participants are partners
    const [user1Id, user2Id] = participants;

    // Check if they are partners
    const arePartners = await areUsersPartners(user1Id, user2Id);
    return arePartners ? ('romantic' as const) : ('platonic' as const);
  } else {
    throw new HttpsError('invalid-argument', 'Invalid conversation type');
  }
}

/**
 * Fetch all required data for coach operations
 * Always fetches coach messages and last 100 parent messages
 */
export async function fetchAllRequiredData(
  request: CallableRequest<{ coachCid?: string; parentCid?: string }>
): Promise<FetchedData> {
  const data = await validateCoachParams(request);

  // Always fetch coach messages
  const coachMessages = await getAllMessages(data.coachCid);

  // Always fetch last 100 parent messages with user info
  const parentMessages = await getRecentMessagesWithUserInfo(
    data.parentCid,
    100
  );

  const relationshipType = await getRelationshipTypeFromParentCid(
    data.parentCid
  );

  const result: FetchedData = {
    ...data,
    relationshipType,
    coachMessages,
    parentMessages,
  };

  return result;
}

/**
 * Validate common parameters for coach functions
 */
export async function validateCoachParams(
  request: CallableRequest<{ coachCid?: string; parentCid?: string }>
): Promise<{
  uid: string;
  coachCid: string;
  parentCid: string;
  displayName: string;
  username: string;
}> {
  const uid = request.auth?.uid;
  const { coachCid, parentCid } = request.data;

  if (!uid || !coachCid || !parentCid) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }

  const userInfo = await getUserInfo(uid);
  if (!userInfo) {
    throw new HttpsError('not-found', 'User not found');
  }

  return {
    uid,
    coachCid,
    parentCid,
    displayName: userInfo.displayName,
    username: userInfo.username,
  };
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

  const relationshipType = await getRelationshipTypeFromParentCid(parentCid);

  // First "hello" from the coach
  await sendCoachMessage(coachCid, INITIAL_MESSAGE[relationshipType]);

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
  const data = await fetchAllRequiredData(request);

  // Query Pinecone for sentiment analysis
  const res = await queryConversationMessages(data.parentCid, 100);
  const stats = analyzeConversationStats(res.matches);

  const total = stats.totalMessages;
  const posPercent =
    total > 0 ? ((stats.positive / total) * 100).toFixed(1) : '0';
  const negPercent =
    total > 0 ? ((stats.negative / total) * 100).toFixed(1) : '0';
  const neuPercent =
    total > 0 ? ((stats.neutral / total) * 100).toFixed(1) : '0';

  const analysis = await coachRatioAI(data, {
    stats,
    total,
    posPercent,
    negPercent,
    neuPercent,
  });

  await sendCoachMessage(data.coachCid, analysis);
  return { ok: true };
});

//--------------------------------------------------------------------------
// 5) coachHorsemen - Four Horsemen Analysis
//--------------------------------------------------------------------------
export const coachHorsemen = onCall<CoachHorsemenData>(async request => {
  const data = await fetchAllRequiredData(request);

  // Query Pinecone for horsemen analysis
  const res = await queryConversationMessages(data.parentCid, 100);
  const stats = analyzeConversationStats(res.matches);

  const horsemanTotal =
    stats.horsemen.criticism +
    stats.horsemen.contempt +
    stats.horsemen.defensiveness;
  const horsemanPercent =
    stats.totalMessages > 0
      ? ((horsemanTotal / stats.totalMessages) * 100).toFixed(1)
      : '0';

  const analysis = await coachHorsemenAI(data, {
    stats,
    horsemanTotal,
    horsemanPercent,
  });

  await sendCoachMessage(data.coachCid, analysis);
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
    topicScore: topicScores[selectedTopic] || 0,
  });

  await sendCoachMessage(coachCid, response);
  return { ok: true };
});

//--------------------------------------------------------------------------
// 7) coachBids - Emotional Bids Analysis
//--------------------------------------------------------------------------
export const coachBids = onCall<CoachBidsData>(async request => {
  const data = await validateCoachParams(request);
  const { coachCid } = data;

  // Fetch conversation data
  const fetchedData = await fetchAllRequiredData(request);

  // Let the AI analyze the conversation for bids
  const analysis = await coachBidsAI(fetchedData);

  await sendCoachMessage(coachCid, analysis);
  return { ok: true };
});

//--------------------------------------------------------------------------
// 8) coachRuptureRepair - Rupture and Repair Analysis
//--------------------------------------------------------------------------
export const coachRuptureRepair = onCall<CoachRuptureRepairData>(
  async request => {
    const data = await validateCoachParams(request);
    const { coachCid } = data;

    // Fetch conversation data
    const fetchedData = await fetchAllRequiredData(request);

    // Let the AI analyze the conversation for ruptures and repairs
    const analysis = await coachRuptureRepairAI(fetchedData);

    await sendCoachMessage(coachCid, analysis);
    return { ok: true };
  }
);

//--------------------------------------------------------------------------
// 9) coachACR - Active-Constructive Responding Analysis (Platonic)
//--------------------------------------------------------------------------
export const coachACR = onCall<CoachACRData>(async request => {
  const data = await validateCoachParams(request);
  const { coachCid, parentCid } = data;

  // Fetch conversation data
  const fetchedData = await fetchAllRequiredData(request);

  // Check message count requirement
  const messageCount = fetchedData.parentMessages.length;
  if (messageCount < 20) {
    await sendCoachMessage(
      coachCid,
      `I need at least 20 messages to analyze Active-Constructive Responding patterns. You currently have ${messageCount} messages. Keep chatting and try again later!`
    );
    return { ok: true };
  }

  // Let the AI analyze the conversation for ACR patterns
  const analysis = await coachACRAI(fetchedData);

  await sendCoachMessage(coachCid, analysis);
  return { ok: true };
});

//--------------------------------------------------------------------------
// 10) coachSharedInterests - Shared Interests Discovery (Platonic, RAG)
//--------------------------------------------------------------------------
export const coachSharedInterests = onCall<CoachSharedInterestsData>(
  async request => {
    const data = await validateCoachParams(request);
    const { coachCid, parentCid } = data;

    // Fetch conversation data
    const fetchedData = await fetchAllRequiredData(request);

    // Query Pinecone for conversation history
    const res = await queryConversationMessages(parentCid, 100);

    // Generate embeddings for interest categories
    const interestEmbeddings = await generateEmbeddings(INTEREST_CATEGORIES);
    const interestEmbeddingsMap = interestEmbeddings.map(
      ({ text, embedding }) => ({
        category: text,
        embedding,
      })
    );

    // Calculate similarity scores for each interest category
    const interestScores: { [key: string]: number } = {};

    interestEmbeddingsMap.forEach(({ category, embedding: catEmbedding }) => {
      let totalSimilarity = 0;
      let messageCount = 0;

      res.matches.forEach(match => {
        if (match.values && match.values.length === DIM) {
          const similarity = cosineSimilarity(catEmbedding, match.values);
          // Only count messages with reasonable similarity
          if (similarity > 0.7) {
            totalSimilarity += similarity;
            messageCount++;
          }
        }
      });

      // Store both count and average similarity
      interestScores[category] = messageCount;
    });

    console.log('🎯 Shared Interest Scores:', interestScores);

    // Get top 5 shared interests
    const topInterests = Object.entries(interestScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, _]) => category);

    const response = await coachSharedInterestsAI(fetchedData, {
      topInterests,
      interestScores,
    });

    await sendCoachMessage(coachCid, response);
    return { ok: true };
  }
);

//--------------------------------------------------------------------------
// 11) coachTopicChampion - Topic Champion Identifier (Group, RAG)
//--------------------------------------------------------------------------
export const coachTopicChampion = onCall<CoachTopicChampionData>(
  async request => {
    const data = await validateCoachParams(request);
    const { coachCid, parentCid } = data;

    // Fetch conversation data
    const fetchedData = await fetchAllRequiredData(request);

    // Query all messages with user info
    const allMessages = await getAllMessagesWithUserInfo(parentCid);

    // Common topic categories to analyze
    const TOPIC_CATEGORIES = [
      'planning and organizing',
      'jokes and humor',
      'personal problems and support',
      'work and career',
      'entertainment and media',
      'food and dining',
      'sports and fitness',
      'technology and gadgets',
    ];

    // Generate embeddings for topics
    const topicEmbeddings = await generateEmbeddings(TOPIC_CATEGORIES);

    // Track who brings up each topic most
    const topicChampions: {
      [topic: string]: { [userId: string]: number };
    } = {};

    // Initialize topic champions
    TOPIC_CATEGORIES.forEach(topic => {
      topicChampions[topic] = {};
    });

    // Analyze each message
    for (const msg of allMessages) {
      // if (msg.type !== 'text' || !msg.text) continue;

      // Generate embedding for this message
      const msgEmbedding = await generateEmbeddings([msg.text]);
      if (!msgEmbedding[0]) continue;

      // Find which topic this message is most similar to
      let maxSimilarity = 0;
      let bestTopic = '';

      topicEmbeddings.forEach(({ text: topic, embedding }) => {
        const similarity = cosineSimilarity(
          msgEmbedding[0].embedding,
          embedding
        );
        if (similarity > maxSimilarity && similarity > 0.75) {
          maxSimilarity = similarity;
          bestTopic = topic;
        }
      });

      // Credit the user for this topic
      if (bestTopic && msg.senderId) {
        const userName = msg.senderInfo?.displayName || msg.senderId;
        topicChampions[bestTopic][userName] =
          (topicChampions[bestTopic][userName] || 0) + 1;
      }
    }

    console.log('👑 Topic Champions:', topicChampions);

    const response = await coachTopicChampionAI(fetchedData, {
      topicChampions,
    });

    await sendCoachMessage(coachCid, response);
    return { ok: true };
  }
);

//--------------------------------------------------------------------------
// 12) coachFriendshipCheckin - Friendship Check-in Generator (Platonic)
//--------------------------------------------------------------------------
export const coachFriendshipCheckin = onCall<CoachFriendshipCheckinData>(
  async request => {
    const data = await validateCoachParams(request);
    const { coachCid } = data;

    // Fetch conversation data
    const fetchedData = await fetchAllRequiredData(request);

    // Analyze message patterns
    const messages = fetchedData.parentMessages || [];
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Calculate recent vs older message stats
    const recentMessages = messages.filter(m => m.createdAt > oneWeekAgo);
    const olderMessages = messages.filter(
      m => m.createdAt <= oneWeekAgo && m.createdAt > oneMonthAgo
    );

    // Calculate average message length
    const avgRecentLength =
      recentMessages.reduce((sum, m) => sum + (m.text?.length || 0), 0) /
      (recentMessages.length || 1);
    const avgOlderLength =
      olderMessages.reduce((sum, m) => sum + (m.text?.length || 0), 0) /
      (olderMessages.length || 1);

    // Calculate response times
    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].senderId !== messages[i - 1].senderId) {
        responseTimes.push(messages[i].createdAt - messages[i - 1].createdAt);
      }
    }

    const avgResponseTime =
      responseTimes.reduce((sum, t) => sum + t, 0) /
      (responseTimes.length || 1);

    const stats = {
      recentMessageCount: recentMessages.length,
      olderMessageCount: olderMessages.length,
      avgRecentLength,
      avgOlderLength,
      avgResponseTime,
      messageLengthChange:
        ((avgRecentLength - avgOlderLength) / avgOlderLength) * 100,
    };

    console.log('📊 Friendship Stats:', stats);

    const response = await coachFriendshipCheckinAI(fetchedData, stats);

    await sendCoachMessage(coachCid, response);
    return { ok: true };
  }
);

//--------------------------------------------------------------------------
// 13) coachGroupEnergy - Group Energy Tracker (Group)
//--------------------------------------------------------------------------
export const coachGroupEnergy = onCall<CoachGroupEnergyData>(async request => {
  const data = await validateCoachParams(request);
  const { coachCid } = data;

  // Fetch conversation data
  const fetchedData = await fetchAllRequiredData(request);

  const messages = fetchedData.parentMessages || [];
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Get messages from different time periods
  const todayMessages = messages.filter(m => m.createdAt > oneDayAgo);
  const weekMessages = messages.filter(m => m.createdAt > oneWeekAgo);

  // Count emoji usage
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
  const todayEmojis = todayMessages.reduce(
    (count, m) => count + (m.text?.match(emojiRegex)?.length || 0),
    0
  );
  const weekEmojis = weekMessages.reduce(
    (count, m) => count + (m.text?.match(emojiRegex)?.length || 0),
    0
  );

  // Calculate unique participants
  const todayParticipants = new Set(todayMessages.map(m => m.senderId)).size;
  const weekParticipants = new Set(weekMessages.map(m => m.senderId)).size;

  // Calculate average response time today
  const todayResponseTimes: number[] = [];
  for (let i = 1; i < todayMessages.length; i++) {
    if (todayMessages[i].senderId !== todayMessages[i - 1].senderId) {
      todayResponseTimes.push(
        todayMessages[i].createdAt - todayMessages[i - 1].createdAt
      );
    }
  }

  const avgTodayResponseTime =
    todayResponseTimes.reduce((sum, t) => sum + t, 0) /
    (todayResponseTimes.length || 1);

  // Calculate energy score (0-100)
  let energyScore = 50; // Base score

  // Message frequency (up to +20)
  if (todayMessages.length > 20) energyScore += 20;
  else energyScore += todayMessages.length;

  // Emoji usage (up to +15)
  if (todayEmojis > 10) energyScore += 15;
  else energyScore += todayEmojis * 1.5;

  // Participation (up to +15)
  const participationRate = todayParticipants / weekParticipants;
  energyScore += participationRate * 15;

  // Response time bonus (quick responses = higher energy)
  if (avgTodayResponseTime < 5 * 60 * 1000)
    energyScore += 10; // <5 min
  else if (avgTodayResponseTime < 30 * 60 * 1000) energyScore += 5; // <30 min

  // Cap at 100
  energyScore = Math.min(100, Math.round(energyScore));

  const stats = {
    energyScore,
    todayMessages: todayMessages.length,
    weekMessages: weekMessages.length,
    todayEmojis,
    todayParticipants,
    weekParticipants,
    avgResponseTimeMinutes: Math.round(avgTodayResponseTime / (60 * 1000)),
  };

  console.log('⚡ Group Energy Stats:', stats);

  const response = await coachGroupEnergyAI(fetchedData, stats);

  await sendCoachMessage(coachCid, response);
  return { ok: true };
});

// 14) coachTopicVibeCheck - Topic Vibe Check (All types)
interface CoachTopicVibeCheckData {
  coachCid: string;
  parentCid: string;
}

export const coachTopicVibeCheck = onCall<CoachTopicVibeCheckData>(
  async request => {
    const { coachCid, parentCid } = request.data;

    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const fetchedData = await fetchAllRequiredData(request);

    if (!fetchedData) {
      throw new HttpsError('not-found', 'Required data not found');
    }

    // Check message count requirement
    const messageCount = fetchedData.parentMessages.length;
    if (messageCount < 50) {
      await sendCoachMessage(
        coachCid,
        `I need at least 50 messages to analyze topic vibes effectively. You currently have ${messageCount} messages. Keep chatting and try again later!`
      );
      return { ok: true };
    }

    // Generate embeddings for all topics
    const embeddings = await generateEmbeddings(TOPIC_VIBE_TOPICS);
    const topicEmbeddings = embeddings.map(({ text, embedding }) => ({
      topic: text,
      embedding,
    }));

    // Get sentiment scores for each topic
    const topicScores = await Promise.all(
      topicEmbeddings.map(async ({ topic, embedding }) => {
        const sentiment = await getTopicSentiment(embedding, parentCid);
        return {
          topic,
          score: sentiment.avg,
        };
      })
    );

    // Filter out topics with no data
    const validTopics = topicScores.filter(t => t.score !== 0);

    if (validTopics.length === 0) {
      await sendCoachMessage(
        coachCid,
        'I need more conversation history to analyze your topic vibes. Keep chatting and try again later!'
      );
      return { ok: true };
    }

    const response = await aiTopicVibeCheck(fetchedData, validTopics);
    await sendCoachMessage(coachCid, response);
    return { ok: true };
  }
);
