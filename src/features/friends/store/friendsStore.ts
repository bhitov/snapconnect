/**
 * @file friendsStore.ts
 * @description Zustand store for friends system state management.
 * Handles friends list, friend requests, search, and related UI state.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import {
  FriendsStore,
  FriendProfile,
  FriendRequest,
  FriendSearchResult,
  SendFriendRequestData,
  FriendRequestResponse,
} from '../types';
import { friendsService } from '../services/friendsService';

/**
 * Initial state for friends store
 */
const initialState = {
  // Friends list
  friends: [],
  friendsLoading: false,
  friendsError: null,

  // Friend requests
  sentRequests: [],
  receivedRequests: [],
  requestsLoading: false,
  requestsError: null,

  // Search
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchQuery: '',

  // UI state
  selectedFriend: null,
  isRefreshing: false,
};

/**
 * Friends store with Zustand
 */
export const useFriendsStore = create<FriendsStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    /**
     * Load friends list
     */
    loadFriends: async () => {
      console.log('👥 FriendsStore: Loading friends list');
      
      set({ friendsLoading: true, friendsError: null });

      try {
        const friends = await friendsService.getFriends();
        
        set({ 
          friends,
          friendsLoading: false,
          friendsError: null,
        });

        console.log('✅ FriendsStore: Friends loaded successfully:', friends.length);
      } catch (error: any) {
        console.error('❌ FriendsStore: Failed to load friends:', error);
        
        set({ 
          friendsLoading: false,
          friendsError: error.message || 'Failed to load friends',
        });
      }
    },

    /**
     * Refresh friends list
     */
    refreshFriends: async () => {
      console.log('🔄 FriendsStore: Refreshing friends list');
      
      set({ isRefreshing: true });

      try {
        const friends = await friendsService.getFriends();
        
        set({ 
          friends,
          isRefreshing: false,
          friendsError: null,
        });

        console.log('✅ FriendsStore: Friends refreshed successfully');
      } catch (error: any) {
        console.error('❌ FriendsStore: Failed to refresh friends:', error);
        
        set({ 
          isRefreshing: false,
          friendsError: error.message || 'Failed to refresh friends',
        });
      }
    },

    /**
     * Load friend requests
     */
    loadFriendRequests: async () => {
      console.log('📨 FriendsStore: Loading friend requests');
      
      set({ requestsLoading: true, requestsError: null });

      try {
        const { sent, received } = await friendsService.getFriendRequests();
        
        set({ 
          sentRequests: sent,
          receivedRequests: received,
          requestsLoading: false,
          requestsError: null,
        });

        console.log('✅ FriendsStore: Friend requests loaded successfully');
      } catch (error: any) {
        console.error('❌ FriendsStore: Failed to load friend requests:', error);
        
        set({ 
          requestsLoading: false,
          requestsError: error.message || 'Failed to load friend requests',
        });
      }
    },

    /**
     * Send friend request
     */
    sendFriendRequest: async (data: SendFriendRequestData) => {
      console.log('📤 FriendsStore: Sending friend request to:', data.receiverId);

      try {
        await friendsService.sendFriendRequest(data);

        // Reload friend requests to get updated state
        await get().loadFriendRequests();

        // Update search results to reflect new status
        const { searchResults } = get();
        const updatedResults = searchResults.map(result => 
          result.uid === data.receiverId 
            ? { ...result, friendshipStatus: 'request_sent' as const }
            : result
        );
        
        set({ searchResults: updatedResults });

        console.log('✅ FriendsStore: Friend request sent successfully');
      } catch (error: any) {
        console.error('❌ FriendsStore: Failed to send friend request:', error);
        
        set({ 
          requestsError: error.message || 'Failed to send friend request',
        });

        throw error; // Re-throw for UI handling
      }
    },

    /**
     * Respond to friend request (accept/reject)
     */
    respondToFriendRequest: async (response: FriendRequestResponse) => {
      console.log('📨 FriendsStore: Responding to friend request:', response.action);

      try {
        await friendsService.respondToFriendRequest(response);

        // Reload both friend requests and friends list
        await Promise.all([
          get().loadFriendRequests(),
          get().loadFriends(),
        ]);

        console.log('✅ FriendsStore: Friend request response sent successfully');
      } catch (error: any) {
        console.error('❌ FriendsStore: Failed to respond to friend request:', error);
        
        set({ 
          requestsError: error.message || 'Failed to respond to friend request',
        });

        throw error; // Re-throw for UI handling
      }
    },

    /**
     * Cancel friend request
     */
    cancelFriendRequest: async (requestId: string) => {
      console.log('❌ FriendsStore: Canceling friend request:', requestId);

      try {
        await friendsService.cancelFriendRequest(requestId);

        // Reload friend requests to get updated state
        await get().loadFriendRequests();

        console.log('✅ FriendsStore: Friend request canceled successfully');
      } catch (error: any) {
        console.error('❌ FriendsStore: Failed to cancel friend request:', error);
        
        set({ 
          requestsError: error.message || 'Failed to cancel friend request',
        });

        throw error; // Re-throw for UI handling
      }
    },

    /**
     * Search users
     */
    searchUsers: async (query: string) => {
      console.log('🔍 FriendsStore: Searching users with query:', query);

      // Don't search for empty queries
      if (!query.trim()) {
        set({ 
          searchResults: [],
          searchQuery: '',
          searchError: null,
        });
        return;
      }

      set({ 
        searchLoading: true, 
        searchError: null,
        searchQuery: query,
      });

      try {
        const results = await friendsService.searchUsers(query);
        
        set({ 
          searchResults: results,
          searchLoading: false,
          searchError: null,
        });

        console.log('✅ FriendsStore: Search completed with', results.length, 'results');
      } catch (error: any) {
        console.error('❌ FriendsStore: Search failed:', error);
        
        set({ 
          searchLoading: false,
          searchError: error.message || 'Search failed',
          searchResults: [],
        });
      }
    },

    /**
     * Clear search results
     */
    clearSearch: () => {
      console.log('🧹 FriendsStore: Clearing search results');
      
      set({ 
        searchResults: [],
        searchQuery: '',
        searchError: null,
      });
    },

    /**
     * Remove friend
     */
    removeFriend: async (friendshipId: string) => {
      console.log('💔 FriendsStore: Removing friend:', friendshipId);

      try {
        await friendsService.removeFriend(friendshipId);

        // Reload friends list to get updated state
        await get().loadFriends();

        console.log('✅ FriendsStore: Friend removed successfully');
      } catch (error: any) {
        console.error('❌ FriendsStore: Failed to remove friend:', error);
        
        set({ 
          friendsError: error.message || 'Failed to remove friend',
        });

        throw error; // Re-throw for UI handling
      }
    },

    /**
     * Block user (placeholder)
     */
    blockUser: async (userId: string) => {
      console.log('🚫 FriendsStore: Blocking user:', userId);
      // TODO: Implement user blocking functionality
      throw new Error('Block user functionality not implemented yet');
    },

    /**
     * Unblock user (placeholder)
     */
    unblockUser: async (userId: string) => {
      console.log('✅ FriendsStore: Unblocking user:', userId);
      // TODO: Implement user unblocking functionality
      throw new Error('Unblock user functionality not implemented yet');
    },

    /**
     * Set selected friend
     */
    setSelectedFriend: (friend: FriendProfile | null) => {
      console.log('👤 FriendsStore: Setting selected friend:', friend?.username || 'none');
      
      set({ selectedFriend: friend });
    },

    /**
     * Clear error states
     */
    clearError: () => {
      console.log('🧹 FriendsStore: Clearing errors');
      
      set({ 
        friendsError: null,
        requestsError: null,
        searchError: null,
      });
    },
  }))
);

