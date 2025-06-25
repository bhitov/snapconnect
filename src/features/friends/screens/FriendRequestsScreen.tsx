/**
 * @file FriendRequestsScreen.tsx
 * @description Screen for managing friend requests.
 * Shows sent and received friend requests with accept/reject functionality.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/base/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import {
  useFriendsStore,
  useSentRequests,
  useReceivedRequests,
  useRequestsLoading,
  useRequestsError,
  useIsRefreshing,
} from '../store/friendsStore';
import { FriendRequest } from '../types';

interface FriendRequestsScreenProps {
  navigation: any;
}

type TabType = 'received' | 'sent';

/**
 * FriendRequests screen component
 */
export function FriendRequestsScreen({
  navigation,
}: FriendRequestsScreenProps) {
  const theme = useTheme();

  // Store state
  const sentRequests = useSentRequests();
  const receivedRequests = useReceivedRequests();
  const requestsLoading = useRequestsLoading();
  const requestsError = useRequestsError();
  const isRefreshing = useIsRefreshing();

  // Store actions
  const {
    loadFriendRequests,
    refreshFriends,
    respondToFriendRequest,
    cancelFriendRequest,
    clearError,
  } = useFriendsStore();

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null
  );

  /**
   * Load friend requests on mount
   */
  useEffect(() => {
    loadFriendRequests();
  }, [loadFriendRequests]);

  /**
   * Handle accepting friend request
   */
  const handleAcceptRequest = async (request: FriendRequest) => {
    console.log(
      '✅ FriendRequestsScreen: Accepting friend request from:',
      request.senderUsername
    );

    setProcessingRequest(request.id);

    try {
      await respondToFriendRequest({
        requestId: request.id,
        action: 'accept',
      });

      Alert.alert(
        'Friend Request Accepted',
        `You are now friends with ${request.senderDisplayName}!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error(
        '❌ FriendRequestsScreen: Failed to accept friend request:',
        error
      );

      Alert.alert(
        'Failed to Accept Request',
        error.message || 'Unable to accept friend request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  /**
   * Handle rejecting friend request
   */
  const handleRejectRequest = async (request: FriendRequest) => {
    console.log(
      '❌ FriendRequestsScreen: Rejecting friend request from:',
      request.senderUsername
    );

    Alert.alert(
      'Reject Friend Request',
      `Are you sure you want to reject the friend request from ${request.senderDisplayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequest(request.id);

            try {
              await respondToFriendRequest({
                requestId: request.id,
                action: 'reject',
              });

              Alert.alert(
                'Friend Request Rejected',
                `Friend request from ${request.senderDisplayName} has been rejected.`,
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error(
                '❌ FriendRequestsScreen: Failed to reject friend request:',
                error
              );

              Alert.alert(
                'Failed to Reject Request',
                error.message ||
                  'Unable to reject friend request. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setProcessingRequest(null);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle canceling sent friend request
   */
  const handleCancelRequest = async (request: FriendRequest) => {
    console.log(
      '🗑️ FriendRequestsScreen: Canceling friend request to:',
      request.receiverUsername
    );

    Alert.alert(
      'Cancel Friend Request',
      `Are you sure you want to cancel the friend request to ${request.receiverDisplayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequest(request.id);

            try {
              await cancelFriendRequest(request.id);

              Alert.alert(
                'Friend Request Canceled',
                `Friend request to ${request.receiverDisplayName} has been canceled.`,
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error(
                '❌ FriendRequestsScreen: Failed to cancel friend request:',
                error
              );

              Alert.alert(
                'Failed to Cancel Request',
                error.message ||
                  'Unable to cancel friend request. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setProcessingRequest(null);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle viewing user profile
   */
  const handleViewProfile = (userId: string) => {
    console.log('👤 FriendRequestsScreen: Viewing profile for user:', userId);
    navigation.navigate('Profile', { userId });
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  /**
   * Render received friend request item
   */
  const renderReceivedRequest = ({ item }: { item: FriendRequest }) => {
    const isLoading = processingRequest === item.id;

    return (
      <TouchableOpacity
        style={[styles.requestItem, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleViewProfile(item.senderId)}
        activeOpacity={0.7}
      >
        <View style={styles.requestContent}>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {item.senderPhotoURL ? (
              <Image
                source={{ uri: resolveMediaUrl(item.senderPhotoURL) }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons
                name='person'
                size={24}
                color={theme.colors.textSecondary}
              />
            )}
          </View>

          {/* Request info */}
          <View style={styles.requestInfo}>
            <Text style={[styles.displayName, { color: theme.colors.text }]}>
              {item.senderDisplayName}
            </Text>
            <Text
              style={[styles.username, { color: theme.colors.textSecondary }]}
            >
              @{item.senderUsername}
            </Text>
            <Text
              style={[styles.timeAgo, { color: theme.colors.textSecondary }]}
            >
              {formatTimeAgo(item.createdAt)}
            </Text>
            {item.message && (
              <Text
                style={[styles.message, { color: theme.colors.textSecondary }]}
              >
                "{item.message}"
              </Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <Button
              variant='primary'
              size='small'
              disabled={isLoading}
              loading={isLoading}
              onPress={() => handleAcceptRequest(item)}
            >
              Accept
            </Button>
            <Button
              variant='outline'
              size='small'
              disabled={isLoading}
              onPress={() => handleRejectRequest(item)}
            >
              Reject
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render sent friend request item
   */
  const renderSentRequest = ({ item }: { item: FriendRequest }) => {
    const isLoading = processingRequest === item.id;

    return (
      <TouchableOpacity
        style={[styles.requestItem, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleViewProfile(item.receiverId)}
        activeOpacity={0.7}
      >
        <View style={styles.requestContent}>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {item.receiverPhotoURL ? (
              <Image
                source={{ uri: resolveMediaUrl(item.receiverPhotoURL) }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons
                name='person'
                size={24}
                color={theme.colors.textSecondary}
              />
            )}
          </View>

          {/* Request info */}
          <View style={styles.requestInfo}>
            <Text style={[styles.displayName, { color: theme.colors.text }]}>
              {item.receiverDisplayName}
            </Text>
            <Text
              style={[styles.username, { color: theme.colors.textSecondary }]}
            >
              @{item.receiverUsername}
            </Text>
            <Text
              style={[styles.timeAgo, { color: theme.colors.textSecondary }]}
            >
              Sent {formatTimeAgo(item.createdAt)}
            </Text>
            {item.message && (
              <Text
                style={[styles.message, { color: theme.colors.textSecondary }]}
              >
                "{item.message}"
              </Text>
            )}
          </View>

          {/* Cancel button */}
          <View style={styles.singleActionContainer}>
            <Button
              variant='outline'
              size='small'
              disabled={isLoading}
              loading={isLoading}
              onPress={() => handleCancelRequest(item)}
            >
              Cancel
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    const isReceived = activeTab === 'received';

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={isReceived ? 'mail-open' : 'mail'}
          size={48}
          color={theme.colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {isReceived ? 'No friend requests' : 'No sent requests'}
        </Text>
        <Text
          style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}
        >
          {isReceived
            ? 'When someone sends you a friend request, it will appear here'
            : 'Friend requests you send will appear here'}
        </Text>
      </View>
    );
  };

  const currentRequests =
    activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Friend Requests
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFriends')}
        >
          <Ionicons name='person-add' size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View
        style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'received' && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => setActiveTab('received')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'received'
                    ? theme.colors.white
                    : theme.colors.textSecondary,
              },
            ]}
          >
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'sent' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('sent')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'sent'
                    ? theme.colors.white
                    : theme.colors.textSecondary,
              },
            ]}
          >
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests list */}
      <FlatList
        data={currentRequests}
        renderItem={
          activeTab === 'received' ? renderReceivedRequest : renderSentRequest
        }
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              refreshFriends();
              loadFriendRequests();
            }}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* Error display */}
      {requestsError && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme.colors.error },
          ]}
        >
          <Text style={[styles.errorText, { color: theme.colors.white }]}>
            {requestsError}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  requestItem: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  requestContent: {
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
  requestInfo: {
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
  timeAgo: {
    fontSize: 12,
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  singleActionContainer: {
    minWidth: 80,
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
