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
  const gpt = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    messages: [
      { role:"system", content: "You are a Gottman-style relationship coach." },
      { role:"assistant", content: `Context of our chat so far:\n${coachLines}` },
      { role:"user", content:
        `Here are the last ${RECENT_PARENT} messages from the main chat:\n${parentLines}\n\n`+
        `Positive-to-Negative ratio: ${ratio}; Horsemen counts: ${JSON.stringify(horse)}\n\n`+
        `User says: "${userText}"\nRespond empathetically in ≤120 words.` }
    ]
  });

  const reply = gpt.choices[0]?.message?.content?.trim() ?? "I'm sorry, I couldn't generate a response right now.";

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

  const gpt = await openai.chat.completions.create({
    model:"gpt-4o-mini",
    temperature:0.4,
    messages:[
      {role:"system",content:"You are a Gottman relationship expert summarizing a chat."},
      {role:"user",content:
        `P:N ratio ${ratio}, Horsemen ${JSON.stringify(horse)}.\n\nSnippets:\n${snippets}\n\n`+
        "Give two observations and two action steps (≤ 100 words total)."}
    ]
  });
  const summary = gpt.choices[0]?.message?.content?.trim() ?? "Unable to generate analysis at this time.";

  const mid = randomUUID();
  await db.ref(`textMessages/${mid}`).set({
    conversationId: coachCid,
    senderId      : "coach",
    text          : summary,
    createdAt     : Date.now()
  });
  return { ok:true };
});