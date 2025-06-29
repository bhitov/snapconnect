import OpenAI from 'openai';
import { HttpsError } from 'firebase-functions/v2/https';
import { config } from 'dotenv';
import { resolve } from 'path';

// Initialize OpenAI client
config({ path: resolve(__dirname, '../../.env.local') });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Call OpenAI with consistent logging and error handling
 */
export async function callOpenAI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const { model = 'gpt-4o-mini', temperature = 0.5, maxTokens } = options;

  console.log('🤖 OpenAI Request:', {
    model,
    temperature,
    maxTokens,
    messageCount: messages.length,
    messages: messages.map(m => ({
      role: m.role,
      contentLength: m.content.length,
      // contentPreview: m.content.substring(0, 100) + '...',
      contentPreview: m.content,
    })),
  });

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      messages,
      ...(maxTokens && { max_tokens: maxTokens }),
    });

    const content =
      response.choices[0]?.message?.content?.trim() ??
      'Unable to generate response at this time.';

    //     console.log('🤖 OpenAI Response:', {
    //       contentLength: content.length,
    //       usage: response.usage,
    //     });

    return content;
  } catch (error) {
    console.error('❌ OpenAI Error:', error);
    throw new HttpsError('internal', 'Failed to generate AI response');
  }
}

/**
 * Generate embeddings for a given text
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model,
      input: text,
    });

    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error('❌ OpenAI Embedding Error:', error);
    throw new HttpsError('internal', 'Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in parallel
 */
export async function generateEmbeddings(
  texts: string[],
  model: string = 'text-embedding-3-small'
): Promise<Array<{ text: string; embedding: number[] }>> {
  try {
    const embeddings = await Promise.all(
      texts.map(async text => {
        const embedding = await generateEmbedding(text, model);
        return { text, embedding };
      })
    );

    return embeddings;
  } catch (error) {
    console.error('❌ OpenAI Embeddings Error:', error);
    throw new HttpsError('internal', 'Failed to generate embeddings');
  }
}

/**
 * Helper function to calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += (vecA[i] || 0) * (vecB[i] || 0);
    normA += (vecA[i] || 0) * (vecB[i] || 0);
    normB += (vecB[i] || 0) * (vecB[i] || 0);
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
