import { callOpenAI } from './openai';

import type { ConversationStats } from './pinecone';
import type { FetchedData } from './types';

export const CHAT_TYPE = {
  romantic: 'partner',
  platonic: 'friend',
  group: 'group',
};

export const INITIAL_MESSAGE = {
  romantic: `Hi! I'm your Gottman-trained relationship coach. I'm here to help you improve your relationship.`,
  platonic: `Hi! I'm your Gottman-trained platonic-relationship coach. I'm here to help you improve your friendship.`,
  group: `Hi! I'm your Gottman-trained group-conversation coach. I'm here to help you improve your group conversation.`,
};

// Base system messages for different relationship types
const BASE_SYSTEM_MESSAGE = {
  romantic: `You are a Gottman-trained relationship coach providing personalized guidance to help someone improve their relationship. 
You are analyzing their conversation with their partner and offering advice based on Gottman Method principles.`,

  platonic: `You are a platonic-relationship coach who helps users deepen healthy friendships.
• Ground advice in: Active-Constructive Responding (ACR), Self-Determination Theory (SDT), the "friendship floors" of Gottman's Sound Relationship House, and Positive Psychology (PERMA).
• Never frame guidance romantically or sexually.`,

  group: `You are a personal group-conversation coach who helps THIS user contribute productively, inclusively, and confidently inside a live group chat.
• Source your guidance from: Psychological Safety (Project Aristotle), Tuckman's 5 stages, Lencioni's 5 Dysfunctions, Liberating Structures, and the ORID question model.`,
};

// Additional context for specific analysis types
// Topic vibe check topics - broad conversation themes
export const TOPIC_VIBE_TOPICS = [
  'hobbies and interests',
  'future plans and dreams',
  'memories and nostalgia',
  'entertainment and media',
  'food and cooking',
  'travel and adventures',
  'home and living space',
  'friends and social life',
  'personal growth and learning',
  'technology and gadgets',
  'sports and fitness',
  'music and arts',
  'nature and outdoors',
  'pets and animals',
  'weekend activities',
  'celebrations and holidays',
  'achievements and successes',
  'creative projects',
  'favorite places',
  'shared experiences',
  'games and fun',
];

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

  emotionalBids: `Dr. John Gottman's research on emotional bids shows that partners make countless attempts to connect throughout the day - 
these "bids" can be as simple as "Look at that bird" or as direct as "I need a hug." How partners respond to these bids is crucial: 
they can "turn toward" (acknowledge and engage), "turn away" (ignore or miss), or "turn against" (reject or respond negatively). 
Couples who turn toward each other's bids 86% of the time stay married, while those who only do so 33% of the time divorce. 
Building awareness of these micro-moments of connection opportunity is essential for relationship health.`,

  ruptureRepair: `Dr. John Gottman's concept of rupture and repair recognizes that all couples experience relationship injuries or "ruptures" - 
moments when trust is broken or partners hurt each other. What matters most is not avoiding ruptures but learning to repair them effectively. 
Successful repair attempts include: taking responsibility, offering sincere apologies, validating your partner's feelings, 
and committing to behavior change. The ability to repair after conflict is one of the strongest predictors of relationship longevity. 
Failed repairs often involve defensiveness, minimizing the hurt, or rushing to "move on" without addressing the underlying issue.`,
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

  const messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[] = [];
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
        ` with their ${CHAT_TYPE[options.relationshipType]}. (this may not be their full conversation):\n${parentLines}\n\n`
      : '';

  const baseMessage =
    BASE_SYSTEM_MESSAGE[options.relationshipType] ||
    BASE_SYSTEM_MESSAGE.romantic;

  const content =
    `${baseMessage}

    ${systemMessage}

    you are acting as a coach and therapist to ${options.displayName}, to whom you are talking. ` +
    `Refer to them in the second person ("You") not in the third person ("${options.displayName}").  
    use a conversational tone and don't be too preachy

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
  const finalUserMessage = userMessage;
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

/**
 * Analyze emotional bids in conversation
 * Pure function for testing - no database calls
 */
export async function coachBidsAI(data: FetchedData): Promise<string> {
  return callCoachAI(
    `**GOTTMAN CONTEXT:** ${GOTTMAN_CONTEXT.emotionalBids}`,
    `
First, give a very short explanation of emotional bids. 1 or 2 short sentences.

Then, analyze the conversation history for emotional bids - attempts by either partner to connect. Look for:
- Questions, requests, or statements seeking attention/connection
- How the partner responded (turned toward, turned away, or turned against)
- Patterns of connection or disconnection

