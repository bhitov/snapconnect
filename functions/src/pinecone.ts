import { Pinecone } from '@pinecone-database/pinecone';
import type { QueryResponse } from '@pinecone-database/pinecone';

import { config } from './config';

// Initialize Pinecone
const pineconeApiKey = config.PINECONE_API_KEY;
const pineconeIndex = config.PINECONE_INDEX;

if (!pineconeApiKey) {
  throw new Error('PINECONE_API_KEY environment variable is not set');
}
if (!pineconeIndex) {
  throw new Error('PINECONE_INDEX environment variable is not set');
}

const pine = new Pinecone({ apiKey: pineconeApiKey });
export const index = pine.index(pineconeIndex);

export const DIM = 1536; // text-embedding-3-small

export interface MessageMetadata extends Record<string, any> {
  conversationId?: string;
  senderId?: string;
  text?: string;
  createdAt?: number;
  sentiment?: string;
  horseman?: string;
}

export interface ConversationStats {
  positive: number;
  negative: number;
  neutral: number;
  ratio: string;
  horsemen: HorsemanCounts;
  totalMessages: number;
}

export interface HorsemanCounts {
  criticism: number;
  contempt: number;
  defensiveness: number;
}

export async function getTopicSentiment(
  topicEmbedding: number[],
  conversationId: string,
  topK = 30,
  similarityFloor = 0.3
): Promise<{ avg: number; n: number; positives: number; negatives: number }> {
  const r = await index.query({
    vector: topicEmbedding,
    topK,
    includeMetadata: true,
    filter: {
      conversationId: conversationId,
    },
  });

  let wSum = 0,
    wTot = 0,
    pos = 0,
    neg = 0;
  for (const m of r.matches) {
    // Only process matches above similarity threshold
    if (m.score && m.score >= similarityFloor) {
      // Parse sentiment - it might be stored as string "positive", "negative", "neutral"
      // or as a number
      let sentimentScore = 0;
      const sentimentValue = m.metadata?.sentiment;

      if (typeof sentimentValue === 'string') {
        if (sentimentValue === 'positive') sentimentScore = 1;
        else if (sentimentValue === 'negative') sentimentScore = -1;
        else sentimentScore = 0; // neutral
      } else if (typeof sentimentValue === 'number') {
        sentimentScore = sentimentValue;
      }

      const w = m.score;
      wSum += sentimentScore * w;
      wTot += w;

      if (sentimentScore > 0.3) pos++;
      else if (sentimentScore < -0.3) neg++;
    }
  }

  return {
    avg: wTot ? wSum / wTot : 0,
    n: r.matches.filter(m => m.score && m.score >= similarityFloor).length,
    positives: pos,
    negatives: neg,
  };
}
/**
 * Query messages from Pinecone for a conversation
 */
export async function queryConversationMessages(
  conversationId: string,
  limit: number = 100
): Promise<QueryResponse<MessageMetadata>> {
  const response = await index.query({
    vector: new Array(DIM).fill(0),
    topK: limit,
    filter: { conversationId },
    includeMetadata: true,
  });

  // Sort by timestamp
  response.matches.sort((a, b) => {
    const aTime = (a.metadata?.createdAt as number) ?? 0;
    const bTime = (b.metadata?.createdAt as number) ?? 0;
    return aTime - bTime;
  });

  return response;
}

/**
 * Analyze conversation statistics from Pinecone query results
 */
export function analyzeConversationStats(
  matches: QueryResponse<MessageMetadata>['matches']
): ConversationStats {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  const horsemen: HorsemanCounts = {
    criticism: 0,
    contempt: 0,
    defensiveness: 0,
  };

  matches.forEach(match => {
    // Sentiment analysis
    if (match.metadata?.sentiment === 'pos') positive++;
    else if (match.metadata?.sentiment === 'neg') negative++;
    else neutral++;

    // Horsemen analysis
    const h = match.metadata?.horseman as string;
    if (h && h !== 'none' && h in horsemen) {
      horsemen[h as keyof HorsemanCounts]++;
    }
  });

  const totalMessages = matches.length;
  const ratio = negative > 0 ? (positive / negative).toFixed(2) : '∞';

  return {
    positive,
    negative,
    neutral,
    ratio,
    horsemen,
    totalMessages,
  };
}

/**
 * Format messages from Pinecone results as conversation snippets
 */
export function formatPineconeMessages(
  matches: QueryResponse<MessageMetadata>['matches']
): string {
  return matches
    .map(m => `${m.metadata?.senderId}: ${m.metadata?.text}`)
    .join('\n');
}
