/**
 * Scenario Generator - Creates realistic test data for social chat app
 * Generates users with diverse personalities and relationship dynamics
 * Includes healthy/unhealthy relationship patterns for testing
 */
import { 
  createUserProfile, 
  createDirectConversation, 
  createGroup, 
  sendBulkTexts 
} from './chatAdmin';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
  messagesPerConversation: 25,
  groupChatSize: 6,
  useAI: true,
  saveToFile: false
};

// Personality and name data
const MALE_NAMES = [
  'Alex', 'Brian', 'Chris', 'David', 'Eric', 'Frank', 'Greg', 'Henry',
  'Ian', 'Jack', 'Kevin', 'Luke', 'Mike', 'Nathan', 'Owen', 'Paul',
  'Quinn', 'Ryan', 'Steve', 'Tom', 'Victor', 'Will', 'Xavier', 'Zach'
];

const FEMALE_NAMES = [
  'Amy', 'Beth', 'Clara', 'Dana', 'Emma', 'Faye', 'Grace', 'Hannah',
  'Iris', 'Jane', 'Kate', 'Lisa', 'Maya', 'Nina', 'Olivia', 'Paige',
  'Rachel', 'Sarah', 'Tina', 'Uma', 'Vera', 'Wendy', 'Xara', 'Zoe'
];

const PERSONALITY_TRAITS = {
  healthy: [
    'supportive', 'empathetic', 'communicative', 'respectful', 'understanding',
    'encouraging', 'patient', 'honest', 'caring', 'reliable'
  ],
  neutral: [
    'friendly', 'casual', 'easygoing', 'social', 'curious', 'creative',
    'adventurous', 'optimistic', 'practical', 'independent'
  ],
  unhealthy: [
    'possessive', 'dismissive', 'controlling', 'critical', 'manipulative',
    'jealous', 'demanding', 'inconsistent', 'defensive', 'unreliable'
  ]
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
function generateUser(sex: 'male' | 'female', relationshipStyle: 'healthy' | 'neutral' | 'unhealthy' = 'neutral'): Omit<UserProfile, 'uid'> {
  const names = sex === 'male' ? MALE_NAMES : FEMALE_NAMES;
  const name = names[Math.floor(Math.random() * names.length)];
  if (!name) throw new Error('Failed to generate user name');
  
  const username = `${name.toLowerCase()}${Math.floor(Math.random() * 999)}`;
  
  // Select personality traits based on relationship style
  const traits = PERSONALITY_TRAITS[relationshipStyle];
  const selectedTraits = traits
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return {
    username,
    displayName: name,
    email: `${username}@example.com`,
    sex,
    personality: selectedTraits,
    relationshipStyle
  };
}

/**
 * Generate conversation messages based on relationship dynamics
 */
async function generateConversationMessages(
  user1: UserProfile, 
  user2: UserProfile, 
  count: number,
  conversationType: 'romantic-healthy' | 'romantic-unhealthy' | 'friendly' | 'group',
  groupMembers?: UserProfile[], // Optional parameter for group chat members
  useAI: boolean = true
): Promise<Array<{ senderId: string; text: string; createdAt: number }>> {
  const participants = groupMembers || [user1, user2];
  
  if (!useAI) {
    // Fallback to simple messages if AI is disabled
    const messages: Array<{ senderId: string; text: string; createdAt: number }> = [];
    const baseTime = Date.now() - (count * 60000);
    
    for (let i = 0; i < count; i++) {
      const sender = Math.random() > 0.5 ? user1 : user2;
      
      messages.push({
        senderId: sender.uid,
        text: `Message ${i + 1} from ${sender.displayName}`,
        createdAt: baseTime + (i * 60000) + Math.floor(Math.random() * 30000)
      });
    }
    
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  }

  console.log(`🤖 Generating AI conversation: ${conversationType} (${participants.length} participants)`);
  
  try {
    // Generate 3-month story outline
    const storyOutline = await generateStoryOutline(conversationType, participants);
    console.log(`📖 Generated story outline with ${storyOutline.weeklyOutline.length} weeks`);
    
    // Generate messages for selected weeks (distribute count across multiple weeks)
    const weeksToUse = Math.min(4, storyOutline.weeklyOutline.length); // Use up to 4 weeks for variety
    const messagesPerWeek = Math.ceil(count / weeksToUse);
    const allMessages: Array<{ senderId: string; text: string; createdAt: number }> = [];
    
    for (let i = 0; i < weeksToUse; i++) {
      const weekTheme = storyOutline.weeklyOutline[i * Math.floor(storyOutline.weeklyOutline.length / weeksToUse)] || storyOutline.weeklyOutline[i] || 'General conversation';
      const weekMessages = await generateWeeklyMessages(
        participants,
        weekTheme,
        messagesPerWeek,
        conversationType,
        storyOutline.overarchingStory
      );
      
      // Convert timestamp to createdAt and adjust for chronological order
      const baseTime = Date.now() - ((weeksToUse - i) * 7 * 24 * 60 * 60 * 1000); // Week spacing
      weekMessages.forEach((msg, index) => {
        allMessages.push({
          senderId: msg.senderId,
          text: msg.text,
          createdAt: baseTime + (index * 60000) + Math.floor(Math.random() * 30000)
        });
      });
    }
    
    // Sort by timestamp and trim to exact count needed
    const sortedMessages = allMessages
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, count);
    
    console.log(`✅ Generated ${sortedMessages.length} AI messages`);
    return sortedMessages;
    
  } catch (error) {
    console.error('Error generating AI conversation:', error);
    console.log('🔄 Falling back to simple messages');
    
    // Fallback to simple messages on error
    const messages: Array<{ senderId: string; text: string; createdAt: number }> = [];
    const baseTime = Date.now() - (count * 60000);
    
    for (let i = 0; i < count; i++) {
      const sender = participants[Math.floor(Math.random() * participants.length)];
      if (!sender) continue;
      
      messages.push({
        senderId: sender.uid,
        text: `Message ${i + 1} from ${sender.displayName}`,
        createdAt: baseTime + (i * 60000) + Math.floor(Math.random() * 30000)
      });
    }
    
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  }
}

