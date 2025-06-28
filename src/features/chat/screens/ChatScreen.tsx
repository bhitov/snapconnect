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
import { CoachModal } from '../components/CoachModal';
import { LoveMapMessage } from '../components/LoveMapMessage';

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
import type { CompositeNavigationProp } from '@react-navigation/native';

type ChatScreenRouteProp = {
  key: string;
  name: 'ChatScreen';
  params: ChatScreenProps;
};

type ChatScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ChatStackParamList>,
  StackNavigationProp<RootStackParamList>
>;

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
  isCoachChat,
  onSendLoveMapQuestion,
  currentUser,
  otherUser,
}: {
  message: Message;
  isFromCurrentUser: boolean;
  onSnapPress?: (snap: SnapMessage) => void;
  isCoachChat?: boolean;
  onSendLoveMapQuestion?: (question: string) => void;
  currentUser?: any;
  otherUser?: any;
}) {
  const theme = useTheme();
  const isCoachMessage = isCoachChat && message.senderId === 'coach';

  // Get avatar info for the message sender
  const getAvatarInfo = () => {
    if (isCoachMessage) {
      return { text: '🎓', photoURL: null };
    }
    
    if (isFromCurrentUser) {
      return {
        text: currentUser?.displayName?.charAt(0)?.toUpperCase() || currentUser?.username?.charAt(0)?.toUpperCase() || '?',
        photoURL: currentUser?.photoURL
      };
    } else {
      return {
        text: otherUser?.displayName?.charAt(0)?.toUpperCase() || '?',
        photoURL: otherUser?.photoURL
      };
    }
  };

  const avatarInfo = getAvatarInfo();

  const handleSnapPress = useCallback(() => {
    if (message.type === 'snap' && onSnapPress) {
      onSnapPress(message as SnapMessage);
    }
  }, [message, onSnapPress]);

  const renderMessageContent = () => {
    if (message.type === 'text') {
      const textMessage = message as TextMessage;
      
      // Use special LoveMapMessage component for coach messages
      if (isCoachMessage && onSendLoveMapQuestion) {
        return (
          <LoveMapMessage
            text={textMessage.text}
            onSendQuestion={onSendLoveMapQuestion}
          />
        );
      }
      
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
      {/* Avatar for all messages */}
      {!isFromCurrentUser && (
        <View style={styles.avatarContainer}>
          <View style={[styles.messageAvatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.messageAvatarText, { color: theme.colors.background }]}>
              {avatarInfo.text}
            </Text>
          </View>
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isCoachMessage
              ? '#E8F4F8'
              : isFromCurrentUser
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
      
      {/* Avatar for current user messages */}
      {isFromCurrentUser && (
        <View style={styles.avatarContainer}>
          <View style={[styles.messageAvatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.messageAvatarText, { color: theme.colors.background }]}>
              {avatarInfo.text}
            </Text>
          </View>
        </View>
      )}
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

  const { conversationId, otherUser, isGroup, groupTitle, isCoach, parentCid, coachChatId } = route.params;

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
    startCoachChat,
    sendCoachMessage,
    analyzeChat,
    analyzeRatio,
    analyzeHorsemen,
    generateLoveMap,
  } = useChatStore();

  // Local state
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  /**
   * Polling function for messages - only refreshes when data changes (no loading animations)
   */
  const pollMessages = useCallback(async () => {
    // console.log('🔄 ChatScreen: Silent polling messages for updates');
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
   * Handle coach button press
   */
  const handleCoachPress = useCallback(async () => {
    try {
      let coachCid = coachChatId;
      
      // If no coach chat exists, create one
      if (!coachCid) {
        coachCid = await startCoachChat(conversationId);
      }
      
      // Navigate to coach chat
      navigation.navigate('ChatScreen', {
        conversationId: coachCid,
        isCoach: true,
        parentCid: conversationId,
      });
    } catch (error) {
      console.error('❌ Failed to start coach chat:', error);
    }
  }, [conversationId, coachChatId, startCoachChat, navigation]);

  /**
   * Handle coach analysis option selection
   */
  const handleCoachAnalysis = useCallback(async (option: 'ratio' | 'horsemen' | 'lovemap') => {
    try {
      switch (option) {
        case 'ratio':
          await analyzeRatio(conversationId, parentCid || '');
          console.log('✅ Ratio analysis completed');
          break;
        case 'horsemen':
          await analyzeHorsemen(conversationId, parentCid || '');
          console.log('✅ Horsemen analysis completed');
          break;
        case 'lovemap':
          await generateLoveMap(conversationId, parentCid || '');
          console.log('✅ Love map generated');
          break;
      }
    } catch (error) {
      console.error('❌ Failed to perform coach analysis:', error);
    }
  }, [conversationId, parentCid, analyzeRatio, analyzeHorsemen, generateLoveMap]);

  /**
   * Handle analyze chat (legacy function for old analyze option)
   */
  const handleAnalyzeChat = useCallback(async () => {
    try {
      await analyzeChat(conversationId, parentCid || '', 30);
      console.log('✅ Chat analysis completed and posted to conversation');
    } catch (error) {
      console.error('❌ Failed to analyze chat:', error);
    }
  }, [conversationId, parentCid, analyzeChat]);

  /**
   * Set navigation title and back button
   */
  useEffect(() => {
    const title = isCoach
      ? 'Coach Chat'
      : isGroup 
      ? (groupTitle || 'Group Chat')
      : (otherUser?.displayName || 'Chat');
      
    navigation.setOptions({
      title,
      headerTitleStyle: {
        color: theme.colors.text || '#000000',
      },
      headerStyle: {
        backgroundColor: theme.colors.background || '#FFFFFF',
      },
      headerBackTitle: isCoach ? 'Chat' : 'Chats',
      headerTintColor: theme.colors.primary || '#FFFC00',
      ...(isCoach && parentCid && {
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ChatScreen', {
                conversationId: parentCid,
                isCoach: false,
              });
            }}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginLeft: 16,
              paddingVertical: 8,
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ 
              fontSize: 17, 
              color: theme.colors.primary || '#FFFC00',
              marginRight: 4,
            }}>
              ←
            </Text>
            <Text style={{ 
              fontSize: 17, 
              color: theme.colors.primary || '#FFFC00',
            }}>
              Chat
            </Text>
          </TouchableOpacity>
        ),
      }),
      // Add Coach button for non-coach conversations, menu for coach chats
      headerRight: () => {
        if (isCoach) {
          // Show prompts button for coach chats
          return (
            <TouchableOpacity
              onPress={() => setShowCoachModal(true)}
              style={{ marginRight: 16 }}
            >
              <View style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}>
                <Text style={{ 
                  color: theme.colors.background,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  Prompts
                </Text>
              </View>
            </TouchableOpacity>
          );
        } else {
          // Show coach button for regular chats
          return (
            <TouchableOpacity
              onPress={handleCoachPress}
              style={{ marginRight: 16 }}
            >
              <Text style={{ fontSize: 24 }}>🎓</Text>
            </TouchableOpacity>
          );
        }
      },
    });
  }, [navigation, otherUser?.displayName, isGroup, groupTitle, theme, isCoach, handleCoachPress, handleAnalyzeChat]);

  /**
   * Scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0 && !isInitialLoad) {
      // Only scroll on new messages after initial load
      setTimeout(() => {
        // With inverted list, offset 0 is the bottom
        flatListRef.current?.scrollToOffset({ 
          offset: 0, 
          animated: true 
        });
      }, 100);
    }
    if (isInitialLoad && messages.length > 0) {
      setIsInitialLoad(false);
    }
  }, [messages.length, isInitialLoad]);

  /**
   * Handle sending text message
   */
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !currentUser || isSending) return;

    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      if (isCoach) {
        // Send message to coach
        await sendCoachMessage(conversationId, parentCid || '', text);
      } else if (isGroup) {
        // Send message to group
        await sendTextMessage({
          text,
          conversationId,
        });
      } else if (otherUser) {
        // Send message to individual user
        await sendTextMessage({
          text,
          recipientId: otherUser.uid,
        });
      } else {
        // Fallback: send to conversation directly (for when otherUser is missing)
        await sendTextMessage({
          text,
          conversationId,
        });
      }

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
    otherUser,
    conversationId,
    isGroup,
    isCoach,
    parentCid,
    isSending,
    sendTextMessage,
    sendCoachMessage,
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
   * Handle sending love map question to parent conversation
   */
  const handleSendLoveMapQuestion = useCallback(async (question: string) => {
    if (!parentCid || !currentUser) return;

    try {
      // Send the question to the parent conversation
      await sendTextMessage({
        text: question,
        conversationId: parentCid,
      });

      console.log('✅ Love map question sent to parent conversation');
      
      // Navigate back to parent chat and scroll to bottom
      navigation.navigate('ChatScreen', {
        conversationId: parentCid,
        isCoach: false,
      });
      
      // Load messages and scroll to bottom after navigation
      setTimeout(async () => {
        await loadMessages(parentCid);
        setTimeout(() => {
          // With inverted list, offset 0 is the bottom
          flatListRef.current?.scrollToOffset({ 
            offset: 0, 
            animated: true 
          });
        }, 100);
      }, 200);
    } catch (error) {
      console.error('❌ Failed to send love map question:', error);
      Alert.alert('Error', 'Failed to send question. Please try again.');
    }
  }, [parentCid, currentUser, sendTextMessage, navigation, loadMessages]);

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
   * Handle scroll-to-bottom button visibility
   */
  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    // With inverted list, being at bottom means offset is near 0
    const isNearBottom = contentOffset.y <= 100;
    setShowScrollToBottom(!isNearBottom);
  }, []);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    // With inverted FlatList, scrollToOffset 0 goes to bottom
    flatListRef.current?.scrollToOffset({ 
      offset: 0, 
      animated: true 
    });
    setShowScrollToBottom(false);
  }, []);

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
          isCoachChat={isCoach || false}
          onSendLoveMapQuestion={isCoach ? handleSendLoveMapQuestion : undefined}
          currentUser={currentUser}
          otherUser={otherUser}
        />
      );
    },
    [currentUser, otherUser, handleSnapPress, isCoach, handleSendLoveMapQuestion]
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
          data={[...messages].reverse()}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          inverted
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: 100, // Increased estimate to account for padding
            offset: 100 * index,
            index,
          })}
          onScrollToIndexFailed={() => {
            // Fallback to scrollToEnd if scrollToIndex fails
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
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

        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <TouchableOpacity
            style={[
              styles.scrollToBottomButton,
              { backgroundColor: '#6B73FF' } // Distinct purple color
            ]}
            onPress={scrollToBottom}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scrollToBottomText,
                { color: '#FFFFFF' }
              ]}
            >
              ↓
            </Text>
          </TouchableOpacity>
        )}

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
            testID="message-input"
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
            testID="send-button"
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

        {/* Coach Modal */}
        <CoachModal
          visible={showCoachModal}
          onClose={() => setShowCoachModal(false)}
          onOptionSelect={handleCoachAnalysis}
        />

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
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sentMessage: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: '600',
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
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 90,
    left: '50%',
    marginLeft: -20, // Half of width to center
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollToBottomText: {
    fontSize: 20,
    fontWeight: '600',
  },
});
