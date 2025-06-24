/**
 * @file RecipientSelectionScreen.tsx
 * @description Screen for selecting recipients and duration when sending a snap.
 * Integrates with camera captured media and friends list.
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useFriendsStore,
  useFriendsList,
} from '@/features/friends/store/friendsStore';
import { useTheme } from '@/shared/hooks/useTheme';

import {
  useChatStore,
  useSelectedRecipients,
  useSendError,
  useSendingMessages,
} from '../store/chatStore';

import type { SnapCreationData, SnapDuration } from '../types';
import type { RootStackParamList } from '@/shared/navigation/types';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RecipientSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RecipientSelection'
>;
type RecipientSelectionScreenRouteProp = RouteProp<
  RootStackParamList,
  'RecipientSelection'
>;

interface RouteParams {
  mediaUri: string;
  mediaType: 'photo' | 'video';
  textOverlay?: string;
}

/**
 * Duration options for snap viewing
 */
const DURATION_OPTIONS: SnapDuration[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Recipient selection screen component
 */
export function RecipientSelectionScreen() {
  const navigation = useNavigation<RecipientSelectionScreenNavigationProp>();
  const route = useRoute<RecipientSelectionScreenRouteProp>();
  const theme = useTheme();

  // Route params
  const { mediaUri, mediaType, textOverlay } = route.params as RouteParams;

  // Store hooks
  const friends = useFriendsList();
  const selectedRecipients = useSelectedRecipients();
  const sendError = useSendError();
  const sendingMessages = useSendingMessages();
  const isSending = sendingMessages.length > 0;

  // Store actions
  const { loadFriends } = useFriendsStore();
  const {
    addRecipient,
    removeRecipient,
    clearRecipients,
    sendSnap,
    clearSendError,
  } = useChatStore();

  // Local state
  const [selectedDuration, setSelectedDuration] = useState<SnapDuration>(3);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load friends on component mount
   */
  useEffect(() => {
    loadFriends();

    // Clear recipients when entering screen
    return () => {
      clearRecipients();
    };
  }, []);

  /**
   * Clear send error when component mounts
   */
  useEffect(() => {
    clearSendError();
  }, []);

  /**
   * Handle recipient selection toggle
   */
  const handleRecipientToggle = (friendId: string) => {
    if (selectedRecipients.includes(friendId)) {
      removeRecipient(friendId);
    } else {
      addRecipient(friendId);
    }
  };

  /**
   * Handle send snap to selected recipients
   */
  const handleSendSnap = async () => {
    if (selectedRecipients.length === 0) {
      Alert.alert(
        'No Recipients',
        'Please select at least one friend to send the snap to.'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Send snap to each selected recipient
      for (const recipientId of selectedRecipients) {
        const snapData: SnapCreationData = {
          recipientId,
          mediaUri,
          mediaType,
          ...(textOverlay && { textOverlay }),
          duration: selectedDuration,
        };

        await sendSnap(snapData);
      }

      // Show success message and navigate to chats
      Alert.alert(
        'Snap Sent!',
        `Your snap was sent to ${selectedRecipients.length} friend${selectedRecipients.length > 1 ? 's' : ''}.`,
        [
          {
            text: 'View Chats',
            onPress: () => {
              // Navigate to main screen (will default to chats tab)
              navigation.navigate('Main');
            },
          },
          {
            text: 'Take Another',
            onPress: () => {
              // Navigate back to main screen (user can switch to camera tab)
              navigation.navigate('Main');
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ RecipientSelectionScreen: Failed to send snap:', error);
      Alert.alert('Send Failed', 'Failed to send snap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigation.goBack();
  };

  /**
   * Render friend item for selection
   */
  const renderFriendItem = ({ item: friend }: { item: any }) => {
    const isSelected = selectedRecipients.includes(friend.uid);

    return (
      <TouchableOpacity
        style={[
          styles.friendItem,
          { backgroundColor: theme.colors.background },
          isSelected && { backgroundColor: `${theme.colors.primary}20` },
        ]}
        onPress={() => handleRecipientToggle(friend.uid)}
        activeOpacity={0.7}
      >
        <View style={styles.friendInfo}>
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[styles.avatarText, { color: theme.colors.background }]}
            >
              {friend.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.friendDetails}>
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
        </View>

        <View
          style={[
            styles.checkbox,
            { borderColor: theme.colors.border },
            isSelected && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          {isSelected && (
            <Text
              style={[styles.checkmark, { color: theme.colors.background }]}
            >
              ✓
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render duration option
   */
  const renderDurationOption = (duration: SnapDuration) => {
    const isSelected = selectedDuration === duration;

    return (
      <TouchableOpacity
        key={duration}
        style={[
          styles.durationOption,
          { borderColor: theme.colors.border },
          isSelected && {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => setSelectedDuration(duration)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.durationText,
            { color: theme.colors.text },
            isSelected && { color: theme.colors.background },
          ]}
        >
          {duration}s
        </Text>
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text
        style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}
      >
        No friends found. Add some friends to send snaps!
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text
            style={[styles.backButtonText, { color: theme.colors.primary }]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Send To
        </Text>

        <TouchableOpacity
          onPress={handleSendSnap}
          style={[
            styles.sendButton,
            { backgroundColor: theme.colors.primary },
            (selectedRecipients.length === 0 || isLoading || isSending) &&
              styles.sendButtonDisabled,
          ]}
          disabled={selectedRecipients.length === 0 || isLoading || isSending}
        >
          {isLoading || isSending ? (
            <ActivityIndicator size='small' color={theme.colors.background} />
          ) : (
            <Text
              style={[
                styles.sendButtonText,
                { color: theme.colors.background },
              ]}
            >
              Send
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Duration Selection */}
      <View style={styles.durationSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Viewing Duration
        </Text>

        <View style={styles.durationOptions}>
          {DURATION_OPTIONS.map(renderDurationOption)}
        </View>
      </View>

      {/* Recipients Selection */}
      <View style={styles.recipientsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Send to Friends ({selectedRecipients.length} selected)
        </Text>

        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.uid}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.friendsList}
        />
      </View>

      {/* Error Display */}
      {sendError && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: `${theme.colors.error}20` },
          ]}
        >
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {sendError}
          </Text>
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
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  durationSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 40,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recipientsSection: {
    flex: 1,
    padding: 16,
  },
  friendsList: {
    flexGrow: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendDetails: {
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