/**
 * Generate an overarching story for a conversation type
 */
async function generateOverarchingStory(
  conversationType: 'romantic-healthy' | 'romantic-unhealthy' | 'friendly' | 'group',
  participants: UserProfile[]
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return `A simple ${conversationType} story between the participants over 3 months.`;
  }

  const participantDescriptions = participants.map(p => 
    `${p.displayName} (${p.sex}, personality: ${p.personality.join(', ')}, relationship style: ${p.relationshipStyle})`
  ).join('\n');

  const conversationContext = {
    'romantic-healthy': 'a loving, supportive romantic relationship with good communication and healthy conflict resolution',
    'romantic-unhealthy': 'a troubled romantic relationship with communication issues, unhealthy patterns, jealousy, and emotional volatility',
    'friendly': 'a casual friendship with shared interests, mutual support, and occasional social activities',
    'group': 'a friend group with diverse personalities, group dynamics, shared activities, and interpersonal relationships'
  };

  const prompt = `Create a compelling 3-month overarching story for ${conversationContext[conversationType]} between these people:

${participantDescriptions}

**CRITICAL FORMATTING REQUIREMENT: Your response must be EXACTLY one paragraph of narrative text. Do not include any headers, bullet points, numbered lists, or formatting. Just write the story as a single continuous paragraph.**

Write a realistic, engaging story that shows the natural progression of ${conversationType === 'group' ? 'group dynamics' : 'their relationship'} over 3 months. Include specific events, conflicts, developments, and resolutions that would naturally occur based on their personality traits and relationship styles.

The story should be detailed enough to later break down into weekly chat message themes. Focus on authentic human experiences and emotions that match their personalities.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative writer specializing in realistic relationship and social dynamics. You MUST follow formatting instructions EXACTLY. Write compelling, believable stories that reflect authentic human behavior and personality differences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 600
    });

    return response.choices[0]?.message?.content?.trim() || `A ${conversationType} story over 3 months.`;
  } catch (error) {
    console.error('Error generating overarching story:', error);
    return `A ${conversationType} story between the participants over 3 months.`;
  }
}

/**
 * Generate a 3-month story outline for a conversation type
 */
async function generateStoryOutline(
  conversationType: 'romantic-healthy' | 'romantic-unhealthy' | 'friendly' | 'group',
  participants: UserProfile[]
): Promise<{ overarchingStory: string; weeklyOutline: string[] }> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ No OpenAI API key found, using placeholder story');
    return {
      overarchingStory: `A simple ${conversationType} story over 3 months.`,
      weeklyOutline: Array.from({ length: 12 }, (_, i) => `Week ${i + 1}: General conversation topics`)
    };
  }

  // First generate the overarching story
  const overarchingStory = await generateOverarchingStory(conversationType, participants);
  console.log(`📖 Generated overarching story: ${overarchingStory.substring(0, 100)}...`);

  const participantDescriptions = participants.map(p => 
    `${p.displayName} (${p.sex}, personality: ${p.personality.join(', ')}, relationship style: ${p.relationshipStyle})`
  ).join('\n');

  const prompt = `Based on this overarching story, break it down into 12 weekly themes:

