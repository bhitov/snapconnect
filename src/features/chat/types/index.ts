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
  recipientId: string;
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
  recipientId: string;
}

/**
 * Snap creation data (before upload)
 */
export interface SnapCreationData {
  recipientId: string;
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
 * Conversation interface (chat thread between two users)
 */
export interface Conversation {
  id: string;
  participants: [string, string]; // [userId1, userId2]
  lastMessageId?: string;
  lastMessageAt?: number;
  lastMessageType?: MessageType;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Conversation with user data populated
 */
export interface ConversationWithUser {
  id: string;
  otherUser: {
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
}

/**
 * Chat actions interface
 */
export interface ChatActions {
  // Conversations
  loadConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  createConversation: (otherUserId: string) => Promise<string>;

  // Messages
  loadMessages: (conversationId: string) => Promise<void>;
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

  // Error handling
  clearError: () => void;
  clearSendError: () => void;
  clearMessagesError: () => void;
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
  recipientId: string;
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
  recipientId: string;
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
  participants: [string, string];
  lastMessageId?: string;
  lastMessageAt?: number;
  lastMessageType?: MessageType;
  unreadCount: [number, number]; // [participant0_unread, participant1_unread]
  createdAt: number;
  updatedAt: number;
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
  details?: any;
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
  otherUser: {
    uid: string;
    username: string;
    displayName: string;
    photoURL?: string;
  };
}

export interface MessageItemProps {
  message: Message;
  isFromCurrentUser: boolean;
  onSnapPress?: (snap: SnapMessage) => void;
}
