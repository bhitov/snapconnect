/**
 * @file GroupInfoScreen.tsx
 * @description Screen for displaying group information including members list,
 * group settings, and admin actions. Allows viewing and managing group details.
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useChatStore } from '@/features/chat/store/chatStore';
import { ProfileAvatar } from '@/shared/components/base/ProfileAvatar';
import { Screen } from '@/shared/components/layout/Screen';
import { useTheme } from '@/shared/hooks/useTheme';

import type { GroupsStackParamList } from '@/shared/navigation/types';
import type { RouteProp, NavigationProp } from '@react-navigation/native';

type GroupInfoRouteProp = RouteProp<GroupsStackParamList, 'GroupInfo'>;
type GroupInfoNavigationProp = NavigationProp<GroupsStackParamList>;

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

  // Local state
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle manage members
   */
  const handleManageMembers = useCallback(() => {
    navigation.navigate('ManageGroupMembers', {
      groupId,
    });
  }, [groupId, navigation]);

  /**
   * Handle leave group
   */
  const handleLeaveGroup = useCallback(() => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement leave group functionality
          console.log('Leave group:', groupId);
          navigation.goBack();
        },
      },
    ]);
  }, [groupId, navigation]);

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
              Group Name {/* TODO: Get from group data */}
            </Text>
            <Text
              style={[
                styles.memberCount,
                { color: theme.colors.textSecondary },
              ]}
            >
              3 members {/* TODO: Get actual member count */}
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
                Leave Group
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

            {/* TODO: Render actual members list */}
            <View style={styles.memberItem}>
              <ProfileAvatar size='medium' />
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.colors.text }]}>
                  You
                </Text>
                <Text
                  style={[
                    styles.memberRole,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Admin
                </Text>
              </View>
            </View>
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
