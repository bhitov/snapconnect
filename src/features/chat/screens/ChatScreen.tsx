/**
 * @file ChatScreen.tsx
 * @description Individual chat screen showing conversation between two users.
 * Displays both persistent text messages and ephemeral snaps in chronological order.
 * Includes text input for sending messages and snap integration.
 */

import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useTheme } from '@/shared/hooks/useTheme';

import { usePolling } from '../hooks';
import {
  useChatStore,
  useCurrentMessages,
  useMessagesLoading,
  useMessagesError,
  useSendError,
} from '../store/chatStore';

import type {
  Message,
  TextMessage,
  SnapMessage,
  ChatScreenProps,
} from '../types';
import type {
  ChatStackParamList,
  RootStackParamList,
} from '@/shared/navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type ChatScreenRouteProp = {
  key: string;
  name: 'ChatScreen';
  params: ChatScreenProps;
};

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Format timestamp for messages
 */
function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString();
}

/**
 * Get status indicator for messages
 */
function getMessageStatusIcon(status: string): string {
  switch (status) {
    case 'sent':
      return '→';
    case 'delivered':
      return '✓';
    case 'viewed':
      return '👁️';
    default:
      return '';
  }
}

/**
 * Get status text for snap display
 */
function getSnapStatusText(status: string, isFromCurrentUser: boolean): string {
  if (isFromCurrentUser) {
    // For sender: show "Sent" → "Viewed"
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'Sent';
      case 'viewed':
        return 'Viewed';
      default:
        return 'Sent';
    }
  } else {
    // For recipient: show "Snap" → "Seen"
    switch (status) {
      case 'viewed':
        return 'Seen';
      default:
        return 'Snap';
    }
  }
}

/**
 * Individual message item component
 */
