/**
 * @file chatService.ts
 * @description Service for managing chat functionality including text messages, snap sending,
 * receiving, media upload, and conversation management with Firebase.
 * Supports hybrid messaging with both ephemeral snaps and persistent text messages.
 */

import { getAuth } from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { generateId } from '@/shared/utils/idGenerator';

import type {
  Message,
  TextMessage,
  SnapMessage,
  TextMessageCreationData,
  SnapCreationData,
  TextMessageDocument,
  SnapDocument,
  ConversationDocument,
  ConversationWithUser,
  ChatError,
  SnapUploadProgress,
  MessageType,
  MessageStatus,
  Group,
  // Legacy types for backward compatibility
  Snap,
} from '../types';
import type { User } from '@/features/auth/types/authTypes';
import type { FirebaseError } from 'firebase/app';

/**
 * Chat service class for managing all chat-related operations
 */
class ChatService {
  private database = getDatabase();
  private storage = getStorage();
  private auth = getAuth();

  /**
   * Get current authenticated user ID
   */
  private getCurrentUserId(): string {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  /**
   * Get current authenticated user ID (public method)
   */
  getCurrentUser(): string {
    return this.getCurrentUserId();
  }

  /**
   * Handle service errors with user-friendly messages
   */
  private handleError(error: unknown): ChatError {
    console.error('❌ ChatService: Error:', error);

    if (error instanceof Error) {
      const firebaseError = error as FirebaseError;

      if (firebaseError.code) {
        switch (firebaseError.code) {
          case 'storage/unauthorized':
            return {
              type: 'permission_denied',
              message: 'Permission denied. Please check your authentication.',
              details: firebaseError.code,
            };
          case 'storage/canceled':
            return {
              type: 'upload_failed',
              message: 'Upload was canceled.',
              details: firebaseError.code,
            };
          case 'storage/unknown':
            return {
              type: 'storage_error',
              message: 'An unknown storage error occurred.',
              details: firebaseError.code,
            };
          case 'network-request-failed':
            return {
              type: 'network_error',
              message: 'Network error. Please check your connection.',
              details: firebaseError.code,
            };
          default:
            return {
              type: 'unknown',
              message: firebaseError.message || 'An unexpected error occurred.',
              details: firebaseError.code,
            };
        }
      }

      return {
        type: 'unknown',
        message: firebaseError.message || 'An unexpected error occurred.',
        details: firebaseError.code || firebaseError,
      };
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred.',
      details: error,
    };
  }

  /**
   * Send a text message to a recipient or group
   */
  async sendTextMessage(data: TextMessageCreationData): Promise<void> {
    const target = data.recipientId
      ? `user: ${data.recipientId}`
      : `conversation: ${data.conversationId}`;
    console.log('💬 ChatService: Sending text message to:', target);

    try {
      const currentUserId = this.getCurrentUserId();
      const messageId = generateId();
      const now = Date.now();

      let conversationId: string;

      // Handle group messages vs direct messages
      if (data.conversationId) {
        // Group message - use existing conversation
        conversationId = data.conversationId;
      } else if (data.recipientId) {
        // Direct message - create or get conversation
        conversationId = await this.createConversation(data.recipientId);
      } else {
        throw new Error(
          'Either recipientId or conversationId must be provided'
        );
      }

      // Create text message document
      const messageData: TextMessageDocument = {
        senderId: currentUserId,
        ...(data.recipientId && { recipientId: data.recipientId }), // Only include if exists
        conversationId,
        text: data.text,
        createdAt: now,
        status: 'sent',
        deliveredAt: now,
      };

      // Save message to database
      const messageRef = ref(this.database, `textMessages/${messageId}`);
      await set(messageRef, messageData);

      // Update conversation
      await this.updateConversationWithMessage(
        conversationId,
        messageId,
        'text',
        now,
        data.recipientId
      );

      console.log('✅ ChatService: Text message sent successfully:', messageId);
    } catch (error) {
      console.error('❌ ChatService: Failed to send text message:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Upload media file to Firebase Storage
   */
  private async uploadMedia(
    mediaUri: string,
    mediaType: 'photo',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    console.log('📤 ChatService: Uploading media:', mediaType, mediaUri);

    try {
      // Convert URI to blob for upload
      const response = await fetch(mediaUri);
      const blob = await response.blob();

      // Create storage reference
      const fileName = `${generateId()}.${mediaType === 'photo' ? 'jpg' : 'mp4'}`;
      const mediaRef = storageRef(this.storage, `snaps/${fileName}`);

      // Upload with progress tracking
      const uploadTask = uploadBytes(mediaRef, blob);

      // Simulate progress for now (uploadBytes doesn't provide progress)
      if (onProgress) {
        const progressInterval = setInterval(() => {
          // Simple progress simulation
          onProgress(Math.min(90, Math.random() * 80 + 10));
        }, 100);

        void uploadTask.finally(() => {
          clearInterval(progressInterval);
          onProgress(100);
        });
      }

      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('✅ ChatService: Media uploaded successfully:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('❌ ChatService: Media upload failed:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Create a group conversation
   */
  async createGroup(
    name: string,
    memberIds: string[],
    avatarUrl?: string
  ): Promise<string> {
    console.log(
      '👥 ChatService: Creating group:',
      name,
      'with members:',
      memberIds
    );

    try {
      const currentUserId = this.getCurrentUserId();
      const groupId = generateId();
      const conversationId = generateId();
      const now = Date.now();

      // Include current user in members
      const allMembers = [
        currentUserId,
        ...memberIds.filter(id => id !== currentUserId),
      ];

      // 1. Create group metadata
      const groupData: Group = {
        id: groupId,
        name,
        createdBy: currentUserId,
        createdAt: now,
        members: Object.fromEntries(
          allMembers.map(id => [
            id,
            {
              role: id === currentUserId ? 'admin' : 'member',
              joinedAt: now,
              addedBy: currentUserId,
            },
          ])
        ),
        ...(avatarUrl && { avatarUrl }),
      };

      const groupRef = ref(this.database, `groups/${groupId}`);
      await set(groupRef, groupData);

      // 2. Create conversation shell
      const conversationData: ConversationDocument = {
        participants: allMembers,
        unreadCount: Array(allMembers.length).fill(0) as number[],
        isGroup: true,
        groupId,
        title: name,
        ...(avatarUrl && { avatarUrl }),
        createdAt: now,
        updatedAt: now,
      };

      const conversationRef = ref(
        this.database,
        `conversations/${conversationId}`
      );
      await set(conversationRef, conversationData);

      console.log(
        '✅ ChatService: Created group:',
        groupId,
        'with conversation:',
        conversationId
      );
      return conversationId;
    } catch (error) {
      console.error('❌ ChatService: Failed to create group:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Create or get existing conversation between two users
   */
  async createConversation(otherUserId: string): Promise<string> {
    console.log(
      '💬 ChatService: Creating conversation with user:',
      otherUserId
    );

    try {
      const currentUserId = this.getCurrentUserId();

      // Check if conversation already exists
      const existingConversation = await this.findConversation(
        currentUserId,
        otherUserId
      );
      if (existingConversation) {
        console.log(
          '✅ ChatService: Found existing conversation:',
          existingConversation
        );
        return existingConversation;
      }

      // Create new conversation
      const conversationId = generateId();
      const conversationData: ConversationDocument = {
        participants: [currentUserId, otherUserId],
        unreadCount: [0, 0], // [participant0_unread, participant1_unread]
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const conversationRef = ref(
        this.database,
        `conversations/${conversationId}`
      );
      await set(conversationRef, conversationData);

      console.log('✅ ChatService: Created new conversation:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('❌ ChatService: Failed to create conversation:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Find existing conversation between two users
   */
  private async findConversation(
    user1Id: string,
    user2Id: string
  ): Promise<string | null> {
    try {
      const conversationsRef = ref(this.database, 'conversations');
      const snapshot = await get(conversationsRef);

      if (!snapshot.exists()) {
        return null;
      }

      const conversations = snapshot.val() as Record<
        string,
        ConversationDocument
      >;

      // Find conversation where both users are participants
      // IMPORTANT: Only find 1-on-1 conversations, not group conversations
      for (const [conversationId, conversation] of Object.entries(
        conversations
      )) {
        const conv = conversation;
        if (
          conv.participants.includes(user1Id) &&
          conv.participants.includes(user2Id) &&
          conv.participants.length === 2 && // Ensure it's a 1-on-1 conversation
          !conv.isGroup // Explicitly check it's not a group
        ) {
          return conversationId;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ ChatService: Failed to find conversation:', error);
      return null;
    }
  }

  /**
   * Send a snap to a recipient
   */
  async sendSnap(
    data: SnapCreationData,
    onProgress?: (progress: SnapUploadProgress) => void
  ): Promise<void> {
    console.log('📸 ChatService: Sending snap to:', data.recipientId);

    const snapId = generateId();

    try {
      // Update progress - starting upload
      onProgress?.({
        snapId,
        progress: 0,
        status: 'uploading',
      });

      // Upload media to Firebase Storage
      const mediaUrl = await this.uploadMedia(
        data.mediaUri,
        data.mediaType,
        uploadProgress => {
          onProgress?.({
            snapId,
            progress: uploadProgress * 0.8, // 80% for upload
            status: 'uploading',
          });
        }
      );

      // Update progress - processing
      onProgress?.({
        snapId,
        progress: 85,
        status: 'processing',
      });

      // Determine conversation ID
      let conversationId: string;
      if (data.conversationId) {
        conversationId = data.conversationId;
      } else if (data.recipientId) {
        conversationId = await this.createConversation(data.recipientId);
      } else {
        throw new Error(
          'Either recipientId or conversationId must be provided'
        );
      }

      // Create snap document
      const currentUserId = this.getCurrentUserId();
      const now = Date.now();
      const snapData: SnapDocument = {
        senderId: currentUserId,
        recipientId: data.recipientId || '', // Empty string for group messages
        conversationId,
        mediaUrl,
        mediaType: data.mediaType,
        ...(data.textOverlay && { textOverlay: data.textOverlay }),
        duration: data.duration,
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
        status: 'sent',
        deliveredAt: now,
      };

      // Save snap to database
      const snapRef = ref(this.database, `snaps/${snapId}`);
      await set(snapRef, snapData);

      // Update conversation
      await this.updateConversationWithMessage(
        conversationId,
        snapId,
        'snap',
        now,
        data.recipientId
      );

      // Update progress - complete
      onProgress?.({
        snapId,
        progress: 100,
        status: 'complete',
      });

      console.log('✅ ChatService: Snap sent successfully:', snapId);
    } catch (error) {
      console.error('❌ ChatService: Failed to send snap:', error);
      onProgress?.({
        snapId,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to send snap',
      });
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Decrement unread count for a user in a conversation
   */
  private async decrementUnreadCount(
    conversationId: string,
    userId: string
  ): Promise<void> {
    console.log('📉 ChatService: Decrementing unread count for user:', userId);

    try {
      const conversationRef = ref(
        this.database,
        `conversations/${conversationId}`
      );
      const snapshot = await get(conversationRef);

      if (!snapshot.exists()) {
        console.warn(
          '⚠️ ChatService: Conversation not found for unread count update'
        );
        return;
      }

      const conversation = snapshot.val() as ConversationDocument;

      // Find user index in participants array
      const userIndex = conversation.participants.findIndex(
        id => id === userId
      );
      if (userIndex === -1) {
        console.warn(
          '⚠️ ChatService: User not found in conversation participants'
        );
        return;
      }

      // Create new unread count array with decremented value
      const newUnreadCount = [...conversation.unreadCount];
      newUnreadCount[userIndex] = Math.max(
        0,
        (newUnreadCount[userIndex] || 0) - 1
      );

      // Update conversation
      await update(conversationRef, {
        unreadCount: newUnreadCount,
        updatedAt: Date.now(),
      });

      console.log('✅ ChatService: Unread count decremented');
    } catch (error) {
      console.error('❌ ChatService: Failed to decrement unread count:', error);
    }
  }

  /**
   * Update conversation with latest message info (unified for text and snaps)
   */
  private async updateConversationWithMessage(
    conversationId: string,
    messageId: string,
    messageType: MessageType,
    timestamp: number,
    recipientId?: string // Made optional for group messages
  ): Promise<void> {
    const conversationRef = ref(
      this.database,
      `conversations/${conversationId}`
    );
    const snapshot = await get(conversationRef);

    if (!snapshot.exists()) {
      throw new Error('Conversation not found');
    }

    const conversation = snapshot.val() as ConversationDocument;
    const currentUserId = this.getCurrentUserId();

    const newUnreadCount = [...conversation.unreadCount];

    if (conversation.isGroup) {
      // For group messages, increment unread count for all participants except sender
      const senderIndex = conversation.participants.findIndex(
        id => id === currentUserId
      );

      conversation.participants.forEach((participantId, index) => {
        if (index !== senderIndex) {
          newUnreadCount[index] = (newUnreadCount[index] || 0) + 1;
        }
      });
    } else if (recipientId) {
      // For one-to-one messages, increment unread count for recipient
      const recipientIndex = conversation.participants.findIndex(
        id => id === recipientId
      );
      if (recipientIndex === -1) {
        throw new Error('Recipient not found in conversation participants');
      }
      newUnreadCount[recipientIndex] =
        (newUnreadCount[recipientIndex] || 0) + 1;
    }

    // Update conversation
    await update(conversationRef, {
      lastMessageId: messageId,
      lastMessageAt: timestamp,
      lastMessageType: messageType,
      updatedAt: timestamp,
      unreadCount: newUnreadCount,
    });
  }

  /**
   * Get all messages for a conversation (both text and snaps)
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    // console.log(
    //   '📥 ChatService: Loading messages for conversation:',
    //   conversationId
    // );

    try {
      const [textMessages, snapMessages] = await Promise.all([
        this.getTextMessages(conversationId),
        this.getSnapMessages(conversationId),
      ]);

      // Combine and sort by creation time
      const allMessages: Message[] = [...textMessages, ...snapMessages];
      allMessages.sort((a, b) => a.createdAt - b.createdAt);

      // console.log('✅ ChatService: Loaded', allMessages.length, 'messages');
      return allMessages;
    } catch (error) {
      console.error('❌ ChatService: Failed to load messages:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Get text messages for a conversation
   */
  private async getTextMessages(
    conversationId: string
  ): Promise<TextMessage[]> {
    try {
      const textMessagesRef = ref(this.database, 'textMessages');
      const textQuery = query(
        textMessagesRef,
        orderByChild('conversationId'),
        equalTo(conversationId)
      );
      const snapshot = await get(textQuery);

      if (!snapshot.exists()) {
        return [];
      }

      const messages: TextMessage[] = [];
      snapshot.forEach(childSnapshot => {
        const messageData = childSnapshot.val() as TextMessageDocument;
        const message: TextMessage = {
          ...messageData,
          id: childSnapshot.key || '',
          type: 'text',
        };
        messages.push(message);
      });

      return messages;
    } catch (error) {
      console.error('❌ ChatService: Failed to load text messages:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Get snap messages for a conversation
   */
  private async getSnapMessages(
    conversationId: string
  ): Promise<SnapMessage[]> {
    try {
      const snapsRef = ref(this.database, 'snaps');
      const snapQuery = query(
        snapsRef,
        orderByChild('conversationId'),
        equalTo(conversationId)
      );
      const snapshot = await get(snapQuery);

      if (!snapshot.exists()) {
        return [];
      }

      const messages: SnapMessage[] = [];
      snapshot.forEach(childSnapshot => {
        const snapData = childSnapshot.val() as SnapDocument;
        const message: SnapMessage = {
          ...snapData,
          id: childSnapshot.key || '',
          type: 'snap',
        };
        messages.push(message);
      });

      return messages;
    } catch (error) {
      console.error('❌ ChatService: Failed to load snap messages:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Get conversations for current user
   */
  async getConversations(): Promise<ConversationWithUser[]> {
    // console.log('💬 ChatService: Loading conversations');

    try {
      const currentUserId = this.getCurrentUserId();
      const conversationsRef = ref(this.database, 'conversations');
      const snapshot = await get(conversationsRef);

      if (!snapshot.exists()) {
        console.log('💬 ChatService: No conversations found');
        return [];
      }

      const conversations = snapshot.val() as Record<
        string,
        ConversationDocument
      >;
      const result: ConversationWithUser[] = [];

      for (const [conversationId, conversation] of Object.entries(
        conversations
      )) {
        // Check if current user is participant
        if (!conversation.participants.includes(currentUserId)) continue;

        // Get current user index for unread count access
        const currentUserIndex = conversation.participants.findIndex(
          id => id === currentUserId
        );
        if (currentUserIndex === -1) continue;

        // Handle group conversations
        if (conversation.isGroup) {
          // Get last message data if exists
          let lastMessage;
          if (conversation.lastMessageId) {
            const messageData = await this.getMessageData(
              conversation.lastMessageId
            );
            if (messageData) {
              lastMessage = {
                id: conversation.lastMessageId,
                senderId: messageData.senderId,
                type: messageData.type,
                ...(messageData.type === 'text' && { text: messageData.text }),
                ...(messageData.type === 'snap' && {
                  mediaType: messageData.mediaType,
                }),
                createdAt: messageData.createdAt,
                status: messageData.status,
              };
            }
          }

          result.push({
            id: conversationId,
            isGroup: true,
            ...(conversation.groupId && { groupId: conversation.groupId }),
            ...(conversation.title && { title: conversation.title }),
            ...(conversation.avatarUrl && {
              avatarUrl: conversation.avatarUrl,
            }),
            participants: conversation.participants,
            ...(lastMessage && { lastMessage }),
            unreadCount: conversation.unreadCount[currentUserIndex] || 0,
            updatedAt: conversation.updatedAt,
            // Coach-specific fields
            ...(conversation.isCoach && { isCoach: conversation.isCoach }),
            ...(conversation.parentCid && {
              parentCid: conversation.parentCid,
            }),
            ...(conversation.coachChatId && {
              coachChatId: conversation.coachChatId,
            }),
          });
        } else {
          // Handle one-to-one conversations (existing logic)

          // Get other user ID
          const otherUserId = conversation.participants.find(
            id => id !== currentUserId
          );
          if (!otherUserId) continue;

          // Get other user data
          const otherUserData = await this.getUserData(otherUserId);
          if (!otherUserData) continue;

          // Get last message data if exists
          let lastMessage;
          if (conversation.lastMessageId) {
            const messageData = await this.getMessageData(
              conversation.lastMessageId
            );
            if (messageData) {
              lastMessage = {
                id: conversation.lastMessageId,
                senderId: messageData.senderId,
                type: messageData.type,
                ...(messageData.type === 'text' && { text: messageData.text }),
                ...(messageData.type === 'snap' && {
                  mediaType: messageData.mediaType,
                }),
                createdAt: messageData.createdAt,
                status: messageData.status,
              };
            }
          }

          result.push({
            id: conversationId,
            otherUser: {
              uid: otherUserId,
              username: otherUserData.username,
              displayName: otherUserData.displayName,
              ...(otherUserData.photoURL && {
                photoURL: otherUserData.photoURL,
              }),
            },
            ...(lastMessage && { lastMessage }),
            unreadCount: conversation.unreadCount[currentUserIndex] || 0,
            updatedAt: conversation.updatedAt,
            // Coach-specific fields
            ...(conversation.isCoach && { isCoach: conversation.isCoach }),
            ...(conversation.parentCid && {
              parentCid: conversation.parentCid,
            }),
            ...(conversation.coachChatId && {
              coachChatId: conversation.coachChatId,
            }),
          });
        }
      }

      // Sort by most recent activity
      result.sort((a, b) => b.updatedAt - a.updatedAt);

      // console.log('✅ ChatService: Loaded', result.length, 'conversations');
      return result;
    } catch (error) {
      console.error('❌ ChatService: Failed to load conversations:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Get snaps for a conversation
   */
  async getSnaps(conversationId: string): Promise<Snap[]> {
    console.log(
      '📸 ChatService: Loading snaps for conversation:',
      conversationId
    );

    try {
      const currentUserId = this.getCurrentUserId();

      // Get conversation to verify access
      const conversationRef = ref(
        this.database,
        `conversations/${conversationId}`
      );
      const conversationSnapshot = await get(conversationRef);

      if (!conversationSnapshot.exists()) {
        throw new Error('Conversation not found');
      }

      const conversation = conversationSnapshot.val() as ConversationDocument;
      if (!conversation.participants.includes(currentUserId)) {
        throw new Error('Access denied to conversation');
      }

      // Get snaps
      const snapsRef = ref(this.database, 'snaps');
      const snapshot = await get(snapsRef);

      if (!snapshot.exists()) {
        console.log('📸 ChatService: No snaps found');
        return [];
      }

      const snaps = snapshot.val() as Record<string, SnapDocument>;
      const result: Snap[] = [];

      for (const [snapId, snapData] of Object.entries(snaps)) {
        // Check if snap belongs to this conversation
        const isRelevant =
          (snapData.senderId === currentUserId &&
            snapData.recipientId &&
            conversation.participants.includes(snapData.recipientId)) ||
          (snapData.recipientId === currentUserId &&
            conversation.participants.includes(snapData.senderId));

        if (isRelevant) {
          result.push({
            ...snapData,
            id: snapId,
            recipientId: snapData.recipientId || '',
          });
        }
      }

      // Sort by creation time (newest first)
      result.sort((a, b) => b.createdAt - a.createdAt);

      console.log('✅ ChatService: Loaded', result.length, 'snaps');
      return result;
    } catch (error) {
      console.error('❌ ChatService: Failed to load snaps:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Get user data by ID
   */
  async getUserData(userId: string): Promise<User | null> {
    const userRef = ref(this.database, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? (snapshot.val() as User) : null;
  }

  /**
   * Get all unique participant IDs from a conversation (including historical senders)
   */
  async getAllParticipantIds(conversationId: string): Promise<string[]> {
    try {
      const uniqueUserIds = new Set<string>();

      // Get all messages for this conversation
      const messages = await this.getMessages(conversationId);

      // Collect all sender IDs
      messages.forEach(message => {
        uniqueUserIds.add(message.senderId);
      });

      return Array.from(uniqueUserIds);
    } catch (error) {
      console.error(
        '❌ ChatService: Failed to get all participant IDs:',
        error
      );
      return [];
    }
  }

  /**
   * Get participant data for a group conversation including historical senders
   */
  async getGroupParticipantData(
    conversationId: string
  ): Promise<Record<string, User>> {
    try {
      const participantData: Record<string, User> = {};

      // Get all unique user IDs from messages
      const allParticipantIds = await this.getAllParticipantIds(conversationId);

      // Fetch user data for each participant
      await Promise.all(
        allParticipantIds.map(async userId => {
          const userData = await this.getUserData(userId);
          if (userData) {
            participantData[userId] = userData;
          }
        })
      );

      return participantData;
    } catch (error) {
      console.error(
        '❌ ChatService: Failed to get group participant data:',
        error
      );
      return {};
    }
  }

  /**
   * Get message data by ID (public method for viewing)
   */
  async getMessage(messageId: string): Promise<Message | null> {
    console.log('📥 ChatService: Getting message data:', messageId);
    return this.getMessageData(messageId);
  }

  /**
   * Get message data by ID (private method) - checks both text messages and snaps
   */
  private async getMessageData(messageId: string): Promise<Message | null> {
    // Try text messages first
    const textMessageRef = ref(this.database, `textMessages/${messageId}`);
    const textSnapshot = await get(textMessageRef);

    if (textSnapshot.exists()) {
      const data = textSnapshot.val() as TextMessageDocument;
      return {
        ...data,
        id: messageId,
        type: 'text',
      } as TextMessage;
    }

    // Try snaps
    const snapRef = ref(this.database, `snaps/${messageId}`);
    const snapSnapshot = await get(snapRef);

    if (snapSnapshot.exists()) {
      const data = snapSnapshot.val() as SnapDocument;
      return {
        ...data,
        id: messageId,
        type: 'snap',
      } as SnapMessage;
    }

    return null;
  }

  /**
   * Mark message as delivered (when chat is opened and message is seen)
   */
  async markMessageAsDelivered(messageId: string): Promise<void> {
    console.log('📬 ChatService: Marking message as delivered:', messageId);

    try {
      const currentUserId = this.getCurrentUserId();

      // Try to find the message in text messages first
      const textMessageRef = ref(this.database, `textMessages/${messageId}`);
      const textSnapshot = await get(textMessageRef);

      if (textSnapshot.exists()) {
        const messageData = textSnapshot.val() as TextMessageDocument;

        // Verify user is the recipient
        if (messageData.recipientId !== currentUserId) {
          throw new Error('Access denied');
        }

        // Only update if not already delivered/viewed
        if (messageData.status === 'sent') {
          await update(textMessageRef, {
            status: 'delivered',
            deliveredAt: Date.now(),
          });

          // Update conversation unread count
          await this.decrementUnreadCount(
            messageData.conversationId,
            currentUserId
          );
        }

        console.log('✅ ChatService: Text message marked as delivered');
        return;
      }

      // Try snaps
      const snapRef = ref(this.database, `snaps/${messageId}`);
      const snapSnapshot = await get(snapRef);

      if (snapSnapshot.exists()) {
        const snapData = snapSnapshot.val() as SnapDocument;

        // Verify user is the recipient
        if (snapData.recipientId !== currentUserId) {
          throw new Error('Access denied');
        }

        // Only update if not already delivered/viewed
        if (snapData.status === 'sent') {
          await update(snapRef, {
            status: 'delivered',
            deliveredAt: Date.now(),
          });

          // Update conversation unread count
          await this.decrementUnreadCount(
            snapData.conversationId,
            currentUserId
          );
        }

        console.log('✅ ChatService: Snap marked as delivered');
        return;
      }

      throw new Error('Message not found');
    } catch (error) {
      console.error(
        '❌ ChatService: Failed to mark message as delivered:',
        error
      );
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Mark message as viewed (only for snaps when actually opened and watched)
   */
  async markMessageAsViewed(messageId: string): Promise<void> {
    console.log('👁️ ChatService: Marking snap as viewed (opened):', messageId);

    try {
      const currentUserId = this.getCurrentUserId();

      // Only snaps can be "viewed" (opened and watched)
      const snapRef = ref(this.database, `snaps/${messageId}`);
      const snapSnapshot = await get(snapRef);

      if (snapSnapshot.exists()) {
        const snapData = snapSnapshot.val() as SnapDocument;

        // Verify user is the recipient
        if (snapData.recipientId !== currentUserId) {
          throw new Error('Access denied');
        }

        // Update snap status to viewed (making it unviewable but keeping in chat history)
        await update(snapRef, {
          status: 'viewed',
          viewedAt: Date.now(),
        });

        console.log(
          '✅ ChatService: Snap marked as viewed (now unviewable but remains in chat history)'
        );

        return;
      }

      throw new Error('Snap not found - only snaps can be marked as viewed');
    } catch (error) {
      console.error('❌ ChatService: Failed to mark snap as viewed:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Legacy method - mark snap as viewed (for backward compatibility)
   */
  async markSnapAsViewed(snapId: string): Promise<void> {
    return this.markMessageAsViewed(snapId);
  }

  /**
   * Set up real-time listener for conversations
   */
  onConversationsChange(
    callback: (conversations: ConversationWithUser[]) => void
  ): () => void {
    const currentUserId = this.getCurrentUserId();
    const conversationsRef = ref(this.database, 'conversations');

    const unsubscribe = onValue(conversationsRef, async snapshot => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      try {
        const conversations = await this.getConversations();
        callback(conversations);
      } catch (error) {
        console.error(
          '❌ ChatService: Real-time conversations update failed:',
          error
        );
        callback([]);
      }
    });

    return () => off(conversationsRef, 'value', unsubscribe);
  }

  /**
   * Set up real-time listener for messages in a conversation
   */
  onMessagesChange(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const messagesRef = ref(this.database, 'textMessages');

    const unsubscribe = onValue(messagesRef, async snapshot => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      try {
        const messages = await this.getMessages(conversationId);
        callback(messages);
      } catch (error) {
        console.error(
          '❌ ChatService: Real-time messages update failed:',
          error
        );
        callback([]);
      }
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }

  /**
   * Delete expired messages (cleanup function)
   */
  async cleanupExpiredMessages(): Promise<void> {
    console.log('🧹 ChatService: Cleaning up expired messages');

    try {
      // Clean up snaps (they expire after 24 hours, but viewed snaps stay in chat history)
      const snapsRef = ref(this.database, 'snaps');
      const snapsSnapshot = await get(snapsRef);

      if (snapsSnapshot.exists()) {
        const snaps = snapsSnapshot.val() as Record<string, SnapDocument>;
        const now = Date.now();
        const expiredSnaps: string[] = [];

        for (const [snapId, snapData] of Object.entries(snaps)) {
          // Only delete snaps that are truly expired (24 hours old)
          // Viewed snaps remain in chat history permanently but become unviewable
          if (snapData.expiresAt < now && snapData.status !== 'viewed') {
            expiredSnaps.push(snapId);
          }
        }

        // Delete only truly expired snaps (not viewed ones)
        for (const snapId of expiredSnaps) {
          const snapRef = ref(this.database, `snaps/${snapId}`);
          await set(snapRef, null);
        }

        console.log(
          '✅ ChatService: Cleaned up',
          expiredSnaps.length,
          'expired snaps (viewed snaps remain in chat history)'
        );
      }

      // Text messages are persistent and don't get cleaned up
      console.log('✅ ChatService: Text messages remain persistent');
    } catch (error) {
      console.error('❌ ChatService: Cleanup failed:', error);
    }
  }

  /**
   * Mark all unread messages in a conversation as delivered (when chat is opened)
   */
  async markAllMessagesAsDelivered(conversationId: string): Promise<void> {
    console.log(
      '📬 ChatService: Marking all unread messages as delivered for conversation:',
      conversationId
    );

    try {
      const currentUserId = this.getCurrentUserId();

      // Get conversation to verify access and get current unread count
      const conversationRef = ref(
        this.database,
        `conversations/${conversationId}`
      );
      const conversationSnapshot = await get(conversationRef);

      if (!conversationSnapshot.exists()) {
        throw new Error('Conversation not found');
      }

      const conversation = conversationSnapshot.val() as ConversationDocument;

      // Verify user is participant
      if (!conversation.participants.includes(currentUserId)) {
        throw new Error('Access denied to conversation');
      }

      // Find current user index
      const currentUserIndex = conversation.participants.findIndex(
        id => id === currentUserId
      );
      if (currentUserIndex === -1) {
        throw new Error('User not found in conversation participants');
      }

      // If no unread messages, nothing to do
      if (
        !conversation.unreadCount ||
        !conversation.unreadCount[currentUserIndex] ||
        conversation.unreadCount[currentUserIndex] === 0
      ) {
        console.log('✅ ChatService: No unread messages to mark as delivered');
        return;
      }

      // Get all text messages for this conversation that are undelivered to current user
      const textMessagesRef = ref(this.database, 'textMessages');
      const textQuery = query(
        textMessagesRef,
        orderByChild('conversationId'),
        equalTo(conversationId)
      );
      const textSnapshot = await get(textQuery);

      // Get all snaps for this conversation that are undelivered to current user
      const snapsRef = ref(this.database, 'snaps');
      const snapQuery = query(
        snapsRef,
        orderByChild('conversationId'),
        equalTo(conversationId)
      );
      const snapSnapshot = await get(snapQuery);

      const updates: Record<string, MessageStatus | number | number[] | null> =
        {};
      const now = Date.now();

      // Mark undelivered text messages as delivered
      if (textSnapshot.exists()) {
        textSnapshot.forEach(childSnapshot => {
          const messageData = childSnapshot.val() as TextMessageDocument;
          if (
            messageData.recipientId === currentUserId &&
            messageData.status === 'sent'
          ) {
            updates[`textMessages/${childSnapshot.key}/status`] = 'delivered';
            updates[`textMessages/${childSnapshot.key}/deliveredAt`] = now;
          }
        });
      }

      // Mark undelivered snaps as delivered
      if (snapSnapshot.exists()) {
        snapSnapshot.forEach(childSnapshot => {
          const snapData = childSnapshot.val() as SnapDocument;
          if (
            snapData.recipientId === currentUserId &&
            snapData.status === 'sent'
          ) {
            updates[`snaps/${childSnapshot.key}/status`] = 'delivered';
            updates[`snaps/${childSnapshot.key}/deliveredAt`] = now;
          }
        });
      }

      // Reset unread count to zero for current user
      const newUnreadCount = conversation.unreadCount
        ? [...conversation.unreadCount]
        : [];
      // Ensure array is long enough for all participants
      while (newUnreadCount.length <= currentUserIndex) {
        newUnreadCount.push(0);
      }
      newUnreadCount[currentUserIndex] = 0;
      updates[`conversations/${conversationId}/unreadCount`] = newUnreadCount;
      updates[`conversations/${conversationId}/updatedAt`] = now;

      // Apply all updates in one atomic operation
      if (Object.keys(updates).length > 0) {
        await update(ref(this.database), updates);
        console.log(
          '✅ ChatService: Marked all unread messages as delivered and reset unread count to zero'
        );
      } else {
        console.log(
          '✅ ChatService: No messages needed to be marked as delivered'
        );
      }
    } catch (error) {
      console.error(
        '❌ ChatService: Failed to mark all messages as delivered:',
        error
      );
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Add users to an existing group
   */
  async addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
    console.log('👥 ChatService: Adding users to group:', groupId, userIds);

    try {
      const currentUserId = this.getCurrentUserId();
      const now = Date.now();

      // Get current group data
      const groupRef = ref(this.database, `groups/${groupId}`);
      const groupSnapshot = await get(groupRef);

      if (!groupSnapshot.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupSnapshot.val() as Group;

      // Check if current user is admin
      if (groupData.members?.[currentUserId]?.role !== 'admin') {
        throw new Error('Only admins can add members');
      }

      // Get conversation data
      const conversationsRef = ref(this.database, 'conversations');
      const conversationsSnapshot = await get(conversationsRef);

      let conversationId: string | null = null;
      let conversationData: ConversationDocument | null = null;

      if (conversationsSnapshot.exists()) {
        const conversations = conversationsSnapshot.val() as Record<
          string,
          ConversationDocument
        >;
        for (const [id, conversation] of Object.entries(conversations)) {
          if (conversation.groupId === groupId) {
            conversationId = id;
            conversationData = conversation;
            break;
          }
        }
      }

      if (!conversationId || !conversationData) {
        throw new Error('Group conversation not found');
      }

      // Add new members to group metadata
      const updatedMembers = { ...(groupData.members || {}) };
      userIds.forEach(userId => {
        if (!updatedMembers[userId]) {
          updatedMembers[userId] = {
            role: 'member',
            joinedAt: now,
            addedBy: currentUserId,
          };
        }
      });

      // Update participants and unread counts arrays
      const newParticipants = [...conversationData.participants];
      const newUnreadCount = [...conversationData.unreadCount];

      userIds.forEach(userId => {
        if (!newParticipants.includes(userId)) {
          newParticipants.push(userId);
          newUnreadCount.push(0);
        }
      });

      // Update both group and conversation
      const updates: Record<string, unknown> = {};
      updates[`groups/${groupId}/members`] = updatedMembers;
      updates[`conversations/${conversationId}/participants`] = newParticipants;
      updates[`conversations/${conversationId}/unreadCount`] = newUnreadCount;
      updates[`conversations/${conversationId}/updatedAt`] = now;

      await update(ref(this.database), updates);

      console.log('✅ ChatService: Added users to group successfully');
    } catch (error) {
      console.error('❌ ChatService: Failed to add users to group:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Remove user from group
   */
  async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    console.log('👥 ChatService: Removing user from group:', groupId, userId);

    try {
      const currentUserId = this.getCurrentUserId();
      const now = Date.now();

      // Get current group data
      const groupRef = ref(this.database, `groups/${groupId}`);
      const groupSnapshot = await get(groupRef);

      if (!groupSnapshot.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupSnapshot.val() as Group;

      // Check permissions: admin can remove others, users can remove themselves
      const canRemove =
        groupData.members?.[currentUserId]?.role === 'admin' ||
        currentUserId === userId;
      if (!canRemove) {
        throw new Error('Permission denied');
      }

      // Get conversation data
      const conversationsRef = ref(this.database, 'conversations');
      const conversationsSnapshot = await get(conversationsRef);

      let conversationId: string | null = null;
      let conversationData: ConversationDocument | null = null;

      if (conversationsSnapshot.exists()) {
        const conversations = conversationsSnapshot.val() as Record<
          string,
          ConversationDocument
        >;
        for (const [id, conversation] of Object.entries(conversations)) {
          if (conversation.groupId === groupId) {
            conversationId = id;
            conversationData = conversation;
            break;
          }
        }
      }

      if (!conversationId || !conversationData) {
        throw new Error('Group conversation not found');
      }

      // Remove member from group metadata
      const updatedMembers = { ...(groupData.members || {}) };
      delete updatedMembers[userId];

      // Update participants and unread counts arrays
      const userIndex = conversationData.participants.findIndex(
        (id: string) => id === userId
      );
      if (userIndex === -1) {
        throw new Error('User not found in conversation participants');
      }

      const newParticipants = conversationData.participants.filter(
        (_participant: string, index: number) => index !== userIndex
      );
      const newUnreadCount = conversationData.unreadCount.filter(
        (_count: number, index: number) => index !== userIndex
      );

      // Update both group and conversation
      const updates: Record<string, unknown> = {};
      updates[`groups/${groupId}/members`] = updatedMembers;
      updates[`conversations/${conversationId}/participants`] = newParticipants;
      updates[`conversations/${conversationId}/unreadCount`] = newUnreadCount;
      updates[`conversations/${conversationId}/updatedAt`] = now;

      await update(ref(this.database), updates);

      console.log('✅ ChatService: Removed user from group successfully');
    } catch (error) {
      console.error('❌ ChatService: Failed to remove user from group:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Leave a group - removes user from group or destroys group if admin
   */
  async leaveGroup(groupId: string): Promise<void> {
    console.log('👥 ChatService: Leaving group:', groupId);

    try {
      const currentUserId = this.getCurrentUserId();

      // Get group data to check if user is admin
      const groupRef = ref(this.database, `groups/${groupId}`);
      const groupSnapshot = await get(groupRef);

      if (!groupSnapshot.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupSnapshot.val() as Group;

      // Check if current user is the admin (creator)
      const isAdmin = groupData.createdBy === currentUserId;

      if (isAdmin) {
        // Admin leaving - destroy the entire group and its conversations
        console.log('👥 ChatService: Admin leaving, destroying group');

        // Find and delete all conversations with this groupId
        const conversationsRef = ref(this.database, 'conversations');
        const conversationsSnapshot = await get(conversationsRef);

        const updates: Record<string, null> = {};

        if (conversationsSnapshot.exists()) {
          const conversations = conversationsSnapshot.val() as Record<
            string,
            ConversationDocument
          >;

          // Find all conversations for this group and mark for deletion
          for (const [convId, conversation] of Object.entries(conversations)) {
            if (conversation.groupId === groupId) {
              updates[`conversations/${convId}`] = null;

              // Also delete all messages in this conversation
              updates[`messages/${convId}`] = null;
            }
          }
        }

        // Delete the group itself
        updates[`groups/${groupId}`] = null;

        // Apply all deletions atomically
        await update(ref(this.database), updates);

        console.log('✅ ChatService: Group destroyed successfully');
      } else {
        // Regular member leaving - just remove them from the group
        console.log('👥 ChatService: Member leaving group');
        await this.removeUserFromGroup(groupId, currentUserId);
      }
    } catch (error) {
      console.error('❌ ChatService: Failed to leave group:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Get group data by groupId
   */
  async getGroupData(groupId: string): Promise<Group | null> {
    console.log('👥 ChatService: Getting group data:', groupId);

    try {
      const groupRef = ref(this.database, `groups/${groupId}`);
      const snapshot = await get(groupRef);

      if (!snapshot.exists()) {
        throw new Error('Group not found');
      }

      return snapshot.val() as Group;
    } catch (error) {
      console.error('❌ ChatService: Failed to get group data:', error);
      const chatError = this.handleError(error);
      throw new Error(chatError.message);
    }
  }

  /**
   * Get message count for a conversation
   */
  async getConversationMessageCount(conversationId: string): Promise<number> {
    try {
      const messagesRef = ref(this.database, 'textMessages');
      const messagesQuery = query(
        messagesRef,
        orderByChild('conversationId'),
        equalTo(conversationId)
      );

      const snapshot = await get(messagesQuery);

      if (!snapshot.exists()) {
        return 0;
      }

      return Object.keys(snapshot.val() as Record<string, unknown>).length;
    } catch (error) {
      console.error('❌ ChatService: Failed to get message count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
