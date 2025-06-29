import { callOpenAI } from './openai';
import type { TextMessage } from './db';
import type { FetchedData } from './types';
import type { ConversationStats } from './pinecone';

// Base system message for all coach interactions
const BASE_SYSTEM_MESSAGE = `You are a Gottman-trained relationship coach providing personalized guidance to help someone improve their relationship. 
You are analyzing their conversation with their partner and offering advice based on Gottman Method principles.`;

// Additional context for specific analysis types
export const GOTTMAN_CONTEXT = {
  ratio: `Dr. John Gottman's research identified that successful couples maintain a 5:1 ratio of positive to negative interactions during conflict, 
and even higher during everyday interactions. This 'magic ratio' is one of the strongest predictors of relationship success. 
Positive interactions include expressions of interest, affection, humor, empathy, and acceptance, 
while negative interactions include criticism, contempt, defensiveness, and stonewalling.
I'll help you understand your ratio and provide strategies to improve it.`,

  horsemen: `Dr. John Gottman identified these four communication patterns as the strongest predictors of relationship failure: 
1) Criticism (attacking character vs. addressing behavior)
2) Contempt (superiority, disrespect, mockery)
3) Defensiveness (playing victim, counter-attacking)
4) Stonewalling (emotional withdrawal)

Each horseman has specific antidotes that you can practice: using "I" statements instead of criticism, 
building appreciation to counter contempt, taking responsibility instead of being defensive, 
and learning self-soothing techniques to prevent stonewalling.`,

  loveMap: `Dr. John Gottman's Love Map concept refers to the part of your brain where you store all the relevant information 
about your partner's life - their hopes, dreams, fears, stresses, and joys. 
Having a detailed Love Map of your partner's inner world helps you both handle stressful events and conflict better. 
You can build your Love Map by asking open-ended questions and staying curious about your partner's evolving inner world.`,
};

interface CallCoachAIOptions extends FetchedData {
  //   parentMessages?: TextMessage[];
  //   coachMessages?: TextMessage[];
  temperature?: number;
}

/**
 * Helper function to call OpenAI with coach-specific context
 */
export async function callCoachAI(
  systemMessage: string,
  userMessage: string,
  options: CallCoachAIOptions
): Promise<string> {
  const {
    parentMessages = [],
    coachMessages = [],
    temperature = 0.5,
  } = options;

  const messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }> = [];
  // const parentConvoHistory =  their partner. Keep in mind that this may not be the full conversation:\n${parentLines}\n\n${userMessage}`;
  const parentLines = parentMessages
    .map(m => {
      // For messages with user info, use display name
      if ('senderInfo' in m && m.senderInfo) {
        const name =
          m.senderInfo.displayName || m.senderInfo.username || m.senderId;
        return `${name}: ${m.text}`;
      }
      // Fallback for regular messages
      return `${m.senderId}: ${m.text}`;
    })
    .join('\n');

  const parentConvoHistory =
    parentLines.length > 0
      ? `Here are the last ${parentMessages.length} messages from ${options.displayName}'s chat` +
        ` with their partner. (this may not be their full conversation):\n${parentLines}\n\n`
      : '';

  const content =
    BASE_SYSTEM_MESSAGE +
    `

    ${systemMessage}

    you are acting as a coach and therapist to ${options.displayName}, to whom you are talking

    ${parentConvoHistory}`;

  // Always add base system message
  messages.push({ role: 'system', content });

  // Add coach chat history if provided
  coachMessages.forEach(msg => {
    if (msg.senderId === 'coach') {
      messages.push({ role: 'assistant', content: msg.text });
    } else {
      messages.push({ role: 'user', content: msg.text });
    }
  });

  // Build final user message with parent chat context if provided
  let finalUserMessage = userMessage;
  //   if (parentMessages.length > 0) {
  //     const parentLines = parentMessages
  //       .map(m => {
  //         // For messages with user info, use display name
  //         if ('senderInfo' in m && m.senderInfo) {
  //           const name = m.senderInfo.displayName || m.senderInfo.username || m.senderId;
  //           return `${name}: ${m.text}`;
  //         }
  //         // Fallback for regular messages
  //         return `${m.senderId}: ${m.text}`;
  //       })
  //       .join('\n');
  //     finalUserMessage = `Here are the last ${parentMessages.length} messages from ${options.displayName}'s chat` +
  //     ` with their partner. Keep in mind that this may not be the full conversation:\n${parentLines}\n\n${userMessage}`;
  // }

  messages.push({ role: 'user', content: finalUserMessage });

  return callOpenAI(messages, { temperature });
}

/**
 * Analyze conversation data and generate coach response
 * Pure function for testing - no database calls
 */
