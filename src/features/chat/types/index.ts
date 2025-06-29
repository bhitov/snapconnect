/**
 * @file index.ts
 * @description TypeScript type definitions for the chat/snap feature.
 * Defines interfaces for snaps, text messages, conversations, and chat operations.
 * Supports hybrid messaging with both ephemeral snaps and persistent text messages.
 */

/**
 * Message type - either text or snap
 */
export type MessageType = 'text' | 'snap';

/**
 * Snap media type
 */
export type SnapMediaType = 'photo' | 'video';

/**
 * Message status for both text and snaps
 */
export type MessageStatus = 'sent' | 'delivered' | 'viewed' | 'expired';

/**
 * Snap viewing duration (seconds)
 */
export type SnapDuration = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Base message interface - shared properties for all message types
 */
export interface BaseMessage {
  id: string;
  senderId: string;
  recipientId?: string; // Optional for group messages
  conversationId: string;
  type: MessageType;
  createdAt: number;
  status: MessageStatus;
  deliveredAt?: number;
  viewedAt?: number;
}

/**
 * Text message interface - persistent chat messages
 */
export interface TextMessage extends BaseMessage {
  type: 'text';
  text: string;
  // Text messages don't expire
}

/**
 * Snap message interface - ephemeral photo/video messages
 */
export interface SnapMessage extends BaseMessage {
  type: 'snap';
  mediaUrl: string;
  mediaType: SnapMediaType;
  textOverlay?: string;
  duration: SnapDuration; // viewing duration in seconds
  expiresAt: number; // 24 hours from creation
}

/**
 * Union type for all message types
 */
export type Message = TextMessage | SnapMessage;

/**
 * Legacy Snap interface for backward compatibility
 * @deprecated Use SnapMessage instead
 */
export interface Snap {
  id: string;
  senderId: string;
  recipientId: string;
  mediaUrl: string;
  mediaType: SnapMediaType;
  textOverlay?: string;
  duration: SnapDuration; // viewing duration in seconds
  createdAt: number;
  expiresAt: number; // 24 hours from creation
  status: MessageStatus;
  viewedAt?: number;
  deliveredAt?: number;
}

/**
 * Text message creation data
 */
export interface TextMessageCreationData {
  text: string;
  recipientId?: string; // Optional for group messages
  conversationId?: string; // For group messages
}

/**
 * Snap creation data (before upload)
 */
export interface SnapCreationData {
  recipientId?: string; // Optional for group messages
  conversationId?: string; // For group messages
  mediaUri: string; // local file URI
  mediaType: SnapMediaType;
  textOverlay?: string;
  duration: SnapDuration;
}

/**
 * Union type for message creation data
 */
export type MessageCreationData = TextMessageCreationData | SnapCreationData;

/**
 * Snap upload progress
 */
export interface SnapUploadProgress {
  snapId: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

/**
 * Group interface for group chats
 */
export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  members: Record<
    string,
    {
      role: 'admin' | 'member';
      joinedAt: number;
      addedBy: string;
    }
  >;
  avatarUrl?: string;
}

/**
 * Conversation interface (chat thread between users or groups)
 */
export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs (2 for DM, multiple for groups)
  lastMessageId?: string;
  lastMessageAt?: number;
  lastMessageType?: MessageType;
  unreadCount: number[]; // Array parallel to participants
  createdAt: number;
  updatedAt: number;
  // Group-specific fields
  isGroup?: boolean;
  groupId?: string;
  title?: string;
  avatarUrl?: string;
  // Coach-specific fields
  isCoach?: boolean;
  parentCid?: string;
  coachChatId?: string;
}

/**
 * Conversation with user data populated
 */
export interface ConversationWithUser {
  id: string;
  otherUser?: {
    uid: string;
    username: string;
    displayName: string;
    photoURL?: string;
  };
  lastMessage?: {
    id: string;
    senderId: string;
    type: MessageType;
    text?: string; // For text messages
    mediaType?: SnapMediaType; // For snaps
    createdAt: number;
    status: MessageStatus;
  };
  unreadCount: number;
  updatedAt: number;
  // Group-specific fields
  isGroup?: boolean;
  groupId?: string;
  title?: string;
  avatarUrl?: string;
  participants?: string[];
  // Coach-specific fields
  isCoach?: boolean;
  parentCid?: string;
  coachChatId?: string;
}

/**
 * Snap sending form data
 */
export interface SendSnapData {
  recipientIds: string[]; // Support multiple recipients
  duration: SnapDuration;
}

/**
 * Snap viewing session
 */
export interface SnapViewingSession {
  snapId: string;
  startTime: number;
  isPaused: boolean;
  remainingTime: number;
  totalDuration: number;
}

/**
 * Chat store state interface
 */
export interface ChatState {
  // Conversations
  conversations: ConversationWithUser[];
  conversationsLoading: boolean;
  conversationsError: string | null;

  // Current conversation
  currentConversation: ConversationWithUser | null;
  currentMessages: Message[]; // Changed from currentSnaps to currentMessages
  messagesLoading: boolean;
  messagesError: string | null;

  // Message sending
  sendingMessages: SnapUploadProgress[]; // For now, only snaps have upload progress
  sendError: string | null;

  // Snap viewing
  viewingSession: SnapViewingSession | null;

  // UI state
  selectedRecipients: string[];
  isRefreshing: boolean;

  // Group creation
  groupCreationState: {
    title: string;
    selectedMembers: string[];
    isCreating: boolean;
  };
}

/**
 * Chat actions interface
 */
export interface ChatActions {
  // Conversations
  loadConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  silentRefreshConversations: () => Promise<void>;
  createConversation: (otherUserId: string) => Promise<string>;

