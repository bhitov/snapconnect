/**
 * @file StoriesScreen.tsx
 * @description Main stories screen showing friends' stories in a horizontal list.
 * Includes add story functionality and navigation to story viewer.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '@/shared/hooks/useTheme';
import { Screen } from '@/shared/components/layout/Screen';
import { StoriesList } from '../components/StoriesList';
import { MyStoryCard } from '../components/MyStoryCard';
import { useStoriesStore, useStories, useMyStory, useStoriesLoading, useStoriesError } from '../store/storiesStore';

import type { StoriesScreenProps, StoryWithUser } from '../types';

/**
 * Stories screen component
 *
 * @param {StoriesScreenProps} props - Screen props with navigation
 * @returns {JSX.Element} Stories screen component
 */
export function StoriesScreen({ navigation }: StoriesScreenProps) {
  const theme = useTheme();

  // Stories state
  const stories = useStories();
  const myStory = useMyStory();
  const isLoading = useStoriesLoading();
  const error = useStoriesError();

  // Stories actions
  const { loadStories, loadMyStory, refreshStories, clearError } = useStoriesStore();

  console.log('📖 StoriesScreen: Rendering with', stories.length, 'stories, myStory:', myStory ? 'exists' : 'null');

  /**
   * Load stories when screen comes into focus
   */
  useFocusEffect(
    React.useCallback(() => {
      console.log('📖 StoriesScreen: Screen focused, loading stories and my story');
      loadStories();
      loadMyStory();

      return () => {
        console.log('📖 StoriesScreen: Screen unfocused');
      };
    }, [loadStories, loadMyStory])
  );

  /**
   * Handle refresh stories
   */
  const handleRefresh = React.useCallback(async () => {
    console.log('🔄 StoriesScreen: Refreshing stories');
    try {
      await refreshStories();
    } catch (refreshError) {
      console.error('❌ StoriesScreen: Failed to refresh stories:', refreshError);
    }
  }, [refreshStories]);

  /**
   * Handle add story press - navigate to camera
   */
  const handleAddStory = React.useCallback(() => {
    console.log('📸 StoriesScreen: Add story pressed');
    
    // Navigate to main tab camera for story creation
    navigation.navigate('Camera');
  }, [navigation]);

  /**
   * Handle story press - navigate to story viewer
   */
  const handleStoryPress = React.useCallback((story: StoryWithUser) => {
    console.log('👁️ StoriesScreen: Story pressed:', story.id);
    
    // Navigate to story viewer
    navigation.navigate('ViewStory', {
      userId: story.user.uid,
      storyId: story.id,
    });
  }, [navigation]);

  /**
   * Handle error dismiss
   */
  const handleErrorDismiss = React.useCallback(() => {
    clearError();
  }, [clearError]);

  /**
   * Handle my story press - navigate to story viewer
   */
  const handleMyStoryPress = React.useCallback(() => {
    if (!myStory) return;
    
    console.log('👁️ StoriesScreen: My story pressed:', myStory.id);
    
    // Navigate to story viewer for own story
    navigation.navigate('ViewStory', {
      userId: myStory.userId,
      storyId: myStory.id,
    });
  }, [myStory, navigation]);

  /**
   * Handle viewers press - show viewers list
   */
  const handleViewersPress = React.useCallback((viewers: any[]) => {
    console.log('👥 StoriesScreen: Showing viewers:', viewers.length);
    
    // For now, show a simple alert with viewer count
    // In a full implementation, this would navigate to a viewers screen
    Alert.alert(
      'Story Viewers',
      `${viewers.length} people have viewed your story:\n\n${viewers.map(v => v.displayName).join('\n')}`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  /**
   * Show error alert if there's an error
   */
  React.useEffect(() => {
    if (error) {
      console.error('❌ StoriesScreen: Showing error alert:', error.message);
      
      Alert.alert(
        'Stories Error',
        error.message,
        [
          { text: 'Retry', onPress: () => { handleErrorDismiss(); loadStories(); } },
          { text: 'Dismiss', onPress: handleErrorDismiss, style: 'cancel' },
        ]
      );
    }
  }, [error, handleErrorDismiss, loadStories]);

  /**
   * Render loading state
   */
  if (isLoading && stories.length === 0) {
    return (
      <Screen backgroundColor={theme.colors.background || '#FFFFFF'} padding={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading stories...
            </Text>
          </View>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.colors.background || '#FFFFFF'} padding={false}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Stories
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {stories.length > 0 ? `${stories.length} active stories` : 'No stories yet'}
          </Text>
        </View>

        {/* My Story Section */}
        {myStory && (
          <MyStoryCard
            story={myStory}
            onPress={handleMyStoryPress}
            onViewersPress={handleViewersPress}
          />
        )}

        {/* Stories list */}
        <StoriesList
          stories={stories}
          onStoryPress={handleStoryPress}
          onAddStoryPress={handleAddStory}
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />

        {/* Content area - could show featured stories or other content */}
        <View style={styles.contentArea}>
          {stories.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                Share Your First Story
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Tap the camera to create your first story and share it with friends!
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Screen>
  );
}

/**
 * Styles for the stories screen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
}); 