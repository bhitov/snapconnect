/**
 * Scenario Generator - Creates realistic test data for social chat app
 * Generates users with diverse personalities and relationship dynamics
 * Includes healthy/unhealthy relationship patterns for testing
 */

import * as fs from 'fs';
import * as path from 'path';

import OpenAI from 'openai';

import {
  createUserProfile,
  createDirectConversation,
  createGroup,
  sendBulkTexts,
} from './chatAdmin';
import { config } from './config';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

// Configuration
interface ScenarioConfig {
  totalUsers: number;
  messagesPerConversation: number;
  groupChatSize: number;
  useAI: boolean; // Toggle AI-generated conversations
  saveToFile: boolean; // Toggle saving conversations to JSON file
}

const DEFAULT_CONFIG: ScenarioConfig = {
  totalUsers: 20,
  messagesPerConversation: 1200,
  groupChatSize: 6,
  useAI: true,
  saveToFile: false,
};

// Personality and name data
const MALE_NAMES = [
  'Alex',
  'Brian',
  'Chris',
  'David',
  'Eric',
  'Frank',
  'Greg',
  'Henry',
  'Ian',
  'Jack',
  'Kevin',
  'Luke',
  'Mike',
  'Nathan',
  'Owen',
  'Paul',
  'Quinn',
  'Ryan',
  'Steve',
  'Tom',
  'Victor',
  'Will',
  'Xavier',
  'Zach',
];

const FEMALE_NAMES = [
  'Amy',
  'Beth',
  'Clara',
  'Dana',
  'Emma',
  'Faye',
  'Grace',
  'Hannah',
  'Iris',
  'Jane',
  'Kate',
  'Lisa',
  'Maya',
  'Nina',
  'Olivia',
  'Paige',
  'Rachel',
  'Sarah',
  'Tina',
  'Uma',
  'Vera',
  'Wendy',
  'Xara',
  'Zoe',
];

const PERSONALITY_TRAITS = {
  healthy: [
    'supportive',
    'empathetic',
    'communicative',
    'respectful',
    'understanding',
    'encouraging',
    'patient',
    'honest',
    'caring',
    'reliable',
  ],
  neutral: [
    'friendly',
    'casual',
    'easygoing',
    'social',
    'curious',
    'creative',
    'adventurous',
    'optimistic',
    'practical',
    'independent',
  ],
  unhealthy: [
    'possessive',
    'dismissive',
    'controlling',
    'critical',
    'manipulative',
    'jealous',
    'demanding',
    'inconsistent',
    'defensive',
    'unreliable',
  ],
};

interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  sex: 'male' | 'female';
  personality: string[];
  relationshipStyle: 'healthy' | 'neutral' | 'unhealthy';
}

/**
 * Generate a random user profile with personality traits
 */
function generateUser(
  sex: 'male' | 'female',
  relationshipStyle: 'healthy' | 'neutral' | 'unhealthy' = 'neutral'
): Omit<UserProfile, 'uid'> {
  const names = sex === 'male' ? MALE_NAMES : FEMALE_NAMES;
  const name = names[Math.floor(Math.random() * names.length)];
  if (!name) throw new Error('Failed to generate user name');

  const username = `${name.toLowerCase()}${Math.floor(Math.random() * 999)}`;

  // Select personality traits based on relationship style
  const traits = PERSONALITY_TRAITS[relationshipStyle];
  const selectedTraits = traits.sort(() => 0.5 - Math.random()).slice(0, 3);

  return {
    username,
    displayName: name,
    email: `${username}@example.com`,
    sex,
    personality: selectedTraits,
    relationshipStyle,
  };
}

/**
 * Generate conversation messages between users with realistic content and timing
 */
