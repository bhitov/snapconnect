/**
 * @file ManageGroupMembersScreen.tsx
 * @description Screen for managing group members - add/remove functionality
 * Admin can add/remove any member, regular members can only leave
 */

import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Switch,
  Image,
  Modal,
  Alert,
} from 'react-native';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useFriendsStore } from '@/features/friends/store/friendsStore';
import { Screen } from '@/shared/components/layout/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import type { FriendProfile } from '@/features/friends/types';
import type { GroupsStackParamList } from '@/shared/navigation/types';

type ManageGroupMembersScreenProps = StackScreenProps<
  GroupsStackParamList,
  'ManageGroupMembers'
>;

interface GroupMember {
  uid: string;
  displayName: string;
  username: string;
  photoURL?: string;
  role: 'admin' | 'member';
  joinedAt: number;
  addedBy: string;
}

/**
 * Simple UserAvatar component for displaying other users' avatars
 */
const UserAvatar = ({
  photoURL,
  displayName,
  size = 40,
}: {
  photoURL?: string | undefined;
  displayName: string;
  size?: number;
}) => {
  const theme = useTheme();

  const avatarStyles = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  const textStyles = {
    color: theme.colors.onPrimary,
    fontSize: size * 0.4,
    fontWeight: 600 as const,
  };

  if (photoURL) {
    return (
      <Image source={{ uri: resolveMediaUrl(photoURL) }} style={avatarStyles} />
    );
  }

  return (
    <View style={avatarStyles}>
      <Text style={textStyles}>{displayName.charAt(0).toUpperCase()}</Text>
    </View>
  );
};

/**
 * Confirmation Modal Component
 */