**OVERARCHING STORY:**
${overarchingStory}

**PARTICIPANTS:**
${participantDescriptions}

**CRITICAL FORMATTING REQUIREMENT: Your response must be EXACTLY 12 lines, each formatted as "Week X: [theme]" where X is the week number (1-12). Do not include any other text, headers, explanations, or formatting. Each line must start with "Week" followed by the number, colon, space, then the theme.**

Break down the overarching story into 12 weekly themes that would naturally progress the story and generate realistic chat messages. Each week should represent specific events, emotions, or developments from the story.

Example format (you MUST follow this EXACTLY):
Week 1: Initial meeting and first impressions
Week 2: Getting to know each other better
Week 3: First conflict or disagreement`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a story breakdown specialist. You MUST follow formatting instructions EXACTLY. Your response must be precisely 12 lines starting with "Week 1:" through "Week 12:" with no additional text or formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const content = response.choices[0]?.message?.content || '';
    const weeks = content
      .split('\n')
      .filter(line => line.trim().startsWith('Week'))
      .map(line => line.trim())
      .slice(0, 12); // Ensure exactly 12 weeks
    
    // Fill in missing weeks if needed
    while (weeks.length < 12) {
      weeks.push(`Week ${weeks.length + 1}: Continuing story development`);
    }
    
    return {
      overarchingStory,
      weeklyOutline: weeks
    };
  } catch (error) {
    console.error('Error generating story outline:', error);
    return {
      overarchingStory,
      weeklyOutline: Array.from({ length: 12 }, (_, i) => `Week ${i + 1}: Story development`)
    };
  }
}

/**
 * Generate realistic chat messages for a specific week based on the story theme
 */
async function generateWeeklyMessages(
  participants: UserProfile[],
  weekTheme: string,
  messageCount: number,
  conversationType: string,
  overarchingStory: string
): Promise<Array<{ senderId: string; text: string; timestamp: number }>> {
  const participantDescriptions = participants.map(p => 
    `${p.displayName}: ${p.sex}, personality traits: ${p.personality.join(', ')}, communication style: ${p.relationshipStyle}`
  ).join('\n');

  const prompt = `Generate realistic chat messages for this scenario:

**OVERARCHING STORY CONTEXT:**
${overarchingStory}

**CURRENT WEEK THEME:**
${weekTheme}

**PARTICIPANTS:**
${participantDescriptions}

**CONVERSATION TYPE:** ${conversationType}

**CRITICAL FORMATTING REQUIREMENT: Your response must be EXACTLY ${messageCount} lines, each formatted as "[Name]: [message text]" where Name is one of the participant names listed above. Do not include any headers, explanations, timestamps, or other formatting. Each line must start with a participant name followed by colon, space, then the message text.**