  // Groups
  createGroup: (
    name: string,
    memberIds: string[],
    avatarUrl?: string
  ) => Promise<string>;
  addUsersToGroup: (groupId: string, userIds: string[]) => Promise<void>;
  removeUserFromGroup: (groupId: string, userId: string) => Promise<void>;
  updateGroupTitle: (groupId: string, title: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;

  // Messages
  loadMessages: (conversationId: string) => Promise<void>;
  silentLoadMessages: (conversationId: string) => Promise<void>;
  sendTextMessage: (data: TextMessageCreationData) => Promise<void>;
  sendSnap: (data: SnapCreationData) => Promise<void>;
  markMessageAsViewed: (messageId: string) => Promise<void>;
  markMessageAsDelivered: (messageId: string) => Promise<void>;
  markAllMessagesAsDelivered: (conversationId: string) => Promise<void>;

  // Snap viewing (legacy - for snap messages only)
  startViewingSnap: (snap: SnapMessage) => void;
  pauseViewingSnap: () => void;
  resumeViewingSnap: () => void;
  stopViewingSnap: () => void;

  // Recipient selection
  setSelectedRecipients: (recipients: string[]) => void;
  addRecipient: (recipientId: string) => void;
  removeRecipient: (recipientId: string) => void;
  clearRecipients: () => void;

  // Group creation UI
  setGroupTitle: (title: string) => void;
  setGroupMembers: (memberIds: string[]) => void;
  addGroupMember: (memberId: string) => void;
  removeGroupMember: (memberId: string) => void;
  resetGroupCreation: () => void;

  // Error handling
  clearError: () => void;
  clearSendError: () => void;
  clearMessagesError: () => void;

  // Coach
  startCoachChat: (parentCid: string) => Promise<string>;
  sendCoachMessage: (
    coachCid: string,
    parentCid: string,
    text: string
  ) => Promise<void>;
  analyzeChat: (
    coachCid: string,
    parentCid: string,
    messageCount?: number
  ) => Promise<void>;
  analyzeRatio: (coachCid: string, parentCid: string) => Promise<void>;
  analyzeHorsemen: (coachCid: string, parentCid: string) => Promise<void>;
  generateLoveMap: (coachCid: string, parentCid: string) => Promise<void>;
  analyzeBids: (coachCid: string, parentCid: string) => Promise<void>;
  analyzeRuptureRepair: (coachCid: string, parentCid: string) => Promise<void>;
  analyzeACR: (coachCid: string, parentCid: string) => Promise<void>;
  analyzeSharedInterests: (coachCid: string, parentCid: string) => Promise<void>;
  analyzeTopicChampion: (coachCid: string, parentCid: string) => Promise<void>;
  generateFriendshipCheckin: (coachCid: string, parentCid: string) => Promise<void>;
  analyzeGroupEnergy: (coachCid: string, parentCid: string) => Promise<void>;
  analyzeTopicVibeCheck: (coachCid: string, parentCid: string) => Promise<void>;
}

/**
 * Complete chat store interface
 */
export interface ChatStore extends ChatState, ChatActions {}

/**
 * Firebase text message document structure
 */
export interface TextMessageDocument {
  senderId: string;
  recipientId?: string; // Nullable for group messages
  conversationId: string;
  text: string;
  createdAt: number;
  status: MessageStatus;
  deliveredAt?: number;
  viewedAt?: number;
}

/**
 * Firebase snap document structure
 */
export interface SnapDocument {
  senderId: string;
  recipientId?: string; // Nullable for group messages
  conversationId: string;
  mediaUrl: string;
  mediaType: SnapMediaType;
  textOverlay?: string;
  duration: SnapDuration;
  createdAt: number;
  expiresAt: number;
  status: MessageStatus;
  viewedAt?: number;
  deliveredAt?: number;
}

/**
 * Firebase conversation document structure
 */
export interface ConversationDocument {
  participants: string[];
  lastMessageId?: string;
  lastMessageAt?: number;
  lastMessageType?: MessageType;
  unreadCount: number[]; // Array parallel to participants
  createdAt: number;
  updatedAt: number;
  // Group-specific fields
  isGroup?: boolean;
  groupId?: string;
  title?: string;
  avatarUrl?: string;
  // Coach-specific fields
  isCoach?: boolean;
  parentCid?: string;
  coachChatId?: string;
}

/**
 * Chat service error types
 */
export type ChatErrorType =
  | 'upload_failed'
  | 'send_failed'
  | 'load_failed'
  | 'conversation_not_found'
  | 'message_not_found'
  | 'permission_denied'
  | 'storage_error'
  | 'network_error'
  | 'unknown';

/**
 * Chat error interface
 */
export interface ChatError {
  type: ChatErrorType;
  message: string;
  details?: unknown;
}

/**
 * Component prop interfaces
 */
export interface RecipientSelectionProps {
  mediaUri: string;
  mediaType: SnapMediaType;
  textOverlay?: string;
}

export interface ConversationItemProps {
  conversation: ConversationWithUser;
  onPress: (conversation: ConversationWithUser) => void;
}

export interface SnapViewerProps {
  snapId: string;
}

export interface SnapTimerProps {
  duration: number;
  onComplete: () => void;
  isPaused: boolean;
}

export interface ChatScreenProps {
  conversationId: string;
  otherUser?: {
    uid: string;
    username: string;
    displayName: string;
    photoURL?: string;
  };
  // Group-specific props
  isGroup?: boolean;
  groupTitle?: string;
  groupId?: string;
  // Coach-specific props
  isCoach?: boolean;
  parentCid?: string;
  coachChatId?: string;
}

export interface MessageItemProps {
  message: Message;
  isFromCurrentUser: boolean;
  onSnapPress?: (snap: SnapMessage) => void;
  isCoachChat?: boolean;
  onSendLoveMapQuestion?: (question: string) => void;
}
