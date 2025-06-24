/**
 * @file index.ts
 * @description TypeScript type definitions for the friends feature.
 * Defines interfaces for friend requests, friendships, and friend-related operations.
 */

/**
 * Friend request status
 */
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Friendship status between two users
 */
export type FriendshipStatus = 
  | 'none'           // No relationship
  | 'request_sent'   // Current user sent request
  | 'request_received' // Current user received request
  | 'friends'        // Already friends
  | 'blocked';       // User is blocked

/**
 * Friend request interface
 */
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderPhotoURL?: string;
  receiverUsername: string;
  receiverDisplayName: string;
  receiverPhotoURL?: string;
  status: FriendRequestStatus;
  createdAt: number;
  updatedAt: number;
  message?: string; // Optional message with friend request
}

/**
 * Friendship interface
 */
export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Username: string;
  user2Username: string;
  user1DisplayName: string;
  user2DisplayName: string;
  user1PhotoURL?: string;
  user2PhotoURL?: string;
  createdAt: number;
  lastInteraction?: number;
}

/**
 * Friend profile interface (simplified user data for friends list)
 */
export interface FriendProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  lastActive?: number;
  isOnline?: boolean;
  friendshipId: string;
  friendsSince: number;
}

/**
 * Friend search result interface
 */
export interface FriendSearchResult {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  friendshipStatus: FriendshipStatus;
  mutualFriends?: number;
  lastActive?: number;
}

/**
 * Friend request form data
 */
export interface SendFriendRequestData {
  receiverId: string;
  message?: string;
}

/**
 * Friend request response data
 */
export interface FriendRequestResponse {
  requestId: string;
  action: 'accept' | 'reject';
}

/**
 * Friends store state interface
 */
export interface FriendsState {
  // Friends list
  friends: FriendProfile[];
  friendsLoading: boolean;
  friendsError: string | null;

  // Friend requests
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];
  requestsLoading: boolean;
  requestsError: string | null;

  // Search
  searchResults: FriendSearchResult[];
  searchLoading: boolean;
  searchError: string | null;
  searchQuery: string;

  // UI state
  selectedFriend: FriendProfile | null;
  isRefreshing: boolean;
}

/**
 * Friends actions interface
 */
export interface FriendsActions {
  // Friends list
  loadFriends: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  
  // Friend requests
  loadFriendRequests: () => Promise<void>;
  sendFriendRequest: (data: SendFriendRequestData) => Promise<void>;
  respondToFriendRequest: (response: FriendRequestResponse) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  
  // Search
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Friend management
  removeFriend: (friendshipId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  
  // UI actions
  setSelectedFriend: (friend: FriendProfile | null) => void;
  clearError: () => void;
}

/**
 * Complete friends store interface
 */
export interface FriendsStore extends FriendsState, FriendsActions {}

/**
 * Friend request notification data
 */
export interface FriendRequestNotification {
  id: string;
  type: 'friend_request_received' | 'friend_request_accepted';
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderPhotoURL?: string;
  createdAt: number;
  read: boolean;
}

/**
 * Friends service error types
 */
export type FriendsErrorType =
  | 'user_not_found'
  | 'request_already_sent'
  | 'already_friends'
  | 'cannot_add_self'
  | 'request_not_found'
  | 'friendship_not_found'
  | 'permission_denied'
  | 'network_error'
  | 'unknown';

/**
 * Friends service error interface
 */
export interface FriendsError {
  type: FriendsErrorType;
  message: string;
  code?: string;
}

/**
 * Firebase friend request document structure
 */
export interface FriendRequestDocument {
  senderId: string;
  receiverId: string;
  senderData: {
    username: string;
    displayName: string;
    photoURL?: string;
  };
  receiverData: {
    username: string;
    displayName: string;
    photoURL?: string;
  };
  status: FriendRequestStatus;
  createdAt: number;
  updatedAt: number;
  message?: string | undefined;
}

/**
 * Firebase friendship document structure
 */
export interface FriendshipDocument {
  user1Id: string;
  user2Id: string;
  user1Data: {
    username: string;
    displayName: string;
    photoURL?: string;
  };
  user2Data: {
    username: string;
    displayName: string;
    photoURL?: string;
  };
  createdAt: number;
  lastInteraction?: number;
}

/**
 * Friend list item props
 */
export interface FriendListItemProps {
  friend: FriendProfile;
  onPress: (friend: FriendProfile) => void;
  onLongPress?: (friend: FriendProfile) => void;
  showOnlineStatus?: boolean;
}

/**
 * Friend request item props
 */
export interface FriendRequestItemProps {
  request: FriendRequest;
  type: 'sent' | 'received';
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}

/**
 * Search result item props
 */
export interface SearchResultItemProps {
  result: FriendSearchResult;
  onAddFriend: (userId: string) => void;
  onViewProfile: (userId: string) => void;
} 