import { Pinecone } from '@pinecone-database/pinecone';
import type { QueryResponse } from '@pinecone-database/pinecone';

// Initialize Pinecone
const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndex = process.env.PINECONE_INDEX;

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