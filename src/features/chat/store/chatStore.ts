/**
 * @file chatStore.ts
 * @description Zustand store for managing chat state including conversations,
 * messages (both text and snaps), sending progress, and viewing sessions.
 * Supports hybrid messaging with both ephemeral snaps and persistent text messages.
 */

import { create } from 'zustand';

import { chatService } from '../services/chatService';
import {
  startCoachChat,
  sendCoachMessage,
  analyzeChat,
  analyzeRatio,
  analyzeHorsemen,
  generateLoveMap,
  analyzeBids,
  analyzeRuptureRepair,
  analyzeACR,
  analyzeSharedInterests,
  analyzeTopicChampion,
  generateFriendshipCheckin,
  analyzeGroupEnergy,
  analyzeTopicVibeCheck,
} from '../services/coachService';

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

  // Group creation
  groupCreationState: {
    title: '',
    selectedMembers: [],
    isCreating: false,
  },
};

/**
 * Chat store with Zustand
 */
export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  // Conversations
  loadConversations: async () => {
    // console.log('💬 ChatStore: Loading conversations');

    set({ conversationsLoading: true, conversationsError: null });

    try {
      const conversations = await chatService.getConversations();
      set({
        conversations,
        conversationsLoading: false,
        conversationsError: null,
      });

      // console.log(
      //   '✅ ChatStore: Loaded',
      //   conversations.length,
      //   'conversations'
      // );
    } catch (loadError) {
      console.error('❌ ChatStore: Failed to load conversations:', loadError);
      set({
        conversationsLoading: false,
        conversationsError:
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load conversations',
      });
    }
  },

  refreshConversations: async () => {
    // console.log('🔄 ChatStore: Refreshing conversations');

    set({ isRefreshing: true });

    try {
      const conversations = await chatService.getConversations();
      set({
        conversations,
        conversationsError: null,
        isRefreshing: false,
      });

      // console.log(
      //   '✅ ChatStore: Refreshed',
      //   conversations.length,
      //   'conversations'
      // );
    } catch (refreshError) {
      console.error(
        '❌ ChatStore: Failed to refresh conversations:',
        refreshError
      );
      set({
        isRefreshing: false,
        conversationsError:
          refreshError instanceof Error
            ? refreshError.message
            : 'Failed to refresh conversations',
      });
    }
  },

  silentRefreshConversations: async () => {
    // console.log(
    //   '🔄 ChatStore: Silent refresh conversations (no loading state)'
    // );

    try {
      const conversations = await chatService.getConversations();
      set({
        conversations,
        conversationsError: null,
      });

      // console.log(
      //   '✅ ChatStore: Silent refresh completed',
      //   conversations.length,
      //   'conversations'
      // );
    } catch (silentError) {
      console.error('❌ ChatStore: Silent refresh failed:', silentError);
      // Don't set error state for silent refresh to avoid UI disruption
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
    } catch (createError) {
      console.error(
        '❌ ChatStore: Failed to create conversation:',
        createError
      );
      throw createError;
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
    } catch (loadMessagesError) {
      console.error(
        '❌ ChatStore: Failed to load messages:',
        loadMessagesError
      );
      set({
        messagesLoading: false,
        messagesError:
          loadMessagesError instanceof Error
            ? loadMessagesError.message
            : 'Failed to load messages',
      });
    }
  },

  silentLoadMessages: async (conversationId: string) => {
    // console.log(
    //   '📥 ChatStore: Silent loading messages for conversation:',
    //   conversationId
    // );

    try {
      const messages = await chatService.getMessages(conversationId);
      set({
        currentMessages: messages,
        messagesError: null,
      });

      // console.log(
      //   '✅ ChatStore: Silent load completed',
      //   messages.length,
      //   'messages'
      // );
    } catch (silentLoadError) {
      console.error('❌ ChatStore: Silent load failed:', silentLoadError);
      // Don't set error state for silent refresh to avoid UI disruption
    }
  },

  sendTextMessage: async (data: TextMessageCreationData) => {
    console.log('💬 ChatStore: Sending text message to:', data.recipientId);

    try {
      await chatService.sendTextMessage(data);

      // Refresh conversations to update last message info
      await get().refreshConversations();

      console.log('✅ ChatStore: Text message sent successfully');
    } catch (sendTextError) {
      console.error(
        '❌ ChatStore: Failed to send text message:',
        sendTextError
      );
      set({
        sendError:
          sendTextError instanceof Error
            ? sendTextError.message
            : 'Failed to send text message',
      });
      throw sendTextError;
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
    } catch (sendSnapError) {
      console.error('❌ ChatStore: Failed to send snap:', sendSnapError);
      set({
        sendError:
          sendSnapError instanceof Error
            ? sendSnapError.message
            : 'Failed to send snap',
      });
      throw sendSnapError;
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
    } catch (viewError) {
      console.error(
        '❌ ChatStore: Failed to mark message as viewed:',
        viewError
      );
      throw viewError;
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
    } catch (deliverError) {
      console.error(
        '❌ ChatStore: Failed to mark message as delivered:',
        deliverError
      );
      throw deliverError;
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
    } catch (markAllError) {
      console.error(
        '❌ ChatStore: Failed to mark all messages as delivered:',
        markAllError
      );
      throw markAllError;
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

  // Coach
  startCoachChat: async (parentCid: string) => {
    console.log('🎓 ChatStore: Starting coach chat for:', parentCid);

    try {
      const coachCid = await startCoachChat(parentCid);

      // Update the parent conversation with the coach chat ID
      const { conversations } = get();
      const updatedConversations = conversations.map(conv =>
        conv.id === parentCid ? { ...conv, coachChatId: coachCid } : conv
      );
      set({ conversations: updatedConversations });

      // Reload conversations to get the new coach chat
      await get().loadConversations();

      console.log('✅ ChatStore: Created coach chat:', coachCid);
      return coachCid;
    } catch (coachStartError) {
      console.error(
        '❌ ChatStore: Failed to start coach chat:',
        coachStartError
      );
      throw coachStartError;
    }
  },

  sendCoachMessage: async (
    coachCid: string,
    parentCid: string,
    text: string
  ) => {
    console.log('🎓 ChatStore: Sending coach message:', { coachCid, text });

    try {
      await sendCoachMessage(coachCid, parentCid, text);

      // Reload messages to show the coach response
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Coach message sent successfully');
    } catch (coachMessageError) {
      console.error(
        '❌ ChatStore: Failed to send coach message:',
        coachMessageError
      );
      set({
        sendError:
          coachMessageError instanceof Error
            ? coachMessageError.message
            : 'Failed to send coach message',
      });
      throw coachMessageError;
    }
  },

  analyzeChat: async (
    coachCid: string,
    parentCid: string,
    messageCount: number = 30
  ) => {
    console.log('🎓 ChatStore: Analyzing chat:', {
      coachCid,
      parentCid,
      messageCount,
    });

    try {
      await analyzeChat(coachCid, parentCid, messageCount);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Chat analysis completed');
    } catch (analyzeChatError) {
      console.error('❌ ChatStore: Failed to analyze chat:', analyzeChatError);
      throw analyzeChatError;
    }
  },

  analyzeRatio: async (coachCid: string, parentCid: string) => {
    console.log('📊 ChatStore: Analyzing ratio:', { coachCid, parentCid });

    try {
      await analyzeRatio(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Ratio analysis completed');
    } catch (ratioError) {
      console.error('❌ ChatStore: Failed to analyze ratio:', ratioError);
      throw ratioError;
    }
  },

  analyzeHorsemen: async (coachCid: string, parentCid: string) => {
    console.log('⚠️ ChatStore: Analyzing horsemen:', { coachCid, parentCid });

    try {
      await analyzeHorsemen(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Horsemen analysis completed');
    } catch (horsemenError) {
      console.error('❌ ChatStore: Failed to analyze horsemen:', horsemenError);
      throw horsemenError;
    }
  },

  generateLoveMap: async (coachCid: string, parentCid: string) => {
    console.log('💕 ChatStore: Generating love map:', { coachCid, parentCid });

    try {
      await generateLoveMap(coachCid, parentCid);

      // Reload messages to show the love map question
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Love map generated');
    } catch (loveMapError) {
      console.error('❌ ChatStore: Failed to generate love map:', loveMapError);
      throw loveMapError;
    }
  },

  analyzeBids: async (coachCid: string, parentCid: string) => {
    console.log('💬 ChatStore: Analyzing emotional bids:', { coachCid, parentCid });

    try {
      await analyzeBids(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Bids analysis completed');
    } catch (bidsError) {
      console.error('❌ ChatStore: Failed to analyze bids:', bidsError);
      throw bidsError;
    }
  },

  analyzeRuptureRepair: async (coachCid: string, parentCid: string) => {
    console.log('🔧 ChatStore: Analyzing rupture and repair:', { coachCid, parentCid });

    try {
      await analyzeRuptureRepair(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Rupture and repair analysis completed');
    } catch (ruptureError) {
      console.error('❌ ChatStore: Failed to analyze rupture and repair:', ruptureError);
      throw ruptureError;
    }
  },

  analyzeACR: async (coachCid: string, parentCid: string) => {
    console.log('🎯 ChatStore: Analyzing ACR:', { coachCid, parentCid });

    try {
      await analyzeACR(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: ACR analysis completed');
    } catch (acrError) {
      console.error('❌ ChatStore: Failed to analyze ACR:', acrError);
      throw acrError;
    }
  },

  analyzeSharedInterests: async (coachCid: string, parentCid: string) => {
    console.log('🎯 ChatStore: Analyzing shared interests:', { coachCid, parentCid });

    try {
      await analyzeSharedInterests(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Shared interests analysis completed');
    } catch (sharedInterestsError) {
      console.error('❌ ChatStore: Failed to analyze shared interests:', sharedInterestsError);
      throw sharedInterestsError;
    }
  },

  analyzeTopicChampion: async (coachCid: string, parentCid: string) => {
    console.log('👑 ChatStore: Analyzing topic champions:', { coachCid, parentCid });

    try {
      await analyzeTopicChampion(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Topic champion analysis completed');
    } catch (topicChampionError) {
      console.error('❌ ChatStore: Failed to analyze topic champions:', topicChampionError);
      throw topicChampionError;
    }
  },

  generateFriendshipCheckin: async (coachCid: string, parentCid: string) => {
    console.log('📦 ChatStore: Generating friendship check-in:', { coachCid, parentCid });

    try {
      await generateFriendshipCheckin(coachCid, parentCid);

      // Reload messages to show the check-in
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Friendship check-in generated');
    } catch (checkinError) {
      console.error('❌ ChatStore: Failed to generate friendship check-in:', checkinError);
      throw checkinError;
    }
  },

  analyzeGroupEnergy: async (coachCid: string, parentCid: string) => {
    console.log('⚡ ChatStore: Analyzing group energy:', { coachCid, parentCid });

    try {
      await analyzeGroupEnergy(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Group energy analysis completed');
    } catch (groupEnergyError) {
      console.error('❌ ChatStore: Failed to analyze group energy:', groupEnergyError);
      throw groupEnergyError;
    }
  },

  analyzeTopicVibeCheck: async (coachCid: string, parentCid: string) => {
    console.log('🌟 ChatStore: Analyzing topic vibes:', { coachCid, parentCid });

    try {
      await analyzeTopicVibeCheck(coachCid, parentCid);

      // Reload messages to show the analysis
      await get().silentLoadMessages(coachCid);

      console.log('✅ ChatStore: Topic vibe check completed');
    } catch (topicVibeError) {
      console.error('❌ ChatStore: Failed to analyze topic vibes:', topicVibeError);
      throw topicVibeError;
    }
  },

  // Groups
  createGroup: async (
    name: string,
    memberIds: string[],
    avatarUrl?: string
  ) => {
    console.log(
      '👥 ChatStore: Creating group:',
      name,
      'with members:',
      memberIds
    );

    set(state => ({
      groupCreationState: {
        ...state.groupCreationState,
        isCreating: true,
      },
    }));

    try {
      const conversationId = await chatService.createGroup(
        name,
        memberIds,
        avatarUrl
      );

      // Reset group creation state
      set(state => ({
        groupCreationState: {
          title: '',
          selectedMembers: [],
          isCreating: false,
        },
      }));

      // Reload conversations to get the new group
      await get().loadConversations();

      console.log('✅ ChatStore: Created group:', conversationId);
      return conversationId;
    } catch (groupCreateError) {
      console.error('❌ ChatStore: Failed to create group:', groupCreateError);
      set(state => ({
        groupCreationState: {
          ...state.groupCreationState,
          isCreating: false,
        },
      }));
      throw groupCreateError;
    }
  },

  addUsersToGroup: async (groupId: string, userIds: string[]) => {
    console.log('👥 ChatStore: Adding users to group:', groupId, userIds);

    try {
      await chatService.addUsersToGroup(groupId, userIds);

      // Reload conversations to reflect changes
      await get().loadConversations();

      console.log('✅ ChatStore: Added users to group successfully');
    } catch (addUsersError) {
      console.error(
        '❌ ChatStore: Failed to add users to group:',
        addUsersError
      );
      throw addUsersError;
    }
  },

  removeUserFromGroup: async (groupId: string, userId: string) => {
    console.log('👥 ChatStore: Removing user from group:', groupId, userId);

    try {
      await chatService.removeUserFromGroup(groupId, userId);

      // Reload conversations to reflect changes
      await get().loadConversations();

      console.log('✅ ChatStore: Removed user from group successfully');
    } catch (removeUserError) {
      console.error(
        '❌ ChatStore: Failed to remove user from group:',
        removeUserError
      );
      throw removeUserError;
    }
  },

  updateGroupTitle: (groupId: string, title: string) => {
    console.log('👥 ChatStore: Updating group title:', groupId, title);
    // TODO: Implement in chatService
  },

  leaveGroup: (groupId: string) => {
    console.log('👥 ChatStore: Leaving group:', groupId);
    // TODO: Implement in chatService
  },

  // Group creation UI
  setGroupTitle: (title: string) => {
    set(state => ({
      groupCreationState: {
        ...state.groupCreationState,
        title,
      },
    }));
  },

  setGroupMembers: (memberIds: string[]) => {
    set(state => ({
      groupCreationState: {
        ...state.groupCreationState,
        selectedMembers: memberIds,
      },
    }));
  },

  addGroupMember: (memberId: string) => {
    set(state => ({
      groupCreationState: {
        ...state.groupCreationState,
        selectedMembers: [
          ...state.groupCreationState.selectedMembers,
          memberId,
        ],
      },
    }));
  },

  removeGroupMember: (memberId: string) => {
    set(state => ({
      groupCreationState: {
        ...state.groupCreationState,
        selectedMembers: state.groupCreationState.selectedMembers.filter(
          id => id !== memberId
        ),
      },
    }));
  },

  resetGroupCreation: () => {
    set({
      groupCreationState: {
        title: '',
        selectedMembers: [],
        isCreating: false,
      },
    });
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

// Group selectors
export const useGroupCreationState = () =>
  useChatStore(state => state.groupCreationState);
export const useGroupTitle = () =>
  useChatStore(state => state.groupCreationState.title);
export const useGroupMembers = () =>
  useChatStore(state => state.groupCreationState.selectedMembers);
export const useIsCreatingGroup = () =>
  useChatStore(state => state.groupCreationState.isCreating);