function MessageItem({
  message,
  isFromCurrentUser,
  onSnapPress,
}: {
  message: Message;
  isFromCurrentUser: boolean;
  onSnapPress?: (snap: SnapMessage) => void;
}) {
  const theme = useTheme();

  const handleSnapPress = useCallback(() => {
    if (message.type === 'snap' && onSnapPress) {
      onSnapPress(message as SnapMessage);
    }
  }, [message, onSnapPress]);

  const renderMessageContent = () => {
    if (message.type === 'text') {
      const textMessage = message as TextMessage;
      return (
        <Text
          style={[
            styles.messageText,
            {
              color: isFromCurrentUser
                ? theme.colors.background
                : theme.colors.text,
            },
          ]}
        >
          {textMessage.text}
        </Text>
      );
    } else {
      const snapMessage = message as SnapMessage;
      return (
        <TouchableOpacity
          style={styles.snapContent}
          onPress={handleSnapPress}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.snapIcon,
              {
                color: isFromCurrentUser
                  ? theme.colors.background
                  : theme.colors.text,
              },
            ]}
          >
            {snapMessage.mediaType === 'photo' ? '📷' : '🎥'}
          </Text>
          <Text
            style={[
              styles.snapText,
              {
                color: isFromCurrentUser
                  ? theme.colors.background
                  : theme.colors.text,
              },
            ]}
          >
            {getSnapStatusText(snapMessage.status, isFromCurrentUser)}
          </Text>
          {snapMessage.textOverlay && (
            <Text
              style={[
                styles.snapOverlay,
                {
                  color: isFromCurrentUser
                    ? theme.colors.background
                    : theme.colors.textSecondary,
                },
              ]}
            >
              "{snapMessage.textOverlay}"
            </Text>
          )}
        </TouchableOpacity>
      );
    }
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isFromCurrentUser ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isFromCurrentUser
              ? theme.colors.primary
              : theme.colors.surface,
          },
        ]}
      >
        {renderMessageContent()}
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              {
                color: isFromCurrentUser
                  ? `${theme.colors.background}80`
                  : theme.colors.textSecondary,
              },
            ]}
          >
            {formatMessageTime(message.createdAt)}
          </Text>
          {isFromCurrentUser && (
            <Text
              style={[
                styles.messageStatus,
                { color: `${theme.colors.background}80` },
              ]}
            >
              {getMessageStatusIcon(message.status)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * Chat screen component
 */
export function ChatScreen() {
  const route = useRoute() as ChatScreenRouteProp;
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const theme = useTheme();

  const { conversationId, otherUser } = route.params;

  // Auth state
  const currentUser = useAuthStore(state => state.user);

  // Chat state
  const messages = useCurrentMessages();
  const isLoading = useMessagesLoading();
  const messagesError = useMessagesError();
  const sendError = useSendError();

  // Chat actions
  const {
    loadMessages,
    silentLoadMessages,
    sendTextMessage,
    markMessageAsViewed,
    markAllMessagesAsDelivered,
    clearError,
    clearSendError,
  } = useChatStore();

  // Local state
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  /**
   * Polling function for messages - only refreshes when data changes (no loading animations)
   */
  const pollMessages = useCallback(async () => {
    console.log('🔄 ChatScreen: Silent polling messages for updates');
    try {
      await silentLoadMessages(conversationId);
    } catch (error) {
      console.error('❌ ChatScreen: Silent message polling failed:', error);
    }
  }, [silentLoadMessages, conversationId]);

  /**
   * Set up polling for messages (twice per second)
   */
  usePolling(pollMessages, {
    interval: 500, // 2 times per second
    immediate: false, // Don't call immediately, let the initial load handle it
    focusOnly: true, // Only poll when screen is focused
  });

  /**
   * Load messages when screen focuses and mark all as delivered
   */
  useFocusEffect(
    useCallback(() => {
      const loadAndMarkDelivered = async () => {
        await loadMessages(conversationId);
        // Mark all unread messages as delivered when chat is opened
        // This will set the unread count to zero for this user
        await markAllMessagesAsDelivered(conversationId);
      };

      loadAndMarkDelivered().catch((error: any) => {
        console.error('Failed to load messages or mark as delivered:', error);
      });
    }, [conversationId, loadMessages, markAllMessagesAsDelivered])
  );

  /**
   * Set navigation title and back button
   */
  useEffect(() => {
    navigation.setOptions({
      title: otherUser.displayName,
      headerTitleStyle: {
        color: theme.colors.text || '#000000',
      },
      headerStyle: {
        backgroundColor: theme.colors.background || '#FFFFFF',
      },
      headerBackTitle: 'Chats',
      headerTintColor: theme.colors.primary || '#FFFC00',
    });
  }, [navigation, otherUser.displayName, theme]);

  /**
   * Scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  /**
   * Handle sending text message
   */
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !currentUser || isSending) return;

    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      await sendTextMessage({
        text,
        recipientId: otherUser.uid,
      });

      // Reload messages to show the new one
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [
    messageText,
    currentUser,
    otherUser.uid,
    conversationId,
    isSending,
    sendTextMessage,
    loadMessages,
  ]);

  /**
   * Handle snap press
   */
  const handleSnapPress = useCallback(
    (snap: SnapMessage) => {
      if (!currentUser) return;

      // Prevent sender from viewing their own snaps
      if (snap.senderId === currentUser.uid) {
        Alert.alert('Cannot View', 'You cannot view your own snaps.');
        return;
      }

      // Prevent viewing already viewed snaps
      if (snap.status === 'viewed') {
        Alert.alert(
          'Snap Viewed',
          'This snap has already been viewed and is no longer available.'
        );
        return;
      }

      navigation.navigate('ViewSnap', { snapId: snap.id });
    },
    [navigation, currentUser]
  );

  /**
   * Handle camera button press
   */
  const handleCameraPress = useCallback(() => {
    console.log(
      '📸 ChatScreen: Camera button pressed, navigating to Camera tab'
    );
    // Navigate to Camera tab using parent navigation
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('Camera');
    } else {
      console.warn('❌ ChatScreen: No parent navigator found');
    }
  }, [navigation]);

  /**
   * Clear errors when component unmounts
   */
  useEffect(() => {
    return () => {
      clearError();
      clearSendError();
    };
  }, [clearError, clearSendError]);

  /**
   * Render message item
   */
  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      if (!currentUser) return null;

      const isFromCurrentUser = item.senderId === currentUser.uid;

      return (
        <MessageItem
          message={item}
          isFromCurrentUser={isFromCurrentUser}
          onSnapPress={handleSnapPress}
        />
      );
    },
    [currentUser, handleSnapPress]
  );

  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading messages...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (messagesError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {messagesError}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => loadMessages(conversationId)}
          >
            <Text
              style={[
                styles.retryButtonText,
                { color: theme.colors.background },
              ]}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No messages yet. Send a message or snap to start the
                conversation!
              </Text>
            </View>
          }
        />

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.cameraButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleCameraPress}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.cameraButtonText,
                { color: theme.colors.background },
              ]}
            >
              📷
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder='Type a message...'
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={500}
            editable={!isSending}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  messageText.trim() && !isSending
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sendButtonText,
                { color: theme.colors.background },
              ]}
            >
              {isSending ? '...' : '→'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Send Error */}
        {sendError && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: theme.colors.error },
            ]}
          >
            <Text
              style={[styles.errorText, { color: theme.colors.background }]}
            >
              {sendError}
            </Text>
            <TouchableOpacity onPress={clearSendError}>
              <Text
                style={[
                  styles.dismissError,
                  { color: theme.colors.background },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageContainer: {
    marginVertical: 4,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  snapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  snapIcon: {
    fontSize: 18,
  },
  snapText: {
    fontSize: 16,
    fontWeight: '500',
  },
  snapOverlay: {
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  messageTime: {
    fontSize: 12,
  },
  messageStatus: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  dismissError: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
});