Requirements for message content:
- Messages should reflect each person's personality and communication style
- Include natural conversation flow with responses to each other
- Mix of message lengths (some short, some longer) 
- Include realistic texting language and occasional emojis
- Show personality differences in how they communicate
- Make it feel like real people texting about the current week theme
- Stay consistent with the overarching story context

Example format (you MUST follow this EXACTLY):
${participants[0]?.displayName}: Hey, how's it going?
${participants[1]?.displayName}: Not bad! Just dealing with work stuff
${participants[0]?.displayName}: Yeah I totally get that 😅

Generate EXACTLY ${messageCount} messages with varied senders that naturally flow together.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing realistic text message conversations. You MUST follow formatting instructions EXACTLY. Your response must be the exact number of lines requested, each starting with a participant name followed by colon and space. No additional text or formatting allowed.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 1200
    });

    const content = response.choices[0]?.message?.content || '';
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':') && line.length > 0);

    const messages = lines
      .map((line, index) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return null;
        
        const name = line.substring(0, colonIndex).trim();
        const messageText = line.substring(colonIndex + 1).trim();
        
        if (!name || !messageText) return null;
        
        const sender = participants.find(p => p.displayName === name);
        if (!sender) return null;
        
        return {
          senderId: sender.uid,
          text: messageText,
          timestamp: Date.now() - ((messageCount - index) * 60000) + Math.floor(Math.random() * 30000)
        };
      })
      .filter(msg => msg !== null) as Array<{ senderId: string; text: string; timestamp: number }>;

    // Ensure we have the right number of messages, pad if necessary
    while (messages.length < messageCount && participants.length > 0) {
      const sender = participants[messages.length % participants.length];
      if (!sender) break;
      
      messages.push({
        senderId: sender.uid,
        text: `Additional message about ${weekTheme}`,
        timestamp: Date.now() - ((messageCount - messages.length) * 60000)
      });
    }

    return messages.slice(0, messageCount);
  } catch (error) {
    console.error('Error generating weekly messages:', error);
    return [];
  }
}

/**
 * Main scenario generation function
 */
