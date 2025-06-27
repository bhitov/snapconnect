import { db } from './admin';
import { Pinecone } from '@pinecone-database/pinecone';
import { randomUUID } from 'crypto';

/**
 * Backfill script to sync existing chat messages from Firebase to Pinecone
 * for vector search capabilities
 */

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.index(process.env.PINECONE_INDEX!);

(async () => {
  const convSnap = await db.ref('conversations').get();
  if (!convSnap.exists()) return;

  for (const [cid] of Object.entries(convSnap.val() as Record<string, any>)) {
    const msgsSnap = await db
      .ref('textMessages')
      .orderByChild('conversationId')
      .equalTo(cid)
      .get();

    if (!msgsSnap.exists()) continue;

    const vectors = Object.entries(msgsSnap.val()).map(([mid, m]: [string, any]) => ({
      id: mid,
      values: computeEmbedding(`${m.senderId} ${m.text}`),
      metadata: { conversationId: cid, senderId: m.senderId, createdAt: m.createdAt }
    }));

    await index.upsert(vectors);
    console.log(`✅ ${cid}: ${vectors.length} messages`);
  }
})();

/**
 * Compute embedding vector for text content
 * TODO: Replace with actual embedding service (OpenAI, Cohere, etc.)
 */
function computeEmbedding(text: string): number[] {
  return Array.from({ length: 8 }, () => Math.random());   // plug in your encoder
}