async function generateConversationMessages(
  user1: UserProfile,
  user2: UserProfile,
  count: number,
  conversationType:
    | 'romantic-healthy'
    | 'romantic-unhealthy'
    | 'friendly'
    | 'group',
  groupMembers?: UserProfile[], // Optional parameter for group chat members
  useAI: boolean = true
): Promise<{ senderId: string; text: string; createdAt: number }[]> {
  console.log('🤖 [DEBUG] generateConversationMessages called');
  console.log('🤖 [DEBUG] user1:', { name: user1.displayName, uid: user1.uid });
  console.log('🤖 [DEBUG] user2:', { name: user2.displayName, uid: user2.uid });
  console.log('🤖 [DEBUG] count:', count);
  console.log('🤖 [DEBUG] conversationType:', conversationType);
  console.log('🤖 [DEBUG] useAI:', useAI);
  console.log('🤖 [DEBUG] OPENAI_API_KEY present:', !!config.OPENAI_API_KEY);

  const participants = groupMembers || [user1, user2];
  console.log(
    '🤖 [DEBUG] participants:',
    participants.map(p => ({ name: p.displayName, uid: p.uid }))
  );

  if (!useAI || !config.OPENAI_API_KEY) {
    console.log('🤖 [DEBUG] Using fallback messages (no AI)');

    // Calculate realistic timestamps spread over 3 months
    const startTime = Date.now() - 12 * 7 * 24 * 60 * 60 * 1000; // 12 weeks ago
    const totalDuration = 12 * 7 * 24 * 60 * 60 * 1000; // 12 weeks in milliseconds
    const messageInterval = count > 1 ? totalDuration / (count - 1) : 0;

    console.log('🤖 [DEBUG] Fallback timestamp calculation:');
    console.log(
      '🤖 [DEBUG] Total duration (days):',
      totalDuration / (24 * 60 * 60 * 1000)
    );
    console.log(
      '🤖 [DEBUG] Message interval (hours):',
      messageInterval / (60 * 60 * 1000)
    );

    return Array.from({ length: count }, (_, i) => {
      const sender = participants[i % participants.length];
      if (!sender) {
        console.log('🤖 [WARNING] No sender found for index:', i);
        return { senderId: '', text: '', createdAt: 0 };
      }

      return {
        senderId: sender.uid,
        text: `Fallback message ${i + 1} from ${sender.displayName}`,
        createdAt: startTime + i * messageInterval,
      };
    }).filter(msg => msg.senderId); // Filter out empty messages
  }

  try {
    console.log('🤖 [DEBUG] Generating AI conversation');
    const { overarchingStory, weeklyOutline } = await generateStoryOutline(
      conversationType,
      participants
    );
    console.log('🤖 [DEBUG] Story outline generated:', {
      storyLength: overarchingStory.length,
      weekCount: weeklyOutline.length,
    });

    const messagesPerWeek = Math.ceil(count / 12);
    console.log('🤖 [DEBUG] Messages per week:', messagesPerWeek);

    const allMessages: { senderId: string; text: string; timestamp: number }[] =
      [];

    for (
      let weekIndex = 0;
      weekIndex < Math.min(weeklyOutline.length, 12);
      weekIndex++
    ) {
      const weekEvent = weeklyOutline[weekIndex];
      if (!weekEvent) {
        console.log('🤖 [WARNING] No event for week:', weekIndex + 1);
        continue;
      }

      console.log(`🤖 [DEBUG] Generating week ${weekIndex + 1}: ${weekEvent}`);

      const weekMessages = await generateWeeklyMessages(
        participants,
        weekEvent,
        messagesPerWeek,
        conversationType,
        overarchingStory,
        weekIndex
      );

      console.log(
        `🤖 [DEBUG] Week ${weekIndex + 1} generated ${weekMessages.length} messages`
      );
      allMessages.push(...weekMessages);
    }

    console.log('🤖 [DEBUG] Total AI messages generated:', allMessages.length);

    // Convert to the expected format and sort by timestamp
    const formattedMessages = allMessages
      .map(msg => ({
        senderId: msg.senderId,
        text: msg.text,
        createdAt: msg.timestamp,
      }))
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, count); // Ensure we don't exceed requested count

    console.log(
      '🤖 [DEBUG] Final formatted messages:',
      formattedMessages.length
    );
    console.log(
      '🤖 [DEBUG] Sender distribution:',
      formattedMessages.reduce(
        (acc, msg) => {
          const sender = participants.find(p => p.uid === msg.senderId);
          const name = sender?.displayName || 'Unknown';
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    );

    return formattedMessages;
  } catch (error) {
    console.error('🤖 [ERROR] Error in generateConversationMessages:', error);
    console.log('🤖 [DEBUG] Falling back to simple messages');

    // Fallback to simple messages with realistic timestamps
    const startTime = Date.now() - 12 * 7 * 24 * 60 * 60 * 1000; // 12 weeks ago
    const totalDuration = 12 * 7 * 24 * 60 * 60 * 1000; // 12 weeks in milliseconds
    const messageInterval = count > 1 ? totalDuration / (count - 1) : 0;

    return Array.from({ length: count }, (_, i) => {
      const sender = participants[i % participants.length];
      if (!sender) return { senderId: '', text: '', createdAt: 0 };

      return {
        senderId: sender.uid,
        text: `Error fallback message ${i + 1} from ${sender.displayName}`,
        createdAt: startTime + i * messageInterval,
      };
    }).filter(msg => msg.senderId);
  }
}

/**
 * Generate an overarching story for a conversation type
 */
async function generateOverarchingStory(
  conversationType:
    | 'romantic-healthy'
    | 'romantic-unhealthy'
    | 'friendly'
    | 'group',
  participants: UserProfile[]
): Promise<string> {
  console.log('🤖 [DEBUG] generateOverarchingStory called');
  console.log('🤖 [DEBUG] conversationType:', conversationType);
  console.log(
    '🤖 [DEBUG] participants:',
    participants.map(p => ({ name: p.displayName, personality: p.personality }))
  );

  const participantDescriptions = participants
    .map(
      p =>
        `${p.displayName}: ${p.sex}, personality traits: ${p.personality.join(', ')}, communication style: ${p.relationshipStyle}`
    )
    .join('\n');

  let systemPrompt: string;
  let userPrompt: string;

  if (conversationType === 'romantic-unhealthy') {
    systemPrompt = `You are a creative writer specializing in realistic relationship dynamics. Create a compelling 3-month story arc for an unhealthy romantic relationship between these people:

${participantDescriptions}

CRITICAL: This is an unhealthy relationship that should remain mostly unhealthy throughout the 3 months. The relationship should consistently exhibit unhealthy patterns like jealousy, control, manipulation, poor communication, and toxic behaviors. Don't make it cartoonishly bad, there must be something they like about each other and some good moments, but I am not looking for a redemption arc.

The story should span 3 months and include specific events, conflicts, and ongoing unhealthy dynamics that would generate natural conversation topics, as well as the mundane daily life of the characters.`;

    userPrompt = `Create a realistic 3-month story arc for these ${participants.length} people in an unhealthy romantic relationship. The relationship should START unhealthy and STAY unhealthy - no growth, no realizations, no positive changes. Include specific events, ongoing conflicts, jealousy, control issues, and toxic patterns that persist throughout all 3 months. Do NOT include any happy endings or relationship improvements. Return as a single paragraph only.`;
  } else {
    systemPrompt = `You are a creative writer specializing in realistic relationship dynamics. Create a compelling 3-month story arc for a ${conversationType.replace('-', ' ')} conversation between these people:

${participantDescriptions}

The story should span 3 months and include specific events, challenges, and growth moments that would generate natural conversation topics, as well as the mundane daily lives of the characters.`;

    userPrompt = `Create a realistic 3-month story arc for these ${participants.length} people in a ${conversationType.replace('-', ' ')} relationship. Include specific events, challenges, and growth that would generate natural conversations.`;
  }

  console.log('🤖 [DEBUG] OpenAI Request - generateOverarchingStory');
  console.log('🤖 [DEBUG] System Prompt:', systemPrompt);
  console.log('🤖 [DEBUG] User Prompt:', userPrompt);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.8,
    });

    console.log('🤖 [DEBUG] OpenAI Response - generateOverarchingStory');
    console.log(
      '🤖 [DEBUG] Full response object:',
      JSON.stringify(response, null, 2)
    );

    const story = response.choices[0]?.message?.content?.trim() || '';
    console.log('🤖 [DEBUG] Extracted story:', story);
    console.log('🤖 [DEBUG] Story length:', story.length);

    return story;
  } catch (error) {
    console.error(
      '🤖 [ERROR] OpenAI API error in generateOverarchingStory:',
      error
    );
    throw error;
  }
}

