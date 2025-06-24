/**
 * @file StoriesList.tsx
 * @description Horizontal scrollable list of stories with pull-to-refresh.
 * Shows story rings with unviewed indicators and add story button.
 */

import React from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { StoryRing } from './StoryRing';

import type { StoriesListProps, StoryWithUser } from '../types';

/**
 * Horizontal stories list component
 *
 * @param {StoriesListProps} props - Component props
 * @returns {JSX.Element} Stories list component
 */
export function StoriesList({
  stories,
  onStoryPress,
  onAddStoryPress,
  refreshing = false,
  onRefresh,
}: StoriesListProps) {
  const theme = useTheme();

  console.log('📖 StoriesList: Rendering', stories.length, 'stories');

  /**
   * Render individual story item
   */
  const renderStoryItem = ({ item, index }: { item: StoryWithUser; index: number }) => {
    return (
      <View style={styles.storyItem}>
        <StoryRing
          story={item}
          size="medium"
          hasUnviewedStories={item.hasUnviewedPosts}
          onPress={() => onStoryPress(item)}
        />
      </View>
    );
  };

  /**
   * Render add story button as first item
   */
  const renderAddStoryButton = () => {
    if (!onAddStoryPress) return null;

    return (
      <View style={styles.storyItem}>
        <StoryRing
          size="medium"
          showAddButton={true}
          onPress={onAddStoryPress}
        />
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
          No Stories Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          Stories from your friends will appear here
        </Text>
      </View>
    );
  };

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = (item: StoryWithUser, index: number) => {
    return `story-${item.id}-${index}`;
  };

  /**
   * Get item layout for performance optimization
   */
  const getItemLayout = (data: any, index: number) => ({
    length: 90, // Story item width + padding
    offset: 90 * index,
    index,
  });

  // Prepare data with add button at the beginning
  const listData = React.useMemo(() => {
    const data: (StoryWithUser | 'add-button')[] = [];
    
    if (onAddStoryPress) {
      data.push('add-button');
    }
    
    data.push(...stories);
    
    return data;
  }, [stories, onAddStoryPress]);

  /**
   * Render list item (either add button or story)
   */
  const renderListItem = ({ item, index }: { item: StoryWithUser | 'add-button'; index: number }) => {
    if (item === 'add-button') {
      return renderAddStoryButton();
    }
    
    return renderStoryItem({ item: item as StoryWithUser, index });
  };

  /**
   * Key extractor for combined list
   */
  const listKeyExtractor = (item: StoryWithUser | 'add-button', index: number) => {
    if (item === 'add-button') {
      return 'add-story-button';
    }
    
    return keyExtractor(item as StoryWithUser, index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={listData}
        renderItem={renderListItem}
        keyExtractor={listKeyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary || '#FFFC00'}
              colors={[theme.colors.primary || '#FFFC00']}
            />
          ) : undefined
        }
        ListEmptyComponent={!onAddStoryPress ? renderEmptyState : null}
      />
    </View>
  );
}

/**
 * Styles for the stories list component
 */
const styles = StyleSheet.create({
  container: {
    height: 120,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  storyItem: {
    marginHorizontal: 6,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 