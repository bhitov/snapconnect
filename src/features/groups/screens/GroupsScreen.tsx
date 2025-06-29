/**
 * @file GroupsScreen.tsx
 * @description Main groups screen showing group conversations.
 * Displays group chats with unread counts and creation abilities.
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';

// Note: Using Image instead of ProfileAvatar since that's for current user
import { ProfileAvatar } from '@/shared/components/base/ProfileAvatar';
import { useTheme } from '@/shared/hooks/useTheme';

import {
  useChatStore,
  useConversations,
  useConversationsLoading,
  useConversationsError,
  useIsRefreshing,
} from '../../chat/store/chatStore';

import type { ConversationWithUser } from '../../chat/types';
import type {
  GroupsStackParamList,
  MainTabParamList,
} from '@/shared/navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type GroupsScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<GroupsStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

/**
 * Format timestamp for group list
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
 * Groups screen component
 */
export function GroupsScreen() {
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const theme = useTheme();

  // Store hooks - filter for groups only
  const allConversations = useConversations();
  const groupConversations = allConversations.filter(conv => conv.isGroup);
  const isLoading = useConversationsLoading();
  const error = useConversationsError();
  const isRefreshing = useIsRefreshing();

  // Store actions
  const {
    loadConversations,
    refreshConversations,
    // silentRefreshConversations,
    clearError,
    leaveGroup,
  } = useChatStore();

  /**
   * Load conversations on component mount
   */
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  /**
   * Refresh conversations when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 GroupsScreen: Screen focused, refreshing conversations');
      // Force refresh conversations to ensure we see new groups
      void refreshConversations();
    }, [refreshConversations])
  );

  /**
   * Handle refresh pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    void refreshConversations();
  }, [refreshConversations]);

  /**
   * Handle group press - navigate to group info screen
   */
  const handleGroupPress = useCallback(
    (conversation: ConversationWithUser) => {
      console.log('Group info pressed:', conversation.id);

      // Navigate to GroupInfo screen
      navigation.navigate('GroupInfo', {
        groupId: conversation.groupId || conversation.id,
      });
    },
    [navigation]
  );

  /**
   * Handle chat bubble press - navigate to chat screen
   */
  const handleChatPress = useCallback(
    (
      conversation: ConversationWithUser,
      event: { stopPropagation: () => void }
    ) => {
      // Stop event propagation to prevent group press
      event.stopPropagation();
      console.log('Chat bubble pressed:', conversation.id);

      // Navigate to ChatScreen in the Chats tab (nested navigator navigation)
      navigation.navigate('Chats', {
        screen: 'ChatScreen',
        params: {
          conversationId: conversation.id,
          isGroup: true,
          ...(conversation.title && { groupTitle: conversation.title }),
          ...(conversation.groupId && { groupId: conversation.groupId }),
        },
      });
    },
    [navigation]
  );

  /**
   * Handle create group button press
   */
  const handleCreateGroup = useCallback(() => {
    navigation.navigate('CreateGroup');
  }, [navigation]);

  /**
   * Handle leave group with confirmation
   */
  const handleLeaveGroup = useCallback(
    (conversation: ConversationWithUser) => {
      if (!conversation.groupId) return;

      Alert.alert(
        'Leave Group',
        `Are you sure you want to leave "${conversation.title || 'this group'}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                try {
                  if (conversation.groupId) {
                    await leaveGroup(conversation.groupId);
                    // Navigation will be handled by the store refresh
                  }
                } catch (error) {
                  Alert.alert(
                    'Error',
                    'Failed to leave group. Please try again.'
                  );
                }
              })();
            },
          },
        ]
      );
    },
    [leaveGroup]
  );

  /**
   * Render group item
   */
  const renderGroupItem = useCallback(
    ({ item: conversation }: { item: ConversationWithUser }) => {
      const hasUnread = conversation.unreadCount > 0;
      const lastMessage = conversation.lastMessage;

      return (
        <TouchableOpacity
          testID={`group-item-${conversation.id}`}
          style={[
            styles.conversationItem,
            { backgroundColor: theme.colors.background },
          ]}
          onPress={() => handleGroupPress(conversation)}
          onLongPress={() => handleLeaveGroup(conversation)}
          activeOpacity={0.7}
        >
          {/* Group Avatar */}
          <View style={styles.avatarContainer}>
            {conversation.avatarUrl ? (
              <Image
                source={{ uri: conversation.avatarUrl }}
                style={styles.groupAvatar}
                testID={`group-avatar-${conversation.id}`}
              />
            ) : (
              <View
                testID={`group-default-avatar-${conversation.id}`}
                style={[
                  styles.defaultGroupAvatar,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons
                  name='people'
                  size={24}
                  color={theme.colors.background}
                />
              </View>
            )}
            {hasUnread && (
              <View
                testID={`group-unread-badge-${conversation.id}`}
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
                  {conversation.unreadCount > 99
                    ? '99+'
                    : conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Group Info */}
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Text
                testID={`group-title-${conversation.id}`}
                style={[
                  styles.conversationName,
                  { color: theme.colors.text },
                  hasUnread && styles.unreadText,
                ]}
                numberOfLines={1}
              >
                {conversation.title || 'Unnamed Group'}
              </Text>
              {lastMessage && (
                <Text
                  testID={`group-timestamp-${conversation.id}`}
                  style={[
                    styles.timestamp,
                    { color: theme.colors.textSecondary },
                    hasUnread && [
                      styles.unreadText,
                      { color: theme.colors.primary },
                    ],
                  ]}
                >
                  {formatTimestamp(lastMessage.createdAt)}
                </Text>
              )}
            </View>

            {/* Last Message */}
            {lastMessage && (
              <Text
                testID={`group-last-message-${conversation.id}`}
                style={[
                  styles.lastMessage,
                  { color: theme.colors.textSecondary },
                  hasUnread && [
                    styles.unreadText,
                    { color: theme.colors.textPrimary },
                  ],
                ]}
                numberOfLines={1}
              >
                {lastMessage.type === 'text'
                  ? lastMessage.text
                  : lastMessage.type === 'snap'
                    ? `📸 ${lastMessage.mediaType === 'photo' ? 'Photo' : 'Video'}`
                    : 'Message'}
              </Text>
            )}
          </View>

          {/* Chat Bubble Button */}
          <TouchableOpacity
            testID={`group-chat-button-${conversation.id}`}
            style={[
              styles.chatBubble,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={event => handleChatPress(conversation, event)}
            activeOpacity={0.7}
          >
            <Ionicons
              name='chatbubble'
              size={20}
              color={theme.colors.background}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [theme, handleGroupPress, handleChatPress, handleLeaveGroup]
  );

  /**
   * Render empty state
   */
  const renderEmptyState = useCallback(
    () => (
      <View
        testID='groups-empty-state'
        style={[
          styles.emptyState,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons
          name='people-outline'
          size={64}
          color={theme.colors.textSecondary}
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No Groups Yet
        </Text>
        <Text
          style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
        >
          Create a group to chat with multiple friends at once
        </Text>
        <TouchableOpacity
          testID='create-first-group-button'
          style={[
            styles.createButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleCreateGroup}
        >
          <Text
            style={[
              styles.createButtonText,
              { color: theme.colors.background },
            ]}
          >
            Create Your First Group
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [theme, handleCreateGroup]
  );

  /**
   * Render error state
   */
  const renderErrorState = useCallback(
    () => (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View testID='groups-error-state' style={styles.errorState}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Error: {error}
          </Text>
          <TouchableOpacity
            testID='retry-button'
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {
              clearError();
              void loadConversations();
            }}
          >
            <Text
              style={[styles.retryText, { color: theme.colors.background }]}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
          Groups
        </Text>
        <ProfileAvatar size='medium' />
      </View>

      {/* Create Group Button */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          testID='create-group-button'
          style={[
            styles.createGroupButtonFull,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleCreateGroup}
        >
          <Ionicons name='add' size={20} color={theme.colors.background} />
          <Text
            style={[
              styles.createGroupButtonText,
              { color: theme.colors.background },
            ]}
          >
            Create New Group
          </Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          testID='groups-list'
          data={groupConversations}
          keyExtractor={item => item.id}
          renderItem={renderGroupItem}
          ListEmptyComponent={!isLoading ? renderEmptyState : null}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={theme.colors.primary ? [theme.colors.primary] : undefined}
              tintColor={theme.colors.primary}
            />
          }
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  headerActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createGroupButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createGroupButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  createGroupButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultGroupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  createButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
