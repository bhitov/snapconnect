/**
 * @file chatStore.ts
 * @description Zustand store for managing chat state including conversations,
 * messages (both text and snaps), sending progress, and viewing sessions.
 * Supports hybrid messaging with both ephemeral snaps and persistent text messages.
 */

import { create } from 'zustand';

import { chatService } from '../services/chatService';

import type {
  ChatStore,
  ChatState,
  ConversationWithUser,
  Message,
  TextMessage,
  SnapMessage,
  TextMessageCreationData,
  SnapCreationData,
  SnapUploadProgress,
  SnapViewingSession,
  // Legacy types for backward compatibility
  Snap,
} from '../types';

/**
 * Initial chat state
 */
const initialState: ChatState = {
  // Conversations
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,

  // Current conversation
  currentConversation: null,
  currentMessages: [], // Changed from currentSnaps to currentMessages
  messagesLoading: false,
  messagesError: null,

  // Message sending
  sendingMessages: [], // For now, only snaps have upload progress
  sendError: null,

  // Snap viewing
  viewingSession: null,

  // UI state
  selectedRecipients: [],
  isRefreshing: false,
};

/**
 * Chat store with Zustand
 */
export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  // Conversations
  loadConversations: async () => {
    console.log('💬 ChatStore: Loading conversations');

    set({ conversationsLoading: true, conversationsError: null });

    try {
      const conversations = await chatService.getConversations();
      set({
        conversations,
        conversationsLoading: false,
        conversationsError: null,
      });

      console.log(
        '✅ ChatStore: Loaded',
        conversations.length,
        'conversations'
      );
    } catch (error) {
      console.error('❌ ChatStore: Failed to load conversations:', error);
      set({
        conversationsLoading: false,
        conversationsError:
          (error as any).message || 'Failed to load conversations',
      });
    }
  },

  refreshConversations: async () => {
    console.log('🔄 ChatStore: Refreshing conversations');

    set({ isRefreshing: true });

    try {
      const conversations = await chatService.getConversations();
      set({
        conversations,
        conversationsError: null,
        isRefreshing: false,
      });

      console.log(
        '✅ ChatStore: Refreshed',
        conversations.length,
        'conversations'
      );
    } catch (error) {
      console.error('❌ ChatStore: Failed to refresh conversations:', error);
      set({
        isRefreshing: false,
        conversationsError:
          (error as any).message || 'Failed to refresh conversations',
      });
    }
  },

  createConversation: async (otherUserId: string) => {
    console.log('💬 ChatStore: Creating conversation with:', otherUserId);

    try {
      const conversationId = await chatService.createConversation(otherUserId);

      // Reload conversations to get the new one
      await get().loadConversations();

      console.log('✅ ChatStore: Created conversation:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('❌ ChatStore: Failed to create conversation:', error);
      throw error;
    }
  },

  // Messages (unified text and snaps)
  loadMessages: async (conversationId: string) => {
    console.log(
      '📥 ChatStore: Loading messages for conversation:',
      conversationId
    );

    set({ messagesLoading: true, messagesError: null });

    try {
      const messages = await chatService.getMessages(conversationId);
      set({
        currentMessages: messages,
        messagesLoading: false,
        messagesError: null,
      });

      console.log('✅ ChatStore: Loaded', messages.length, 'messages');
    } catch (error) {
      console.error('❌ ChatStore: Failed to load messages:', error);
      set({
        messagesLoading: false,
        messagesError: (error as any).message || 'Failed to load messages',
      });
    }
  },

  sendTextMessage: async (data: TextMessageCreationData) => {
    console.log('💬 ChatStore: Sending text message to:', data.recipientId);

    try {
      await chatService.sendTextMessage(data);

      // Refresh conversations to update last message info
      await get().refreshConversations();

      console.log('✅ ChatStore: Text message sent successfully');
    } catch (error) {
      console.error('❌ ChatStore: Failed to send text message:', error);
      set({
        sendError: (error as any).message || 'Failed to send text message',
      });
      throw error;
    }
  },

  sendSnap: async (data: SnapCreationData) => {
    console.log('📸 ChatStore: Sending snap to:', data.recipientId);

    const { sendingMessages } = get();

    try {
      await chatService.sendSnap(data, progress => {
        // Update sending progress
        const updatedSending = sendingMessages.map(item =>
          item.snapId === progress.snapId ? progress : item
        );

        // Add new progress if not found
        if (!updatedSending.find(item => item.snapId === progress.snapId)) {
          updatedSending.push(progress);
        }

        set({ sendingMessages: updatedSending });
      });

      // Remove from sending list when complete
      const finalSending = sendingMessages.filter(
        item => item.snapId !== data.recipientId // Use a proper ID here
      );
      set({ sendingMessages: finalSending });

      // Refresh conversations to update last message info
      await get().refreshConversations();

      console.log('✅ ChatStore: Snap sent successfully');
    } catch (error) {
      console.error('❌ ChatStore: Failed to send snap:', error);
      set({
        sendError: (error as any).message || 'Failed to send snap',
      });
      throw error;
    }
  },

  markMessageAsViewed: async (messageId: string) => {
    console.log('👁️ ChatStore: Marking message as viewed:', messageId);

    try {
      await chatService.markMessageAsViewed(messageId);

      // Update local message status
      const { currentMessages } = get();
      const updatedMessages = currentMessages.map(message =>
        message.id === messageId
          ? { ...message, status: 'viewed' as const, viewedAt: Date.now() }
          : message
      );

      set({ currentMessages: updatedMessages });

      // Refresh conversations to update unread counts
      await get().refreshConversations();

      console.log('✅ ChatStore: Message marked as viewed');
    } catch (error) {
      console.error('❌ ChatStore: Failed to mark message as viewed:', error);
      throw error;
    }
  },

  markMessageAsDelivered: async (messageId: string) => {
    console.log('📬 ChatStore: Marking message as delivered:', messageId);

    try {
      await chatService.markMessageAsDelivered(messageId);

      // Update local message status
      const { currentMessages } = get();
      const updatedMessages = currentMessages.map(message =>
        message.id === messageId
          ? {
              ...message,
              status: 'delivered' as const,
              deliveredAt: Date.now(),
            }
          : message
      );

      set({ currentMessages: updatedMessages });

      // Refresh conversations to update unread counts
      await get().refreshConversations();

      console.log('✅ ChatStore: Message marked as delivered');
    } catch (error) {
      console.error(
        '❌ ChatStore: Failed to mark message as delivered:',
        error
      );
      throw error;
    }
  },

  markAllMessagesAsDelivered: async (conversationId: string) => {
    console.log(
      '📬 ChatStore: Marking all messages as delivered for conversation:',
      conversationId
    );

    try {
      await chatService.markAllMessagesAsDelivered(conversationId);

      // Refresh messages to show updated status
      await get().loadMessages(conversationId);

      // Refresh conversations to update unread counts
      await get().refreshConversations();

      console.log('✅ ChatStore: All messages marked as delivered');
    } catch (error) {
      console.error(
        '❌ ChatStore: Failed to mark all messages as delivered:',
        error
      );
      throw error;
    }
  },

  // Snap viewing (for snap messages only)
  startViewingSnap: (snap: SnapMessage) => {
    console.log('👁️ ChatStore: Starting to view snap:', snap.id);

    const session: SnapViewingSession = {
      snapId: snap.id,
      startTime: Date.now(),
      isPaused: false,
      remainingTime: snap.duration * 1000, // Convert to milliseconds
      totalDuration: snap.duration * 1000,
    };

    set({ viewingSession: session });
  },

  pauseViewingSnap: () => {
    const { viewingSession } = get();
    if (!viewingSession || viewingSession.isPaused) return;

    console.log('⏸️ ChatStore: Pausing snap viewing');

    const elapsed = Date.now() - viewingSession.startTime;
    const remainingTime = Math.max(0, viewingSession.totalDuration - elapsed);

    set({
      viewingSession: {
        ...viewingSession,
        isPaused: true,
        remainingTime,
      },
    });
  },

  resumeViewingSnap: () => {
    const { viewingSession } = get();
    if (!viewingSession || !viewingSession.isPaused) return;

    console.log('▶️ ChatStore: Resuming snap viewing');

    set({
      viewingSession: {
        ...viewingSession,
        isPaused: false,
        startTime: Date.now(),
      },
    });
  },

  stopViewingSnap: () => {
    console.log('⏹️ ChatStore: Stopping snap viewing');
    set({ viewingSession: null });
  },

  // Recipient selection
  setSelectedRecipients: (recipients: string[]) => {
    console.log('👥 ChatStore: Setting selected recipients:', recipients);
    set({ selectedRecipients: recipients });
  },

  addRecipient: (recipientId: string) => {
    const { selectedRecipients } = get();
    if (!selectedRecipients.includes(recipientId)) {
      console.log('➕ ChatStore: Adding recipient:', recipientId);
      set({ selectedRecipients: [...selectedRecipients, recipientId] });
    }
  },

  removeRecipient: (recipientId: string) => {
    const { selectedRecipients } = get();
    console.log('➖ ChatStore: Removing recipient:', recipientId);
    set({
      selectedRecipients: selectedRecipients.filter(id => id !== recipientId),
    });
  },

  clearRecipients: () => {
    console.log('🗑️ ChatStore: Clearing all recipients');
    set({ selectedRecipients: [] });
  },

  // Error handling
  clearError: () => {
    set({
      conversationsError: null,
      messagesError: null,
      sendError: null,
    });
  },

  clearSendError: () => {
    set({ sendError: null });
  },

  clearMessagesError: () => {
    set({ messagesError: null });
  },
}));

// Performance selectors
export const useConversations = () =>
  useChatStore(state => state.conversations);
export const useConversationsLoading = () =>
  useChatStore(state => state.conversationsLoading);
export const useConversationsError = () =>
  useChatStore(state => state.conversationsError);

export const useCurrentConversation = () =>
  useChatStore(state => state.currentConversation);
export const useCurrentMessages = () =>
  useChatStore(state => state.currentMessages);
export const useMessagesLoading = () =>
  useChatStore(state => state.messagesLoading);
export const useMessagesError = () =>
  useChatStore(state => state.messagesError);

export const useSendingMessages = () =>
  useChatStore(state => state.sendingMessages);
export const useSendError = () => useChatStore(state => state.sendError);

export const useViewingSession = () =>
  useChatStore(state => state.viewingSession);

export const useSelectedRecipients = () =>
  useChatStore(state => state.selectedRecipients);
export const useIsRefreshing = () => useChatStore(state => state.isRefreshing);

// Computed selectors
export const useUnreadCount = () =>
  useChatStore(state =>
    state.conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  );

export const useHasUnreadMessages = () =>
  useChatStore(state => state.conversations.some(conv => conv.unreadCount > 0));