/**
 * Generate weekly story outline from overarching story
 */
async function generateStoryOutline(
  conversationType:
    | 'romantic-healthy'
    | 'romantic-unhealthy'
    | 'friendly'
    | 'group',
  participants: UserProfile[]
): Promise<{ overarchingStory: string; weeklyOutline: string[] }> {
  console.log('🤖 [DEBUG] generateStoryOutline called');
  console.log('🤖 [DEBUG] conversationType:', conversationType);

  const overarchingStory = await generateOverarchingStory(
    conversationType,
    participants
  );
  console.log('🤖 [DEBUG] Generated overarching story:', overarchingStory);

  const participantDescriptions = participants
    .map(
      p =>
        `${p.displayName}: ${p.sex}, personality traits: ${p.personality.join(', ')}, communication style: ${p.relationshipStyle}`
    )
    .join('\n');

  const systemPrompt = `You are a story planning expert. Break down stories into weekly events for chat conversations.

You MUST follow formatting instructions EXACTLY. Return EXACTLY 12 lines, each formatted as:
Week X: [what happened that week]

Each line should describe specific events, developments, or situations that occurred that week in the story. Focus on concrete happenings, not abstract themes.

No additional text, no explanations, no bullet points. Just 12 lines exactly as shown above.`;

  const userPrompt = `Break this 3-month story into 12 weekly events - what specifically happened each week:

${overarchingStory}

Participants:
${participantDescriptions}

Return exactly 12 lines formatted as "Week X: [what happened that week]" - focus on specific events, not themes.`;

  console.log('🤖 [DEBUG] OpenAI Request - generateStoryOutline');
  console.log('🤖 [DEBUG] System Prompt:', systemPrompt);
  console.log('🤖 [DEBUG] User Prompt:', userPrompt);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    console.log('🤖 [DEBUG] OpenAI Response - generateStoryOutline');
    console.log(
      '🤖 [DEBUG] Full response object:',
      JSON.stringify(response, null, 2)
    );

    const content = response.choices[0]?.message?.content?.trim() || '';
    console.log('🤖 [DEBUG] Raw outline content:', content);

    const weeklyOutline = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    console.log('🤖 [DEBUG] Parsed weekly outline:', weeklyOutline);
    console.log('🤖 [DEBUG] Number of weeks:', weeklyOutline.length);

    return { overarchingStory, weeklyOutline };
  } catch (error) {
    console.error(
      '🤖 [ERROR] OpenAI API error in generateStoryOutline:',
      error
    );
    throw error;
  }
}

/**
 * Generate messages for a specific week using OpenAI
 */
