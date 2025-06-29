/**
 * @file storiesService.ts
 * @description Firebase service for stories operations.
 */

import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get, remove } from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { friendsService } from '@/features/friends/services/friendsService';
import { generateId } from '@/shared/utils/idGenerator';

import type {
  Story,
  StoryWithUser,
  StoryCreationData,
  StoryUploadProgress,
  StoryError,
  StoryDocument,
  StoryPostDocument,
  ViewData,
  StoryViewer,
} from '../types';
import type { UserProfileData } from '@/features/auth/types/authTypes';
import type { FriendProfile } from '@/features/friends/types';

class StoriesService {
  private database = getDatabase();
  private storage = getStorage();
  private auth = getAuth();

  private getCurrentUserId(): string {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return user.uid;
  }

  private handleError(error: unknown): StoryError {
    console.error('❌ StoriesService: Error:', error);
    return {
      type: 'unknown',
      message:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.',
      details: error,
    };
  }

  /**
   * Get user data from Firebase
   */
  private async getUserData(userId: string): Promise<{
    uid: string;
    username: string;
    displayName: string;
    photoURL?: string;
  }> {
    console.log('👤 StoriesService: Fetching user data for:', userId);

    try {
      const userRef = ref(this.database, `users/${userId}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        console.warn('⚠️ StoriesService: User not found, using fallback data');
        return {
          uid: userId,
          username: `user_${userId.slice(-6)}`,
          displayName: `User ${userId.slice(-6)}`,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        };
      }

      const userData = snapshot.val() as UserProfileData;
      console.log('✅ StoriesService: User data loaded:', userData.username);

      return {
        uid: userId,
        username: userData.username || `user_${userId.slice(-6)}`,
        displayName:
          userData.displayName ||
          userData.username ||
          `User ${userId.slice(-6)}`,
        photoURL:
          userData.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      };
    } catch (error) {
      console.error('❌ StoriesService: Failed to fetch user data:', error);
      // Return fallback data on error
      return {
        uid: userId,
        username: `user_${userId.slice(-6)}`,
        displayName: `User ${userId.slice(-6)}`,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      };
    }
  }

  /**
   * Upload media to Firebase Storage
   */
  private async uploadMediaToStorage(
    mediaUri: string,
    mediaType: 'photo',
    postId: string,
    onProgress?: (progress: StoryUploadProgress) => void
  ): Promise<string> {
    console.log('📤 StoriesService: Starting media upload to Firebase Storage');

    try {
      const currentUserId = this.getCurrentUserId();

      // Create storage reference
      const fileExtension = mediaType === 'photo' ? 'jpg' : 'mp4';
      const fileName = `${postId}.${fileExtension}`;
      const storagePath = `stories/${currentUserId}/${fileName}`;
      const storageReference = storageRef(this.storage, storagePath);

      console.log('📤 StoriesService: Uploading to path:', storagePath);

      // Convert URI to blob for upload
      const response = await fetch(mediaUri);
      const blob = await response.blob();

      console.log('📤 StoriesService: File size:', blob.size, 'bytes');

      // Upload with progress tracking
      const uploadTask = uploadBytes(storageReference, blob);

      // Wait for upload completion
      const snapshot = await uploadTask;
      console.log(
        '📤 StoriesService: Upload completed, metadata:',
        snapshot.metadata
      );

      // Get download URL
      const downloadURL = await getDownloadURL(storageReference);
      console.log('✅ StoriesService: Download URL obtained:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('❌ StoriesService: Media upload failed:', error);
      throw new Error(
        `Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async createStory(
    data: StoryCreationData,
    onProgress?: (progress: StoryUploadProgress) => void
  ): Promise<void> {
    console.log('📖 StoriesService: Creating story with media:', data.mediaUri);

    const currentUserId = this.getCurrentUserId();
    const storyId = currentUserId;
    const postId = generateId();

    try {
      onProgress?.({
        storyId,
        progress: 0,
        status: 'uploading',
      });

      // Upload media to Firebase Storage
      console.log('📤 StoriesService: Uploading media to Firebase Storage');
      const mediaUrl = await this.uploadMediaToStorage(
        data.mediaUri,
        data.mediaType,
        postId,
        onProgress
      );

      console.log('✅ StoriesService: Media uploaded successfully:', mediaUrl);

      onProgress?.({
        storyId,
        progress: 90,
        status: 'processing',
      });

      const now = Date.now();
      const postData: StoryPostDocument = {
        userId: currentUserId,
        mediaUrl,
        mediaType: data.mediaType,
        timestamp: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
        views: {},
        privacy: data.privacy,
        status: 'active',
        ...(data.text && { text: data.text }),
        ...(data.customViewers && { customViewers: data.customViewers }),
      };

      const storyRef = ref(this.database, `stories/${storyId}`);
      const storySnapshot = await get(storyRef);

      let storyData: StoryDocument;
      if (storySnapshot.exists()) {
        storyData = storySnapshot.val() as StoryDocument;
        storyData.posts[postId] = postData;
        storyData.updatedAt = now;
      } else {
        storyData = {
          userId: currentUserId,
          posts: { [postId]: postData },
          updatedAt: now,
        };
      }

      await set(storyRef, storyData);

      onProgress?.({
        storyId,
        progress: 100,
        status: 'complete',
      });

      console.log('✅ StoriesService: Story created successfully');
    } catch (error) {
      console.error('❌ StoriesService: Failed to create story:', error);
      throw new Error(this.handleError(error).message);
    }
  }

  async getFriendStories(): Promise<StoryWithUser[]> {
    console.log('📖 StoriesService: Loading friend stories');

    try {
      const currentUserId = this.getCurrentUserId();
      const friends = await friendsService.getFriends();
      const friendIds = friends.map((friend: FriendProfile) => friend.uid);

      if (friendIds.length === 0) {
        console.log(
          '📖 StoriesService: No friends found, so no stories to load.'
        );
        return [];
      }

      const storiesRef = ref(this.database, 'stories');
      const snapshot = await get(storiesRef);

      if (!snapshot.exists()) {
        console.log('📖 StoriesService: No stories found in database');
        return [];
      }

      const storiesData = snapshot.val() as Record<string, StoryDocument>;
      const stories: StoryWithUser[] = [];

      // Convert Firebase data to StoryWithUser format for friends
      for (const [storyId, storyDoc] of Object.entries(storiesData)) {
        if (!friendIds.includes(storyId) || storyId === currentUserId) {
          continue;
        }

        const activePosts = Object.entries(storyDoc.posts || {})
          .map(([postId, postDoc]) => ({
            id: postId,
            ...postDoc,
          }))
          .filter(
            post =>
              post.status === 'active' &&
              post.expiresAt > Date.now() &&
              post.privacy === 'friends'
          )
          .sort((a, b) => a.timestamp - b.timestamp);

        if (activePosts.length === 0) continue;

        const hasUnviewedPosts = activePosts.some(
          post =>
            !post.views ||
            !post.views[currentUserId] ||
            !post.views[currentUserId].completed
        );

        const userData = await this.getUserData(storyDoc.userId);
        const userStory: StoryWithUser = {
          id: storyId,
          user: userData,
          posts: activePosts,
          updatedAt: storyDoc.updatedAt,
          hasUnviewedPosts,
          totalPosts: activePosts.length,
          latestPostTimestamp: Math.max(...activePosts.map(p => p.timestamp)),
        };

        stories.push(userStory);
      }

      // Advanced sorting: unviewed first, then most recent
      stories.sort((a, b) => {
        if (a.hasUnviewedPosts && !b.hasUnviewedPosts) return -1;
        if (!a.hasUnviewedPosts && b.hasUnviewedPosts) return 1;
        return b.latestPostTimestamp - a.latestPostTimestamp;
      });

      console.log(
        '✅ StoriesService: Friend stories loaded and sorted successfully'
      );
      return stories;
    } catch (error) {
      console.error('❌ StoriesService: Failed to load friend stories:', error);
      throw new Error(this.handleError(error).message);
    }
  }

  async getMyStory(): Promise<Story | null> {
    console.log('📖 StoriesService: Loading my story');

    try {
      const currentUserId = this.getCurrentUserId();
      const myStoryRef = ref(this.database, `stories/${currentUserId}`);
      const snapshot = await get(myStoryRef);

      if (!snapshot.exists()) {
        console.log('📖 StoriesService: No story found for current user');
        return null;
      }

      const storyDoc = snapshot.val() as StoryDocument;

      // Convert Firebase data to Story format
      const activePosts = Object.entries(storyDoc.posts || {})
        .map(([postId, postDoc]) => ({
          id: postId,
          ...postDoc,
        }))
        .filter(post => post.status === 'active' && post.expiresAt > Date.now())
        .sort((a, b) => a.timestamp - b.timestamp);

      if (activePosts.length === 0) {
        console.log('📖 StoriesService: No active posts found');
        return null;
      }

      const myStory: Story = {
        id: currentUserId,
        userId: currentUserId,
        posts: activePosts,
        updatedAt: storyDoc.updatedAt,
      };

      console.log(
        '✅ StoriesService: Loaded my story with',
        activePosts.length,
        'posts'
      );
      return myStory;
    } catch (error) {
      console.error('❌ StoriesService: Failed to load my story:', error);
      throw new Error(this.handleError(error).message);
    }
  }

  async deleteStoryPost(storyId: string, postId: string): Promise<void> {
    console.log('🗑️ StoriesService: Deleting story post');

    try {
      const currentUserId = this.getCurrentUserId();
      if (storyId !== currentUserId) {
        throw new Error(
          'Permission denied: Can only delete your own story posts'
        );
      }

      const postRef = ref(this.database, `stories/${storyId}/posts/${postId}`);
      await remove(postRef);

      console.log('✅ StoriesService: Story post deleted successfully');
    } catch (error) {
      console.error('❌ StoriesService: Failed to delete story post:', error);
      throw new Error(this.handleError(error).message);
    }
  }

  async deleteStory(storyId: string): Promise<void> {
    console.log('🗑️ StoriesService: Deleting story');

    try {
      const currentUserId = this.getCurrentUserId();
      if (storyId !== currentUserId) {
        throw new Error('Permission denied: Can only delete your own story');
      }

      const storyRef = ref(this.database, `stories/${storyId}`);
      await remove(storyRef);

      console.log('✅ StoriesService: Story deleted successfully');
    } catch (error) {
      console.error('❌ StoriesService: Failed to delete story:', error);
      throw new Error(this.handleError(error).message);
    }
  }

  async markPostAsViewed(storyId: string, postId: string): Promise<void> {
    console.log('👁️ StoriesService: Marking post as viewed');

    try {
      const currentUserId = this.getCurrentUserId();
      const viewData: ViewData = {
        timestamp: Date.now(),
        completed: true,
      };

      const viewRef = ref(
        this.database,
        `stories/${storyId}/posts/${postId}/views/${currentUserId}`
      );
      await set(viewRef, viewData);

      console.log('✅ StoriesService: Post marked as viewed');
    } catch (error) {
      console.error('❌ StoriesService: Failed to mark post as viewed:', error);
      throw new Error(this.handleError(error).message);
    }
  }

  async getStoryViewers(
    storyId: string,
    postId?: string
  ): Promise<StoryViewer[]> {
    console.log('👥 StoriesService: Getting story viewers');

    try {
      const currentUserId = this.getCurrentUserId();
      if (storyId !== currentUserId) {
        throw new Error(
          'Permission denied: Can only view your own story viewers'
        );
      }

      const storyRef = ref(this.database, `stories/${storyId}`);
      const snapshot = await get(storyRef);

      if (!snapshot.exists()) {
        console.log('👥 StoriesService: Story not found');
        return [];
      }

      const storyDoc = snapshot.val() as StoryDocument;
      const viewers: Map<string, StoryViewer> = new Map();

      // If specific post requested, get viewers for that post only
      if (postId && storyDoc.posts[postId]) {
        const post = storyDoc.posts[postId];
        for (const [viewerId, viewData] of Object.entries(post.views || {})) {
          if (viewData.completed) {
            viewers.set(viewerId, {
              userId: viewerId,
              username: `user_${viewerId.slice(-6)}`, // Mock data
              displayName: `User ${viewerId.slice(-6)}`, // Mock data
              photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewerId}`,
              viewedAt: viewData.timestamp,
              hasViewedAll: true, // Since viewing specific post
            });
          }
        }
      } else {
        // Get viewers across all posts
        for (const [currentPostId, post] of Object.entries(
          storyDoc.posts || {}
        )) {
          if (post.status === 'active' && post.expiresAt > Date.now()) {
            for (const [viewerId, viewData] of Object.entries(
              post.views || {}
            )) {
              if (viewData.completed) {
                const existing = viewers.get(viewerId);
                if (existing) {
                  // Update if this view is more recent
                  if (viewData.timestamp > existing.viewedAt) {
                    existing.viewedAt = viewData.timestamp;
                  }
                } else {
                  viewers.set(viewerId, {
                    userId: viewerId,
                    username: `user_${viewerId.slice(-6)}`, // Mock data
                    displayName: `User ${viewerId.slice(-6)}`, // Mock data
                    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewerId}`,
                    viewedAt: viewData.timestamp,
                    hasViewedAll: false, // Will be calculated below
                  });
                }
              }
            }
          }
        }

        // Check if each viewer has viewed all posts
        const activePosts = Object.keys(storyDoc.posts || {}).filter(pid => {
          const post = storyDoc.posts[pid];
          return (
            post && post.status === 'active' && post.expiresAt > Date.now()
          );
        });

        for (const viewer of viewers.values()) {
          viewer.hasViewedAll = activePosts.every(pid => {
            const post = storyDoc.posts[pid];
            return post && post.views && post.views[viewer.userId]?.completed;
          });
        }
      }

      const sortedViewers = Array.from(viewers.values()).sort(
        (a, b) => b.viewedAt - a.viewedAt
      );

      console.log(
        '✅ StoriesService: Loaded',
        sortedViewers.length,
        'story viewers'
      );
      return sortedViewers;
    } catch (error) {
      console.error('❌ StoriesService: Failed to get story viewers:', error);
      throw new Error(this.handleError(error).message);
    }
  }
}

export const storiesService = new StoriesService();