const ConfirmationModal = ({
  visible,
  user,
  isCurrentUser,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  user: GroupMember | null;
  isCurrentUser: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const theme = useTheme();

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600' as const,
              color: theme.colors.onSurface,
              marginBottom: 12,
              textAlign: 'center' as const,
            }}
          >
            {isCurrentUser ? 'Leave Group' : 'Remove Member'}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: theme.colors.onSurface,
              marginBottom: 24,
              textAlign: 'center' as const,
            }}
          >
            {isCurrentUser
              ? 'Are you sure you want to leave this group?'
              : `Remove ${user.displayName} from the group?`}
          </Text>

          <View
            style={{
              flexDirection: 'row' as const,
              justifyContent: 'space-between' as const,
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
              onPress={onCancel}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: '600' as const,
                  textAlign: 'center' as const,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.error,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
              onPress={onConfirm}
            >
              <Text
                style={{
                  color: theme.colors.onError,
                  fontWeight: '600' as const,
                  textAlign: 'center' as const,
                }}
              >
                {isCurrentUser ? 'Leave' : 'Remove'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export function ManageGroupMembersScreen({
  route,
  navigation,
}: ManageGroupMembersScreenProps) {
  const { groupId } = route.params;
  const theme = useTheme();
  const { user: currentUser } = useAuthStore();
  const { addUsersToGroup, removeUserFromGroup } = useChatStore();
  const { friends, loadFriends } = useFriendsStore();

  // State
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member'>(
    'member'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState<GroupMember | null>(null);

  /**
   * Load group data from Firebase
   */
  const loadGroupData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { chatService } = await import(
        '@/features/chat/services/chatService'
      );

      const groupData = await chatService.getGroupData(groupId);

      if (!groupData || !groupData.members) {
        console.error('Group data not found or missing members');
        return;
      }

      // Convert group members to our format and fetch user data
      const memberPromises = Object.entries(groupData.members).map(
        async ([userId, memberInfo]: [
          string,
          { role: 'admin' | 'member'; joinedAt: number; addedBy: string },
        ]) => {
          try {
            const userData = await chatService.getUserData(userId);

            return {
              uid: userId,
              displayName:
                userData?.displayName || userData?.username || 'Unknown User',
              username: userData?.username || 'unknown',
              photoURL: userData?.photoURL,
              role: memberInfo.role,
              joinedAt: memberInfo.joinedAt,
              addedBy: memberInfo.addedBy,
            } as GroupMember;
          } catch (error) {
            console.error('Failed to load user data for:', userId, error);
            return {
              uid: userId,
              displayName: userId === currentUser?.uid ? 'You' : 'Unknown User',
              username: 'unknown',
              role: memberInfo.role,
              joinedAt: memberInfo.joinedAt,
              addedBy: memberInfo.addedBy,
            } as GroupMember;
          }
        }
      );

      const members = await Promise.all(memberPromises);

      // Set current user role
      const currentUserMember = members.find(
        member => member.uid === currentUser?.uid
      );
      if (currentUserMember) {
        setCurrentUserRole(currentUserMember.role);
      }

      setGroupMembers(members);
      console.log('✅ Loaded group members:', members.length);
    } catch (error) {
      console.error('❌ Failed to load group data:', error);
      Alert.alert('Error', 'Failed to load group data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [groupId, currentUser]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      void loadGroupData();
      void loadFriends();
    }, [loadGroupData, loadFriends])
  );

  /**
   * Filter friends not in group
   */
  const availableFriends = friends.filter(
    friend => !groupMembers.some(member => member.uid === friend.uid)
  );

  /**
   * Filter friends by search term
   */
  const filteredFriends = availableFriends.filter(
    friend =>
      friend.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Handle adding selected friends
   */
  const handleAddFriends = async () => {
    if (selectedFriends.length === 0) return;

    try {
      setIsLoading(true);
      await addUsersToGroup(groupId, selectedFriends);
      setSelectedFriends([]);
      await loadGroupData();
      console.log('✅ Successfully added friends to group');
    } catch (error) {
      console.error('Failed to add friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Show confirmation modal for removing user
   */
  const showRemoveConfirmation = (member: GroupMember) => {
    console.log(
      '🔥 Showing remove confirmation for user:',
      member.uid,
      member.displayName
    );
    setUserToRemove(member);
    setShowConfirmModal(true);
  };

  /**
   * Handle confirmed user removal
   */
  const handleConfirmRemoval = async () => {
    if (!userToRemove) return;

    console.log(
      '🔥 ManageGroupMembers: Starting to remove user:',
      userToRemove.uid,
      'from group:',
      groupId
    );

    setShowConfirmModal(false);

    try {
      setIsLoading(true);
      console.log('🔥 ManageGroupMembers: Calling removeUserFromGroup...');

      await removeUserFromGroup(groupId, userToRemove.uid);

      console.log(
        '🔥 ManageGroupMembers: Successfully removed user, reloading group data...'
      );
      await loadGroupData();

      console.log('🔥 ManageGroupMembers: Group data reloaded');

      if (userToRemove.uid === currentUser?.uid) {
        console.log(
          '🔥 ManageGroupMembers: User removed themselves, navigating back'
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ ManageGroupMembers: Failed to remove user:', error);
    } finally {
      setIsLoading(false);
      setUserToRemove(null);
    }
  };

  /**
   * Cancel removal
   */
  const handleCancelRemoval = () => {
    setShowConfirmModal(false);
    setUserToRemove(null);
  };

  /**
   * Render group member item
   */
  const renderMemberItem = ({ item: member }: { item: GroupMember }) => {
    const isCurrentUser = member.uid === currentUser?.uid;
    const canRemove = currentUserRole === 'admin' || isCurrentUser;

    return (
      <View
        style={[styles.memberItem, { borderBottomColor: theme.colors.border }]}
      >
        <UserAvatar
          photoURL={member.photoURL}
          displayName={member.displayName}
          size={50}
        />
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, { color: theme.colors.text }]}>
            {member.displayName} {isCurrentUser && '(You)'}
          </Text>
          <Text
            style={[styles.memberRole, { color: theme.colors.textSecondary }]}
          >
            {member.role}
          </Text>
        </View>
        {canRemove && (
          <TouchableOpacity
            style={[styles.removeButton, { borderColor: theme.colors.error }]}
            onPress={() => {
              console.log(
                '🔥 Remove button pressed for user:',
                member.uid,
                member.displayName
              );
              showRemoveConfirmation(member);
            }}
          >
            <Text
              style={[styles.removeButtonText, { color: theme.colors.error }]}
            >
              {isCurrentUser ? 'Leave' : 'Remove'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Render friend item for adding
   */
  const renderFriendItem = ({ item: friend }: { item: FriendProfile }) => {
    const isSelected = selectedFriends.includes(friend.uid);

    return (
      <View
        style={[styles.friendItem, { borderBottomColor: theme.colors.border }]}
      >
        <UserAvatar
          photoURL={friend.photoURL}
          displayName={friend.displayName}
          size={40}
        />
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: theme.colors.text }]}>
            {friend.displayName}
          </Text>
          <Text
            style={[
              styles.friendUsername,
              { color: theme.colors.textSecondary },
            ]}
          >
            @{friend.username}
          </Text>
        </View>
        <Switch
          value={isSelected}
          onValueChange={value => {
            if (value) {
              setSelectedFriends(prev => [...prev, friend.uid]);
            } else {
              setSelectedFriends(prev => prev.filter(id => id !== friend.uid));
            }
          }}
          trackColor={{
            false: theme.colors.border,
            true: `${theme.colors.primary}50`,
          }}
          thumbColor={isSelected ? theme.colors.primary : theme.colors.surface}
        />
      </View>
    );
  };

  if (isLoading && groupMembers.length === 0) {
    return (
      <Screen
        {...(theme.colors.background && {
          backgroundColor: theme.colors.background,
        })}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading group data...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      {...(theme.colors.background && {
        backgroundColor: theme.colors.background,
      })}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonTouchable}
          >
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Manage Members
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Current Members Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Current Members ({groupMembers.length})
        </Text>
        <FlatList
          data={groupMembers}
          renderItem={renderMemberItem}
          keyExtractor={item => item.uid}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Add Members Section (Admin Only) */}
      {currentUserRole === 'admin' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Add Members
          </Text>

          {/* Search Bar */}
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder='Search friends to add...'
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {/* Friends List */}
          <FlatList
            data={filteredFriends}
            renderItem={renderFriendItem}
            keyExtractor={item => item.uid}
            showsVerticalScrollIndicator={false}
            style={styles.friendsList}
          />

          {/* Add Button */}
          {selectedFriends.length > 0 && (
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => void handleAddFriends()}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.addButtonText,
                  { color: theme.colors.onPrimary },
                ]}
              >
                Add {selectedFriends.length} Friend
                {selectedFriends.length > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start' as const,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center' as const,
  },
  headerRight: {
    flex: 1,
  },
  backButtonTouchable: {
    padding: 10,
    marginLeft: -10,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 15,
  },
  memberItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  memberRole: {
    fontSize: 14,
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  friendUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 15,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
};
