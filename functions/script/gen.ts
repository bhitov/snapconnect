/**
 * Script to generate test chat histories
 * Run with: npm run script:gen
 */

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { randomUUID } from 'crypto';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });
export const app = initializeApp({
  credential: applicationDefault(),
  databaseURL: 'http://localhost:9000?ns=snapconnect-d75c6-default-rtdb',
  projectId: 'snapconnect-d75c6',
});

import {
  healthyPlatonicMessages,
  troubledPlatonicMessages,
  groupMessages,
  MessageData,
} from './gen-data';
import { database } from 'firebase-admin';
import { connectDatabaseEmulator } from 'firebase/database';

// Initialize Firebase Admin
if (!admin.apps.length) {
  initializeApp();
}

const db = getDatabase(app);

// connectDatabaseEmulator(db, host, 9000);
// Username to user ID mapping
const USERNAMES = {
  alex: 'alex_chen',
  jason: 'jason_miller',
  emma: 'emma_davis',
};

/**
 * Get user ID from username
 */
async function getUserId(username: string): Promise<string> {
  const usersRef = db.ref('users');
  const snapshot = await usersRef.get();

  if (!snapshot.exists()) {
    throw new Error('No users found in database');
  }

  const users = snapshot.val();
  for (const [userId, userData] of Object.entries(users)) {
    const user = userData as any;
    if (user.username === username) {
      return userId;
    }
  }

  throw new Error(`User with username '${username}' not found`);
}

/**
 * Find existing conversation between users (does not create new ones)
 */
async function findConversation(participants: string[]): Promise<string> {
  // Sort participants for consistent conversation ID lookup
  const sortedParticipants = [...participants].sort();

  // Check if conversation already exists
  const conversationsRef = db.ref('conversations');
  const snapshot = await conversationsRef.get();

  if (!snapshot.exists()) {
    throw new Error('No conversations found in database');
  }

  const conversations = snapshot.val();
  for (const [convId, conv] of Object.entries(conversations)) {
    const convData = conv as any;
    if (convData.participants) {
      const sortedExisting = [...convData.participants].sort();
      if (
        JSON.stringify(sortedExisting) === JSON.stringify(sortedParticipants)
      ) {
        console.log(`Found existing conversation: ${convId}`);
        return convId;
      }
    }
  }

  throw new Error(
    `Conversation not found for participants: ${participants.join(', ')}`
  );
}

/**
 * Insert messages into a conversation
 */
async function insertMessages(
  conversationId: string,
  messages: MessageData[],
  label: string
) {
  console.log(`\nInserting ${messages.length} messages for ${label}...`);

  const now = Date.now();
  const updates: Record<string, any> = {};

  for (const msg of messages) {
    const messageId = randomUUID();
    const createdAt = now - msg.minutesAgo * 60 * 1000;

    updates[`textMessages/${messageId}`] = {
      senderId: msg.senderId,
      text: msg.text,
      createdAt,
      conversationId,
      type: 'text',
      status: 'viewed', // Mark all as viewed for clean test data
    };
  }

  // Update conversation last message
  const lastMsg = messages[messages.length - 1];
  updates[`conversations/${conversationId}/lastMessage`] = lastMsg.text;
  updates[`conversations/${conversationId}/lastMessageAt`] =
    now - lastMsg.minutesAgo * 60 * 1000;

  await db.ref().update(updates);
  console.log(`✅ Inserted ${messages.length} messages successfully`);
}

/**
 * Main function to generate all test data
 */
async function generateTestData() {
  try {
    console.log('🚀 Starting test data generation...\n');

    // Get actual user IDs from database
    console.log('Looking up user IDs...');
    const alexId = await getUserId(USERNAMES.alex);
    const jasonId = await getUserId(USERNAMES.jason);
    const emmaId = await getUserId(USERNAMES.emma);

    console.log(`Found user IDs:
- Alex: ${alexId}
- Jason: ${jasonId}
- Emma: ${emmaId}\n`);

    // Update message data with actual user IDs
    const updateMessageSenderIds = (
      messages: MessageData[],
      mapping: Record<string, string>
    ): MessageData[] => {
      return messages.map(msg => ({
        ...msg,
        senderId: mapping[msg.senderId] || msg.senderId,
      }));
    };

    const userIdMapping = {
      alex_chen: alexId,
      jason_miller: jasonId,
      emma_davis: emmaId,
    };

    const updatedHealthyMessages = updateMessageSenderIds(
      healthyPlatonicMessages,
      userIdMapping
    );
    const updatedTroubledMessages = updateMessageSenderIds(
      troubledPlatonicMessages,
      userIdMapping
    );
    const updatedGroupMessages = updateMessageSenderIds(
      groupMessages,
      userIdMapping
    );

    // 1. Healthy platonic conversation (Alex ↔ Jason)
    const healthyConvId = await findConversation([alexId, jasonId]);
    await insertMessages(
      healthyConvId,
      updatedHealthyMessages,
      'Healthy Platonic (Alex ↔ Jason)'
    );

    // 2. Troubled platonic conversation (Emma ↔ Jason)
    const troubledConvId = await findConversation([emmaId, jasonId]);
    await insertMessages(
      troubledConvId,
      updatedTroubledMessages,
      'Troubled Platonic (Emma ↔ Jason)'
    );

    // 3. Group conversation (Alex, Jason, Emma)
    const groupConvId = await findConversation([alexId, jasonId, emmaId]);
    await insertMessages(
      groupConvId,
      updatedGroupMessages,
      'Group Chat (Alex, Jason, Emma)'
    );

    console.log('\n✨ Test data generation complete!');
    console.log('\nConversation IDs:');
    console.log(`- Healthy Platonic: ${healthyConvId}`);
    console.log(`- Troubled Platonic: ${troubledConvId}`);
    console.log(`- Group Chat: ${groupConvId}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error generating test data:', error);
    process.exit(1);
  }
}

// Run the script
generateTestData();
