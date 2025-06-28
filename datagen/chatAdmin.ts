/**
 * Chat administration utilities for creating and managing users, conversations, groups, and messages
 * Used for seeding test data and administrative operations
 */
import { randomUUID } from 'crypto';

import { getAuth } from 'firebase-admin/auth';

import { db } from './admin';

const auth = getAuth();

/* ---------- USERS ---------- */
export async function createUserProfile(data: {
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
}) {
  const now = Date.now();

  // Generate simple email from username
  const email = `${data.username}@example.com`;
  const password = 'pass123word';

  // Create Firebase Auth user
  const userRecord = await auth.createUser({
    email,
    password,
    displayName: data.displayName,
    ...(data.photoURL && { photoURL: data.photoURL }),
  });

  const uid = userRecord.uid;

  const profile = {
    uid,
    email: email.toLowerCase(),
    username: data.username,
    displayName: data.displayName,
    createdAt: now,
    lastActive: now,
    ...(data.photoURL && { photoURL: data.photoURL }),
    ...(data.bio && { bio: data.bio }),
    profileSetupCompleted: true,
  };

  // multi-location fan-out
  await db.ref().update({
    [`users/${uid}`]: profile,
    [`usernames/${data.username}`]: uid,
  });

  return uid;
}

/* ---------- DIRECT CONVERSATIONS ---------- */
export async function createDirectConversation(a: string, b: string) {
  const cid = randomUUID();
  const now = Date.now();

  await db.ref(`conversations/${cid}`).set({
    participants: [a, b],
    unreadCount: [0, 0],
    createdAt: now,
    updatedAt: now,
    isGroup: false,
  });

  return cid;
}

/* ---------- GROUPS ---------- */
export async function createGroup(
  name: string,
  memberIds: string[],
  avatarUrl?: string
) {
  const gid = randomUUID();
  const cid = randomUUID();
  const now = Date.now();
  const creator = memberIds[0];

  await db.ref(`groups/${gid}`).set({
    id: gid,
    name,
    createdBy: creator,
    createdAt: now,
    members: Object.fromEntries(
      memberIds.map(uid => [
        uid,
        {
          role: uid === creator ? 'admin' : 'member',
          joinedAt: now,
          addedBy: creator,
        },
      ])
    ),
    ...(avatarUrl && { avatarUrl }),
  });

  await db.ref(`conversations/${cid}`).set({
    participants: memberIds,
    unreadCount: Array(memberIds.length).fill(0),
    isGroup: true,
    groupId: gid,
    title: name,
    avatarUrl,
    createdAt: now,
    updatedAt: now,
  });

  return { gid, cid };
}

/* ---------- TEXT MESSAGES ---------- */
export async function sendText(
  conversationId: string,
  senderId: string,
  text: string,
  recipientId?: string
) {
  const mid = db.ref('textMessages').push().key;
  if (!mid) throw new Error('Failed to generate message ID');
  const now = Date.now();

  await db.ref(`textMessages/${mid}`).set({
    senderId,
    ...(recipientId && { recipientId }),
    conversationId,
    text,
    createdAt: now,
    status: 'sent',
  });

  await db.ref(`conversations/${conversationId}`).update({
    lastMessageId: mid,
    lastMessageType: 'text',
    lastMessageAt: now,
    updatedAt: now,
  });
}

/**
 * Bulk insert multiple text messages to a conversation in a single database operation
 * Efficient for seeding or importing large amounts of chat data
 */
export async function sendBulkTexts(
  conversationId: string,
  messages: {
    senderId: string;
    text: string;
    recipientId?: string;
    createdAt: number;
  }[]
) {
  if (messages.length === 0) return [];

  const now = Date.now();
  const messageIds: string[] = [];
  const updates: Record<string, unknown> = {};

  // Generate message IDs and prepare updates for all messages
  for (let i = 0; i < messages.length; i++) {
    const mid = db.ref('textMessages').push().key;
    if (!mid) throw new Error('Failed to generate message ID');
    const message = messages[i];
    if (!message) continue; // Type guard for array access

    messageIds.push(mid);

    updates[`textMessages/${mid}`] = {
      senderId: message.senderId,
      ...(message.recipientId && { recipientId: message.recipientId }),
      conversationId,
      text: message.text,
      createdAt: message.createdAt || now + i, // Increment timestamp to maintain order
      status: 'sent',
    };
  }

  // Update conversation with the last message info
  const lastMessage = messages[messages.length - 1];
  const lastMessageId = messageIds[messageIds.length - 1];

  if (lastMessage && lastMessageId) {
    updates[`conversations/${conversationId}/lastMessageId`] = lastMessageId;
    updates[`conversations/${conversationId}/lastMessageType`] = 'text';
    updates[`conversations/${conversationId}/lastMessageAt`] =
      lastMessage.createdAt || now + messages.length - 1;
    updates[`conversations/${conversationId}/updatedAt`] = now;
  }

  // Execute all updates in a single atomic operation
  await db.ref().update(updates);

  return messageIds;
}