async function generateWeeklyMessages(
  participants: UserProfile[],
  weekEvent: string,
  messageCount: number,
  conversationType: string,
  overarchingStory: string,
  weekIndex: number = 0
): Promise<{ senderId: string; text: string; timestamp: number }[]> {
  console.log('🤖 [DEBUG] generateWeeklyMessages called');
  console.log(
    '🤖 [DEBUG] participants:',
    participants.map(p => ({ name: p.displayName, uid: p.uid }))
  );
  console.log('🤖 [DEBUG] weekEvent:', weekEvent);
  console.log('🤖 [DEBUG] messageCount:', messageCount);
  console.log('🤖 [DEBUG] conversationType:', conversationType);
  console.log('🤖 [DEBUG] weekIndex:', weekIndex);

  const participantDescriptions = participants
    .map(
      p =>
        `${p.displayName}: ${p.sex}, personality traits: ${p.personality.join(', ')}, communication style: ${p.relationshipStyle}`
    )
    .join('\n');

  const systemPrompt = `You are a chat conversation generator. Create realistic messages between people discussing what happened in their story.

You MUST follow formatting instructions EXACTLY. Return EXACTLY ${messageCount} lines, each formatted as:
[Name]: [message text]

Where [Name] is one of: ${participants.map(p => p.displayName).join(', ')}

Rules:
- Alternate between different speakers naturally
- Messages should be about what happened that specific week in their story
- Messages should feel like real people texting about their experiences
- No additional text, explanations, or formatting
- Just ${messageCount} lines of messages`;

  const userPrompt = `Generate ${messageCount} chat messages about what happened this week in their story:

WHAT HAPPENED THIS WEEK: ${weekEvent}

OVERALL STORY CONTEXT: ${overarchingStory}

PARTICIPANTS:
${participantDescriptions}

The messages should be the participants discussing, reacting to, and talking about what happened that week. Show their personalities through how they communicate about these events. Also include some mundane daily life of the characters.

Return exactly ${messageCount} lines formatted as "[Name]: [message]"`;

  console.log('🤖 [DEBUG] OpenAI Request - generateWeeklyMessages');
  console.log('🤖 [DEBUG] System Prompt:', systemPrompt);
  console.log('🤖 [DEBUG] User Prompt:', userPrompt);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: Math.min(4000, messageCount * 50),
      temperature: 0.9,
    });

    console.log('🤖 [DEBUG] OpenAI Response - generateWeeklyMessages');
    console.log(
      '🤖 [DEBUG] Full response object:',
      JSON.stringify(response, null, 2)
    );

    const content = response.choices[0]?.message?.content?.trim() || '';
    console.log('🤖 [DEBUG] Raw messages content:', content);

    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    console.log('🤖 [DEBUG] Parsed lines:', lines);
    console.log('🤖 [DEBUG] Number of lines:', lines.length);

    // Calculate realistic timestamps for this week
    const startTime = Date.now() - 12 * 7 * 24 * 60 * 60 * 1000; // 12 weeks ago
    const weekStartTime = startTime + weekIndex * 7 * 24 * 60 * 60 * 1000; // Start of this week
    const weekDuration = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    const messageInterval =
      lines.length > 1 ? weekDuration / (lines.length - 1) : 0; // Spread across the week

    console.log('🤖 [DEBUG] Timestamp calculation:');
    console.log(
      '🤖 [DEBUG] Week start time:',
      new Date(weekStartTime).toISOString()
    );
    console.log('🤖 [DEBUG] Week duration (ms):', weekDuration);
    console.log('🤖 [DEBUG] Message interval (ms):', messageInterval);
    console.log(
      '🤖 [DEBUG] Message interval (hours):',
      messageInterval / (60 * 60 * 1000)
    );

    const messages: { senderId: string; text: string; timestamp: number }[] =
      [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        console.log('🤖 [WARNING] Line missing colon:', line);
        continue;
      }

      const senderName = line.substring(0, colonIndex).trim();
      const messageText = line.substring(colonIndex + 1).trim();

      console.log('🤖 [DEBUG] Processing message:', {
        senderName,
        messageText,
      });

      // Find participant by display name
      const sender = participants.find(p => p.displayName === senderName);
      if (!sender) {
        console.log('🤖 [WARNING] Unknown sender:', senderName);
        console.log(
          '🤖 [DEBUG] Available participants:',
          participants.map(p => p.displayName)
        );
        continue;
      }

      // Calculate timestamp for this message, spread evenly across the week
      const messageTimestamp = weekStartTime + i * messageInterval;

      messages.push({
        senderId: sender.uid,
        text: messageText,
        timestamp: messageTimestamp,
      });

      console.log('🤖 [DEBUG] Added message:', {
        senderId: sender.uid,
        senderName: sender.displayName,
        text: messageText,
        timestamp: messageTimestamp,
        date: new Date(messageTimestamp).toISOString(),
      });
    }

    console.log('🤖 [DEBUG] Final messages array:', messages);
    console.log('🤖 [DEBUG] Total messages generated:', messages.length);
    console.log('🤖 [DEBUG] Time span:', {
      start: new Date(messages[0]?.timestamp || 0).toISOString(),
      end: new Date(
        messages[messages.length - 1]?.timestamp || 0
      ).toISOString(),
    });

    return messages;
  } catch (error) {
    console.error(
      '🤖 [ERROR] OpenAI API error in generateWeeklyMessages:',
      error
    );
    throw error;
  }
}

/**
 * Main scenario generation function
 */
