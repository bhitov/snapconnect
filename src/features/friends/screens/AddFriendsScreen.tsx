/**
 * @file AddFriendsScreen.tsx
 * @description Screen for searching and adding friends.
 * Allows users to search by username and send friend requests.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/base/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import {
  useFriendsStore,
  useSearchResults,
  useSearchLoading,
  useSearchError,
  useSearchQuery,
} from '../store/friendsStore';
import { FriendSearchResult, FriendshipStatus } from '../types';

interface AddFriendsScreenProps {
  navigation: any;
}

/**
 * AddFriends screen component
 */
export function AddFriendsScreen({ navigation }: AddFriendsScreenProps) {
  const theme = useTheme();

  // Store state
  const searchResults = useSearchResults();
  const searchLoading = useSearchLoading();
  const searchError = useSearchError();
  const searchQuery = useSearchQuery();

  // Store actions
  const { searchUsers, clearSearch, sendFriendRequest, clearError } =
    useFriendsStore();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  /**
   * Handle search input change with debouncing
   */
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchInput(text);

      // Debounce search
      const timeoutId = setTimeout(() => {
        if (text.trim()) {
          searchUsers(text.trim());
        } else {
          clearSearch();
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [searchUsers, clearSearch]
  );

  /**
   * Handle sending friend request
   */
  const handleSendFriendRequest = async (userId: string, username: string) => {
    console.log('📤 AddFriendsScreen: Sending friend request to:', username);

    setSendingRequest(userId);

    try {
      await sendFriendRequest({ receiverId: userId });

      Alert.alert(
        'Friend Request Sent',
        `Friend request sent to ${username}!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error(
        '❌ AddFriendsScreen: Failed to send friend request:',
        error
      );

      Alert.alert(
        'Failed to Send Request',
        error.message || 'Unable to send friend request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSendingRequest(null);
    }
  };

  /**
   * Handle viewing user profile
   */
  const handleViewProfile = (userId: string) => {
    console.log('👤 AddFriendsScreen: Viewing profile for user:', userId);
    navigation.navigate('Profile', { userId });
  };

  /**
   * Get button text based on friendship status
   */
  const getActionButtonText = (status: FriendshipStatus) => {
    switch (status) {
      case 'friends':
        return 'Friends';
      case 'request_sent':
        return 'Request Sent';
      case 'request_received':
        return 'Accept Request';
      case 'blocked':
        return 'Blocked';
      default:
        return 'Add Friend';
    }
  };

  /**
   * Get button variant based on friendship status
   */
  const getActionButtonVariant = (status: FriendshipStatus) => {
    switch (status) {
      case 'friends':
        return 'outline' as const;
      case 'request_sent':
        return 'outline' as const;
      case 'request_received':
        return 'primary' as const;
      case 'blocked':
        return 'outline' as const;
      default:
        return 'primary' as const;
    }
  };

  /**
   * Check if button should be disabled
   */
  const isActionButtonDisabled = (status: FriendshipStatus) => {
    return (
      status === 'friends' || status === 'request_sent' || status === 'blocked'
    );
  };

  /**
   * Render search result item
   */
  const renderSearchResult = ({ item }: { item: FriendSearchResult }) => {
    const isLoading = sendingRequest === item.uid;

    return (
      <TouchableOpacity
        style={[
          styles.resultItem,
          { backgroundColor: theme.colors.background },
        ]}
        onPress={() => handleViewProfile(item.uid)}
        activeOpacity={0.7}
      >
        <View style={styles.resultContent}>
          {/* Avatar */}
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.surface }]}
          >
            {item.photoURL ? (
              <Image
                source={{ uri: resolveMediaUrl(item.photoURL) }}
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

          {/* User info */}
          <View style={styles.userInfo}>
            <Text style={[styles.displayName, { color: theme.colors.text }]}>
              {item.displayName}
            </Text>
            <Text
              style={[styles.username, { color: theme.colors.textSecondary }]}
            >
              @{item.username}
            </Text>
            {item.mutualFriends && item.mutualFriends > 0 && (
              <Text
                style={[
                  styles.mutualFriends,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {item.mutualFriends} mutual friend
                {item.mutualFriends !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Action button */}
          <View style={styles.actionContainer}>
            <Button
              variant={getActionButtonVariant(item.friendshipStatus)}
              size='small'
              disabled={
                isActionButtonDisabled(item.friendshipStatus) || isLoading
              }
              loading={isLoading}
              onPress={() => {
                if (item.friendshipStatus === 'none') {
                  handleSendFriendRequest(item.uid, item.username);
                } else if (item.friendshipStatus === 'request_received') {
                  // TODO: Handle accepting friend request
                  console.log('Accept friend request for:', item.username);
                }
              }}
              testID={`${item.friendshipStatus === 'none' ? 'add-friend' : item.friendshipStatus === 'request_received' ? 'accept-request' : 'friend-action'}-button-${item.username}`}
            >
              {getActionButtonText(item.friendshipStatus)}
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
    if (searchLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Searching users...
          </Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name='alert-circle' size={48} color={theme.colors.error} />
          <Text style={[styles.emptyText, { color: theme.colors.error }]}>
            {searchError}
          </Text>
          <Button
            variant='outline'
            size='small'
            onPress={() => {
              clearError();
              if (searchQuery) {
                searchUsers(searchQuery);
              }
            }}
          >
            Try Again
          </Button>
        </View>
      );
    }

    if (searchQuery && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name='search'
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No users found for "{searchQuery}"
          </Text>
          <Text
            style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}
          >
            Try searching with a different username
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name='people' size={48} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Search for friends
        </Text>
        <Text
          style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}
        >
          Enter a username to find and add friends
        </Text>
      </View>
    );
  };

  /**
   * Clear search when leaving screen
   */
  useEffect(() => {
    return () => {
      clearSearch();
    };
  }, [clearSearch]);

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
          Add Friends
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Search input */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Ionicons name='search' size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder='Search by username...'
          placeholderTextColor={theme.colors.textSecondary}
          value={searchInput}
          onChangeText={handleSearchChange}
          autoCapitalize='none'
          autoCorrect={false}
          returnKeyType='search'
        />
        {searchInput.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchInput('');
              clearSearch();
            }}
          >
            <Ionicons
              name='close-circle'
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Search results */}
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={item => item.uid}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              if (searchQuery) {
                searchUsers(searchQuery);
              }
            }}
            tintColor={theme.colors.primary}
          />
        }
      />
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
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  resultItem: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  resultContent: {
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
  userInfo: {
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
  mutualFriends: {
    fontSize: 12,
  },
  actionContainer: {
    minWidth: 100,
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
});
