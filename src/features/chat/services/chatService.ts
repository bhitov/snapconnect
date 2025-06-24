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
  push,
  set,
  get,
  update,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
  orderByKey,
  limitToLast,
} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
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
  Conversation,
  ConversationDocument,
  ConversationWithUser,
  ChatError,
  ChatErrorType,
  SnapUploadProgress,
  MessageType,
  MessageStatus,
  // Legacy types for backward compatibility
  Snap,
} from '../types';

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
   * Handle service errors with user-friendly messages
   */
  private handleError(error: any): ChatError {
    console.error('❌ ChatService: Error:', error);

    if (error.code) {
      switch (error.code) {
        case 'storage/unauthorized':
          return {
            type: 'permission_denied',
            message: 'Permission denied. Please check your authentication.',
            details: error.code,
          };
        case 'storage/canceled':
          return {
            type: 'upload_failed',
            message: 'Upload was canceled.',
            details: error.code,
          };
        case 'storage/unknown':
          return {
            type: 'storage_error',
            message: 'An unknown storage error occurred.',
            details: error.code,
          };
        case 'network-request-failed':
          return {
            type: 'network_error',
            message: 'Network error. Please check your connection.',
            details: error.code,
          };
        default:
          return {
            type: 'unknown',
            message: error.message || 'An unexpected error occurred.',
            details: error.code,
          };
      }
    }

    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      details: error,
    };
  }

  /**
   * Send a text message to a recipient
   */
  async sendTextMessage(data: TextMessageCreationData): Promise<void> {
    console.log('💬 ChatService: Sending text message to:', data.recipientId);

    try {
      const currentUserId = this.getCurrentUserId();
      const messageId = generateId();
      const now = Date.now();

      // Create or get conversation
      const conversationId = await this.createConversation(data.recipientId);

      // Create text message document
      const messageData: TextMessageDocument = {
        senderId: currentUserId,
        recipientId: data.recipientId,
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
      throw this.handleError(error);
    }
  }

  /**
   * Upload media file to Firebase Storage
   */
  private async uploadMedia(
    mediaUri: string,
    mediaType: 'photo' | 'video',
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

        uploadTask.finally(() => {
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
      throw this.handleError(error);
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
      throw this.handleError(error);
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

      const conversations = snapshot.val();

      // Find conversation where both users are participants
      for (const [conversationId, conversation] of Object.entries(
        conversations
      )) {
        const conv = conversation as ConversationDocument;
        if (
          conv.participants.includes(user1Id) &&
          conv.participants.includes(user2Id)
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

      // Create or get conversation
      const conversationId = await this.createConversation(data.recipientId);

      // Create snap document
      const currentUserId = this.getCurrentUserId();
      const now = Date.now();
      const snapData: SnapDocument = {
        senderId: currentUserId,
        recipientId: data.recipientId,
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
        error: (error as any).message || 'Failed to send snap',
      });
      throw this.handleError(error);
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
    recipientId: string
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

    // Find recipient index in participants array
    const recipientIndex = conversation.participants.findIndex(id => id === recipientId);
    if (recipientIndex === -1) {
      throw new Error('Recipient not found in conversation participants');
    }

    // Create new unread count array with updated value
    const newUnreadCount = [...conversation.unreadCount];
    newUnreadCount[recipientIndex] = (newUnreadCount[recipientIndex] || 0) + 1;

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
    console.log('📥 ChatService: Loading messages for conversation:', conversationId);

    try {
      const [textMessages, snapMessages] = await Promise.all([
        this.getTextMessages(conversationId),
        this.getSnapMessages(conversationId),
      ]);

      // Combine and sort by creation time
      const allMessages: Message[] = [...textMessages, ...snapMessages];
      allMessages.sort((a, b) => a.createdAt - b.createdAt);

      console.log('✅ ChatService: Loaded', allMessages.length, 'messages');
      return allMessages;
    } catch (error) {
      console.error('❌ ChatService: Failed to load messages:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get text messages for a conversation
   */
  private async getTextMessages(conversationId: string): Promise<TextMessage[]> {
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
          id: childSnapshot.key!,
          type: 'text',
          senderId: messageData.senderId,
          recipientId: messageData.recipientId,
          conversationId: messageData.conversationId,
          text: messageData.text,
          createdAt: messageData.createdAt,
          status: messageData.status,
          ...(messageData.deliveredAt && { deliveredAt: messageData.deliveredAt }),
          ...(messageData.viewedAt && { viewedAt: messageData.viewedAt }),
        };
        messages.push(message);
      });

      return messages;
    } catch (error) {
      console.error('❌ ChatService: Failed to load text messages:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get snap messages for a conversation
   */
  private async getSnapMessages(conversationId: string): Promise<SnapMessage[]> {
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
          id: childSnapshot.key!,
          type: 'snap',
          senderId: snapData.senderId,
          recipientId: snapData.recipientId,
          conversationId: snapData.conversationId,
          mediaUrl: snapData.mediaUrl,
          mediaType: snapData.mediaType,
          ...(snapData.textOverlay && { textOverlay: snapData.textOverlay }),
          duration: snapData.duration,
          createdAt: snapData.createdAt,
          expiresAt: snapData.expiresAt,
          status: snapData.status,
          ...(snapData.deliveredAt && { deliveredAt: snapData.deliveredAt }),
          ...(snapData.viewedAt && { viewedAt: snapData.viewedAt }),
        };
        messages.push(message);
      });

      return messages;
    } catch (error) {
      console.error('❌ ChatService: Failed to load snap messages:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get conversations for current user
   */
  async getConversations(): Promise<ConversationWithUser[]> {
    console.log('💬 ChatService: Loading conversations');

    try {
      const currentUserId = this.getCurrentUserId();
      const conversationsRef = ref(this.database, 'conversations');
      const snapshot = await get(conversationsRef);

      if (!snapshot.exists()) {
        console.log('💬 ChatService: No conversations found');
        return [];
      }

      const conversations = snapshot.val();
      const result: ConversationWithUser[] = [];

      for (const [conversationId, conversation] of Object.entries(
        conversations as Record<string, ConversationDocument>
      )) {
        // Check if current user is participant
        if (!conversation.participants.includes(currentUserId)) continue;

        // Get other user ID
        const otherUserId = conversation.participants.find(
          id => id !== currentUserId
        );
        if (!otherUserId) continue;

        // Get current user index for unread count access
        const currentUserIndex = conversation.participants.findIndex(id => id === currentUserId);
        if (currentUserIndex === -1) continue;

        // Get other user data
        const otherUserData = await this.getUserData(otherUserId);
        if (!otherUserData) continue;

        // Get last snap data if exists
        let lastSnap;
        if (conversation.lastMessageId) {
          const messageData = await this.getMessageData(conversation.lastMessageId);
          if (messageData) {
            lastSnap = {
              id: conversation.lastMessageId,
              senderId: messageData.senderId,
              type: messageData.type,
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
            photoURL: otherUserData.photoURL,
          },
          ...(lastSnap && { lastSnap }),
          unreadCount: conversation.unreadCount[currentUserIndex] || 0,
          updatedAt: conversation.updatedAt,
        });
      }

      // Sort by most recent activity
      result.sort((a, b) => b.updatedAt - a.updatedAt);

      console.log('✅ ChatService: Loaded', result.length, 'conversations');
      return result;
    } catch (error) {
      console.error('❌ ChatService: Failed to load conversations:', error);
      throw this.handleError(error);
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

      const snaps = snapshot.val();
      const result: Snap[] = [];

      for (const [snapId, snapData] of Object.entries(
        snaps as Record<string, SnapDocument>
      )) {
        // Check if snap belongs to this conversation
        const isRelevant =
          (snapData.senderId === currentUserId &&
            conversation.participants.includes(snapData.recipientId)) ||
          (snapData.recipientId === currentUserId &&
            conversation.participants.includes(snapData.senderId));

        if (isRelevant) {
          result.push({
            id: snapId,
            ...snapData,
          });
        }
      }

      // Sort by creation time (newest first)
      result.sort((a, b) => b.createdAt - a.createdAt);

      console.log('✅ ChatService: Loaded', result.length, 'snaps');
      return result;
    } catch (error) {
      console.error('❌ ChatService: Failed to load snaps:', error);
      throw this.handleError(error);
    }
  }



  /**
   * Get user data by ID
   */
  private async getUserData(userId: string): Promise<any> {
    const userRef = ref(this.database, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
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
  private async getMessageData(messageId: string): Promise<any | null> {
    // Try text messages first
    const textMessageRef = ref(this.database, `textMessages/${messageId}`);
    const textSnapshot = await get(textMessageRef);
    
    if (textSnapshot.exists()) {
      return { ...textSnapshot.val(), type: 'text' };
    }

    // Try snaps
    const snapRef = ref(this.database, `snaps/${messageId}`);
    const snapSnapshot = await get(snapRef);
    
    if (snapSnapshot.exists()) {
      return { ...snapSnapshot.val(), type: 'snap' };
    }

    return null;
  }

  /**
   * Mark message as viewed (supports both text messages and snaps)
   */
  async markMessageAsViewed(messageId: string): Promise<void> {
    console.log('👁️ ChatService: Marking message as viewed:', messageId);

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

        // Update message status
        await update(textMessageRef, {
          status: 'viewed',
          viewedAt: Date.now(),
        });

        console.log('✅ ChatService: Text message marked as viewed');
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

        // Update snap status
        await update(snapRef, {
          status: 'viewed',
          viewedAt: Date.now(),
        });

        console.log('✅ ChatService: Snap marked as viewed');
        return;
      }

      throw new Error('Message not found');
    } catch (error) {
      console.error('❌ ChatService: Failed to mark message as viewed:', error);
      throw this.handleError(error);
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
        console.error('❌ ChatService: Real-time messages update failed:', error);
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
      const messagesRef = ref(this.database, 'textMessages');
      const snapshot = await get(messagesRef);

      if (!snapshot.exists()) return;

      const messages = snapshot.val();
      const now = Date.now();
      const expiredMessages: string[] = [];

             for (const [messageId, messageData] of Object.entries(
         messages as Record<string, any>
       )) {
         // Only snaps expire, text messages are persistent
         if (messageData.expiresAt && (messageData.expiresAt < now || messageData.status === 'viewed')) {
           expiredMessages.push(messageId);
         }
       }

      // Delete expired messages
      for (const messageId of expiredMessages) {
        const messageRef = ref(this.database, `textMessages/${messageId}`);
        await set(messageRef, null);
      }

      console.log(
        '✅ ChatService: Cleaned up',
        expiredMessages.length,
        'expired messages'
      );
    } catch (error) {
      console.error('❌ ChatService: Cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