Provide specific examples from the conversation if you find any bids. If no clear bids are detected, provide general guidance on recognizing and making bids for connection.

Keep total response under 250 words.`,
    { ...data, temperature: 0.4, coachMessages: undefined }
  );
}

/**
 * Analyze ruptures and provide repair guidance
 * Pure function for testing - no database calls
 */
export async function coachRuptureRepairAI(data: FetchedData): Promise<string> {
  return callCoachAI(
    `**GOTTMAN CONTEXT:** ${GOTTMAN_CONTEXT.ruptureRepair}`,
    `
First, give a very short explanation of the rupture and repair concept. 1 or 2 short sentences.

Then, analyze the conversation history for ruptures (conflicts, hurtful exchanges, breaks in connection). Look for:
- Instances of criticism, contempt, defensiveness, or stonewalling
- Moments where trust was broken or partners hurt each other
- Any repair attempts that were made
- Whether repairs were successful or failed

If you find moderate to sever conflicts that didn't go well, provide a specific repair playbook:
1. What rupture occurred (be specific about the hurt)
2. Steps for effective repair (tailored to this situation)
3. What to say/do to rebuild trust
4. How to prevent similar ruptures

if there was a minor conflict that went decently well, you can mention what went well. don't be nitpicky.
don't pretend that something went poorly just because we are focusing on conflicts

If no recent conflicts are detected, or all conflicts were minor and went great, offer a complimentary message.

Keep total response under 200 words.`,
    { ...data, temperature: 0.4, coachMessages: undefined }
  );
}

/**
 * Analyze Active-Constructive Responding in platonic conversations
 * Pure function for testing - no database calls
 */
export async function coachACRAI(data: FetchedData): Promise<string> {
  const acrContext = `Active-Constructive Responding (ACR) is a gold-standard skill for celebrating good news in friendships. 
When someone shares positive news, there are four response styles:
1. Active-Constructive: Enthusiastic, supportive, asking questions
2. Passive-Constructive: Understated support ("That's nice")
3. Active-Destructive: Finding problems ("But what about...")
4. Passive-Destructive: Ignoring or hijacking ("That reminds me of when I...")

ACR predicts friendship satisfaction and strengthens bonds.`;

  return callCoachAI(
    `**ACR CONTEXT:** ${acrContext}`,
    `
First, briefly explain what Active-Constructive Responding means for friendships. 1-2 sentences.

Then, analyze the conversation for instances where someone shared good news or positive experiences. Look for:
- What good news was shared
- How the other person responded
- Which response style was used (Active-Constructive, Passive-Constructive, Active-Destructive, or Passive-Destructive)

Provide specific examples and coaching on how to respond more actively and constructively to strengthen the friendship.

If no good news sharing was found, provide general guidance on using ACR in friendships.

Keep total response under 200 words.`,
    { ...data, temperature: 0.4, coachMessages: undefined }
  );
}

/**
 * Analyze shared interests in platonic conversations (RAG)
 * Pure function for testing - no database calls
 */
export async function coachSharedInterestsAI(
  data: FetchedData,
  analysis: {
    topInterests: string[];
    interestScores: { [key: string]: number };
  }
): Promise<string> {
  const { topInterests, interestScores } = analysis;

  const context = `I've analyzed your conversation history and identified your shared interests based on what you both talk about.`;

  return callCoachAI(
    `**ANALYSIS CONTEXT:** ${context}\n\nTop shared interests: ${topInterests.join(', ')}\n\nInterest mention counts: ${JSON.stringify(interestScores)}`,
    `
Analyze the shared interests between these friends. Your response should:

1. Highlight the top 2-3 shared interests you've discovered
2. Suggest a specific activity for each interest that they could do together
3. Identify 1-2 interests they haven't explored together yet (low scores) that might be worth trying

Be specific and actionable. For example, instead of "you both like movies", say "You both frequently discuss sci-fi movies - consider having a monthly sci-fi movie night."

Keep response under 150 words and make it friendly and encouraging.`,
    { ...data, temperature: 0.5, coachMessages: undefined }
  );
}

/**
 * Identify topic champions in group conversations (RAG)
 * Pure function for testing - no database calls
 */
export async function coachTopicChampionAI(
  data: FetchedData,
  analysis: {
    topicChampions: { [topic: string]: { [userId: string]: number } };
  }
): Promise<string> {
  const { topicChampions } = analysis;

  const context = `I've analyzed who brings up different topics in your group chat to understand each member's interests and contributions.`;

  return callCoachAI(
    `**ANALYSIS CONTEXT:** ${context}\n\nTopic champions data: ${JSON.stringify(topicChampions)}`,
    `
Analyze the topic champions in this group. Your response should:

1. Identify 2-3 members and their signature topics (who talks most about what)
2. Highlight any interesting patterns (e.g., one person always organizes, another brings humor)
3. Suggest how the group can leverage each person's interests/expertise better
4. Note if anyone seems less engaged with a suggestion to include them

Use actual names from the data. Be positive but honest about group dynamics.

Keep response under 200 words.`,
    { ...data, temperature: 0.4, coachMessages: undefined }
  );
}

