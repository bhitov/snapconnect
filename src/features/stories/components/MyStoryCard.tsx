/**
 * @file MyStoryCard.tsx
 * @description Component showing user's own story with viewer count and viewer list access.
 * Displays story thumbnail, view count, and allows viewing who has seen the story.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';

import { useStoriesStore } from '../store/storiesStore';

import type { Story, StoryViewer } from '../types';

export interface MyStoryCardProps {
  story: Story;
  onPress?: () => void;
  onViewersPress?: (viewers: StoryViewer[]) => void;
}

/**
 * My Story card component showing user's story with viewer information
 *
 * @param {MyStoryCardProps} props - Component props
 * @returns {JSX.Element} My Story card component
 */
export function MyStoryCard({
  story,
  onPress,
  onViewersPress,
}: MyStoryCardProps) {
  const theme = useTheme();
  const { getStoryViewers } = useStoriesStore();

  // Get latest post for thumbnail
  const latestPost =
    story.posts.length > 0 ? story.posts[story.posts.length - 1] : null;
  const thumbnailUri = latestPost?.mediaUrl;

  // Calculate total unique viewers across all posts
  const uniqueViewers = React.useMemo(() => {
    const viewerIds = new Set<string>();
    story.posts.forEach(post => {
      Object.keys(post.views || {}).forEach(viewerId => {
        const viewData = post.views?.[viewerId];
        if (viewData && viewData.completed) {
          viewerIds.add(viewerId);
        }
      });
    });
    return viewerIds.size;
  }, [story.posts]);

  /**
   * Handle viewers button press
   */
  const handleViewersPress = React.useCallback(async () => {
    console.log('👥 MyStoryCard: Loading viewers for story:', story.id);

    try {
      const viewers = await getStoryViewers(story.id);

      if (viewers.length === 0) {
        Alert.alert(
          'No Views Yet',
          "Your story hasn't been viewed by anyone yet.",
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      onViewersPress?.(viewers);
    } catch (error) {
      console.error('❌ MyStoryCard: Failed to load viewers:', error);
      Alert.alert('Error', 'Failed to load story viewers. Please try again.', [
        { text: 'OK', style: 'default' },
      ]);
    }
  }, [story.id, getStoryViewers, onViewersPress]);

  /**
   * Handle story press
   */
  const handleStoryPress = React.useCallback(() => {
    console.log('📖 MyStoryCard: Story pressed:', story.id);
    onPress?.();
  }, [story.id, onPress]);

  /**
   * Format time ago
   */
  const getTimeAgo = React.useCallback((timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60 * 1000) return 'now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
    if (diff < 24 * 60 * 60 * 1000)
      return `${Math.floor(diff / (60 * 60 * 1000))}h`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Story Thumbnail */}
      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={handleStoryPress}
        activeOpacity={0.8}
      >
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            resizeMode='cover'
          />
        ) : (
          <View
            style={[
              styles.thumbnailPlaceholder,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Ionicons
              name='camera'
              size={24}
              color={theme.colors.textSecondary}
            />
          </View>
        )}

        {/* Story Ring */}
        <View
          style={[styles.storyRing, { borderColor: theme.colors.primary }]}
        />
      </TouchableOpacity>

      {/* Story Info */}
      <View style={styles.storyInfo}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          My Story
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {story.posts.length} post{story.posts.length !== 1 ? 's' : ''} •{' '}
          {getTimeAgo(story.updatedAt)}
        </Text>
      </View>

      {/* Viewers Button */}
      <TouchableOpacity
        style={styles.viewersButton}
        onPress={handleViewersPress}
        activeOpacity={0.7}
      >
        <View style={styles.viewersInfo}>
          <Ionicons
            name='eye'
            size={16}
            color={theme.colors.textSecondary}
            style={styles.viewersIcon}
          />
          <Text
            style={[styles.viewersCount, { color: theme.colors.textSecondary }]}
          >
            {uniqueViewers}
          </Text>
        </View>

        <Ionicons
          name='chevron-forward'
          size={16}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Styles for the My Story card component
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
  },
  storyInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  viewersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  viewersIcon: {
    marginRight: 4,
  },
  viewersCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});