export async function generateScenario(config: Partial<ScenarioConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  console.log(`🎭 Generating scenario with ${finalConfig.totalUsers} users...`);

  // PHASE 1: GENERATE USER PROFILES AND CREATE ACCOUNTS
  console.log('👤 Phase 1: Creating user accounts...');

  // Create primary user (healthy relationship style)
  const primaryUser: UserProfile = {
    uid: '', // Will be filled when created in database
    username: 'alex_chen',
    displayName: 'Alex Chen',
    email: 'alex_chen@example.com',
    sex: 'male',
    personality: ['empathetic', 'communicative', 'supportive'],
    relationshipStyle: 'healthy',
  };

  // Create primary partner (healthy relationship style)
  const primaryPartner: UserProfile = {
    uid: '', // Will be filled when created in database
    username: 'emma_davis',
    displayName: 'Emma Davis',
    email: 'emma_davis@example.com',
    sex: 'female',
    personality: ['understanding', 'affectionate', 'trustworthy'],
    relationshipStyle: 'healthy',
  };

  // Create secondary user (female, unhealthy relationship)
  const secondaryUserData = generateUser('female', 'unhealthy');
  const secondaryUser: UserProfile = { ...secondaryUserData, uid: '' };
  console.log(
    `👩 Generated secondary user: ${secondaryUser.displayName} (${secondaryUser.username})`
  );

  // Create secondary user's partner (male, unhealthy relationship)
  const secondaryPartnerData = generateUser('male', 'unhealthy');
  const secondaryPartner: UserProfile = { ...secondaryPartnerData, uid: '' };
  console.log(
    `👨 Generated secondary partner: ${secondaryPartner.displayName} (${secondaryPartner.username})`
  );

  // Create remaining random users
  const remainingUsers: UserProfile[] = [];
  const remainingCount = finalConfig.totalUsers - 4;

  for (let i = 0; i < remainingCount; i++) {
    const sex = Math.random() > 0.5 ? 'male' : 'female';
    const relationshipStyles: ('healthy' | 'neutral' | 'unhealthy')[] = [
      'healthy',
      'neutral',
      'unhealthy',
    ];
    const style =
      relationshipStyles[Math.floor(Math.random() * relationshipStyles.length)];

    const userData = generateUser(sex, style);
    remainingUsers.push({ ...userData, uid: '' }); // Will be set after DB insertion
  }

  console.log(`👥 Generated ${remainingUsers.length} additional users`);

  // Create all user accounts in database
  const { email: _, ...primaryUserProfileData } = primaryUser;
  const primaryUserId = await createUserProfile(primaryUserProfileData);
  primaryUser.uid = primaryUserId;

  const { email: __, ...primaryPartnerProfileData } = primaryPartner;
  const primaryPartnerId = await createUserProfile(primaryPartnerProfileData);
  primaryPartner.uid = primaryPartnerId;

  const { email: ___, ...secondaryUserProfileData } = secondaryUserData;
  const secondaryUserId = await createUserProfile(secondaryUserProfileData);
  secondaryUser.uid = secondaryUserId;

  const { email: ____, ...secondaryPartnerProfileData } = secondaryPartnerData;
  const secondaryPartnerId = await createUserProfile(
    secondaryPartnerProfileData
  );
  secondaryPartner.uid = secondaryPartnerId;

  // Create remaining user accounts
  for (let i = 0; i < remainingUsers.length; i++) {
    const userData = remainingUsers[i];
    if (!userData) continue;

    const { email: _____, ...userProfileData } = userData;
    const userId = await createUserProfile(userProfileData);
    remainingUsers[i]!.uid = userId;
  }

  console.log('✅ All user accounts created');

  // PHASE 2: GENERATE ALL CONVERSATION DATA (no DB insertions yet)
  console.log('💬 Phase 2: Generating conversations...');

  // 1. Primary user + partner (healthy relationship)
  console.log(`🤖 Generating healthy relationship conversation...`);
  const primaryMessages = await generateConversationMessages(
    primaryUser,
    primaryPartner,
    finalConfig.messagesPerConversation,
    'romantic-healthy',
    undefined,
    finalConfig.useAI
  );
  console.log(
    `❤️ Generated healthy relationship conversation (${primaryMessages.length} messages)`
  );

  // 2. Secondary user + partner (unhealthy relationship)
  console.log(`🤖 Generating unhealthy relationship conversation...`);
  const secondaryMessages = await generateConversationMessages(
    secondaryUser,
    secondaryPartner,
    finalConfig.messagesPerConversation,
    'romantic-unhealthy',
    undefined,
    finalConfig.useAI
  );
  console.log(
    `💔 Generated unhealthy relationship conversation (${secondaryMessages.length} messages)`
  );

  // 3. Random person + primary user
  if (remainingUsers.length === 0) {
    throw new Error('Not enough users to create friend conversations');
  }

  const randomUser1 =
    remainingUsers[Math.floor(Math.random() * remainingUsers.length)];
  if (!randomUser1) {
    throw new Error('Failed to select random user 1');
  }

  console.log(`🤖 Generating friendship conversation 1...`);
  const friendMessages1 = await generateConversationMessages(
    primaryUser,
    randomUser1,
    Math.floor(finalConfig.messagesPerConversation * 0.6),
    'friendly',
    undefined,
    finalConfig.useAI
  );
  console.log(
    `🤝 Generated friendship conversation: ${primaryUser.displayName} + ${randomUser1.displayName}`
  );

  // 4. Random person + secondary user
  const randomUser2 =
    remainingUsers.find(u => u.username !== randomUser1.username) ||
    remainingUsers[0];
  if (!randomUser2) {
    throw new Error('Failed to select random user 2');
  }

  console.log(`🤖 Generating friendship conversation 2...`);
  const friendMessages2 = await generateConversationMessages(
    secondaryUser,
    randomUser2,
    Math.floor(finalConfig.messagesPerConversation * 0.6),
    'friendly',
    undefined,
    finalConfig.useAI
  );
  console.log(
    `🤝 Generated friendship conversation: ${secondaryUser.displayName} + ${randomUser2.displayName}`
  );

  // 5. Group chat 1
  const groupSize = Math.min(
    finalConfig.groupChatSize - 2,
    remainingUsers.length
  );
  const group1Users = [
    primaryUser,
    secondaryUser,
    ...remainingUsers.slice(0, groupSize),
  ];

  if (group1Users.length < 2) {
    throw new Error('Not enough users for group chat 1');
  }

  console.log(`🤖 Generating group chat 1...`);
  const group1Messages = await generateConversationMessages(
    group1Users[0]!, // Primary user as main participant
    group1Users[1]!, // Secondary user as second participant
    finalConfig.messagesPerConversation,
    'group',
    group1Users, // Pass all group members
    finalConfig.useAI
  );
  console.log(
    `👥 Generated group chat: Weekend Warriors (${group1Messages.length} messages)`
  );

  // 6. Group chat 2
  const group2Size = Math.min(
    finalConfig.groupChatSize - 2,
    remainingUsers.length
  );
  const group2StartIndex = Math.max(0, remainingUsers.length - group2Size);
  const group2Users = [
    primaryUser,
    secondaryUser,
    ...remainingUsers.slice(group2StartIndex),
  ];

  if (group2Users.length < 2) {
    throw new Error('Not enough users for group chat 2');
  }

  console.log(`🤖 Generating group chat 2...`);
  const group2Messages = await generateConversationMessages(
    group2Users[0]!, // Primary user as main participant
    group2Users[1]!, // Secondary user as second participant
    finalConfig.messagesPerConversation,
    'group',
    group2Users, // Pass all group members
    finalConfig.useAI
  );
  console.log(
    `👥 Generated group chat: Study Buddies (${group2Messages.length} messages)`
  );

  // PHASE 3: CREATE CONVERSATION STRUCTURES
  console.log('💬 Phase 3: Creating conversation structures...');

  // Create all conversation structures
  const primaryConversationId = await createDirectConversation(
    primaryUser.uid,
    primaryPartner.uid
  );
  const secondaryConversationId = await createDirectConversation(
    secondaryUser.uid,
    secondaryPartner.uid
  );
  const friendConversation1Id = await createDirectConversation(
    primaryUser.uid,
    randomUser1.uid
  );
  const friendConversation2Id = await createDirectConversation(
    secondaryUser.uid,
    randomUser2.uid
  );

  const group1Members = group1Users.map(u => u.uid);
  const group1Result = await createGroup('Weekend Warriors', group1Members);

  const group2Members = group2Users.map(u => u.uid);
  const group2Result = await createGroup('Study Buddies', group2Members);

  console.log('✅ All conversations created');

  // PHASE 4: PREPARE MESSAGES WITH CORRECT UIDS
  console.log('📝 Phase 4: Preparing messages...');

  // 1. Primary relationship conversation messages
  const primaryMessagesWithUIDs = primaryMessages.map(msg => ({
    ...msg,
    senderId:
      msg.senderId === primaryUser.uid ? primaryUser.uid : primaryPartner.uid,
  }));

  // 2. Secondary relationship conversation messages
  const secondaryMessagesWithUIDs = secondaryMessages.map(msg => ({
    ...msg,
    senderId:
      msg.senderId === secondaryUser.uid
        ? secondaryUser.uid
        : secondaryPartner.uid,
  }));

  // 3. Friend conversation 1 messages
  const friendMessages1WithUIDs = friendMessages1.map(msg => ({
    ...msg,
    senderId:
      msg.senderId === primaryUser.uid ? primaryUser.uid : randomUser1.uid,
  }));

  // 4. Friend conversation 2 messages
  const friendMessages2WithUIDs = friendMessages2.map(msg => ({
    ...msg,
    senderId:
      msg.senderId === secondaryUser.uid ? secondaryUser.uid : randomUser2.uid,
  }));

  // 5. Group chat 1 messages
  const group1MessagesWithUIDs = group1Messages.map(msg => {
    const sender = group1Users.find(u => u.displayName === msg.senderId);
    return {
      ...msg,
      senderId: sender?.uid || group1Users[0]!.uid,
    };
  });

  // 6. Group chat 2 messages
  const group2MessagesWithUIDs = group2Messages.map(msg => {
    const sender = group2Users.find(u => u.displayName === msg.senderId);
    return {
      ...msg,
      senderId: sender?.uid || group2Users[0]!.uid,
    };
  });

  console.log('✅ All messages prepared');

  console.log('✅ All messages prepared');

  // PHASE 5: INSERT ALL MESSAGES (BULK OPERATIONS)
  console.log('💾 Phase 5: Inserting all messages...');
  await sendBulkTexts(primaryConversationId, primaryMessagesWithUIDs);
  await sendBulkTexts(secondaryConversationId, secondaryMessagesWithUIDs);
  await sendBulkTexts(friendConversation1Id, friendMessages1WithUIDs);
  await sendBulkTexts(friendConversation2Id, friendMessages2WithUIDs);
  await sendBulkTexts(group1Result.cid, group1MessagesWithUIDs);
  await sendBulkTexts(group2Result.cid, group2MessagesWithUIDs);
  console.log('✅ All messages inserted');

  console.log(`\n🎉 Scenario generation complete!`);
  console.log(`📊 Summary:`);
  console.log(`   • ${finalConfig.totalUsers} users created`);
  console.log(`   • 4 direct conversations`);
  console.log(`   • 2 group chats`);
  console.log(
    `   • ${finalConfig.messagesPerConversation * 4 + finalConfig.messagesPerConversation * 2} total messages`
  );

  // Save all conversation data to JSON file
  if (finalConfig.saveToFile) {
    saveConversationsToFile(
      primaryUser,
      primaryPartner,
      secondaryUser,
      secondaryPartner,
      remainingUsers,
      randomUser1,
      randomUser2,
      group1Users,
      group2Users,
      {
        primary: {
          id: primaryConversationId,
          messages: primaryMessagesWithUIDs,
        },
        secondary: {
          id: secondaryConversationId,
          messages: secondaryMessagesWithUIDs,
        },
        friend1: {
          id: friendConversation1Id,
          messages: friendMessages1WithUIDs,
        },
        friend2: {
          id: friendConversation2Id,
          messages: friendMessages2WithUIDs,
        },
        group1: {
          id: group1Result.cid,
          messages: group1MessagesWithUIDs,
        },
        group2: {
          id: group2Result.cid,
          messages: group2MessagesWithUIDs,
        },
      }
    );
  }

  return {
    primaryUser,
    primaryPartner,
    secondaryUser,
    secondaryPartner,
    remainingUsers,
    conversations: {
      primaryConversation: primaryConversationId,
      secondaryConversation: secondaryConversationId,
      friendConversation1: friendConversation1Id,
      friendConversation2: friendConversation2Id,
      group1: group1Result.cid,
      group2: group2Result.cid,
    },
  };
}