export async function coachAnalyzeAI(
  data: FetchedData,
  context: {
    stats: ConversationStats;
  }
): Promise<string> {
  return callCoachAI(
    `${data.displayName} has a P:N ratio of ${context.stats.ratio}, Horsemen ${JSON.stringify(context.stats.horsemen)}.\n\n` +
      `${data.displayName} is unfamiliar with the Gottman method and any gottman concepts you use must be explained. Do
    not use a concept like the 4 horsemen without giving a brief explanation of what the concept of the 4 horsemen is`,
    'Give two observations and two action steps (≤ 400 words total).\n' +
      'if they are relevant,use examples from the conversation to support your observations (positive or negative) and action steps.',
    { temperature: 0.4, ...data, coachMessages: undefined }
  );
}

/**
 * Generate reply to user message
 * Pure function for testing - no database calls
 */
export async function coachReplyAI(
  data: FetchedData,
  context: {
    userText: string;
    stats: ConversationStats;
  }
): Promise<string> {
  return callCoachAI(
    '',
    `${context.userText}"\n (Respond empathetically in ≤120 words.)`,
    {
      ...data,
      temperature: 0.5,
    }
  );
}

/**
 * Analyze positive/negative ratio
 * Pure function for testing - no database calls
 */
export async function coachRatioAI(
  data: FetchedData,
  context: {
    stats: ConversationStats;
    total: number;
    posPercent: string;
    negPercent: string;
    neuPercent: string;
  }
): Promise<string> {
  return callCoachAI(
    `**ANALYSIS RESULTS:**
Total messages analyzed: ${context.total}
- Positive interactions: ${context.stats.positive} (${context.posPercent}%)
- Negative interactions: ${context.stats.negative} (${context.negPercent}%)
- Neutral interactions: ${context.stats.neutral} (${context.neuPercent}%)
- Current positive-to-negative ratio: ${context.stats.ratio}:1

**GOTTMAN CONTEXT:** ${GOTTMAN_CONTEXT.ratio}`,
    `

First, give a very short explanation of the gottman idea of the magic ratio. 1 or 2 short sentences.

Then, give feedback. Include these statistics in your response and provide specific, actionable advice based ` +
      `on Gottman Method principles to help improve the relationship ratio. Use positive and negative` +
      `examples from the conversation to support your advice if they are available. Keep this portion of the response under 150 words.`,
    { ...data, temperature: 0.4, coachMessages: undefined }
  );
}

/**
 * Analyze Four Horsemen patterns
 * Pure function for testing - no database calls
 */
export async function coachHorsemenAI(
  data: FetchedData,
  context: {
    stats: ConversationStats;
    horsemanTotal: number;
    horsemanPercent: string;
  }
): Promise<string> {
  return callCoachAI(
    `**FOUR HORSEMEN ANALYSIS:**
Total messages analyzed: ${context.stats.totalMessages}
- Criticism: ${context.stats.horsemen.criticism} instances
- Contempt: ${context.stats.horsemen.contempt} instances  
- Defensiveness: ${context.stats.horsemen.defensiveness} instances
- Total destructive patterns: ${context.horsemanTotal} (${context.horsemanPercent}% of messages)

**GOTTMAN CONTEXT:** ${GOTTMAN_CONTEXT.horsemen}`,
    `

First, give a very short explanation of the idea of the four horsemen. 1 or 2 short sentences.

Then, give feedback. Include these specific statistics in your response. Explain what these patterns mean for the ` +
      `relationship and provide Gottman Method antidotes and strategies they can use to replace these ` +
      `with healthier communication. Use positive and negative examples from the conversation to support ` +
      `your advice if they are available. Keep this portion of the response under 250 words.`,
    { ...data, temperature: 0.4, coachMessages: undefined }
  );
}

/**
 * Generate Love Map questions
 * Pure function for testing - no database calls
 */
export async function coachLoveMapAI(
  data: FetchedData,
  context: {
    selectedTopic: string;
    topicScore: number;
  }
): Promise<string> {
  return callCoachAI(
    `**TOPIC ANALYSIS:** Based on semantic analysis of their conversation, the topic "${context.selectedTopic}" appears to be under-explored (similarity score: ${context.topicScore.toFixed(3)}).

**GOTTMAN CONTEXT:** ${GOTTMAN_CONTEXT.loveMap}`,
    `

First, give a very short explanation of the idea of the love map. 1 or 2 short sentences.

Then, provide a brief explanation of why "${context.selectedTopic}" matters for building Love Maps, then suggest a specific question. Format your response as:

1. Brief Gottman-based explanation of why this topic matters
2. A specific, thoughtful question to ask (mark it clearly with "QUESTION: " prefix)

Keep total response under 220 words.`,
    {
      ...data,
      temperature: 0.6,
      parentMessages: undefined,
      coachMessages: undefined,
    }
  );
}
