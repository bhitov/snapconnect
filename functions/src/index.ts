import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from root project directory
config({ path: resolve(__dirname, "../../.env.local") });

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp }          from "firebase-admin/app";
import { getDatabase }            from "firebase-admin/database";
import { randomUUID }             from "crypto";

import { Pinecone }               from "@pinecone-database/pinecone";
import OpenAI                     from "openai";

initializeApp();                              // auto-detects emulator or prod
const db      = getDatabase();

const pine    = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index   = pine.index(process.env.PINECONE_INDEX!);
const openai  = new OpenAI();

const DIM = 1536;                             // text-embedding-3-small
const RECENT_PARENT = 50;                     // last 50 msgs

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
  'personal growth goals'
];

// Central OpenAI function with logging
async function callOpenAI(
  messages: Array<{role: string, content: string}>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: any;
  } = {}
) {
  const {
    model = "gpt-4o-mini",
    temperature = 0.5,
    maxTokens,
    responseFormat
  } = options;

  console.log('🤖 OpenAI Request:', {
    model,
    temperature,
    maxTokens,
    messageCount: messages.length,
    messages: messages.map(m => ({
      role: m.role,
      contentLength: m.content.length,
      contentPreview: m.content,
    }))
  });

  const requestOptions: any = {
    model,
    temperature,
    messages,
  };

  if (maxTokens) requestOptions.max_tokens = maxTokens;
  if (responseFormat) requestOptions.response_format = responseFormat;

  const response = await openai.chat.completions.create(requestOptions);
  
  const content = response.choices[0]?.message?.content?.trim() ?? "Unable to generate response at this time.";
  const usage = response.usage;
  
  console.log('🤖 OpenAI Response:', {
    contentLength: content.length,
    contentPreview: content,
    usage: {
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens
    }
  });

  return content;
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

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

interface HorsemanCounts {
  criticism: number;
  contempt: number;
  defensiveness: number;
}

//--------------------------------------------------------------------------
// 1) startCoachChat  (creates one coach chat per parentCid per user)
//--------------------------------------------------------------------------
export const startCoachChat = onCall<StartCoachChatData>(async (request) => {
  const { data } = request;
  const uid = request.auth?.uid;
  const { parentCid } = data;
  
  if (!uid || !parentCid) throw new HttpsError("invalid-argument", "auth/parentCid");

  // Does coach chat already exist?
  const node = await db.ref(`coachIndex/${uid}/${parentCid}`).get();
  if (node.exists()) return { coachCid: node.val() as string };

  // Create new conversation
  const coachCid = randomUUID();
  const now      = Date.now();
  await db.ref().update({
    [`conversations/${coachCid}`]: {
      participants: [uid, "coach"],
      isCoach     : true,
      parentCid,
      createdAt   : now
    },
    [`conversations/${parentCid}/coachChatId`]: coachCid,
    [`coachIndex/${uid}/${parentCid}`]: coachCid
  });

  // First "hello" from the coach
  const helloId = randomUUID();
  await db.ref(`textMessages/${helloId}`).set({
    conversationId: coachCid,
    senderId      : "coach",
    text          : "Hi! I'm your relationship coach. Ask me anything or choose an option from the menu. TEST",
    createdAt     : now
  });

  return { coachCid };
});

//--------------------------------------------------------------------------
// 2) coachReply  (fires for every user message in the coach chat)
//--------------------------------------------------------------------------
export const coachReply = onCall<CoachReplyData>(async (request) => {
  const { data } = request;
  const uid = request.auth?.uid;
  const { coachCid, parentCid, userText } = data;
  
  if (!uid || !coachCid || !parentCid || !userText)
    throw new HttpsError("invalid-argument", "missing params");

  const now  = Date.now();
  const userMid = randomUUID();               // store the user's message first
  await db.ref(`textMessages/${userMid}`).set({
    conversationId: coachCid,
    senderId      : uid,
    text          : userText,
    createdAt     : now
  });

  // ---- A)  Last 20 messages from coach chat for continuity
  const coachCtxSnap = await db.ref("textMessages")
    .orderByChild("conversationId").equalTo(coachCid)
    .limitToLast(20).get();
  const coachCtx = Object.values(coachCtxSnap.val() ?? {}) as any[];
  coachCtx.sort((a,b)=>a.createdAt-b.createdAt);          // oldest→newest
  const coachLines = coachCtx.map(m => `${m.senderId === "coach" ? "Coach" : "You"}: ${m.text}`).join("\n");

  // ---- B)  Last 50 messages & stats from parent chat (Pinecone)
  const parentMsgs = await index.query({
    vector: new Array(DIM).fill(0),
    topK:   RECENT_PARENT,
    filter: { conversationId: parentCid },              // metadata filter
    includeMetadata: true
  });
  parentMsgs.matches.sort((a,b)=>{
    const aTime = a.metadata?.createdAt as number ?? 0;
    const bTime = b.metadata?.createdAt as number ?? 0;
    return aTime - bTime;
  });

  let pos=0, neg=0;
  const horse: HorsemanCounts = { criticism:0, contempt:0, defensiveness:0 };
  parentMsgs.matches.forEach(m=>{
    if (m.metadata?.sentiment==="pos") pos++;
    else if (m.metadata?.sentiment==="neg") neg++;
    const h = m.metadata?.horseman as string;
    if (h && h !== "none" && h in horse) {
      horse[h as keyof HorsemanCounts]++;
    }
  });
  const ratio = neg ? (pos/neg).toFixed(2) : "∞";
  const parentLines = parentMsgs.matches.map(m=>`${m.metadata?.senderId}: ${m.metadata?.text}`).join("\n");

  // ---- C)  GPT-4o-mini response
  const reply = await callOpenAI([
    { role:"system", content: "You are a Gottman-trained relationship coach helping a couple improve their relationship. You are analyzing their conversation and providing personalized guidance based on Gottman Method principles." },
    { role:"assistant", content: `Context of our chat so far:\n${coachLines}` },
    { role:"user", content:
      `Here are the last ${RECENT_PARENT} messages from the main chat:\n${parentLines}\n\n`+
      `Positive-to-Negative ratio: ${ratio}; Horsemen counts: ${JSON.stringify(horse)}\n\n`+
      `User says: "${userText}"\nRespond empathetically in ≤120 words.` }
  ], { temperature: 0.5 });

  // ---- D)  persist coach message
  const coachMid = randomUUID();
  await db.ref(`textMessages/${coachMid}`).set({
    conversationId: coachCid,
    senderId      : "coach",
    text          : reply,
    createdAt     : Date.now()
  });

  return { reply };
});

//--------------------------------------------------------------------------
// 3) coachAnalyze  (triggered from dropdown)
//--------------------------------------------------------------------------
export const coachAnalyze = onCall<CoachAnalyzeData>(async (request) => {
  const { data } = request;
  const uid = request.auth?.uid;
  const { coachCid, parentCid, n = 30 } = data;
  
  if (!uid || !coachCid || !parentCid)
    throw new HttpsError("invalid-argument", "params");

  // reuse same Pinecone logic as above
  const res = await index.query({
    vector: new Array(DIM).fill(0),
    topK:   n,
    filter: { conversationId: parentCid },
    includeMetadata: true
  });
  res.matches.sort((a,b)=>{
    const aTime = a.metadata?.createdAt as number ?? 0;
    const bTime = b.metadata?.createdAt as number ?? 0;
    return aTime - bTime;
  });

  let pos=0, neg=0; 
  const horse: HorsemanCounts = {criticism:0, contempt:0, defensiveness:0};
  res.matches.forEach(m=>{
    if(m.metadata?.sentiment==="pos") pos++; 
    else if(m.metadata?.sentiment==="neg") neg++;
    const h = m.metadata?.horseman as string;
    if (h && h !== "none" && h in horse) {
      horse[h as keyof HorsemanCounts]++;
    }
  });
  const ratio = neg ? (pos/neg).toFixed(2) : "∞";
  const snippets = res.matches.map(m=>`${m.metadata?.senderId}: ${m.metadata?.text}`).join("\n");

  const summary = await callOpenAI([
    {role:"system",content:"You are a Gottman-trained relationship coach analyzing a couple's conversation. Provide insights based on Gottman Method research and principles."},
    {role:"user",content:
      `P:N ratio ${ratio}, Horsemen ${JSON.stringify(horse)}.\n\nSnippets:\n${snippets}\n\n`+
      "Give two observations and two action steps (≤ 100 words total)."}
  ], { temperature: 0.4 });

  const mid = randomUUID();
  await db.ref(`textMessages/${mid}`).set({
    conversationId: coachCid,
    senderId      : "coach",
    text          : summary,
    createdAt     : Date.now()
  });
  return { ok:true };
});

//--------------------------------------------------------------------------
// 4) coachRatio - Positive/Negative Ratio Analysis
//--------------------------------------------------------------------------
export const coachRatio = onCall<CoachRatioData>(async (request) => {
  const { data } = request;
  const uid = request.auth?.uid;
  const { coachCid, parentCid } = data;
  
  if (!uid || !coachCid || !parentCid)
    throw new HttpsError("invalid-argument", "params");

  // Query Pinecone for sentiment analysis
  const res = await index.query({
    vector: new Array(DIM).fill(0),
    topK: 100,
    filter: { conversationId: parentCid },
    includeMetadata: true
  });

  let pos = 0, neg = 0, neu = 0;
  res.matches.forEach(m => {
    console.log(m);
    if (m.metadata?.sentiment === "pos") pos++;
    else if (m.metadata?.sentiment === "neg") neg++;
    else neu++;
  });

  const total = pos + neg + neu;
  const ratio = neg > 0 ? (pos / neg).toFixed(2) : "∞";
  const posPercent = total > 0 ? ((pos / total) * 100).toFixed(1) : "0";
  const negPercent = total > 0 ? ((neg / total) * 100).toFixed(1) : "0";

  const analysis = await callOpenAI([
    {
      role: "system",
      content: "You are a Gottman-trained relationship coach analyzing a couple's conversation. Dr. John Gottman's research identified that successful couples maintain a 5:1 ratio of positive to negative interactions during conflict, and even higher during everyday interactions. This 'magic ratio' is one of the strongest predictors of relationship success. Positive interactions include expressions of interest, affection, humor, empathy, and acceptance, while negative interactions include criticism, contempt, defensiveness, and stonewalling."
    },
    {
      role: "user",
      content: `**ANALYSIS RESULTS:**
Total messages analyzed: ${total}
- Positive interactions: ${pos} (${posPercent}%)
- Negative interactions: ${neg} (${negPercent}%)
- Neutral interactions: ${neu} (${((neu / total) * 100).toFixed(1)}%)
- Current positive-to-negative ratio: ${ratio}:1

**GOTTMAN CONTEXT:** Research shows healthy couples maintain at least a 5:1 positive-to-negative ratio. Include these statistics in your response and provide specific, actionable advice based on Gottman Method principles to help this couple improve their ratio. Keep response under 150 words.`
    }
  ], { temperature: 0.4 });

  const mid = randomUUID();
  await db.ref(`textMessages/${mid}`).set({
    conversationId: coachCid,
    senderId: "coach",
    text: analysis,
    createdAt: Date.now()
  });

  return { ok: true };
});

//--------------------------------------------------------------------------
// 5) coachHorsemen - Four Horsemen Analysis
//--------------------------------------------------------------------------
export const coachHorsemen = onCall<CoachHorsemenData>(async (request) => {
  const { data } = request;
  const uid = request.auth?.uid;
  const { coachCid, parentCid } = data;
  
  if (!uid || !coachCid || !parentCid)
    throw new HttpsError("invalid-argument", "params");

  // Query Pinecone for horsemen analysis
  const res = await index.query({
    vector: new Array(DIM).fill(0),
    topK: 100,
    filter: { conversationId: parentCid },
    includeMetadata: true
  });

  const horse: HorsemanCounts = { criticism: 0, contempt: 0, defensiveness: 0 };
  let totalMessages = 0;
  
  res.matches.forEach(m => {
    totalMessages++;
    const h = m.metadata?.horseman as string;
    if (h && h !== "none" && h in horse) {
      horse[h as keyof HorsemanCounts]++;
    }
  });

  const horsemanTotal = horse.criticism + horse.contempt + horse.defensiveness;
  const horsemanPercent = totalMessages > 0 ? ((horsemanTotal / totalMessages) * 100).toFixed(1) : "0";

  const analysis = await callOpenAI([
    {
      role: "system",
      content: "You are a Gottman-trained relationship coach analyzing a couple's conversation for the Four Horsemen of the Apocalypse. Dr. John Gottman identified these four communication patterns as the strongest predictors of relationship failure: 1) Criticism (attacking character vs. addressing behavior), 2) Contempt (superiority, disrespect, mockery), 3) Defensiveness (playing victim, counter-attacking), and 4) Stonewalling (emotional withdrawal). Each horseman has specific antidotes: complaints instead of criticism, building culture of appreciation vs. contempt, taking responsibility vs. defensiveness, and self-soothing vs. stonewalling."
    },
    {
      role: "user",
      content: `**FOUR HORSEMEN ANALYSIS:**
Total messages analyzed: ${totalMessages}
- Criticism: ${horse.criticism} instances
- Contempt: ${horse.contempt} instances  
- Defensiveness: ${horse.defensiveness} instances
- Total destructive patterns: ${horsemanTotal} (${horsemanPercent}% of messages)

**GOTTMAN CONTEXT:** Include these specific statistics in your response. Explain what these patterns mean for this couple and provide Gottman Method antidotes and strategies to replace them with healthier communication. Keep response under 150 words.`
    }
  ], { temperature: 0.4 });

  const mid = randomUUID();
  await db.ref(`textMessages/${mid}`).set({
    conversationId: coachCid,
    senderId: "coach",
    text: analysis,
    createdAt: Date.now()
  });

  return { ok: true };
});

//--------------------------------------------------------------------------
// 6) coachLoveMap - Love Map Questions with Topic Analysis
//--------------------------------------------------------------------------
export const coachLoveMap = onCall<CoachLoveMapData>(async (request) => {
  const { data } = request;
  const uid = request.auth?.uid;
  const { coachCid, parentCid } = data;
  
  if (!uid || !coachCid || !parentCid)
    throw new HttpsError("invalid-argument", "params");

  // Get full coach chat history for context
  const coachCtxSnap = await db.ref("textMessages")
    .orderByChild("conversationId").equalTo(coachCid)
    .get();
  const coachCtx = Object.values(coachCtxSnap.val() ?? {}) as any[];
  coachCtx.sort((a, b) => a.createdAt - b.createdAt);
  const coachHistory = coachCtx.map(m => `${m.senderId === "coach" ? "Coach" : "User"}: ${m.text}`).join("\n");

  // Query Pinecone to analyze topic coverage
  const res = await index.query({
    vector: new Array(DIM).fill(0),
    topK: 100,
    filter: { conversationId: parentCid },
    includeMetadata: true
  });

  // Generate embeddings for all love map topics
  const topicEmbeddings = await Promise.all(
    LOVE_MAP_TOPICS.map(async (topic) => {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: topic
      });
      return {
        topic,
        embedding: embedding.data[0].embedding
      };
    })
  );

  // Calculate similarity scores for each topic against conversation messages
  const topicScores: { [key: string]: number } = {};
  
  topicEmbeddings.forEach(({ topic, embedding: topicEmbedding }) => {
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
  const selectedTopic = sortedTopics[Math.floor(Math.random() * sortedTopics.length)][0];

  const response = await callOpenAI([
    {
      role: "system",
      content: "You are a Gottman-trained relationship coach helping a couple build their Love Maps. Dr. John Gottman's Love Map concept refers to the part of your brain where you store all the relevant information about your partner's life - their hopes, dreams, fears, stresses, and joys. Couples with detailed Love Maps of each other's inner world are better equipped to handle stressful events and conflict. Love Maps are built through open-ended questions that help partners stay connected to each other's evolving inner world."
    },
    {
      role: "assistant",
      content: `Our conversation history:\n${coachHistory}`
    },
    {
      role: "user",
      content: `**TOPIC ANALYSIS:** Based on semantic analysis of their conversation, the topic "${selectedTopic}" appears to be under-explored (similarity score: ${topicScores[selectedTopic].toFixed(3)}).

**GOTTMAN CONTEXT:** Love Maps help couples stay connected to each other's inner world. Provide a brief explanation of why "${selectedTopic}" matters for building Love Maps, then suggest a specific question. Format your response as:

1. Brief Gottman-based explanation of why this topic matters
2. A specific, thoughtful question to ask (mark it clearly with "QUESTION: " prefix)

Keep total response under 120 words.`
    }
  ], { temperature: 0.6 });

  const mid = randomUUID();
  await db.ref(`textMessages/${mid}`).set({
    conversationId: coachCid,
    senderId: "coach",
    text: response,
    createdAt: Date.now()
  });

  return { ok: true };
});