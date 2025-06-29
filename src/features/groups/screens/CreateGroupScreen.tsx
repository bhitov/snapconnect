/**
 * @file CreateGroupScreen.tsx
 * @description Screen for creating a new group chat.
 * Allows users to select friends, set group name, and create the group.
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import {
  useChatStore,
  useGroupCreationState,
  useIsCreatingGroup,
} from '../../chat/store/chatStore';
import {
  useFriendsStore,
  useFriendsList,
  useFriendsLoading,
} from '../../friends/store/friendsStore';

import type { FriendProfile } from '../../friends/types';
import type {
  GroupsStackParamList,
  MainTabParamList,
} from '@/shared/navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type CreateGroupScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<GroupsStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

/**
 * Create group screen component
 */
export function CreateGroupScreen() {
  const navigation = useNavigation<CreateGroupScreenNavigationProp>();
  const theme = useTheme();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');

  // Store hooks
  const friends = useFriendsList();
  const isLoadingFriends = useFriendsLoading();
  const groupCreationState = useGroupCreationState();
  const isCreatingGroup = useIsCreatingGroup();

  // Store actions
  const { loadFriends } = useFriendsStore();
  const {
    createGroup,
    setGroupTitle,
    addGroupMember,
    removeGroupMember,
    resetGroupCreation,
  } = useChatStore();

  /**
   * Load friends on mount
   */
  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  /**
   * Reset group creation state when screen focuses
   */
  useFocusEffect(
    useCallback(() => {
      resetGroupCreation();
    }, [resetGroupCreation])
  );

  /**
   * Filter friends based on search query
   */
  const filteredFriends = friends.filter(
    friend =>
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Handle friend selection toggle
   */
  const handleFriendToggle = useCallback(
    (friend: FriendProfile) => {
      const isSelected = groupCreationState.selectedMembers.includes(
        friend.uid
      );

      if (isSelected) {
        removeGroupMember(friend.uid);
      } else {
        addGroupMember(friend.uid);
      }
    },
    [groupCreationState.selectedMembers, addGroupMember, removeGroupMember]
  );

  /**
   * Handle create group
   */
  const handleCreateGroup = useCallback(async () => {
    if (!groupCreationState.title.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (groupCreationState.selectedMembers.length < 2) {
      Alert.alert(
        'Error',
        'Please select at least 2 friends to create a group'
      );
      return;
    }

    try {
      await createGroup(
        groupCreationState.title.trim(),
        groupCreationState.selectedMembers
      );

      // Go back to the Groups screen to show the new group
      navigation.goBack();
    } catch (createError) {
      console.error('Failed to create group:', createError);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  }, [groupCreationState, createGroup, navigation]);

  /**
   * Handle back button
   */
  const handleBack = useCallback(() => {
    resetGroupCreation();
    navigation.goBack();
  }, [navigation, resetGroupCreation]);

  /**
   * Render friend item
   */
  const renderFriendItem = useCallback(
    ({ item: friend }: { item: FriendProfile }) => {
      const isSelected = groupCreationState.selectedMembers.includes(
        friend.uid
      );

      return (
        <TouchableOpacity
          testID={`friend-item-${friend.uid}`}
          style={[
            styles.friendItem,
            { backgroundColor: theme.colors.background },
            isSelected && {
              backgroundColor: `${theme.colors.primary}20`, // 20% opacity
            },
          ]}
          onPress={() => handleFriendToggle(friend)}
          activeOpacity={0.7}
        >
          {/* Friend Avatar */}
          <View style={styles.avatarContainer}>
            {friend.photoURL ? (
              <Image
                source={{ uri: resolveMediaUrl(friend.photoURL) }}
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.surface },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: theme.colors.background },
                  ]}
                >
                  {friend.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Friend Info */}
          <View style={styles.friendInfo}>
            <Text
              testID={`friend-name-${friend.uid}`}
              style={[styles.friendName, { color: theme.colors.textPrimary }]}
              numberOfLines={1}
            >
              {friend.displayName}
            </Text>
            <Text
              testID={`friend-username-${friend.uid}`}
              style={[
                styles.friendUsername,
                { color: theme.colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              @{friend.username}
            </Text>
          </View>

          {/* Selection Indicator */}
          <View
            testID={`friend-selection-${friend.uid}`}
            style={[
              styles.selectionIndicator,
              { borderColor: theme.colors.primary },
              isSelected && { backgroundColor: theme.colors.primary },
            ]}
          >
            {isSelected && (
              <Ionicons
                name='checkmark'
                size={16}
                color={theme.colors.background}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [theme, groupCreationState.selectedMembers, handleFriendToggle]
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View testID='create-group-empty-state' style={styles.emptyState}>
      <Ionicons
        name='people-outline'
        size={48}
        color={theme.colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {searchQuery ? 'No friends match your search' : 'No friends found'}
      </Text>
    </View>
  );

  const canCreateGroup =
    groupCreationState.title.trim().length > 0 &&
    groupCreationState.selectedMembers.length >= 2;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: theme.colors.background }]}
      >
        <TouchableOpacity
          testID='back-button'
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons
            name='arrow-back'
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          New Group
        </Text>
        <TouchableOpacity
          testID='create-group-done-button'
          style={[
            styles.doneButton,
            {
              backgroundColor: canCreateGroup
                ? theme.colors.primary
                : theme.colors.disabled,
            },
          ]}
          onPress={() => void handleCreateGroup()}
          disabled={!canCreateGroup || isCreatingGroup}
        >
          {isCreatingGroup ? (
            <ActivityIndicator size='small' color={theme.colors.background} />
          ) : (
            <Text
              style={[
                styles.doneButtonText,
                { color: theme.colors.background },
              ]}
            >
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Group Name Input */}
      <View
        style={[
          styles.inputSection,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
          Group Name
        </Text>
        <TextInput
          testID='group-name-input'
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder='Enter group name...'
          placeholderTextColor={theme.colors.textSecondary}
          value={groupCreationState.title}
          onChangeText={setGroupTitle}
          maxLength={50}
          autoFocus
        />
      </View>

      {/* Selected Members Count */}
      {groupCreationState.selectedMembers.length > 0 && (
        <View
          style={[
            styles.selectedSection,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            testID='selected-count'
            style={[styles.selectedText, { color: theme.colors.textPrimary }]}
          >
            {groupCreationState.selectedMembers.length} member
            {groupCreationState.selectedMembers.length === 1 ? '' : 's'}{' '}
            selected
          </Text>
        </View>
      )}

      {/* Search Bar */}
      <View
        style={[
          styles.searchSection,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name='search'
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            testID='friend-search-input'
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder='Search friends...'
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Friends List */}
      <FlatList
        testID='friends-list'
        data={filteredFriends}
        keyExtractor={item => item.uid}
        renderItem={renderFriendItem}
        ListEmptyComponent={!isLoadingFriends ? renderEmptyState : null}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* Loading Indicator */}
      {isLoadingFriends && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
        </View>
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  selectedSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
