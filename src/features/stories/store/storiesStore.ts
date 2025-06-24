/**
 * @file storiesStore.ts
 * @description Stories store using Zustand for state management.
 * Handles stories data, viewing sessions, upload progress, and UI state.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { generateId } from '@/shared/utils/idGenerator';
import { storiesService } from '../services/storiesService';

import type {
  StoriesStore,
  Story,
  StoryWithUser,
  StoryCreationData,
  StoryUploadProgress,
  StoryViewingSession,
  StoryViewer,
  StoryError,
} from '../types';

/**
 * Initial stories store state
 */
const initialState = {
  // Story data
  stories: [] as StoryWithUser[],
  currentStory: null as Story | null,
  myStory: null as Story | null,
  
  // Viewing session
  viewingSession: null as StoryViewingSession | null,
  
  // UI state
  isLoading: false,
  isUploading: false,
  uploadProgress: null as StoryUploadProgress | null,
  error: null as StoryError | null,
  
  // Filters
  showOnlyUnviewed: false,
};

/**
 * Stories store using Zustand
 */
export const useStoriesStore = create<StoriesStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      ...initialState,

      // Story management
      loadStories: async () => {
        console.log('📖 StoriesStore: Loading stories');

        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const stories = await storiesService.getStories();

          set(state => {
            state.stories = stories;
            state.isLoading = false;
          });

          console.log('✅ StoriesStore: Loaded', stories.length, 'stories');
        } catch (error) {
          console.error('❌ StoriesStore: Failed to load stories:', error);

          set(state => {
            state.error = error as StoryError;
            state.isLoading = false;
          });
        }
      },

      refreshStories: async () => {
        console.log('🔄 StoriesStore: Refreshing stories');

        try {
          const stories = await storiesService.getStories();

          set(state => {
            state.stories = stories;
          });

          console.log('✅ StoriesStore: Refreshed stories');
        } catch (error) {
          console.error('❌ StoriesStore: Failed to refresh stories:', error);

          set(state => {
            state.error = error as StoryError;
          });
        }
      },

      loadMyStory: async () => {
        console.log('📖 StoriesStore: Loading my story');

        try {
          const myStory = await storiesService.getMyStory();

          set(state => {
            state.myStory = myStory;
          });

          console.log('✅ StoriesStore: Loaded my story');
        } catch (error) {
          console.error('❌ StoriesStore: Failed to load my story:', error);

          set(state => {
            state.error = error as StoryError;
          });
        }
      },

      createStory: async (data: StoryCreationData, onProgress?: (progress: StoryUploadProgress) => void) => {
        console.log('📸 StoriesStore: Creating story');

        set(state => {
          state.isUploading = true;
          state.error = null;
          state.uploadProgress = {
            storyId: 'temp-' + generateId(),
            progress: 0,
            status: 'uploading',
          };
        });

        try {
          await storiesService.createStory(data, progress => {
            set(state => {
              state.uploadProgress = progress;
            });
            onProgress?.(progress);
          });

          // Reload stories after successful creation
          await get().loadStories();
          await get().loadMyStory();

          set(state => {
            state.isUploading = false;
            state.uploadProgress = null;
          });

          console.log('✅ StoriesStore: Story created successfully');
        } catch (error) {
          console.error('❌ StoriesStore: Failed to create story:', error);

          set(state => {
            state.error = error as StoryError;
            state.isUploading = false;
            state.uploadProgress = null;
          });
        }
      },

      deleteStoryPost: async (storyId: string, postId: string) => {
        console.log('🗑️ StoriesStore: Deleting story post');

        try {
          await storiesService.deleteStoryPost(storyId, postId);

          // Reload stories after deletion
          await get().loadStories();
          await get().loadMyStory();

          console.log('✅ StoriesStore: Story post deleted successfully');
        } catch (error) {
          console.error('❌ StoriesStore: Failed to delete story post:', error);

          set(state => {
            state.error = error as StoryError;
          });
        }
      },

      deleteStory: async (storyId: string) => {
        console.log('🗑️ StoriesStore: Deleting story');

        try {
          await storiesService.deleteStory(storyId);

          // Reload stories after deletion
          await get().loadStories();
          await get().loadMyStory();

          console.log('✅ StoriesStore: Story deleted successfully');
        } catch (error) {
          console.error('❌ StoriesStore: Failed to delete story:', error);

          set(state => {
            state.error = error as StoryError;
          });
        }
      },

      getStoryViewers: async (storyId: string, postId?: string) => {
        console.log('👥 StoriesStore: Getting story viewers');

        try {
          const viewers = await storiesService.getStoryViewers(storyId, postId);

          console.log('✅ StoriesStore: Loaded', viewers.length, 'story viewers');
          return viewers;
        } catch (error) {
          console.error('❌ StoriesStore: Failed to get story viewers:', error);

          set(state => {
            state.error = error as StoryError;
          });

          return [];
        }
      },

      // Viewing
      startViewing: (story: Story) => {
        console.log('👁️ StoriesStore: Starting viewing session');

        const viewingSession: StoryViewingSession = {
          storyId: story.id,
          currentPostIndex: 0,
          posts: story.posts,
          isPlaying: true,
          isPaused: false,
          startTime: Date.now(),
          duration: 5000, // 5 seconds per post
          remainingTime: 5000,
          autoAdvance: true,
        };

        set(state => {
          state.viewingSession = viewingSession;
        });
      },

      nextPost: () => {
        console.log('⏭️ StoriesStore: Next post');

        const state = get();
        if (!state.viewingSession) return;

        const { currentPostIndex, posts } = state.viewingSession;

        if (currentPostIndex < posts.length - 1) {
          set(state => {
            if (state.viewingSession) {
              state.viewingSession.currentPostIndex += 1;
              state.viewingSession.startTime = Date.now();
              state.viewingSession.remainingTime = 5000;
              state.viewingSession.isPlaying = true;
              state.viewingSession.isPaused = false;
            }
          });

          // Mark previous post as viewed
          const currentPost = posts[currentPostIndex];
          if (currentPost) {
            get().markPostAsViewed(state.viewingSession.storyId, currentPost.id);
          }
        } else {
          // End of story - mark last post as viewed and stop
          const lastPost = posts[currentPostIndex];
          if (lastPost) {
            get().markPostAsViewed(state.viewingSession.storyId, lastPost.id);
          }
          get().stopViewing();
        }
      },

      previousPost: () => {
        console.log('⏮️ StoriesStore: Previous post');

        set(state => {
          if (state.viewingSession && state.viewingSession.currentPostIndex > 0) {
            state.viewingSession.currentPostIndex -= 1;
            state.viewingSession.startTime = Date.now();
            state.viewingSession.remainingTime = 5000;
            state.viewingSession.isPlaying = true;
            state.viewingSession.isPaused = false;
          }
        });
      },

      pauseViewing: () => {
        console.log('⏸️ StoriesStore: Pausing viewing');

        set(state => {
          if (state.viewingSession) {
            state.viewingSession.isPlaying = false;
            state.viewingSession.isPaused = true;
          }
        });
      },

      resumeViewing: () => {
        console.log('▶️ StoriesStore: Resuming viewing');

        set(state => {
          if (state.viewingSession) {
            state.viewingSession.isPlaying = true;
            state.viewingSession.isPaused = false;
            state.viewingSession.startTime = Date.now();
          }
        });
      },

      stopViewing: () => {
        console.log('⏹️ StoriesStore: Stopping viewing');

        set(state => {
          state.viewingSession = null;
        });
      },

      markPostAsViewed: async (storyId: string, postId: string) => {
        console.log('👁️ StoriesStore: Marking post as viewed');

        try {
          await storiesService.markPostAsViewed(storyId, postId);

          console.log('✅ StoriesStore: Post marked as viewed');
        } catch (error) {
          console.error('❌ StoriesStore: Failed to mark post as viewed:', error);
        }
      },

      // UI actions
      setShowOnlyUnviewed: (show: boolean) => {
        set(state => {
          state.showOnlyUnviewed = show;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      clearUploadProgress: () => {
        set(state => {
          state.uploadProgress = null;
        });
      },
    })),
    {
      name: 'StoriesStore',
    }
  )
);

/**
 * Selectors for performance optimization
 */
export const useStories = () => useStoriesStore(state => state.stories);
export const useMyStory = () => useStoriesStore(state => state.myStory);
export const useCurrentStory = () => useStoriesStore(state => state.currentStory);
export const useViewingSession = () => useStoriesStore(state => state.viewingSession);
export const useStoriesLoading = () => useStoriesStore(state => state.isLoading);
export const useStoriesUploading = () => useStoriesStore(state => state.isUploading);
export const useUploadProgress = () => useStoriesStore(state => state.uploadProgress);
export const useStoriesError = () => useStoriesStore(state => state.error);
export const useShowOnlyUnviewed = () => useStoriesStore(state => state.showOnlyUnviewed); 