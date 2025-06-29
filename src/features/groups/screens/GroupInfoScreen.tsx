/**
 * @file GroupInfoScreen.tsx
 * @description Screen for displaying group information including members list,
 * group settings, and admin actions. Allows viewing and managing group details.
 */

import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'react-native';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useChatStore } from '@/features/chat/store/chatStore';
import { ProfileAvatar } from '@/shared/components/base/ProfileAvatar';
import { Screen } from '@/shared/components/layout/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import type { Group } from '@/features/chat/types';
import type { GroupsStackParamList } from '@/shared/navigation/types';
import type { RouteProp, NavigationProp } from '@react-navigation/native';

type GroupInfoRouteProp = RouteProp<GroupsStackParamList, 'GroupInfo'>;
type GroupInfoNavigationProp = NavigationProp<GroupsStackParamList>;

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
  photoURL?: string;
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
    fontWeight: '600' as const,
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
 * GroupInfoScreen - displays group information and member management
 */
export function GroupInfoScreen() {
  const route = useRoute<GroupInfoRouteProp>();
  const navigation = useNavigation<GroupInfoNavigationProp>();
  const theme = useTheme();

  const { groupId } = route.params;

  // Auth state
  const currentUser = useAuthStore(state => state.user);
  const { leaveGroup } = useChatStore();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [groupData, setGroupData] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member'>(
    'member'
  );

  /**
   * Handle manage members
   */
  const handleManageMembers = useCallback(() => {
    navigation.navigate('ManageGroupMembers', {
      groupId,
    });
  }, [groupId, navigation]);

  /**
   * Load group data from Firebase
   */
  const loadGroupData = useCallback(async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    try {
      const { chatService } = await import(
        '@/features/chat/services/chatService'
      );

      // Load group data
      const group = await chatService.getGroupData(groupId);
      if (!group || !group.members) {
        console.error('Group data not found');
        return;
      }

      setGroupData(group);

      // Load member data
      const memberPromises = Object.entries(group.members).map(
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
            console.error('Failed to load user data for:', userId);
            return {
              uid: userId,
              displayName: 'Unknown User',
              username: 'unknown',
              role: memberInfo.role,
              joinedAt: memberInfo.joinedAt,
              addedBy: memberInfo.addedBy,
            } as GroupMember;
          }
        }
      );

      const members = await Promise.all(memberPromises);
      setGroupMembers(members);

      // Set current user role
      const currentUserMember = members.find(m => m.uid === currentUser.uid);
      if (currentUserMember) {
        setCurrentUserRole(currentUserMember.role);
      }
    } catch (error) {
      console.error('Failed to load group data:', error);
      Alert.alert('Error', 'Failed to load group information');
    } finally {
      setIsLoading(false);
    }
  }, [groupId, currentUser?.uid]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      void loadGroupData();
    }, [loadGroupData])
  );

  /**
   * Handle leave group
   */
  const handleLeaveGroup = useCallback(() => {
    const isAdmin = currentUserRole === 'admin';
    const message = isAdmin
      ? 'As the admin, leaving will delete this group for all members. Are you sure?'
      : 'Are you sure you want to leave this group?';

    Alert.alert('Leave Group', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              setIsLoading(true);
              await leaveGroup(groupId);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to leave group:', error);
              Alert.alert('Error', 'Failed to leave group. Please try again.');
            } finally {
              setIsLoading(false);
            }
          })();
        },
      },
    ]);
  }, [groupId, navigation, leaveGroup, currentUserRole]);

  if (isLoading && !groupData) {
    return (
      <Screen testID='group-info-screen'>
        <View
          style={[
            styles.container,
            styles.loadingContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading group info...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen testID='group-info-screen'>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Group Header */}
          <View
            style={[styles.header, { borderBottomColor: theme.colors.border }]}
          >
            <ProfileAvatar size='large' />
            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
              {groupData?.name || 'Group'}
            </Text>
            <Text
              style={[
                styles.memberCount,
                { color: theme.colors.textSecondary },
              ]}
            >
              {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleManageMembers}
              testID='manage-members-button'
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.background },
                ]}
              >
                Manage Members
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.leaveButton,
                { borderColor: theme.colors.error },
              ]}
              onPress={handleLeaveGroup}
              testID='leave-group-button'
            >
              <Text
                style={[styles.actionButtonText, { color: theme.colors.error }]}
              >
                {isLoading ? 'Leaving...' : 'Leave Group'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Members Section */}
          <View
            style={[styles.section, { borderTopColor: theme.colors.border }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Members
            </Text>

            {groupMembers.map(member => {
              const isCurrentUser = member.uid === currentUser?.uid;
              return (
                <View key={member.uid} style={styles.memberItem}>
                  <UserAvatar
                    {...(member.photoURL && { photoURL: member.photoURL })}
                    displayName={member.displayName}
                    size={40}
                  />
                  <View style={styles.memberInfo}>
                    <Text
                      style={[styles.memberName, { color: theme.colors.text }]}
                    >
                      {member.displayName} {isCurrentUser && '(You)'}
                    </Text>
                    <Text
                      style={[
                        styles.memberRole,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  memberCount: {
    fontSize: 16,
    marginTop: 4,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 14,
    marginTop: 2,
  },
});
