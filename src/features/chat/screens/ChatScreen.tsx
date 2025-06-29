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
  Image,
  ActivityIndicator,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import { CoachModal } from '../components/CoachModal';
import { LoveMapMessage } from '../components/LoveMapMessage';
import { usePolling } from '../hooks';
import { chatService } from '../services/chatService';
import {
  useChatStore,
  useCurrentMessages,
  useMessagesLoading,
  useMessagesError,
  useSendError,
  useConversations,
} from '../store/chatStore';

import type {
  Message,
  TextMessage,
  SnapMessage,
  ChatScreenProps,
} from '../types';
import type { User } from '@/features/auth/types/authTypes';
import type {
  ChatStackParamList,
  RootStackParamList,
} from '@/shared/navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

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
  isGroup,
  senderData,
}: {
  message: Message;
  isFromCurrentUser: boolean;
  onSnapPress?: (snap: SnapMessage) => void;
  isCoachChat?: boolean;
  onSendLoveMapQuestion?: (question: string) => void;
  currentUser?: User | null;
  otherUser?: {
    uid: string;
    username: string;
    displayName: string;
    photoURL?: string;
  };
  isGroup?: boolean;
  senderData?: {
    uid: string;
    username: string;
    displayName: string;
    photoURL?: string;
  };
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
        text:
          currentUser?.displayName?.charAt(0)?.toUpperCase() ||
          currentUser?.username?.charAt(0)?.toUpperCase() ||
          '?',
        photoURL: currentUser?.photoURL,
      };
    } else {
      // In group chats, use sender data if available
      if (isGroup && senderData) {
        return {
          text:
            senderData.displayName?.charAt(0)?.toUpperCase() ||
            senderData.username?.charAt(0)?.toUpperCase() ||
            '?',
          photoURL: senderData.photoURL,
        };
      }
      // In one-on-one chats, use otherUser
      return {
        text:
          otherUser?.displayName?.charAt(0)?.toUpperCase() ||
          otherUser?.username?.charAt(0)?.toUpperCase() ||
          '?',
        photoURL: otherUser?.photoURL,
      };
    }
  };

  const avatarInfo = getAvatarInfo();

  const handleSnapPress = useCallback(() => {
    if (message.type === 'snap' && onSnapPress) {
      onSnapPress(message);
    }
  }, [message, onSnapPress]);

  const renderMessageContent = () => {
    if (message.type === 'text') {
      const textMessage = message;

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
      const snapMessage = message;
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
          <View
            style={[
              styles.messageAvatar,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            {avatarInfo.photoURL ? (
              <Image
                source={{ uri: resolveMediaUrl(avatarInfo.photoURL) }}
                style={styles.messageAvatarImage}
              />
            ) : (
              <Text
                style={[
                  styles.messageAvatarText,
                  { color: theme.colors.background },
                ]}
              >
                {avatarInfo.text}
              </Text>
            )}
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
          <View
            style={[
              styles.messageAvatar,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            {avatarInfo.photoURL ? (
              <Image
                source={{ uri: resolveMediaUrl(avatarInfo.photoURL) }}
                style={styles.messageAvatarImage}
              />
            ) : (
              <Text
                style={[
                  styles.messageAvatarText,
                  { color: theme.colors.background },
                ]}
              >
                {avatarInfo.text}
              </Text>
            )}
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
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const theme = useTheme();

  const {
    conversationId,
    otherUser,
    isGroup,
    groupTitle,
    isCoach,
    parentCid,
    coachChatId,
  } = route.params;

  // Auth state
  const currentUser = useAuthStore(state => state.user);

  // Chat state
  const messages = useCurrentMessages();
  const isLoading = useMessagesLoading();
  const messagesError = useMessagesError();
  const sendError = useSendError();
  const conversations = useConversations();

  // Check if this is a partner conversation
  const isPartnerConversation = React.useMemo(() => {
    if (isCoach && parentCid) {
      // Find the parent conversation
      const parentConv = conversations.find(c => c.id === parentCid);
      return parentConv?.otherUser?.uid === currentUser?.partnerId;
    }
    return otherUser?.uid === currentUser?.partnerId;
  }, [isCoach, parentCid, conversations, otherUser, currentUser]);

  // Check if the parent conversation is a group (for coach chats)
  const isParentGroup = React.useMemo(() => {
    if (isCoach && parentCid) {
      // Find the parent conversation
      const parentConv = conversations.find(c => c.id === parentCid);
      return parentConv?.isGroup || false;
    }
    return false;
  }, [isCoach, parentCid, conversations]);

  // Get parent conversation message count
  const [parentMessageCount, setParentMessageCount] = useState(0);

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
    analyzeBids,
    analyzeRuptureRepair,
    analyzeACR,
    analyzeSharedInterests,
    analyzeTopicChampion,
    generateFriendshipCheckin,
    analyzeGroupEnergy,
    analyzeTopicVibeCheck,
  } = useChatStore();

  // Local state
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [groupMembersData, setGroupMembersData] = useState<
    Record<string, User>
  >({});
  const [resolvedOtherUser, setResolvedOtherUser] = useState(otherUser);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();
  const messageCountRef = useRef<number>(messages.length);

  /**
   * Polling function for messages - only refreshes when data changes (no loading animations)
   */
  const pollMessages = useCallback(async () => {
    // console.log('🔄 ChatScreen: Silent polling messages for updates');
    try {
      await silentLoadMessages(conversationId);
    } catch (pollError) {
      console.error('❌ ChatScreen: Silent message polling failed:', pollError);
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

      void loadAndMarkDelivered().catch(loadError => {
        console.error(
          'Failed to load messages or mark as delivered:',
          loadError
        );
      });
    }, [conversationId, loadMessages, markAllMessagesAsDelivered])
  );

  /**
   * Resolve otherUser data when missing (e.g., when navigating from coach chat)
   */
  useEffect(() => {
    if (!isGroup && !isCoach && !resolvedOtherUser && conversationId) {
      // Find the conversation in the store
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation?.otherUser) {
        console.log('📱 ChatScreen: Resolved missing otherUser from store');
        setResolvedOtherUser(conversation.otherUser);
      }
    }
  }, [conversationId, isGroup, isCoach, resolvedOtherUser, conversations]);

  /**
   * Fetch group members data when in a group chat
   */
  useEffect(() => {
    if (isGroup && messages.length > 0) {
      const fetchGroupMembersData = async () => {
        const uniqueSenderIds = [...new Set(messages.map(m => m.senderId))];
        const membersData: Record<string, User> = {};

        for (const senderId of uniqueSenderIds) {
          if (!groupMembersData[senderId]) {
            try {
              const userData = await chatService.getUserData(senderId);
              if (userData) {
                membersData[senderId] = userData;
              }
            } catch (fetchError) {
              console.error(
                'Failed to fetch user data for:',
                senderId,
                fetchError
              );
            }
          }
        }

        if (Object.keys(membersData).length > 0) {
          setGroupMembersData(prev => ({ ...prev, ...membersData }));
        }
      };

      void fetchGroupMembersData();
    }
  }, [isGroup, messages, groupMembersData]);

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
    } catch (coachError) {
      console.error('❌ Failed to start coach chat:', coachError);
    }
  }, [conversationId, coachChatId, startCoachChat, navigation]);

  /**
   * Handle coach analysis option selection
   */
  const handleCoachAnalysis = useCallback(
    async (
      option:
        | 'ratio'
        | 'horsemen'
        | 'lovemap'
        | 'bids'
        | 'rupturerepair'
        | 'acr'
        | 'sharedinterests'
        | 'topicchampion'
        | 'friendshipcheckin'
        | 'groupenergy'
        | 'topicvibecheck'
    ) => {
      try {
        // Set loading state
        setIsAnalyzing(true);

        // Clear any existing timeout
        if (analysisTimeoutRef.current) {
          clearTimeout(analysisTimeoutRef.current);
        }

        // Set 10 second timeout
        analysisTimeoutRef.current = setTimeout(() => {
          setIsAnalyzing(false);
        }, 10000);

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
          case 'bids':
            await analyzeBids(conversationId, parentCid || '');
            console.log('✅ Bids analysis completed');
            break;
          case 'rupturerepair':
            await analyzeRuptureRepair(conversationId, parentCid || '');
            console.log('✅ Rupture and repair analysis completed');
            break;
          case 'acr':
            await analyzeACR(conversationId, parentCid || '');
            console.log('✅ ACR analysis completed');
            break;
          case 'sharedinterests':
            await analyzeSharedInterests(conversationId, parentCid || '');
            console.log('✅ Shared interests analysis completed');
            break;
          case 'topicchampion':
            await analyzeTopicChampion(conversationId, parentCid || '');
            console.log('✅ Topic champion analysis completed');
            break;
          case 'friendshipcheckin':
            await generateFriendshipCheckin(conversationId, parentCid || '');
            console.log('✅ Friendship check-in generated');
            break;
          case 'groupenergy':
            await analyzeGroupEnergy(conversationId, parentCid || '');
            console.log('✅ Group energy analysis completed');
            break;
          case 'topicvibecheck':
            await analyzeTopicVibeCheck(conversationId, parentCid || '');
            console.log('✅ Topic vibe check completed');
            break;
        }
      } catch (analysisError) {
        console.error('❌ Failed to perform coach analysis:', analysisError);
      }
    },
    [
      conversationId,
      parentCid,
      analyzeRatio,
      analyzeHorsemen,
      generateLoveMap,
      analyzeBids,
      analyzeRuptureRepair,
      analyzeACR,
      analyzeSharedInterests,
      analyzeTopicChampion,
      generateFriendshipCheckin,
      analyzeGroupEnergy,
      analyzeTopicVibeCheck,
    ]
  );

  /**
   * Handle analyze chat (legacy function for old analyze option)
   */
  const handleAnalyzeChat = useCallback(async () => {
    try {
      await analyzeChat(conversationId, parentCid || '', 30);
      console.log('✅ Chat analysis completed and posted to conversation');
    } catch (analyzeError) {
      console.error('❌ Failed to analyze chat:', analyzeError);
    }
  }, [conversationId, parentCid, analyzeChat]);

  /**
   * Set navigation title and back button
   */
  useEffect(() => {
    const title = isCoach
      ? 'Coach Chat'
      : isGroup
        ? groupTitle || 'Group Chat'
        : resolvedOtherUser?.displayName || 'Chat';

    navigation.setOptions({
      title,
      headerTitleStyle: {
        color: theme.colors.text || '#000000',
      },
      headerStyle: {
        backgroundColor: theme.colors.background || '#FFFFFF',
      },
      headerBackTitle: 'Chats',
      headerTintColor: theme.colors.primary || '#FFFC00',
      // Custom back button for non-coach chats to go directly to Chats screen
      ...(!isCoach && {
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              // Navigate directly to Chats list screen instead of going back
              navigation.navigate('ChatsList');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 16,
              paddingVertical: 8,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                color: theme.colors.primary || '#FFFC00',
                marginRight: 4,
              }}
            >
              ←
            </Text>
            <Text
              style={{
                fontSize: 17,
                color: theme.colors.primary || '#FFFC00',
              }}
            >
              Chats
            </Text>
          </TouchableOpacity>
        ),
      }),
      ...(isCoach &&
        parentCid && {
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                // Find parent conversation to get otherUser data
                const parentConversation = conversations.find(
                  c => c.id === parentCid
                );
                navigation.push('ChatScreen', {
                  conversationId: parentCid,
                  isCoach: false,
                  // Don't include parentCid at all instead of setting it to undefined
                  ...(parentConversation?.otherUser && {
                    otherUser: parentConversation.otherUser,
                  }),
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
              <Text
                style={{
                  fontSize: 17,
                  color: theme.colors.primary || '#FFFC00',
                  marginRight: 4,
                }}
              >
                ←
              </Text>
              <Text
                style={{
                  fontSize: 17,
                  color: theme.colors.primary || '#FFFC00',
                }}
              >
                Chat
              </Text>
            </TouchableOpacity>
          ),
        }),
      // Add Coach button for non-coach conversations, menu for coach chats
      headerRight: () => {
        if (isCoach) {
          // Show prompts button for all coach chats
          return (
            <TouchableOpacity
              onPress={() => {
                // Fetch parent message count when opening the modal
                void (async () => {
                  if (parentCid) {
                    const count =
                      await chatService.getConversationMessageCount(parentCid);
                    setParentMessageCount(count);
                  }
                  setShowCoachModal(true);
                })();
              }}
              style={{ marginRight: 16 }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.background,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  AI Analysis
                </Text>
              </View>
            </TouchableOpacity>
          );
        } else if (!isCoach) {
          // Show coach button for regular chats
          return (
            <TouchableOpacity
              onPress={() => void handleCoachPress()}
              style={{ marginRight: 16 }}
            >
              <Text style={{ fontSize: 24 }}>🎓</Text>
            </TouchableOpacity>
          );
        }
        return null;
      },
    });
  }, [
    navigation,
    resolvedOtherUser?.displayName,
    isGroup,
    groupTitle,
    theme,
    isCoach,
    parentCid,
    conversations,
    handleCoachPress,
    handleAnalyzeChat,
    isPartnerConversation,
  ]);

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
          animated: true,
        });
      }, 100);
    }
    if (isInitialLoad && messages.length > 0) {
      setIsInitialLoad(false);
    }
  }, [messages.length, isInitialLoad]);

  /**
   * Detect new coach messages and clear loading state
   */
  useEffect(() => {
    if (isCoach && messages.length > messageCountRef.current) {
      // New message arrived
      const lastMessage = messages[0]; // Messages are inverted
      if (lastMessage?.senderId === 'coach') {
        // Coach message arrived, clear loading state
        setIsAnalyzing(false);
        if (analysisTimeoutRef.current) {
          clearTimeout(analysisTimeoutRef.current);
        }
      }
    }
    messageCountRef.current = messages.length;
  }, [messages, isCoach]);

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
      } else if (resolvedOtherUser) {
        // Send message to individual user
        await sendTextMessage({
          text,
          recipientId: resolvedOtherUser.uid,
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
    } catch (sendError) {
      console.error('Failed to send message:', sendError);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [
    messageText,
    currentUser,
    resolvedOtherUser,
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
  const handleSendLoveMapQuestion = useCallback(
    async (question: string) => {
      if (!parentCid || !currentUser) return;

      try {
        // Send the question to the parent conversation
        await sendTextMessage({
          text: question,
          conversationId: parentCid,
        });

        console.log('✅ Love map question sent to parent conversation');

        // Navigate back to parent chat and scroll to bottom
        // Find parent conversation to get otherUser data
        const parentConversation = conversations.find(c => c.id === parentCid);
        navigation.push('ChatScreen', {
          conversationId: parentCid,
          isCoach: false,
          // Don't include parentCid at all instead of setting it to undefined
          ...(parentConversation?.otherUser && {
            otherUser: parentConversation.otherUser,
          }),
        });

        // Load messages and scroll to bottom after navigation
        setTimeout(() => {
          void loadMessages(parentCid).then(() => {
            setTimeout(() => {
              // With inverted list, offset 0 is the bottom
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
            }, 100);
          });
        }, 200);
      } catch (loveMapError) {
        console.error('❌ Failed to send love map question:', loveMapError);
        Alert.alert('Error', 'Failed to send question. Please try again.');
      }
    },
    [
      parentCid,
      currentUser,
      sendTextMessage,
      navigation,
      loadMessages,
      conversations,
    ]
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
   * Handle scroll-to-bottom button visibility
   */
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      // With inverted list, being at bottom means offset is near 0
      const isNearBottom = contentOffset.y <= 100;
      setShowScrollToBottom(!isNearBottom);
    },
    []
  );

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    // With inverted FlatList, scrollToOffset 0 goes to bottom
    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
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
      // Clear analysis timeout
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
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
          {...(isCoach && {
            onSendLoveMapQuestion: (question: string) =>
              void handleSendLoveMapQuestion(question),
          })}
          currentUser={currentUser}
          {...(resolvedOtherUser && { otherUser: resolvedOtherUser })}
          {...(typeof isGroup === 'boolean' && { isGroup })}
          {...(isGroup &&
            !isFromCurrentUser &&
            groupMembersData[item.senderId] && {
              senderData: groupMembersData[item.senderId],
            })}
        />
      );
    },
    [
      currentUser,
      resolvedOtherUser,
      handleSnapPress,
      isCoach,
      handleSendLoveMapQuestion,
      isGroup,
      groupMembersData,
    ]
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
            onPress={() => void loadMessages(conversationId)}
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
              { backgroundColor: '#6B73FF' }, // Distinct purple color
            ]}
            onPress={scrollToBottom}
            activeOpacity={0.7}
          >
            <Text style={[styles.scrollToBottomText, { color: '#FFFFFF' }]}>
              ↓
            </Text>
          </TouchableOpacity>
        )}

        {/* Loading Indicator for AI Analysis */}
        {isAnalyzing && isCoach && (
          <View
            style={[
              styles.analyzingContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <ActivityIndicator size='small' color={theme.colors.primary} />
            <Text
              style={[
                styles.analyzingText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Analyzing conversation...
            </Text>
          </View>
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
            testID='message-input'
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
            onPress={() => void handleSendMessage()}
            disabled={!messageText.trim() || isSending}
            activeOpacity={0.7}
            testID='send-button'
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
          onOptionSelect={option => void handleCoachAnalysis(option)}
          isRomantic={isPartnerConversation}
          isPlatonic={!isPartnerConversation && !(isGroup || isParentGroup)}
          isGroup={isGroup || isParentGroup}
          messageCount={parentMessageCount}
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
  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  analyzingText: {
    fontSize: 14,
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