/**
 * Save all conversation data to JSON file
 */
function saveConversationsToFile(
  primaryUser: UserProfile,
  primaryPartner: UserProfile,
  secondaryUser: UserProfile,
  secondaryPartner: UserProfile,
  remainingUsers: UserProfile[],
  randomUser1: UserProfile,
  randomUser2: UserProfile,
  group1Users: UserProfile[],
  group2Users: UserProfile[],
  conversations: {
    primary: {
      id: string;
      messages: { senderId: string; text: string; createdAt: number }[];
    };
    secondary: {
      id: string;
      messages: { senderId: string; text: string; createdAt: number }[];
    };
    friend1: {
      id: string;
      messages: { senderId: string; text: string; createdAt: number }[];
    };
    friend2: {
      id: string;
      messages: { senderId: string; text: string; createdAt: number }[];
    };
    group1: {
      id: string;
      messages: { senderId: string; text: string; createdAt: number }[];
    };
    group2: {
      id: string;
      messages: { senderId: string; text: string; createdAt: number }[];
    };
  }
) {
  const conversationData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalUsers: remainingUsers.length + 4,
      totalConversations: 6,
      totalMessages: Object.values(conversations).reduce(
        (sum, conv) => sum + conv.messages.length,
        0
      ),
    },
    users: {
      primaryUser: {
        ...primaryUser,
        role: 'primary',
        relationshipType: 'healthy',
      },
      primaryPartner: {
        ...primaryPartner,
        role: 'primary-partner',
        relationshipType: 'healthy',
      },
      secondaryUser: {
        ...secondaryUser,
        role: 'secondary',
        relationshipType: 'unhealthy',
      },
      secondaryPartner: {
        ...secondaryPartner,
        role: 'secondary-partner',
        relationshipType: 'unhealthy',
      },
      randomUsers: remainingUsers,
      friendsInvolved: [randomUser1, randomUser2],
    },
    conversations: {
      healthyRelationship: {
        type: 'romantic-healthy',
        participants: [primaryUser, primaryPartner],
        conversationId: conversations.primary.id,
        messageCount: conversations.primary.messages.length,
        messages: conversations.primary.messages.map(msg => ({
          senderId: msg.senderId,
          senderName:
            msg.senderId === primaryUser.uid
              ? primaryUser.displayName
              : primaryPartner.displayName,
          text: msg.text,
          timestamp: msg.createdAt,
          date: new Date(msg.createdAt).toISOString(),
        })),
      },
      unhealthyRelationship: {
        type: 'romantic-unhealthy',
        participants: [secondaryUser, secondaryPartner],
        conversationId: conversations.secondary.id,
        messageCount: conversations.secondary.messages.length,
        messages: conversations.secondary.messages.map(msg => ({
          senderId: msg.senderId,
          senderName:
            msg.senderId === secondaryUser.uid
              ? secondaryUser.displayName
              : secondaryPartner.displayName,
          text: msg.text,
          timestamp: msg.createdAt,
          date: new Date(msg.createdAt).toISOString(),
        })),
      },
      friendship1: {
        type: 'friendly',
        participants: [primaryUser, randomUser1],
        conversationId: conversations.friend1.id,
        messageCount: conversations.friend1.messages.length,
        messages: conversations.friend1.messages.map(msg => ({
          senderId: msg.senderId,
          senderName:
            msg.senderId === primaryUser.uid
              ? primaryUser.displayName
              : randomUser1.displayName,
          text: msg.text,
          timestamp: msg.createdAt,
          date: new Date(msg.createdAt).toISOString(),
        })),
      },
      friendship2: {
        type: 'friendly',
        participants: [secondaryUser, randomUser2],
        conversationId: conversations.friend2.id,
        messageCount: conversations.friend2.messages.length,
        messages: conversations.friend2.messages.map(msg => ({
          senderId: msg.senderId,
          senderName:
            msg.senderId === secondaryUser.uid
              ? secondaryUser.displayName
              : randomUser2.displayName,
          text: msg.text,
          timestamp: msg.createdAt,
          date: new Date(msg.createdAt).toISOString(),
        })),
      },
      groupChat1: {
        type: 'group',
        name: 'Weekend Warriors',
        participants: group1Users,
        conversationId: conversations.group1.id,
        messageCount: conversations.group1.messages.length,
        messages: conversations.group1.messages.map(msg => {
          const sender = group1Users.find(u => u.uid === msg.senderId);
          return {
            senderId: msg.senderId,
            senderName: sender?.displayName || 'Unknown',
            text: msg.text,
            timestamp: msg.createdAt,
            date: new Date(msg.createdAt).toISOString(),
          };
        }),
      },
      groupChat2: {
        type: 'group',
        name: 'Study Buddies',
        participants: group2Users,
        conversationId: conversations.group2.id,
        messageCount: conversations.group2.messages.length,
        messages: conversations.group2.messages.map(msg => {
          const sender = group2Users.find(u => u.uid === msg.senderId);
          return {
            senderId: msg.senderId,
            senderName: sender?.displayName || 'Unknown',
            text: msg.text,
            timestamp: msg.createdAt,
            date: new Date(msg.createdAt).toISOString(),
          };
        }),
      },
    },
  };

  // Ensure data directory exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to file
  const filePath = path.join(dataDir, 'conversations.json');
  fs.writeFileSync(filePath, JSON.stringify(conversationData, null, 2));

  console.log(`💾 Conversations saved to: ${filePath}`);
  console.log(
    `📊 File contains ${conversationData.metadata.totalMessages} messages across ${conversationData.metadata.totalConversations} conversations`
  );
}