/**
 * Performance selectors for specific parts of friends state
 */

/**
 * Get friends list
 */
export const useFriendsList = () => useFriendsStore(state => state.friends);

/**
 * Get friends loading state
 */
export const useFriendsLoading = () => useFriendsStore(state => state.friendsLoading);

/**
 * Get friends error
 */
export const useFriendsError = () => useFriendsStore(state => state.friendsError);

/**
 * Get sent friend requests
 */
export const useSentRequests = () => useFriendsStore(state => state.sentRequests);

/**
 * Get received friend requests
 */
export const useReceivedRequests = () => useFriendsStore(state => state.receivedRequests);

/**
 * Get friend requests loading state
 */
export const useRequestsLoading = () => useFriendsStore(state => state.requestsLoading);

/**
 * Get friend requests error
 */
export const useRequestsError = () => useFriendsStore(state => state.requestsError);

/**
 * Get search results
 */
export const useSearchResults = () => useFriendsStore(state => state.searchResults);

/**
 * Get search loading state
 */
export const useSearchLoading = () => useFriendsStore(state => state.searchLoading);

/**
 * Get search error
 */
export const useSearchError = () => useFriendsStore(state => state.searchError);

/**
 * Get search query
 */
export const useSearchQuery = () => useFriendsStore(state => state.searchQuery);

/**
 * Get selected friend
 */
export const useSelectedFriend = () => useFriendsStore(state => state.selectedFriend);

/**
 * Get refresh state
 */
export const useIsRefreshing = () => useFriendsStore(state => state.isRefreshing);

/**
 * Get friend count
 */
export const useFriendCount = () => useFriendsStore(state => state.friends.length);

/**
 * Get pending requests count
 */
export const usePendingRequestsCount = () => useFriendsStore(state => state.receivedRequests.length);

/**
 * Check if user has friends
 */
export const useHasFriends = () => useFriendsStore(state => state.friends.length > 0);

/**
 * Check if user has pending requests
 */
export const useHasPendingRequests = () => useFriendsStore(state => state.receivedRequests.length > 0); 