export async function generateScenario(config: Partial<ScenarioConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  console.log(`🎭 Generating scenario with ${finalConfig.totalUsers} users...`);
  
  // PHASE 1: GENERATE ALL USER DATA (no DB insertions yet)
  console.log('📝 Phase 1: Generating user profiles...');
  
  // Create primary user (healthy relationship style)
  const primaryUser: UserProfile = {
    uid: '', // Will be filled when created in database
    username: 'alex_chen',
    displayName: 'Alex Chen',
    email: 'alex_chen@example.com',
    sex: 'male',
    personality: ['empathetic', 'communicative', 'supportive'],
    relationshipStyle: 'healthy'
  };

  // Create primary partner (healthy relationship style)
  const primaryPartner: UserProfile = {
    uid: '', // Will be filled when created in database
    username: 'emma_davis',
    displayName: 'Emma Davis',
    email: 'emma_davis@example.com',
    sex: 'female',
    personality: ['understanding', 'affectionate', 'trustworthy'],
    relationshipStyle: 'healthy'
  };

  console.log('✅ User profiles generated');
  
  // Create secondary user (female, unhealthy relationship)
  const secondaryUserData = generateUser('female', 'unhealthy');
  const secondaryUser: UserProfile = { ...secondaryUserData, uid: '' };
  console.log(`👩 Generated secondary user: ${secondaryUser.displayName} (${secondaryUser.username})`);
  
  // Create secondary user's partner (male, unhealthy relationship)
  const secondaryPartnerData = generateUser('male', 'unhealthy');
  const secondaryPartner: UserProfile = { ...secondaryPartnerData, uid: '' };
  console.log(`👨 Generated secondary partner: ${secondaryPartner.displayName} (${secondaryPartner.username})`);
  
  // Create remaining random users
  const remainingUsers: UserProfile[] = [];
  const remainingCount = finalConfig.totalUsers - 4;
  
  for (let i = 0; i < remainingCount; i++) {
    const sex = Math.random() > 0.5 ? 'male' : 'female';
    const relationshipStyles: ('healthy' | 'neutral' | 'unhealthy')[] = ['healthy', 'neutral', 'unhealthy'];
    const style = relationshipStyles[Math.floor(Math.random() * relationshipStyles.length)];
    
    const userData = generateUser(sex, style);
    remainingUsers.push({ ...userData, uid: '' }); // Will be set after DB insertion
  }
  
  console.log(`👥 Generated ${remainingUsers.length} additional users`);
  
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
  console.log(`❤️ Generated healthy relationship conversation (${primaryMessages.length} messages)`);
  
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
  console.log(`💔 Generated unhealthy relationship conversation (${secondaryMessages.length} messages)`);
  
  // 3. Random person + primary user
  if (remainingUsers.length === 0) {
    throw new Error('Not enough users to create friend conversations');
  }
  
  const randomUser1 = remainingUsers[Math.floor(Math.random() * remainingUsers.length)];
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
  console.log(`🤝 Generated friendship conversation: ${primaryUser.displayName} + ${randomUser1.displayName}`);
  
  // 4. Random person + secondary user
  const randomUser2 = remainingUsers.find(u => u.username !== randomUser1.username) || remainingUsers[0];
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
  console.log(`🤝 Generated friendship conversation: ${secondaryUser.displayName} + ${randomUser2.displayName}`);
  
  // 5. Group chat 1
  const groupSize = Math.min(finalConfig.groupChatSize - 2, remainingUsers.length);
  const group1Users = [primaryUser, secondaryUser, ...remainingUsers.slice(0, groupSize)];
  
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
  console.log(`👥 Generated group chat: Weekend Warriors (${group1Messages.length} messages)`);
  
  // 6. Group chat 2
  const group2Size = Math.min(finalConfig.groupChatSize - 2, remainingUsers.length);
  const group2StartIndex = Math.max(0, remainingUsers.length - group2Size);
  const group2Users = [primaryUser, secondaryUser, ...remainingUsers.slice(group2StartIndex)];
  
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
  console.log(`👥 Generated group chat: Study Buddies (${group2Messages.length} messages)`);
  
  // PHASE 3: DATABASE INSERTIONS (all at once)
  console.log('💾 Phase 3: Inserting data into database...');
  
  // Insert all users
  console.log('👤 Creating user accounts...');
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
  const secondaryPartnerId = await createUserProfile(secondaryPartnerProfileData);
  secondaryPartner.uid = secondaryPartnerId;
  
  // Insert remaining users
  for (let i = 0; i < remainingUsers.length; i++) {
    const userData = remainingUsers[i];
    if (!userData) continue;
    
    const { email: _____, ...userProfileData } = userData;
    const userId = await createUserProfile(userProfileData);
    remainingUsers[i]!.uid = userId;
  }
  
  console.log('✅ All user accounts created');
  
  // Create conversations (but don't insert messages yet)
  console.log('💬 Creating conversations...');
  
  // Create all conversation structures
  const primaryConversationId = await createDirectConversation(primaryUser.uid, primaryPartner.uid);
  const secondaryConversationId = await createDirectConversation(secondaryUser.uid, secondaryPartner.uid);
  const friendConversation1Id = await createDirectConversation(primaryUser.uid, randomUser1.uid);
  const friendConversation2Id = await createDirectConversation(secondaryUser.uid, randomUser2.uid);
  
  const group1Members = group1Users.map(u => u.uid);
  const group1Result = await createGroup('Weekend Warriors', group1Members);
  
  const group2Members = group2Users.map(u => u.uid);
  const group2Result = await createGroup('Study Buddies', group2Members);
  
  console.log('✅ All conversations created');
  
  // Prepare all messages with correct UIDs
  console.log('📝 Preparing messages...');
  
  // 1. Primary relationship conversation messages
  const primaryMessagesWithUIDs = primaryMessages.map(msg => ({
    ...msg,
    senderId: msg.senderId === primaryUser.uid ? primaryUser.uid : primaryPartner.uid
  }));
  
  // 2. Secondary relationship conversation messages
  const secondaryMessagesWithUIDs = secondaryMessages.map(msg => ({
    ...msg,
    senderId: msg.senderId === secondaryUser.uid ? secondaryUser.uid : secondaryPartner.uid
  }));
  
  // 3. Friend conversation 1 messages
  const friendMessages1WithUIDs = friendMessages1.map(msg => ({
    ...msg,
    senderId: msg.senderId === primaryUser.uid ? primaryUser.uid : randomUser1.uid
  }));
  
  // 4. Friend conversation 2 messages
  const friendMessages2WithUIDs = friendMessages2.map(msg => ({
    ...msg,
    senderId: msg.senderId === secondaryUser.uid ? secondaryUser.uid : randomUser2.uid
  }));
  
  // 5. Group chat 1 messages
  const group1MessagesWithUIDs = group1Messages.map(msg => {
    const sender = group1Users.find(u => u.displayName === msg.senderId);
    return {
      ...msg,
      senderId: sender?.uid || group1Users[0]!.uid
    };
  });
  
  // 6. Group chat 2 messages
  const group2MessagesWithUIDs = group2Messages.map(msg => {
    const sender = group2Users.find(u => u.displayName === msg.senderId);
    return {
      ...msg,
      senderId: sender?.uid || group2Users[0]!.uid
    };
  });
  
  console.log('✅ All messages prepared');
  
  console.log(`✅ Scenario generation complete!`);
  console.log(`📊 Summary:`);
  console.log(`   • ${finalConfig.totalUsers} users created`);
  console.log(`   • 4 direct conversations`);
  console.log(`   • 2 group chats`);
  console.log(`   • ${(finalConfig.messagesPerConversation * 4) + (finalConfig.messagesPerConversation * 2)} total messages`);

  // Insert all messages at the very end
  console.log('💾 Inserting all messages...');
  await sendBulkTexts(primaryConversationId, primaryMessagesWithUIDs);
  await sendBulkTexts(secondaryConversationId, secondaryMessagesWithUIDs);
  await sendBulkTexts(friendConversation1Id, friendMessages1WithUIDs);
  await sendBulkTexts(friendConversation2Id, friendMessages2WithUIDs);
  await sendBulkTexts(group1Result.cid, group1MessagesWithUIDs);
  await sendBulkTexts(group2Result.cid, group2MessagesWithUIDs);
  console.log('✅ All messages inserted');
  
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
          messages: primaryMessagesWithUIDs
        },
        secondary: {
          id: secondaryConversationId,
          messages: secondaryMessagesWithUIDs
        },
        friend1: {
          id: friendConversation1Id,
          messages: friendMessages1WithUIDs
        },
        friend2: {
          id: friendConversation2Id,
          messages: friendMessages2WithUIDs
        },
        group1: {
          id: group1Result.cid,
          messages: group1MessagesWithUIDs
        },
        group2: {
          id: group2Result.cid,
          messages: group2MessagesWithUIDs
        }
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
      group2: group2Result.cid
    }
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
    primary: { id: string; messages: Array<{ senderId: string; text: string; createdAt: number }> };
    secondary: { id: string; messages: Array<{ senderId: string; text: string; createdAt: number }> };
    friend1: { id: string; messages: Array<{ senderId: string; text: string; createdAt: number }> };
    friend2: { id: string; messages: Array<{ senderId: string; text: string; createdAt: number }> };
    group1: { id: string; messages: Array<{ senderId: string; text: string; createdAt: number }> };
    group2: { id: string; messages: Array<{ senderId: string; text: string; createdAt: number }> };
  }
) {
  const conversationData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalUsers: remainingUsers.length + 4,
      totalConversations: 6,
      totalMessages: Object.values(conversations).reduce((sum, conv) => sum + conv.messages.length, 0)
    },
    users: {
      primaryUser: {
        ...primaryUser,
        role: 'primary',
        relationshipType: 'healthy'
      },
      primaryPartner: {
        ...primaryPartner,
        role: 'primary-partner',
        relationshipType: 'healthy'
      },
      secondaryUser: {
        ...secondaryUser,
        role: 'secondary',
        relationshipType: 'unhealthy'
      },
      secondaryPartner: {
        ...secondaryPartner,
        role: 'secondary-partner',
        relationshipType: 'unhealthy'
      },
      randomUsers: remainingUsers,
      friendsInvolved: [randomUser1, randomUser2]
    },
    conversations: {
      healthyRelationship: {
        type: 'romantic-healthy',
        participants: [primaryUser, primaryPartner],
        conversationId: conversations.primary.id,
        messageCount: conversations.primary.messages.length,
        messages: conversations.primary.messages.map(msg => ({
          senderId: msg.senderId,
          senderName: msg.senderId === primaryUser.uid ? primaryUser.displayName : primaryPartner.displayName,
          text: msg.text,
          timestamp: msg.createdAt,
          date: new Date(msg.createdAt).toISOString()
        }))
      },
      unhealthyRelationship: {
        type: 'romantic-unhealthy',
        participants: [secondaryUser, secondaryPartner],
        conversationId: conversations.secondary.id,
        messageCount: conversations.secondary.messages.length,
        messages: conversations.secondary.messages.map(msg => ({
          senderId: msg.senderId,
          senderName: msg.senderId === secondaryUser.uid ? secondaryUser.displayName : secondaryPartner.displayName,
          text: msg.text,
          timestamp: msg.createdAt,
          date: new Date(msg.createdAt).toISOString()
        }))
      },
      friendship1: {
        type: 'friendly',
        participants: [primaryUser, randomUser1],
        conversationId: conversations.friend1.id,
        messageCount: conversations.friend1.messages.length,
        messages: conversations.friend1.messages.map(msg => ({
          senderId: msg.senderId,
          senderName: msg.senderId === primaryUser.uid ? primaryUser.displayName : randomUser1.displayName,
          text: msg.text,
          timestamp: msg.createdAt,
          date: new Date(msg.createdAt).toISOString()
        }))
      },
      friendship2: {
        type: 'friendly',
        participants: [secondaryUser, randomUser2],
        conversationId: conversations.friend2.id,
        messageCount: conversations.friend2.messages.length,
        messages: conversations.friend2.messages.map(msg => ({
          senderId: msg.senderId,
          senderName: msg.senderId === secondaryUser.uid ? secondaryUser.displayName : randomUser2.displayName,
          text: msg.text,
          timestamp: msg.createdAt,
          date: new Date(msg.createdAt).toISOString()
        }))
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
            date: new Date(msg.createdAt).toISOString()
          };
        })
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
            date: new Date(msg.createdAt).toISOString()
          };
        })
      }
    }
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
  console.log(`📊 File contains ${conversationData.metadata.totalMessages} messages across ${conversationData.metadata.totalConversations} conversations`);
}

