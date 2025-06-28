/**
 * @file friendsService.ts
 * @description Firebase service for friends system operations.
 * Handles friend requests, friendships, user search, and related Firebase operations.
 */

import { getAuth } from 'firebase/auth';
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  startAt,
  endAt,
  limitToFirst,
  onValue,
  off,
  type DataSnapshot,
} from 'firebase/database';

import { generateId } from '@/shared/utils/idGenerator';

import {
  FriendRequest,
  Friendship,
  FriendProfile,
  FriendSearchResult,
  FriendRequestDocument,
  FriendshipDocument,
  SendFriendRequestData,
  FriendRequestResponse,
  FriendshipStatus,
  FriendsError,
} from '../types';

import type { User } from '@/features/auth/types/authTypes';
import type { FirebaseError } from 'firebase/app';

/**
 * Friends service class
 */
class FriendsService {
  private database = getDatabase();
  private auth = getAuth();

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  /**
   * Handle Firebase errors with user-friendly messages
   */
  private handleError(error: unknown): FriendsError {
    console.error('❌ FriendsService: Error:', error);

    if (error instanceof Error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code) {
        switch (firebaseError.code) {
          case 'PERMISSION_DENIED':
            return {
              type: 'permission_denied',
              message: 'You do not have permission to perform this action.',
              code: firebaseError.code,
            };
          case 'NETWORK_ERROR':
            return {
              type: 'network_error',
              message: 'Network error. Please check your connection.',
              code: firebaseError.code,
            };
          default:
            return {
              type: 'unknown',
              message: error.message || 'An unexpected error occurred.',
              code: firebaseError.code,
            };
        }
      }

      return {
        type: 'unknown',
        message: error.message || 'An unexpected error occurred.',
      };
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred.',
    };
  }

  /**
   * Search users by username
   */
  async searchUsers(searchQuery: string): Promise<FriendSearchResult[]> {
    console.log('🔍 FriendsService: Searching users with query:', searchQuery);

    try {
      const currentUserId = this.getCurrentUserId();
      const usersRef = ref(this.database, 'users');

      // Search by username (case-insensitive)
      const searchLower = searchQuery.toLowerCase();
      const usersQuery = query(
        usersRef,
        orderByChild('username'),
        startAt(searchLower),
        endAt(`${searchLower}\uf8ff`),
        limitToFirst(20)
      );

      const snapshot = await get(usersQuery);

      if (!snapshot.exists()) {
        console.log('🔍 FriendsService: No users found');
        return [];
      }

      const users = snapshot.val();
      const results: FriendSearchResult[] = [];

      // Process each user and determine friendship status
      for (const [userId, userData] of Object.entries(
        users as Record<string, User>
      )) {
        // Skip current user
        if (userId === currentUserId) continue;

        const friendshipStatus = await this.getFriendshipStatus(userId);

        results.push({
          uid: userId,
          username: userData.username,
          displayName: userData.displayName,
          ...(userData.photoURL && { photoURL: userData.photoURL }),
          friendshipStatus,
          lastActive: userData.lastActive,
        });
      }

      console.log('✅ FriendsService: Found', results.length, 'users');
      return results;
    } catch (error) {
      console.error('❌ FriendsService: Search failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get friendship status between current user and target user
   */
  async getFriendshipStatus(targetUserId: string): Promise<FriendshipStatus> {
    try {
      const currentUserId = this.getCurrentUserId();

      // Check if already friends
      const friendshipExists = await this.checkFriendshipExists(
        currentUserId,
        targetUserId
      );
      if (friendshipExists) {
        return 'friends';
      }

      // Check for pending friend requests
      const sentRequest = await this.checkFriendRequestExists(
        currentUserId,
        targetUserId
      );
      if (sentRequest) {
        return 'request_sent';
      }

      const receivedRequest = await this.checkFriendRequestExists(
        targetUserId,
        currentUserId
      );
      if (receivedRequest) {
        return 'request_received';
      }

      return 'none';
    } catch (error) {
      console.error(
        '❌ FriendsService: Failed to get friendship status:',
        error
      );
      return 'none';
    }
  }

  /**
   * Check if friendship exists between two users
   */
  private async checkFriendshipExists(
    user1Id: string,
    user2Id: string
  ): Promise<boolean> {
    const friendshipsRef = ref(this.database, 'friendships');

    // Check both possible friendship combinations
    const query1 = query(
      friendshipsRef,
      orderByChild('user1Id'),
      equalTo(user1Id)
    );
    const query2 = query(
      friendshipsRef,
      orderByChild('user2Id'),
      equalTo(user1Id)
    );

    const [snapshot1, snapshot2] = await Promise.all([
      get(query1),
      get(query2),
    ]);

    // Check if any friendship involves both users
    const checkSnapshot = (snapshot: DataSnapshot, otherUserId: string) => {
      if (!snapshot.exists()) return false;

      const friendships = snapshot.val();
      return Object.values(
        friendships as Record<string, FriendshipDocument>
      ).some(
        friendship =>
          (friendship.user1Id === user1Id && friendship.user2Id === user2Id) ||
          (friendship.user1Id === user2Id && friendship.user2Id === user1Id)
      );
    };

    return (
      checkSnapshot(snapshot1, user2Id) || checkSnapshot(snapshot2, user2Id)
    );
  }

  /**
   * Check if friend request exists
   */
  private async checkFriendRequestExists(
    senderId: string,
    receiverId: string
  ): Promise<boolean> {
    const requestsRef = ref(this.database, 'friendRequests');
    const requestQuery = query(
      requestsRef,
      orderByChild('senderId'),
      equalTo(senderId)
    );

    const snapshot = await get(requestQuery);

    if (!snapshot.exists()) return false;

    const requests = snapshot.val();
    return Object.values(
      requests as Record<string, FriendRequestDocument>
    ).some(
      request =>
        request.receiverId === receiverId && request.status === 'pending'
    );
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(data: SendFriendRequestData): Promise<void> {
    console.log(
      '📤 FriendsService: Sending friend request to:',
      data.receiverId
    );

    try {
      const currentUserId = this.getCurrentUserId();

      // Prevent sending request to self
      if (currentUserId === data.receiverId) {
        throw {
          type: 'cannot_add_self',
          message: 'You cannot send a friend request to yourself.',
        };
      }

      // Check if request already exists
      const requestExists = await this.checkFriendRequestExists(
        currentUserId,
        data.receiverId
      );
      if (requestExists) {
        throw {
          type: 'request_already_sent',
          message: 'Friend request already sent to this user.',
        };
      }

      // Check if already friends
      const friendshipExists = await this.checkFriendshipExists(
        currentUserId,
        data.receiverId
      );
      if (friendshipExists) {
        throw {
          type: 'already_friends',
          message: 'You are already friends with this user.',
        };
      }

      // Get user data for both users
      const [senderData, receiverData] = await Promise.all([
        this.getUserData(currentUserId),
        this.getUserData(data.receiverId),
      ]);

      if (!receiverData) {
        throw {
          type: 'user_not_found',
          message: 'User not found.',
        };
      }

      // Create friend request - filter out undefined values for Firebase
      const requestId = generateId();
      const requestData: FriendRequestDocument = {
        senderId: currentUserId,
        receiverId: data.receiverId,
        senderData: {
          username: senderData?.username || '',
          displayName: senderData?.displayName || '',
          ...(senderData?.photoURL && { photoURL: senderData.photoURL }),
        },
        receiverData: {
          username: receiverData.username || '',
          displayName: receiverData.displayName || '',
          ...(receiverData.photoURL && { photoURL: receiverData.photoURL }),
        },
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...(data.message && { message: data.message }),
      };

      const requestRef = ref(this.database, `friendRequests/${requestId}`);
      await set(requestRef, requestData);

      console.log('✅ FriendsService: Friend request sent successfully');
    } catch (error) {
      console.error('❌ FriendsService: Failed to send friend request:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user data by ID
   */
  private async getUserData(userId: string): Promise<User | null> {
    const userRef = ref(this.database, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? (snapshot.val() as User) : null;
  }

  /**
   * Respond to friend request (accept/reject)
   */
  async respondToFriendRequest(response: FriendRequestResponse): Promise<void> {
    console.log(
      '📨 FriendsService: Responding to friend request:',
      response.requestId,
      response.action
    );

    try {
      const requestRef = ref(
        this.database,
        `friendRequests/${response.requestId}`
      );
      const snapshot = await get(requestRef);

      if (!snapshot.exists()) {
        throw {
          type: 'request_not_found',
          message: 'Friend request not found.',
        };
      }

      const requestData = snapshot.val() as FriendRequestDocument;

      // If accepted, create friendship first
      if (response.action === 'accept') {
        await this.createFriendship(requestData);
      }

      // Remove the friend request (whether accepted or rejected)
      await remove(requestRef);

      console.log(
        '✅ FriendsService: Friend request',
        response.action,
        'successfully'
      );
    } catch (error) {
      console.error(
        '❌ FriendsService: Failed to respond to friend request:',
        error
      );
      throw this.handleError(error);
    }
  }

  /**
   * Create friendship from accepted request
   */
  private async createFriendship(
    requestData: FriendRequestDocument
  ): Promise<void> {
    const friendshipId = generateId();
    const friendshipData: FriendshipDocument = {
      user1Id: requestData.senderId,
      user2Id: requestData.receiverId,
      user1Data: requestData.senderData,
      user2Data: requestData.receiverData,
      createdAt: Date.now(),
    };

    const friendshipRef = ref(this.database, `friendships/${friendshipId}`);
    await set(friendshipRef, friendshipData);
  }

  /**
   * Cancel friend request
   */
  async cancelFriendRequest(requestId: string): Promise<void> {
    console.log('❌ FriendsService: Canceling friend request:', requestId);

    try {
      const requestRef = ref(this.database, `friendRequests/${requestId}`);
      await remove(requestRef);

      console.log('✅ FriendsService: Friend request canceled successfully');
    } catch (error) {
      console.error(
        '❌ FriendsService: Failed to cancel friend request:',
        error
      );
      throw this.handleError(error);
    }
  }

  /**
   * Get friends list for current user
   */
  async getFriends(): Promise<FriendProfile[]> {
    console.log('👥 FriendsService: Loading friends list');

    try {
      const currentUserId = this.getCurrentUserId();
      const friendshipsRef = ref(this.database, 'friendships');

      // Get all friendships involving current user
      const snapshot = await get(friendshipsRef);

      if (!snapshot.exists()) {
        console.log('👥 FriendsService: No friendships found');
        return [];
      }

      const friendships = snapshot.val();
      const friends: FriendProfile[] = [];

      for (const [friendshipId, friendship] of Object.entries(
        friendships as Record<string, FriendshipDocument>
      )) {
        let friendData: {
          username: string;
          displayName: string;
          photoURL?: string;
        };
        let friendId: string;

        // Determine which user is the friend
        if (friendship.user1Id === currentUserId) {
          friendData = friendship.user2Data;
          friendId = friendship.user2Id;
        } else if (friendship.user2Id === currentUserId) {
          friendData = friendship.user1Data;
          friendId = friendship.user1Id;
        } else {
          continue; // This friendship doesn't involve current user
        }

        // Fetch current user data to get latest photoURL
        const currentUserData = await this.getUserData(friendId);

        friends.push({
          uid: friendId,
          username: currentUserData?.username || friendData.username,
          displayName: currentUserData?.displayName || friendData.displayName,
          ...(currentUserData?.photoURL && {
            photoURL: currentUserData.photoURL,
          }),
          friendshipId,
          friendsSince: friendship.createdAt,
        });
      }

      console.log('✅ FriendsService: Loaded', friends.length, 'friends');
      return friends;
    } catch (error) {
      console.error('❌ FriendsService: Failed to load friends:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get friend requests for current user
   */
  async getFriendRequests(): Promise<{
    sent: FriendRequest[];
    received: FriendRequest[];
  }> {
    console.log('📨 FriendsService: Loading friend requests');

    try {
      const currentUserId = this.getCurrentUserId();
      const requestsRef = ref(this.database, 'friendRequests');

      const snapshot = await get(requestsRef);

      if (!snapshot.exists()) {
        console.log('📨 FriendsService: No friend requests found');
        return { sent: [], received: [] };
      }

      const requests = snapshot.val();
      const sent: FriendRequest[] = [];
      const received: FriendRequest[] = [];

      for (const [requestId, request] of Object.entries(
        requests as Record<string, FriendRequestDocument>
      )) {
        const friendRequest: FriendRequest = {
          id: requestId,
          senderId: request.senderId,
          receiverId: request.receiverId,
          senderUsername: request.senderData.username,
          senderDisplayName: request.senderData.displayName,
          receiverUsername: request.receiverData.username,
          receiverDisplayName: request.receiverData.displayName,
          status: request.status,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          ...(request.senderData.photoURL && {
            senderPhotoURL: request.senderData.photoURL,
          }),
          ...(request.receiverData.photoURL && {
            receiverPhotoURL: request.receiverData.photoURL,
          }),
          ...(request.message && { message: request.message }),
        };

        if (
          request.senderId === currentUserId &&
          request.status === 'pending'
        ) {
          sent.push(friendRequest);
        } else if (
          request.receiverId === currentUserId &&
          request.status === 'pending'
        ) {
          received.push(friendRequest);
        }
      }

      console.log(
        '✅ FriendsService: Loaded',
        sent.length,
        'sent and',
        received.length,
        'received requests'
      );
      return { sent, received };
    } catch (error) {
      console.error(
        '❌ FriendsService: Failed to load friend requests:',
        error
      );
      throw this.handleError(error);
    }
  }

  /**
   * Remove friend
   */
  async removeFriend(friendshipId: string): Promise<void> {
    console.log('💔 FriendsService: Removing friend:', friendshipId);

    try {
      const friendshipRef = ref(this.database, `friendships/${friendshipId}`);
      await remove(friendshipRef);

      console.log('✅ FriendsService: Friend removed successfully');
    } catch (error) {
      console.error('❌ FriendsService: Failed to remove friend:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Set up real-time listener for friend requests
   */
  onFriendRequestsChange(
    callback: (requests: {
      sent: FriendRequest[];
      received: FriendRequest[];
    }) => void
  ): () => void {
    const currentUserId = this.getCurrentUserId();
    const requestsRef = ref(this.database, 'friendRequests');

    const unsubscribe = onValue(requestsRef, snapshot => {
      if (!snapshot.exists()) {
        callback({ sent: [], received: [] });
        return;
      }

      const requests = snapshot.val();
      const sent: FriendRequest[] = [];
      const received: FriendRequest[] = [];

      for (const [requestId, request] of Object.entries(
        requests as Record<string, FriendRequestDocument>
      )) {
        const friendRequest: FriendRequest = {
          id: requestId,
          senderId: request.senderId,
          receiverId: request.receiverId,
          senderUsername: request.senderData.username,
          senderDisplayName: request.senderData.displayName,
          receiverUsername: request.receiverData.username,
          receiverDisplayName: request.receiverData.displayName,
          status: request.status,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          ...(request.senderData.photoURL && {
            senderPhotoURL: request.senderData.photoURL,
          }),
          ...(request.receiverData.photoURL && {
            receiverPhotoURL: request.receiverData.photoURL,
          }),
          ...(request.message && { message: request.message }),
        };

        if (
          request.senderId === currentUserId &&
          request.status === 'pending'
        ) {
          sent.push(friendRequest);
        } else if (
          request.receiverId === currentUserId &&
          request.status === 'pending'
        ) {
          received.push(friendRequest);
        }
      }

      callback({ sent, received });
    });

    return () => off(requestsRef, 'value', unsubscribe);
  }

  /**
   * Set up real-time listener for friends list
   */
  onFriendsChange(callback: (friends: FriendProfile[]) => void): () => void {
    const currentUserId = this.getCurrentUserId();
    const friendshipsRef = ref(this.database, 'friendships');

    const unsubscribe = onValue(friendshipsRef, async snapshot => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const friendships = snapshot.val();
      const friends: FriendProfile[] = [];

      for (const [friendshipId, friendship] of Object.entries(
        friendships as Record<string, FriendshipDocument>
      )) {
        let friendData: {
          username: string;
          displayName: string;
          photoURL?: string;
        };
        let friendId: string;

        if (friendship.user1Id === currentUserId) {
          friendData = friendship.user2Data;
          friendId = friendship.user2Id;
        } else if (friendship.user2Id === currentUserId) {
          friendData = friendship.user1Data;
          friendId = friendship.user1Id;
        } else {
          continue;
        }

        // Fetch current user data to get latest photoURL
        const currentUserData = await this.getUserData(friendId);

        friends.push({
          uid: friendId,
          username: currentUserData?.username || friendData.username,
          displayName: currentUserData?.displayName || friendData.displayName,
          ...(currentUserData?.photoURL && {
            photoURL: currentUserData.photoURL,
          }),
          friendshipId,
          friendsSince: friendship.createdAt,
        });
      }

      callback(friends);
    });

    return () => off(friendshipsRef, 'value', unsubscribe);
  }
}

// Export singleton instance
export const friendsService = new FriendsService();