/**
 * Generate friendship check-in based on communication patterns
 * Pure function for testing - no database calls
 */
export async function coachFriendshipCheckinAI(
  data: FetchedData,
  stats: {
    recentMessageCount: number;
    olderMessageCount: number;
    avgRecentLength: number;
    avgOlderLength: number;
    avgResponseTime: number;
    messageLengthChange: number;
  }
): Promise<string> {
  const context = `I've analyzed your recent communication patterns compared to earlier conversations to generate a personalized check-in.`;

  return callCoachAI(
    `**ANALYSIS CONTEXT:** ${context}\n\nCommunication stats:\n- Recent messages (last week): ${stats.recentMessageCount}\n- Older messages (previous 3 weeks): ${stats.olderMessageCount}\n- Average message length change: ${stats.messageLengthChange.toFixed(1)}%\n- Average response time: ${Math.round(stats.avgResponseTime / 60000)} minutes`,
    `
Generate a friendship check-in based on these communication patterns:

1. Note any significant changes (frequency, length, response time)
2. If messages are getting shorter or less frequent, gently explore why
3. If patterns are positive, celebrate that
4. Ask 1-2 specific check-in questions based on what you observe

Be warm, not judgmental. Focus on strengthening the friendship.

Examples of good check-in questions:
- "I noticed our chats have been briefer lately. Everything okay with your schedule?"
- "We've been chatting more than ever\! What's been energizing you lately?"

Keep response under 150 words.`,
    { ...data, temperature: 0.6, coachMessages: undefined }
  );
}

/**
 * Track and analyze group energy levels
 * Pure function for testing - no database calls
 */
export async function coachGroupEnergyAI(
  data: FetchedData,
  stats: {
    energyScore: number;
    todayMessages: number;
    weekMessages: number;
    todayEmojis: number;
    todayParticipants: number;
    weekParticipants: number;
    avgResponseTimeMinutes: number;
  }
): Promise<string> {
  const context = `I've calculated your group's current energy level based on activity, engagement, and interaction patterns.`;

  return callCoachAI(
    `**ANALYSIS CONTEXT:** ${context}\n\nGroup Energy Stats:\n- Energy Score: ${stats.energyScore}/100\n- Messages today: ${stats.todayMessages}\n- Active members today: ${stats.todayParticipants}/${stats.weekParticipants}\n- Emoji usage today: ${stats.todayEmojis}\n- Avg response time: ${stats.avgResponseTimeMinutes} min`,
    `
Analyze the group's energy level and provide guidance:

1. Interpret the energy score (${stats.energyScore}/100) - what does it mean?
2. Identify what's driving the current energy (high/low participation, quick/slow responses, emoji usage)
3. If energy is low (<50), suggest 2-3 specific ways to boost it
4. If energy is high (>70), note what's working well
5. Give one actionable suggestion for the user to help improve/maintain group energy

Be encouraging and specific. Focus on practical actions.

Keep response under 150 words.`,
    { ...data, temperature: 0.5, coachMessages: undefined }
  );
}

/**
 * Analyze topic vibes for any conversation type
 */
export async function aiTopicVibeCheck(
  data: FetchedData,
  topicScores: { topic: string; score: number }[]
): Promise<string> {
  const chatType = data.relationshipType;
  const systemMessage = BASE_SYSTEM_MESSAGE[chatType];

  // Select a random topic from the top half
  const sortedTopics = [...topicScores].sort((a, b) => b.score - a.score);
  const topHalf = sortedTopics.slice(0, Math.ceil(sortedTopics.length / 2));
  const selectedTopic = topHalf[Math.floor(Math.random() * topHalf.length)];

  const userMessage = `Explain to the user that an analysis of messsage sentiment in this conversation shows that the topic ${selectedTopic.topic} tends to lean positive.

Then, please craft a brief message about this finding:
1. Briefly explain why this might be (shared interest, mutual support, etc.)
2. Suggest one way they could lean into this positive pattern

Keep response under 100 words.`;

  return callCoachAI(systemMessage, userMessage, {
    ...data,
    temperature: 0.7,
    coachMessages: undefined,
    parentMessages: undefined,
  });
}