/**
 * Generate a minimal scenario with only primary user and their partner
 * Perfect for focused testing or quick setup
 */
export async function generateMinimalScenario(config: Partial<ScenarioConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  console.log('🚀 Starting minimal scenario generation...');
  console.log('📋 Configuration:');
  console.log(`   • Messages: ${finalConfig.messagesPerConversation}`);
  console.log(`   • AI Generation: ${finalConfig.useAI ? 'Enabled' : 'Disabled'}`);
  console.log(`   • Save to JSON: ${finalConfig.saveToFile ? 'Enabled' : 'Disabled'}\n`);

  /* ---------- PHASE 1: Generate User Data ---------- */
  console.log('👥 Phase 1: Generating user profiles...');
  
  // Create primary user (healthy relationship style)
  const primaryUser: UserProfile = {
    uid: '', // Will be filled when created in database
    username: 'alex_chen',
    displayName: 'Alex Chen',
    email: 'alex_chen@example.com',
    sex: 'male',
    personality: ['empathetic', 'communicative', 'supportive'],
    relationshipStyle: 'healthy'
  };

  // Create primary partner (healthy relationship style)
  const primaryPartner: UserProfile = {
    uid: '', // Will be filled when created in database
    username: 'emma_davis',
    displayName: 'Emma Davis',
    email: 'emma_davis@example.com',
    sex: 'female',
    personality: ['understanding', 'affectionate', 'trustworthy'],
    relationshipStyle: 'healthy'
  };

  console.log('✅ User profiles generated');

  /* ---------- PHASE 2: Generate Conversation Data ---------- */
  console.log('💬 Phase 2: Generating conversation content...');
  
  // Generate primary relationship conversation
  const primaryMessages = await generateConversationMessages(
    primaryUser,
    primaryPartner,
    finalConfig.messagesPerConversation,
    'romantic-healthy',
    undefined,
    finalConfig.useAI
  );

  console.log('✅ Conversation content generated');

  /* ---------- PHASE 3: Create Database Structure ---------- */
  console.log('🗄️ Phase 3: Creating database structure...');
  
  // Create users in database and get real UIDs
  const primaryUserUID = await createUserProfile({
    username: primaryUser.username,
    displayName: primaryUser.displayName
  });
  
  const primaryPartnerUID = await createUserProfile({
    username: primaryPartner.username,
    displayName: primaryPartner.displayName
  });

  // Update user objects with real UIDs
  primaryUser.uid = primaryUserUID;
  primaryPartner.uid = primaryPartnerUID;

  // Create conversation
  const conversationId = await createDirectConversation(primaryUserUID, primaryPartnerUID);

  console.log('✅ Database structure created');

  /* ---------- PHASE 4: Message Insertion ---------- */
  console.log('💾 Phase 4: Preparing messages...');
  
  // Map temporary sender IDs to real UIDs for messages
  const messagesWithUIDs = primaryMessages.map(msg => ({
    senderId: msg.senderId === primaryUser.uid ? primaryUserUID : primaryPartnerUID,
    text: msg.text,
    createdAt: msg.createdAt
  }));

  // Save to JSON file if requested
  if (finalConfig.saveToFile) {
    saveMinimalConversationToFile(
      primaryUser,
      primaryPartner,
      {
        id: conversationId,
        messages: messagesWithUIDs
      }
    );
  }

  // Insert all messages
  console.log('💾 Inserting messages...');
  await sendBulkTexts(conversationId, messagesWithUIDs);
  console.log('✅ Messages inserted');

  return {
    users: {
      primary: { ...primaryUser },
      partner: { ...primaryPartner }
    },
    conversation: {
      id: conversationId,
      messageCount: messagesWithUIDs.length
    },
    summary: {
      totalUsers: 2,
      totalConversations: 1,
      totalMessages: messagesWithUIDs.length
    }
  };
}

