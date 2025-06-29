import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useFriendsList } from '@/features/friends/store/friendsStore';
import { FriendProfile } from '@/features/friends/types';
import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import { partnerService } from '../services/partnerService';
import { PartnerRequest } from '../types/partnerTypes';

import type { FriendsStackParamList } from '@/shared/navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

interface AddPartnerScreenProps {
  navigation: StackNavigationProp<FriendsStackParamList, 'AddPartner'>;
}

export function AddPartnerScreen({ navigation }: AddPartnerScreenProps) {
  const theme = useTheme();
  const friends = useFriendsList();
  const currentUser = useAuthStore(state => state.user);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingRequests, setExistingRequests] = useState<PartnerRequest[]>(
    []
  );

  const loadExistingRequests = useCallback(async () => {
    if (!currentUser) return;
    try {
      const requests = await partnerService.getPartnerRequests(currentUser.uid);
      setExistingRequests(requests);
    } catch (error) {
      console.error('Failed to load partner requests:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadExistingRequests();
  }, [loadExistingRequests]);

  const handleSelectFriend = (friend: FriendProfile) => {
    if (currentUser?.partnerId) {
      Alert.alert(
        'Already Partnered',
        'You already have a partner. Break up first to add a new partner.'
      );
      return;
    }

    // Check if there's already a pending request with this specific friend
    const hasRequestWithFriend = existingRequests.some(
      req =>
        req.status === 'pending' &&
        ((req.senderId === currentUser?.uid && req.receiverId === friend.uid) ||
          (req.receiverId === currentUser?.uid && req.senderId === friend.uid))
    );

    if (hasRequestWithFriend) {
      Alert.alert(
        'Request Exists',
        `You already have a pending partner request with ${friend.displayName}.`
      );
      return;
    }

    // Check if user has any other active partner request
    const hasOtherActiveRequest = existingRequests.some(
      req =>
        req.status === 'pending' &&
        (req.senderId === currentUser?.uid ||
          req.receiverId === currentUser?.uid)
    );

    if (hasOtherActiveRequest) {
      Alert.alert(
        'Pending Request',
        'You have a pending partner request with someone else. Please wait for it to be resolved.'
      );
      return;
    }

    setSelectedFriend(friend);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedFriend || !currentUser) return;

    setLoading(true);
    try {
      await partnerService.sendPartnerRequest(
        currentUser.uid,
        selectedFriend.uid
      );

      // Navigate to Friend Requests screen with Partner tab
      navigation.navigate('FriendRequests', { initialTab: 'partner' });

      // Show success message
      Alert.alert(
        'Request Sent',
        `Partner request sent to ${selectedFriend.displayName}. They'll need to confirm.`
      );
    } catch (error) {
      console.error('Failed to send partner request:', error);
      Alert.alert('Error', 'Failed to send partner request. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const renderFriend = ({ item }: { item: FriendProfile }) => {
    const isPending = existingRequests.some(
      req =>
        req.status === 'pending' &&
        (req.receiverId === item.uid || req.senderId === item.uid)
    );

    return (
      <TouchableOpacity
        style={[styles.friendItem, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleSelectFriend(item)}
        disabled={isPending}
        activeOpacity={0.7}
      >
        <View style={styles.friendContent}>
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
                {item.displayName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>

          <View style={styles.friendInfo}>
            <Text style={[styles.displayName, { color: theme.colors.text }]}>
              {item.displayName}
            </Text>
            <Text
              style={[styles.username, { color: theme.colors.textSecondary }]}
            >
              @{item.username}
            </Text>
            {isPending && (
              <Text
                style={[styles.pendingText, { color: theme.colors.warning }]}
              >
                Request pending
              </Text>
            )}
          </View>

          <Ionicons
            name='chevron-forward'
            size={20}
            color={isPending ? theme.colors.textSecondary : theme.colors.text}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name='heart-outline'
        size={48}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        No friends yet
      </Text>
      <Text
        style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}
      >
        You need to add someone as a friend first before making them your
        partner
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Add Partner
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={item => item.uid}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showConfirmModal}
        transparent
        animationType='fade'
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Confirm Partnership
            </Text>
            <Text
              style={[styles.modalText, { color: theme.colors.textSecondary }]}
            >
              Are you in a relationship with {selectedFriend?.displayName}?
            </Text>
            <Text
              style={[
                styles.modalSubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              (They will have to confirm)
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.background },
                ]}
                onPress={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                <Text
                  style={[styles.modalButtonText, { color: theme.colors.text }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => void handleConfirm()}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: theme.colors.white },
                  ]}
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 8,
  },
  friendItem: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
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
  },
  pendingText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    // Additional styles for confirm button
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