/**
 * Generate a minimal scenario with only primary user and their partner
 * Perfect for focused testing or quick setup
 */
export async function generateMinimalScenario(
  config: Partial<ScenarioConfig> = {},
  useUnhealthyRelationship: boolean = false
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log('🚀 Starting minimal scenario generation...');
  console.log('📋 Configuration:');
  console.log(`   • Messages: ${finalConfig.messagesPerConversation}`);
  console.log(
    `   • AI Generation: ${finalConfig.useAI ? 'Enabled' : 'Disabled'}`
  );
  console.log(
    `   • Save to JSON: ${finalConfig.saveToFile ? 'Enabled' : 'Disabled'}`
  );
  console.log(
    `   • Relationship Type: ${useUnhealthyRelationship ? 'Unhealthy' : 'Healthy'}\n`
  );

  /* ---------- PHASE 1: Create User Accounts ---------- */
  console.log('👤 Phase 1: Creating user accounts...');

  let primaryUser: UserProfile;
  let primaryPartner: UserProfile;
  let conversationType: 'romantic-healthy' | 'romantic-unhealthy';

  if (useUnhealthyRelationship) {
    // Create unhealthy relationship users with different names
    primaryUser = {
      uid: '', // Will be filled when created in database
      username: 'jason_miller',
      displayName: 'Jason Miller',
      email: 'jason_miller@example.com',
      sex: 'male',
      personality: ['possessive', 'controlling', 'jealous'],
      relationshipStyle: 'unhealthy',
    };

    primaryPartner = {
      uid: '', // Will be filled when created in database
      username: 'sarah_jones',
      displayName: 'Sarah Jones',
      email: 'sarah_jones@example.com',
      sex: 'female',
      personality: ['defensive', 'inconsistent', 'critical'],
      relationshipStyle: 'unhealthy',
    };

    conversationType = 'romantic-unhealthy';
  } else {
    // Create healthy relationship users (original names)
    primaryUser = {
      uid: '', // Will be filled when created in database
      username: 'alex_chen',
      displayName: 'Alex Chen',
      email: 'alex_chen2@example.com',
      sex: 'male',
      personality: ['empathetic', 'communicative', 'supportive'],
      relationshipStyle: 'healthy',
    };

    primaryPartner = {
      uid: '', // Will be filled when created in database
      username: 'emma_davis',
      displayName: 'Emma Davis',
      email: 'emma_davis2@example.com',
      sex: 'female',
      personality: ['understanding', 'affectionate', 'trustworthy'],
      relationshipStyle: 'healthy',
    };

    conversationType = 'romantic-healthy';
  }

  // Create users in database and get real UIDs
  const primaryUserUID = await createUserProfile({
    username: primaryUser.username,
    displayName: primaryUser.displayName,
  });

  const primaryPartnerUID = await createUserProfile({
    username: primaryPartner.username,
    displayName: primaryPartner.displayName,
  });

  // Update user objects with real UIDs
  primaryUser.uid = primaryUserUID;
  primaryPartner.uid = primaryPartnerUID;

  console.log('✅ User accounts created');

  /* ---------- PHASE 2: Generate Conversation Data ---------- */
  console.log('💬 Phase 2: Generating conversation content...');

  // Generate primary relationship conversation
  const primaryMessages = await generateConversationMessages(
    primaryUser,
    primaryPartner,
    finalConfig.messagesPerConversation,
    conversationType,
    undefined,
    finalConfig.useAI
  );

  console.log('✅ Conversation content generated');

  /* ---------- PHASE 3: Create Conversation Structure ---------- */
  console.log('💬 Phase 3: Creating conversation structure...');

  // Create conversation
  const conversationId = await createDirectConversation(
    primaryUserUID,
    primaryPartnerUID
  );

  console.log('✅ Conversation structure created');

  /* ---------- PHASE 4: Prepare and Insert Messages ---------- */
  console.log('📝 Phase 4: Preparing messages...');

  // Map temporary sender IDs to real UIDs for messages
  const messagesWithUIDs = primaryMessages.map(msg => ({
    senderId:
      msg.senderId === primaryUser.uid ? primaryUserUID : primaryPartnerUID,
    text: msg.text,
    createdAt: msg.createdAt,
  }));

  console.log('✅ Messages prepared');

  // Save to JSON file if requested
  if (finalConfig.saveToFile) {
    saveMinimalConversationToFile(
      primaryUser,
      primaryPartner,
      {
        id: conversationId,
        messages: messagesWithUIDs,
      },
      conversationType
    );
  }

  // Insert all messages (bulk operation)
  console.log('💾 Inserting messages...');
  await sendBulkTexts(conversationId, messagesWithUIDs);
  console.log('✅ Messages inserted');

  console.log(`\n🎉 Minimal scenario generation complete!`);
  console.log(`📊 Summary:`);
  console.log(`   • 2 users created`);
  console.log(`   • 1 conversation`);
  console.log(`   • ${messagesWithUIDs.length} messages`);

  return {
    users: {
      primary: { ...primaryUser },
      partner: { ...primaryPartner },
    },
    conversation: {
      id: conversationId,
      messageCount: messagesWithUIDs.length,
    },
    summary: {
      totalUsers: 2,
      totalConversations: 1,
      totalMessages: messagesWithUIDs.length,
    },
  };
}

