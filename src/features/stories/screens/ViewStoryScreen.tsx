/**
 * @file ViewStoryScreen.tsx
 * @description Full-screen story viewer with tap controls and progress tracking.
 * Handles story navigation, auto-advance, and viewing state management.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
  Alert,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/hooks/useTheme';
import { StoryProgressBar } from '../components/StoryProgressBar';
import { useStoriesStore } from '../store/storiesStore';
import { storiesService } from '../services/storiesService';

import type { ViewStoryScreenProps } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * View story screen component
 *
 * @param {ViewStoryScreenProps} props - Screen props with navigation and route
 * @returns {JSX.Element} View story screen component
 */
export function ViewStoryScreen({ navigation, route }: ViewStoryScreenProps) {
  const theme = useTheme();
  const { userId, storyId } = route.params;

  console.log('👁️ ViewStoryScreen: Viewing story', storyId, 'from user', userId);

  // Local state
  const [story, setStory] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPostIndex, setCurrentPostIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);

  // Animation values
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Timer ref for auto-advance
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Load story data
   */
  const loadStory = React.useCallback(async () => {
    console.log('📖 ViewStoryScreen: Loading story data');
    setIsLoading(true);
    setError(null);

    try {
      // For now, create mock story data
      const mockStory = {
        id: storyId,
        user: {
          uid: userId,
          username: 'testuser',
          displayName: 'Test User',
          photoURL: 'https://via.placeholder.com/100',
        },
        posts: [
          {
            id: 'post1',
            userId: userId,
            mediaUrl: 'https://via.placeholder.com/400x600/ff6b6b/ffffff?text=Story+1',
            mediaType: 'photo' as const,
            text: 'Check out this amazing view!',
            timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
            expiresAt: Date.now() + 1000 * 60 * 60 * 23, // 23 hours from now
            views: {},
            privacy: 'friends' as const,
            status: 'active' as const,
          },
          {
            id: 'post2',
            userId: userId,
            mediaUrl: 'https://via.placeholder.com/400x600/4ecdc4/ffffff?text=Story+2',
            mediaType: 'photo' as const,
            text: 'Another great moment',
            timestamp: Date.now() - 1000 * 60 * 20, // 20 minutes ago
            expiresAt: Date.now() + 1000 * 60 * 60 * 23, // 23 hours from now
            views: {},
            privacy: 'friends' as const,
            status: 'active' as const,
          },
        ],
        updatedAt: Date.now() - 1000 * 60 * 20,
        hasUnviewedPosts: true,
        totalPosts: 2,
        latestPostTimestamp: Date.now() - 1000 * 60 * 20,
      };

      setStory(mockStory);
      setIsLoading(false);

      console.log('✅ ViewStoryScreen: Story loaded successfully');
    } catch (loadError) {
      console.error('❌ ViewStoryScreen: Failed to load story:', loadError);
      setError('Failed to load story');
      setIsLoading(false);
    }
  }, [storyId, userId]);

  /**
   * Start progress animation for current post
   */
  const startProgress = React.useCallback(() => {
    if (!story || !isPlaying) return;

    console.log('▶️ ViewStoryScreen: Starting progress for post', currentPostIndex);

    progress.value = 0;
    
    // Animate progress over 5 seconds
    progress.value = withTiming(1, {
      duration: 5000,
    }, (finished) => {
      if (finished) {
        runOnJS(goToNextPost)();
      }
    });

    // Update progress value for progress bar
    const updateProgress = () => {
      if (!isPlaying) return;
      
      const currentTime = Date.now();
      const elapsedTime = currentTime - progressStartTime.current;
      const progressPercent = Math.min(elapsedTime / 5000, 1);
      
      setProgressValue(progressPercent);
      
      if (progressPercent < 1 && isPlaying) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    progressStartTime.current = Date.now();
    requestAnimationFrame(updateProgress);
  }, [story, isPlaying, currentPostIndex, progress]);

  // Progress tracking
  const progressStartTime = React.useRef(Date.now());
  const [progressValue, setProgressValue] = React.useState(0);

  /**
   * Go to next post
   */
  const goToNextPost = React.useCallback(() => {
    if (!story) return;

    console.log('⏭️ ViewStoryScreen: Going to next post');

    if (currentPostIndex < story.posts.length - 1) {
      setCurrentPostIndex(prev => prev + 1);
      setProgressValue(0);
    } else {
      // End of story, close viewer
      console.log('✅ ViewStoryScreen: End of story reached');
      navigation.goBack();
    }
  }, [story, currentPostIndex, navigation]);

  /**
   * Go to previous post
   */
  const goToPreviousPost = React.useCallback(() => {
    if (!story) return;

    console.log('⏮️ ViewStoryScreen: Going to previous post');

    if (currentPostIndex > 0) {
      setCurrentPostIndex(prev => prev - 1);
      setProgressValue(0);
    }
  }, [story, currentPostIndex]);

  /**
   * Handle tap on left side (previous)
   */
  const handleLeftTap = React.useCallback(() => {
    console.log('👆 ViewStoryScreen: Left tap - previous post');
    goToPreviousPost();
  }, [goToPreviousPost]);

  /**
   * Handle tap on right side (next)
   */
  const handleRightTap = React.useCallback(() => {
    console.log('👆 ViewStoryScreen: Right tap - next post');
    goToNextPost();
  }, [goToNextPost]);

  /**
   * Handle pause/resume
   */
  const handlePauseResume = React.useCallback(() => {
    console.log('⏸️ ViewStoryScreen: Toggle pause/resume');
    setIsPlaying(prev => !prev);
  }, []);

  /**
   * Handle close
   */
  const handleClose = React.useCallback(() => {
    console.log('❌ ViewStoryScreen: Closing story viewer');
    navigation.goBack();
  }, [navigation]);

  /**
   * Handle post change from progress bar
   */
  const handlePostChange = React.useCallback((index: number) => {
    console.log('📊 ViewStoryScreen: Post change from progress bar:', index);
    setCurrentPostIndex(index);
    setProgressValue(0);
  }, []);

  /**
   * Mark current post as viewed
   */
  const markAsViewed = React.useCallback(async () => {
    if (!story || currentPostIndex >= story.posts.length) return;

    const currentPost = story.posts[currentPostIndex];
    try {
      await storiesService.markPostAsViewed(storyId, currentPost.id);
      console.log('👁️ ViewStoryScreen: Marked post as viewed');
    } catch (viewError) {
      console.error('❌ ViewStoryScreen: Failed to mark as viewed:', viewError);
    }
  }, [story, currentPostIndex, storyId]);

  /**
   * Load story on screen focus
   */
  useFocusEffect(
    React.useCallback(() => {
      loadStory();

      return () => {
        // Cleanup timers on unfocus
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }, [loadStory])
  );

  /**
   * Start progress when story loads or post changes
   */
  React.useEffect(() => {
    if (story && !isLoading) {
      startProgress();
      markAsViewed();
    }
  }, [story, isLoading, currentPostIndex, startProgress, markAsViewed]);

  /**
   * Handle pause/resume
   */
  React.useEffect(() => {
    if (isPlaying && story) {
      startProgress();
    }
  }, [isPlaying, story, startProgress]);

  /**
   * Show error alert
   */
  React.useEffect(() => {
    if (error) {
      Alert.alert(
        'Story Error',
        error,
        [
          { text: 'Retry', onPress: loadStory },
          { text: 'Close', onPress: handleClose, style: 'cancel' },
        ]
      );
    }
  }, [error, loadStory, handleClose]);

  /**
   * Create animated style for fade
   */
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
          Loading story...
        </Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.textPrimary }]}>
          Story not found
        </Text>
      </View>
    );
  }

  const currentPost = story.posts[currentPostIndex];
  if (!currentPost) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.textPrimary }]}>
          Post not found
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, fadeStyle]}>
      {/* Background image */}
      <Image
        source={{ uri: currentPost.mediaUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Overlay for better text readability */}
      <View style={styles.overlay} />

      {/* Top section with progress and close */}
      <SafeAreaView style={styles.topSection}>
        <StoryProgressBar
          posts={story.posts}
          currentIndex={currentPostIndex}
          isPlaying={isPlaying}
          progress={progressValue}
          onPostChange={handlePostChange}
        />

        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: story.user.photoURL || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
            <View style={styles.userText}>
              <Text style={[styles.username, { color: theme.colors.textPrimary }]}>
                {story.user.displayName}
              </Text>
              <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
                {getTimeAgo(currentPost.timestamp)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.closeText, { color: theme.colors.textPrimary }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Tap areas for navigation */}
      <View style={styles.tapContainer}>
        {/* Left tap area - previous */}
        <Pressable
          style={styles.leftTapArea}
          onPress={handleLeftTap}
        />

        {/* Center tap area - pause/resume */}
        <Pressable
          style={styles.centerTapArea}
          onPress={handlePauseResume}
        />

        {/* Right tap area - next */}
        <Pressable
          style={styles.rightTapArea}
          onPress={handleRightTap}
        />
      </View>

      {/* Bottom section with text overlay */}
      {currentPost.text && (
        <SafeAreaView style={styles.bottomSection}>
          <View style={styles.textContainer}>
            <Text style={[styles.storyText, { color: theme.colors.textPrimary }]}>
              {currentPost.text}
            </Text>
          </View>
        </SafeAreaView>
      )}
    </Animated.View>
  );
}

/**
 * Helper function to get time ago string
 */
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else {
    return `${hours}h ago`;
  }
}

/**
 * Styles for the view story screen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftTapArea: {
    flex: 1,
  },
  centerTapArea: {
    flex: 1,
  },
  rightTapArea: {
    flex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  textContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  storyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});