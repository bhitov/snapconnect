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
  isGroup?: boolean;
  groupId?: string;
  parentCid?: string;
  createdAt: number;
  coachChatId?: string;
}

export interface UserInfo {
  displayName: string;
  username: string;
}

export interface TextMessageWithUserInfo extends TextMessage {
  senderInfo?: UserInfo;
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
 * Get recent messages from a conversation with user info
 */
export async function getRecentMessagesWithUserInfo(
  conversationId: string,
  limit: number = 20
): Promise<TextMessageWithUserInfo[]> {
  const messages = await getRecentMessages(conversationId, limit);
  const participantInfo = await getConversationParticipants(conversationId);

  // Add user info to each message
  return messages.map(msg => ({
    ...msg,
    senderInfo: participantInfo.get(msg.senderId),
  }));
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
 * Get all messages from a conversation with user info
 */
export async function getAllMessagesWithUserInfo(
  conversationId: string
): Promise<TextMessageWithUserInfo[]> {
  const messages = await getAllMessages(conversationId);
  const participantInfo = await getConversationParticipants(conversationId);

  // Add user info to each message
  return messages.map(msg => ({
    ...msg,
    senderInfo: participantInfo.get(msg.senderId),
  }));
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
    .map(m => `${m.senderId === 'coach' ? coachLabel : userLabel}: ${m.text}`)
    .join('\n');
}

/**
 * Format messages with user info for display in chat context
 */
export function formatMessagesWithUserInfoForContext(
  messages: TextMessageWithUserInfo[],
  coachLabel: string = 'Coach'
): string {
  return messages
    .map(m => {
      if (m.senderId === 'coach') {
        return `${coachLabel}: ${m.text}`;
      }
      // Use display name if available, otherwise fall back to username or senderId
      const name =
        m.senderInfo?.displayName || m.senderInfo?.username || m.senderId;
      return `${name}: ${m.text}`;
    })
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
    username: userData.username || '',
  };
}

/**
 * Get user information for multiple uids
 */
export async function getUsersInfo(
  uids: string[]
): Promise<Map<string, UserInfo>> {
  const userMap = new Map<string, UserInfo>();

  // Fetch all users in parallel
  const promises = uids.map(async uid => {
    const userInfo = await getUserInfo(uid);
    if (userInfo) {
      userMap.set(uid, userInfo);
    }
  });

  await Promise.all(promises);
  return userMap;
}

/**
 * Get conversation participants' information
 */
export async function getConversationParticipants(
  conversationId: string
): Promise<Map<string, UserInfo>> {
  const convSnapshot = await db.ref(`conversations/${conversationId}`).get();
  if (!convSnapshot.exists()) {
    return new Map();
  }

  const conversation = convSnapshot.val() as Conversation;
  const participants = conversation.participants || [];

  // Filter out 'coach' from participants list as it's not a real user
  const userIds = participants.filter(p => p !== 'coach');

  return getUsersInfo(userIds);
}

/**
 * Check if two users are partners
 */
export async function areUsersPartners(
  user1Id: string,
  user2Id: string
): Promise<boolean> {
  const [user1Snapshot, user2Snapshot] = await Promise.all([
    db.ref(`users/${user1Id}`).get(),
    db.ref(`users/${user2Id}`).get(),
  ]);

  const user1Data = user1Snapshot.val();
  const user2Data = user2Snapshot.val();

  // Check if they are partners (each user's partnerId points to the other)
  return user1Data?.partnerId === user2Id && user2Data?.partnerId === user1Id;
}

/**
 * Get conversation details
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  const snapshot = await db.ref(`conversations/${conversationId}`).get();
  return snapshot.exists() ? (snapshot.val() as Conversation) : null;
}