/**
 * Save minimal conversation data to JSON file
 */
function saveMinimalConversationToFile(
  primaryUser: UserProfile,
  primaryPartner: UserProfile,
  conversation: {
    id: string;
    messages: { senderId: string; text: string; createdAt: number }[];
  },
  conversationType: 'romantic-healthy' | 'romantic-unhealthy'
) {
  const relationshipType =
    conversationType === 'romantic-healthy' ? 'healthy' : 'unhealthy';

  const conversationData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      type: 'minimal-scenario',
      relationshipType,
      totalUsers: 2,
      totalConversations: 1,
      totalMessages: conversation.messages.length,
    },
    users: {
      primaryUser: {
        ...primaryUser,
        role: 'primary',
        relationshipType,
      },
      primaryPartner: {
        ...primaryPartner,
        role: 'primary-partner',
        relationshipType,
      },
    },
    conversation: {
      type: conversationType,
      participants: [primaryUser, primaryPartner],
      conversationId: conversation.id,
      messageCount: conversation.messages.length,
      messages: conversation.messages.map(msg => ({
        senderId: msg.senderId,
        senderName:
          msg.senderId === primaryUser.uid
            ? primaryUser.displayName
            : primaryPartner.displayName,
        text: msg.text,
        timestamp: msg.createdAt,
        date: new Date(msg.createdAt).toISOString(),
      })),
    },
  };

  // Ensure data directory exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to file with relationship type in filename
  const filename = `minimal-conversation-${relationshipType}.json`;
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(conversationData, null, 2));

  console.log(
    `💾 Minimal ${relationshipType} conversation saved to: ${filePath}`
  );
  console.log(
    `📊 File contains ${conversationData.metadata.totalMessages} messages`
  );
}

// Export for direct execution
if (require.main === module) {
  generateScenario().catch(console.error);
}
