/**
 * @file FriendsListScreen.tsx
 * @description Screen for displaying the user's friends list.
 * Shows all friends with options to view profiles and manage friendships.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChatStore } from '@/features/chat/store/chatStore';
import { Button } from '@/shared/components/base/Button';
import { ProfileAvatar } from '@/shared/components/base/ProfileAvatar';
import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import {
  useFriendsStore,
  useFriendsList,
  useFriendsLoading,
  useFriendsError,
  useIsRefreshing,
  usePendingRequestsCount,
} from '../store/friendsStore';
import { FriendProfile } from '../types';

import type {
  FriendsStackParamList,
  MainTabParamList,
} from '@/shared/navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

interface FriendsListScreenProps {
  navigation: CompositeNavigationProp<
    StackNavigationProp<FriendsStackParamList, 'FriendsList'>,
    BottomTabNavigationProp<MainTabParamList>
  >;
}

/**
 * FriendsList screen component
 */
export function FriendsListScreen({ navigation }: FriendsListScreenProps) {
  const theme = useTheme();

  // Store state
  const friends = useFriendsList();
  const friendsLoading = useFriendsLoading();
  const friendsError = useFriendsError();
  const isRefreshing = useIsRefreshing();
  const pendingRequestsCount = usePendingRequestsCount();

  // Store actions
  const { loadFriends, refreshFriends, clearError } = useFriendsStore();

  /**
   * Load friends and friend requests on mount
   */
  useEffect(() => {
    loadFriends();
    // Also load friend requests to ensure badge count is accurate
    const { loadFriendRequests } = useFriendsStore.getState();
    loadFriendRequests();
  }, [loadFriends]);

  /**
   * Handle viewing friend profile
   */
  const handleViewProfile = (friend: FriendProfile) => {
    console.log(
      '👤 FriendsListScreen: Viewing profile for friend:',
      friend.username
    );
    navigation.navigate('Profile', { userId: friend.uid });
  };

  /**
   * Handle starting chat with friend (snap)
   */
  const handleStartChat = (friend: FriendProfile) => {
    console.log(
      '📸 FriendsListScreen: Starting snap with friend:',
      friend.username
    );
    // Navigate to Camera tab to send a snap to this friend
    navigation.navigate('Camera');
    // TODO: Pre-select this friend as recipient when sending snap
  };

  /**
   * Handle opening text chat with a friend
   */
  const handleOpenChat = async (friend: FriendProfile) => {
    console.log(
      '💬 FriendsListScreen: Opening chat with friend:',
      friend.username
    );

    try {
      // Create or get conversation
      const { createConversation } = useChatStore.getState();
      const conversationId = await createConversation(friend.uid);

      // Navigate to chat screen
      navigation.navigate('Chats', {
        screen: 'ChatScreen',
        params: {
          conversationId,
          otherUser: {
            uid: friend.uid,
            username: friend.username,
            displayName: friend.displayName,
            ...(friend.photoURL && { photoURL: friend.photoURL }),
          },
        },
      });
    } catch (error) {
      console.error('❌ FriendsListScreen: Failed to open chat:', error);
      Alert.alert('Error', 'Failed to open chat. Please try again.');
    }
  };

  /**
   * Format time since friends
   */
  const formatFriendsSince = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `Friends for ${years} year${years !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `Friends for ${months} month${months !== 1 ? 's' : ''}`;
    } else if (days > 0) {
      return `Friends for ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      return 'Just became friends';
    }
  };

  /**
   * Render friend item
   */
  const renderFriend = ({ item }: { item: FriendProfile }) => {
    return (
      <TouchableOpacity
        style={[styles.friendItem, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleViewProfile(item)}
        activeOpacity={0.7}
      >
        <View style={styles.friendContent}>
          {/* Avatar */}
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            {item.photoURL ? (
              <Image
                source={{ uri: resolveMediaUrl(item.photoURL) }}
                style={styles.avatarImage}
              />
            ) : (
              <Text
                style={[styles.avatarText, { color: theme.colors.background }]}
              >
                {item.displayName?.charAt(0)?.toUpperCase() ||
                  item.username?.charAt(0)?.toUpperCase() ||
                  '?'}
              </Text>
            )}
          </View>

          {/* Friend info */}
          <View style={styles.friendInfo}>
            <Text style={[styles.displayName, { color: theme.colors.text }]}>
              {item.displayName}
            </Text>
            <Text
              style={[styles.username, { color: theme.colors.textSecondary }]}
            >
              @{item.username}
            </Text>
            <Text
              style={[
                styles.friendsSince,
                { color: theme.colors.textSecondary },
              ]}
            >
              {formatFriendsSince(item.friendsSince)}
            </Text>
            {item.isOnline && (
              <View style={styles.onlineIndicator}>
                <View
                  style={[
                    styles.onlineDot,
                    { backgroundColor: theme.colors.success },
                  ]}
                />
                <Text
                  style={[styles.onlineText, { color: theme.colors.success }]}
                >
                  Online
                </Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            {/* Chat button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => handleOpenChat(item)}
              testID={`chat-button-${item.username}`}
            >
              <Ionicons name='chatbubble' size={18} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Snap button */}
            <TouchableOpacity
              style={[
                styles.snapButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => handleStartChat(item)}
            >
              <Ionicons name='camera' size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name='people' size={48} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No friends yet
        </Text>
        <Text
          style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}
        >
          Add friends to start sending snaps
        </Text>
        <Button
          variant='primary'
          onPress={() => navigation.navigate('AddFriends')}
        >
          Add Friends
        </Button>
      </View>
    );
  };

  /**
   * Render header with friend requests indicator
   */
  const renderHeader = () => {
    return (
      <View style={styles.headerActions}>
        <Button
          variant='outline'
          onPress={() => navigation.navigate('AddFriends')}
        >
          Add Friends
        </Button>

        <TouchableOpacity
          style={[
            styles.requestsButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => navigation.navigate('FriendRequests')}
          testID='requests-button'
        >
          <Ionicons name='mail' size={20} color={theme.colors.text} />
          <Text style={[styles.requestsText, { color: theme.colors.text }]}>
            Requests
          </Text>
          {pendingRequestsCount > 0 && (
            <View
              style={[styles.badge, { backgroundColor: theme.colors.error }]}
            >
              <Text style={[styles.badgeText, { color: theme.colors.white }]}>
                {pendingRequestsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Friends ({friends.length})
        </Text>
        <ProfileAvatar size='medium' />
      </View>

      {/* Header actions */}
      {renderHeader()}

      {/* Friends list */}
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={item => item.uid}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFriends}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* Error display */}
      {friendsError && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme.colors.error },
          ]}
        >
          <Text style={[styles.errorText, { color: theme.colors.white }]}>
            {friendsError}
          </Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name='close' size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    position: 'relative',
  },
  requestsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  friendItem: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  friendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  friendInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    marginBottom: 2,
  },
  friendsSince: {
    fontSize: 12,
    marginBottom: 4,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  snapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
});
