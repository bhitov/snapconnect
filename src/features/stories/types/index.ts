/**
 * @file types/index.ts
 * @description TypeScript type definitions for stories feature.
 * Defines story data models, interfaces, and component props following SnapConnect patterns.
 */

import type {
  StoriesStackParamList,
  MainTabParamList,
} from '@/shared/navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

/**
 * Story privacy levels
 */
export type StoryPrivacy = 'all' | 'friends' | 'custom';

/**
 * Media types for story posts
 */
export type StoryMediaType = 'photo' | 'video';

/**
 * Story post status
 */
export type StoryPostStatus = 'uploading' | 'active' | 'expired';

/**
 * View data for story tracking
 */
export interface ViewData {
  timestamp: number;
  completed: boolean;
}

/**
 * Story viewer information
 */
export interface StoryViewer {
  userId: string;
  username: string;
  displayName: string;
  photoURL?: string;
  viewedAt: number;
  hasViewedAll: boolean;
}

/**
 * Individual story post
 */
export interface StoryPost {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: StoryMediaType;
  text?: string;
  timestamp: number;
  expiresAt: number;
  views: Record<string, ViewData>;
  privacy: StoryPrivacy;
  customViewers?: string[];
  status: StoryPostStatus;
}

/**
 * Complete story collection for a user
 */
export interface Story {
  id: string;
  userId: string;
  posts: StoryPost[];
  updatedAt: number;
  hasUnviewedPosts?: boolean;
}

/**
 * Story with populated user data for display
 */
export interface StoryWithUser {
  id: string;
  user: {
    uid: string;
    username: string;
    displayName: string;
    photoURL?: string;
  };
  posts: StoryPost[];
  updatedAt: number;
  hasUnviewedPosts: boolean;
  totalPosts: number;
  latestPostTimestamp: number;
}

/**
 * Story creation data before upload
 */
export interface StoryCreationData {
  mediaUri: string;
  mediaType: StoryMediaType;
  text?: string;
  privacy: StoryPrivacy;
  customViewers?: string[];
}

/**
 * Story upload progress tracking
 */
export interface StoryUploadProgress {
  storyId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

/**
 * Firebase story document structure
 */
export interface StoryDocument {
  userId: string;
  posts: Record<string, StoryPostDocument>;
  updatedAt: number;
}

/**
 * Firebase story post document structure
 */
export interface StoryPostDocument {
  userId: string;
  mediaUrl: string;
  mediaType: StoryMediaType;
  text?: string;
  timestamp: number;
  expiresAt: number;
  views: Record<string, ViewData>;
  privacy: StoryPrivacy;
  customViewers?: string[];
  status: StoryPostStatus;
}

/**
 * Story viewing session
 */
export interface StoryViewingSession {
  storyId: string;
  currentPostIndex: number;
  posts: StoryPost[];
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number;
  duration: number;
  remainingTime: number;
  autoAdvance: boolean;
}

/**
 * Story error types
 */
export type StoryErrorType =
  | 'upload_failed'
  | 'permission_denied'
  | 'network_error'
  | 'storage_error'
  | 'processing_failed'
  | 'not_found'
  | 'expired'
  | 'unknown';

/**
 * Story error interface
 */
export interface StoryError {
  type: StoryErrorType;
  message: string;
  details?: unknown;
}

/**
 * Stories store state interface
 */
export interface StoriesState {
  // Story data
  stories: StoryWithUser[];
  currentStory: Story | null;
  myStory: Story | null;

  // Viewing session
  viewingSession: StoryViewingSession | null;

  // UI state
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: StoryUploadProgress | null;
  error: StoryError | null;

  // Filters
  showOnlyUnviewed: boolean;
}

/**
 * Stories store actions interface
 */
export interface StoriesActions {
  // Story management
  loadStories: () => Promise<void>;
  refreshStories: () => Promise<void>;
  loadMyStory: () => Promise<void>;
  createStory: (
    data: StoryCreationData,
    onProgress?: (progress: StoryUploadProgress) => void
  ) => Promise<void>;
  deleteStoryPost: (storyId: string, postId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  getStoryViewers: (storyId: string, postId?: string) => Promise<StoryViewer[]>;

  // Viewing
  startViewing: (story: Story) => void;
  nextPost: () => void;
  previousPost: () => void;
  pauseViewing: () => void;
  resumeViewing: () => void;
  stopViewing: () => void;
  markPostAsViewed: (storyId: string, postId: string) => Promise<void>;

  // UI actions
  setShowOnlyUnviewed: (show: boolean) => void;
  clearError: () => void;
  clearUploadProgress: () => void;
}

/**
 * Complete stories store interface
 */
export interface StoriesStore extends StoriesState, StoriesActions {}

/**
 * Component prop interfaces
 */
export interface StoryRingProps {
  story?: StoryWithUser;
  size?: 'small' | 'medium' | 'large';
  hasUnviewedStories?: boolean;
  onPress?: () => void;
  showAddButton?: boolean;
}

export interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface StoryItemProps {
  post: StoryPost;
  isActive: boolean;
  onPress?: () => void;
}

export interface StoriesListProps {
  stories: StoryWithUser[];
  onStoryPress: (story: StoryWithUser) => void;
  onAddStoryPress?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export interface StoryProgressBarProps {
  posts: StoryPost[];
  currentIndex: number;
  isPlaying: boolean;
  onPostChange: (index: number) => void;
}

/**
 * Screen prop interfaces
 */
export interface StoriesScreenProps {
  navigation: CompositeNavigationProp<
    StackNavigationProp<StoriesStackParamList, 'StoriesList'>,
    BottomTabNavigationProp<MainTabParamList>
  >;
  route: {
    key: string;
    name: 'StoriesList';
  };
}

export interface ViewStoryScreenProps {
  navigation: StackNavigationProp<StoriesStackParamList, 'ViewStory'>;
  route: {
    key: string;
    name: 'ViewStory';
    params: {
      userId: string;
      storyId: string;
    };
  };
}

export interface CreateStoryScreenProps {
  navigation: StackNavigationProp<StoriesStackParamList, 'CreateStory'>;
  route: {
    key: string;
    name: 'CreateStory';
    params: {
      mediaUri: string;
      mediaType: StoryMediaType;
    };
  };
}

/**
 * Privacy option for UI
 */
export interface PrivacyOption {
  value: StoryPrivacy;
  label: string;
  description: string;
  icon: string;
}
