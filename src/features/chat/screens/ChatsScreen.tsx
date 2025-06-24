/**
 * @file ChatsScreen.tsx
 * @description Main chats screen showing conversations with friends.
 * Displays received snaps, unread counts, and real-time updates.
 */

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks/useTheme';

import {
  useChatStore,
  useConversations,
  useConversationsLoading,
  useConversationsError,
  useIsRefreshing,
  useUnreadCount,
} from '../store/chatStore';

import type { ConversationWithUser } from '../types';
import type { ChatStackParamList } from '@/shared/navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type ChatsScreenNavigationProp = StackNavigationProp<ChatStackParamList>;

/**
 * Format timestamp for conversation list
 */
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60 * 1000) {
    return 'now';
  }

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m`;
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h`;
  }

  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d`;
  }

  // Format as date
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Get status icon for snap
 */
function getSnapStatusIcon(status: string, isFromCurrentUser: boolean): string {
  if (isFromCurrentUser) {
    switch (status) {
      case 'sent':
        return '→';
      case 'delivered':
        return '✓';
      case 'viewed':
        return '👁️';
      default:
        return '→';
    }
  } else {
    switch (status) {
      case 'viewed':
        return '';
      default:
        return '🔴'; // New snap indicator
    }
  }
}

/**
 * Chats screen component
 */
export function ChatsScreen() {
  const navigation = useNavigation<ChatsScreenNavigationProp>();
  const theme = useTheme();

  // Store hooks
  const conversations = useConversations();
  const isLoading = useConversationsLoading();
  const error = useConversationsError();
  const isRefreshing = useIsRefreshing();
  const totalUnreadCount = useUnreadCount();

  // Store actions
  const { loadConversations, refreshConversations, clearError } =
    useChatStore();

  /**
   * Load conversations on component mount and focus
   */
  useEffect(() => {
    loadConversations();
  }, []);

  /**
   * Refresh conversations when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      refreshConversations();
    }, [])
  );

  /**
   * Handle refresh pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    refreshConversations();
  }, []);

  /**
   * Handle conversation press - navigate to individual chat screen
   */
  const handleConversationPress = useCallback(
    (conversation: ConversationWithUser) => {
      // Navigate to individual chat screen
      navigation.navigate('ChatScreen', {
        conversationId: conversation.id,
        otherUser: conversation.otherUser,
      });
    },
    [navigation]
  );

  /**
   * Render conversation item
   */
  const renderConversationItem = useCallback(
    ({ item: conversation }: { item: ConversationWithUser }) => {
      const hasUnread = conversation.unreadCount > 0;
      const lastMessage = conversation.lastMessage;

      return (
        <TouchableOpacity
          style={[
            styles.conversationItem,
            { backgroundColor: theme.colors.background },
            hasUnread && { backgroundColor: `${theme.colors.primary}10` },
          ]}
          onPress={() => handleConversationPress(conversation)}
          activeOpacity={0.7}
        >
          {/* User Avatar */}
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[styles.avatarText, { color: theme.colors.background }]}
            >
              {conversation.otherUser.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Conversation Info */}
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Text
                style={[
                  styles.userName,
                  { color: theme.colors.text },
                  hasUnread && { fontWeight: '600' },
                ]}
              >
                {conversation.otherUser.displayName}
              </Text>

              {lastMessage && (
                <Text
                  style={[
                    styles.timestamp,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {formatTimestamp(lastMessage.createdAt)}
                </Text>
              )}
            </View>

            <View style={styles.conversationMeta}>
              {lastMessage ? (
                <View style={styles.snapInfo}>
                  <Text
                    style={[
                      styles.snapType,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {lastMessage.type === 'text' 
                      ? `💬 ${lastMessage.text?.substring(0, 30)}${lastMessage.text && lastMessage.text.length > 30 ? '...' : ''}`
                      : `${lastMessage.mediaType === 'photo' ? '📷' : '🎥'} Snap`
                    }
                  </Text>
                  <Text
                    style={[
                      styles.statusIcon,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {getSnapStatusIcon(
                      lastMessage.status,
                      lastMessage.senderId === conversation.otherUser.uid
                    )}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.noSnaps,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  No messages yet
                </Text>
              )}

              {hasUnread && (
                <View
                  style={[
                    styles.unreadBadge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.unreadCount,
                      { color: theme.colors.background },
                    ]}
                  >
                    {conversation.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [theme, handleConversationPress]
  );

  /**
   * Render empty state
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
          No Conversations Yet
        </Text>
        <Text
          style={[
            styles.emptyStateDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          Add friends and start sending snaps to see your conversations here.
        </Text>
      </View>
    ),
    []
  );

  /**
   * Render error state
   */
  const renderErrorState = useCallback(
    () => (
      <View style={styles.errorState}>
        <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
          Failed to Load Conversations
        </Text>
        <Text
          style={[
            styles.errorDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: theme.colors.primary }]}
          onPress={() => {
            clearError();
            loadConversations();
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.retryButtonText, { color: theme.colors.primary }]}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [theme, error, clearError, loadConversations]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Chats
        </Text>

        {totalUnreadCount > 0 && (
          <View
            style={[
              styles.headerBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text
              style={[
                styles.headerBadgeText,
                { color: theme.colors.background },
              ]}
            >
              {totalUnreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={!isLoading ? renderEmptyState : null}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={theme.colors.primary ? [theme.colors.primary] : undefined}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.conversationsList,
            conversations.length === 0 && styles.emptyListContainer,
          ]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  headerBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  conversationsList: {
    flexGrow: 1,
  },
  emptyListContainer: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  snapType: {
    fontSize: 14,
    marginRight: 8,
  },
  statusIcon: {
    fontSize: 12,
  },
  noSnaps: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
