import { randomUUID } from 'crypto';
import { getDatabase } from 'firebase-admin/database';
import type { Database } from 'firebase-admin/database';

// Type definitions
export interface TextMessage {
  id?: string;
  senderId: string;
  text: string;
  createdAt: number;
  conversationId: string;
}

export interface Conversation {
  participants: string[];
  isCoach?: boolean;
  parentCid?: string;
  createdAt: number;
  coachChatId?: string;
}

export interface UserInfo {
  displayName: string;
  username: string;
}

// Initialize database instance
const db: Database = getDatabase();

/**
 * Check if a coach chat already exists for a user and parent conversation
 */
export async function getCoachChatId(
  uid: string,
  parentCid: string
): Promise<string | null> {
  const node = await db.ref(`coachIndex/${uid}/${parentCid}`).get();
  return node.exists() ? (node.val() as string) : null;
}

/**
 * Create a new coach conversation and index it
 */
export async function createCoachConversation(
  coachCid: string,
  uid: string,
  parentCid: string,
  timestamp: number
): Promise<void> {
  await db.ref().update({
    [`conversations/${coachCid}`]: {
      participants: [uid, 'coach'],
      isCoach: true,
      parentCid,
      createdAt: timestamp,
    },
    [`conversations/${parentCid}/coachChatId`]: coachCid,
    [`coachIndex/${uid}/${parentCid}`]: coachCid,
  });
}

/**
 * Save a text message to the database
 */
export async function saveTextMessage(
  message: Omit<TextMessage, 'id'>
): Promise<void> {
  const messageId = randomUUID();
  await db.ref(`textMessages/${messageId}`).set(message);
}

/**
 * Get recent messages from a conversation
 */
export async function getRecentMessages(
  conversationId: string,
  limit: number = 20
): Promise<TextMessage[]> {
  const snapshot = await db
    .ref('textMessages')
    .orderByChild('conversationId')
    .equalTo(conversationId)
    .limitToLast(limit)
    .get();

  const messages = Object.entries(snapshot.val() ?? {}).map(([id, msg]) => ({
    id,
    ...(msg as Omit<TextMessage, 'id'>),
  }));

  // Sort by timestamp (oldest to newest)
  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Get all messages from a conversation (no limit)
 */
export async function getAllMessages(
  conversationId: string
): Promise<TextMessage[]> {
  const snapshot = await db
    .ref('textMessages')
    .orderByChild('conversationId')
    .equalTo(conversationId)
    .get();

  const messages = Object.entries(snapshot.val() ?? {}).map(([id, msg]) => ({
    id,
    ...(msg as Omit<TextMessage, 'id'>),
  }));

  // Sort by timestamp (oldest to newest)
  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Format messages for display in chat context
 */
export function formatMessagesForContext(
  messages: TextMessage[],
  coachLabel: string = 'Coach',
  userLabel: string = 'You'
): string {
  return messages
    .map(
      m => `${m.senderId === 'coach' ? coachLabel : userLabel}: ${m.text}`
    )
    .join('\n');
}

/**
 * Get user information by uid
 */
export async function getUserInfo(uid: string): Promise<UserInfo | null> {
  const snapshot = await db.ref(`users/${uid}`).get();
  if (!snapshot.exists()) {
    return null;
  }
  
  const userData = snapshot.val();
  return {
    displayName: userData.displayName || '',
    username: userData.username || ''
  };
}