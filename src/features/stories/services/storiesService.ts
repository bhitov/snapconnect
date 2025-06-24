/**
 * @file storiesService.ts
 * @description Firebase service for stories operations.
 */

import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get, update, remove, onValue, off } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { generateId } from '@/shared/utils/idGenerator';
import type { 
  Story, 
  StoryWithUser, 
  StoryCreationData, 
  StoryUploadProgress, 
  StoryError, 
  StoryDocument, 
  StoryPostDocument,
  ViewData 
} from '../types';

class StoriesService {
  private database = getDatabase();
  private storage = getStorage();
  private auth = getAuth();

  private getCurrentUserId(): string {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return user.uid;
  }

  private handleError(error: any): StoryError {
    console.error('❌ StoriesService: Error:', error);
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      details: error,
    };
  }

  async createStory(data: StoryCreationData, onProgress?: (progress: StoryUploadProgress) => void): Promise<void> {
    console.log('📖 StoriesService: Creating story');
    
    const currentUserId = this.getCurrentUserId();
    const storyId = currentUserId;
    const postId = generateId();

    try {
      onProgress?.({
        storyId,
        progress: 0,
        status: 'uploading',
      });

      // Upload media (simplified implementation)
      const mediaUrl = `https://example.com/media/${postId}`;
      
      onProgress?.({
        storyId,
        progress: 100,
        status: 'complete',
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
      console.log('✅ StoriesService: Story created successfully');
    } catch (error) {
      console.error('❌ StoriesService: Failed to create story:', error);
      throw this.handleError(error);
    }
  }

  async getStories(): Promise<StoryWithUser[]> {
    console.log('📖 StoriesService: Loading stories');
    
    try {
      const currentUserId = this.getCurrentUserId();
      const storiesRef = ref(this.database, 'stories');
      const snapshot = await get(storiesRef);

      if (!snapshot.exists()) {
        console.log('📖 StoriesService: No stories found');
        return [];
      }

      const storiesData = snapshot.val() as Record<string, StoryDocument>;
      const stories: StoryWithUser[] = [];

      // Convert Firebase data to StoryWithUser format
      for (const [storyId, storyDoc] of Object.entries(storiesData)) {
        // Skip expired stories and own story for this list
        if (storyId === currentUserId) continue;

        const activePosts = Object.entries(storyDoc.posts || {})
          .map(([postId, postDoc]) => ({
            id: postId,
            ...postDoc,
          }))
          .filter(post => post.status === 'active' && post.expiresAt > Date.now())
          .sort((a, b) => a.timestamp - b.timestamp);

        if (activePosts.length === 0) continue;

        // Check for unviewed posts
        const hasUnviewedPosts = activePosts.some(post => 
          !post.views[currentUserId] || !post.views[currentUserId].completed
        );

        // Mock user data (in real implementation, fetch from users collection)
        const userStory: StoryWithUser = {
          id: storyId,
          user: {
            uid: storyDoc.userId,
            username: `user_${storyDoc.userId.slice(-6)}`,
            displayName: `User ${storyDoc.userId.slice(-6)}`,
            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${storyDoc.userId}`,
          },
          posts: activePosts,
          updatedAt: storyDoc.updatedAt,
          hasUnviewedPosts,
          totalPosts: activePosts.length,
          latestPostTimestamp: Math.max(...activePosts.map(p => p.timestamp)),
        };

        stories.push(userStory);
      }

      // Sort by latest post timestamp (most recent first)
      stories.sort((a, b) => b.latestPostTimestamp - a.latestPostTimestamp);

      console.log('✅ StoriesService: Loaded', stories.length, 'stories');
      return stories;
    } catch (error) {
      console.error('❌ StoriesService: Failed to load stories:', error);
      throw this.handleError(error);
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

      console.log('✅ StoriesService: Loaded my story with', activePosts.length, 'posts');
      return myStory;
    } catch (error) {
      console.error('❌ StoriesService: Failed to load my story:', error);
      throw this.handleError(error);
    }
  }

  async deleteStoryPost(storyId: string, postId: string): Promise<void> {
    console.log('🗑️ StoriesService: Deleting story post');
    
    try {
      const currentUserId = this.getCurrentUserId();
      if (storyId !== currentUserId) {
        throw new Error('Permission denied: Can only delete your own story posts');
      }

      const postRef = ref(this.database, `stories/${storyId}/posts/${postId}`);
      await remove(postRef);
      
      console.log('✅ StoriesService: Story post deleted successfully');
    } catch (error) {
      console.error('❌ StoriesService: Failed to delete story post:', error);
      throw this.handleError(error);
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
      throw this.handleError(error);
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

      const viewRef = ref(this.database, `stories/${storyId}/posts/${postId}/views/${currentUserId}`);
      await set(viewRef, viewData);
      
      console.log('✅ StoriesService: Post marked as viewed');
    } catch (error) {
      console.error('❌ StoriesService: Failed to mark post as viewed:', error);
      throw this.handleError(error);
    }
  }
}

export const storiesService = new StoriesService(); 