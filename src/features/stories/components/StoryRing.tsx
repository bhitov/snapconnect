/**
 * @file StoryRing.tsx
 * @description Story ring component with gradient border indicating unviewed stories.
 * Shows user avatar with animated ring for unviewed content.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

// Removed linear gradient dependency

import { useTheme } from '@/shared/hooks/useTheme';
import { resolveMediaUrl } from '@/shared/utils/resolveMediaUrl';

import type { StoryRingProps } from '../types';

/**
 * Story ring component with animated gradient for unviewed stories
 *
 * @param {StoryRingProps} props - Component props
 * @returns {JSX.Element} Story ring component
 */
export function StoryRing({
  story,
  size = 'medium',
  hasUnviewedStories = false,
  onPress,
  showAddButton = false,
}: StoryRingProps) {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      container: 60,
      avatar: 48,
      ring: 64,
      addIcon: 16,
    },
    medium: {
      container: 96,
      avatar: 68,
      ring: 84,
      addIcon: 20,
    },
    large: {
      container: 100,
      avatar: 88,
      ring: 104,
      addIcon: 24,
    },
  };

  const config = sizeConfig[size];

  // Handle press
  const handlePress = () => {
    console.log('📱 StoryRing: Ring pressed', story?.id || 'add-button');
    onPress?.();
  };

  // Render add button for "My Story"
  if (showAddButton) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          {
            width: config.container,
            height: config.container,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.addButtonContainer,
            {
              width: config.avatar,
              height: config.avatar,
              borderRadius: config.avatar / 2,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name='add'
            size={config.addIcon}
            color={theme.colors.primary}
          />
        </View>
        <Text
          style={[
            styles.username,
            {
              color: theme.colors.textSecondary,
              fontSize: size === 'small' ? 11 : size === 'medium' ? 12 : 14,
            },
          ]}
          numberOfLines={1}
        >
          Add Story
        </Text>
      </TouchableOpacity>
    );
  }

  // Get the latest story post for thumbnail
  const latestPost = story?.posts?.length
    ? story.posts[story.posts.length - 1]
    : null;
  const thumbnailUri = latestPost?.mediaUrl;

  // Render story ring
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: config.container,
          height: config.container,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Avatar container */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: config.avatar,
            height: config.avatar,
            borderRadius: config.avatar / 2,
            borderColor: hasUnviewedStories
              ? theme.colors.primary
              : theme.colors.border,
            borderWidth: hasUnviewedStories ? 3 : 2,
          },
        ]}
      >
        {thumbnailUri ? (
          <Image
            source={{ uri: resolveMediaUrl(thumbnailUri) }}
            style={[
              styles.avatar,
              {
                width: config.avatar - 4,
                height: config.avatar - 4,
                borderRadius: (config.avatar - 4) / 2,
              },
            ]}
            resizeMode='cover'
          />
        ) : story?.user?.photoURL ? (
          <Image
            source={{ uri: resolveMediaUrl(story.user.photoURL) }}
            style={[
              styles.avatar,
              {
                width: config.avatar - 4,
                height: config.avatar - 4,
                borderRadius: (config.avatar - 4) / 2,
              },
            ]}
            resizeMode='cover'
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              {
                width: config.avatar - 4,
                height: config.avatar - 4,
                borderRadius: (config.avatar - 4) / 2,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Ionicons
              name='person'
              size={config.addIcon}
              color={theme.colors.textSecondary}
            />
          </View>
        )}
      </View>

      {/* Username */}
      <Text
        style={[
          styles.username,
          {
            color: theme.colors.textPrimary,
            fontSize: size === 'small' ? 11 : size === 'medium' ? 12 : 14,
          },
        ]}
        numberOfLines={1}
      >
        {story?.user?.displayName || story?.user?.username || 'User'}
      </Text>

      {/* Unviewed indicator */}
      {hasUnviewedStories && (
        <View
          style={[
            styles.unviewedIndicator,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

/**
 * Styles for the story ring component
 */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  avatar: {
    // No additional styles needed - dimensions set dynamically
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  username: {
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 90,
  },
  unviewedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
});