/**
 * Save minimal conversation data to JSON file
 */
function saveMinimalConversationToFile(
  primaryUser: UserProfile,
  primaryPartner: UserProfile,
  conversation: { id: string; messages: Array<{ senderId: string; text: string; createdAt: number }> }
) {
  const conversationData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      type: 'minimal-scenario',
      totalUsers: 2,
      totalConversations: 1,
      totalMessages: conversation.messages.length
    },
    users: {
      primaryUser: {
        ...primaryUser,
        role: 'primary',
        relationshipType: 'healthy'
      },
      primaryPartner: {
        ...primaryPartner,
        role: 'primary-partner',
        relationshipType: 'healthy'
      }
    },
    conversation: {
      type: 'romantic-healthy',
      participants: [primaryUser, primaryPartner],
      conversationId: conversation.id,
      messageCount: conversation.messages.length,
      messages: conversation.messages.map(msg => ({
        senderId: msg.senderId,
        senderName: msg.senderId === primaryUser.uid ? primaryUser.displayName : primaryPartner.displayName,
        text: msg.text,
        timestamp: msg.createdAt,
        date: new Date(msg.createdAt).toISOString()
      }))
    }
  };

  // Ensure data directory exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to file
  const filePath = path.join(dataDir, 'minimal-conversation.json');
  fs.writeFileSync(filePath, JSON.stringify(conversationData, null, 2));
  
  console.log(`💾 Minimal conversation saved to: ${filePath}`);
  console.log(`📊 File contains ${conversationData.metadata.totalMessages} messages`);
}

// Export for direct execution
if (require.main === module) {
  generateScenario().catch(console.error);
} 