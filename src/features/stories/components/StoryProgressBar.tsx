/**
 * @file StoryProgressBar.tsx
 * @description Progress bar component for stories showing multiple posts progress.
 * Displays individual progress bars for each post with smooth animations.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/hooks/useTheme';
import type { StoryProgressBarProps } from '../types';

/**
 * Story progress bar component
 *
 * @param {StoryProgressBarProps} props - Component props
 * @returns {JSX.Element} Story progress bar component
 */
export function StoryProgressBar({
  posts,
  currentIndex,
  isPlaying,
  progress = 0,
  onPostChange,
}: StoryProgressBarProps & { progress?: number }) {
  const theme = useTheme();

  console.log(
    '📊 StoryProgressBar: Rendering with',
    posts.length,
    'posts, current:',
    currentIndex,
    'progress:',
    progress
  );

  /**
   * Animated progress value for current post
   */
  const progressValue = useSharedValue(0);

  /**
   * Update progress animation
   */
  React.useEffect(() => {
    if (isPlaying) {
      progressValue.value = withTiming(progress, {
        duration: 100, // Smooth update
      });
    } else {
      progressValue.value = progress;
    }
  }, [progress, isPlaying, progressValue]);

  /**
   * Create progress style for current post
   */
  const currentProgressStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    );

    return {
      width: `${width}%`,
    };
  }, []);

  /**
   * Handle tap on progress bar segment
   */
  const handleSegmentPress = React.useCallback(
    (index: number) => {
      console.log('👆 StoryProgressBar: Segment pressed:', index);
      onPostChange?.(index);
    },
    [onPostChange]
  );

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {posts.map((post, index) => (
        <View
          key={post.id}
          style={[
            styles.segment,
            {
              backgroundColor:
                theme.colors.backgroundSecondary || 'rgba(255, 255, 255, 0.3)',
            },
          ]}
          onTouchEnd={() => handleSegmentPress(index)}
        >
          {/* Background bar */}
          <View
            style={[
              styles.backgroundBar,
              {
                backgroundColor:
                  theme.colors.backgroundSecondary ||
                  'rgba(255, 255, 255, 0.3)',
              },
            ]}
          />

          {/* Progress bar */}
          {index < currentIndex && (
            // Completed posts - show full progress
            <View
              style={[
                styles.progressBar,
                styles.completedBar,
                {
                  backgroundColor: theme.colors.textPrimary || '#FFFFFF',
                },
              ]}
            />
          )}

          {index === currentIndex && (
            // Current post - show animated progress
            <Animated.View
              style={[
                styles.progressBar,
                currentProgressStyle,
                {
                  backgroundColor: theme.colors.textPrimary || '#FFFFFF',
                },
              ]}
            />
          )}

          {/* Future posts show no progress (just background) */}
        </View>
      ))}
    </View>
  );
}

/**
 * Styles for story progress bar
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  } as ViewStyle,
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,
  backgroundBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 1.5,
  } as ViewStyle,
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 1.5,
  } as ViewStyle,
  completedBar: {
    width: '100%',
  } as ViewStyle,
});
