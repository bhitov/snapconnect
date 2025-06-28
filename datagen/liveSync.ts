import { Pinecone } from '@pinecone-database/pinecone';
import { DataSnapshot } from 'firebase-admin/database';

import { db } from './admin';
import { config } from './config';

/**
 * Live sync service that listens to Firebase database changes and syncs to Pinecone
 * for real-time vector search capabilities on chat messages
 */

const pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY });
const index = pinecone.index(config.PINECONE_INDEX);

/**
 * Listen for new text messages and sync them to Pinecone for vector search
 */
db.ref('textMessages').on('child_added', async (snap: DataSnapshot) => {
  const m = snap.val();
  await index.upsert([
    {
      id: snap.key || '',
      values: computeEmbedding(`${m.senderId} ${m.text}`),
      metadata: {
        conversationId: m.conversationId,
        senderId: m.senderId,
        createdAt: m.createdAt,
      },
    },
  ]);

  console.log(`📌 Pinecone upsert ${snap.key}`);
});

/**
 * Compute embedding vector for text content
 * TODO: Replace with actual embedding service (OpenAI, Cohere, etc.)
 */
function computeEmbedding(text: string): number[] {
  return Array.from({ length: 8 }, () => Math.random());
}
