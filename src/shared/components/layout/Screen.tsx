/**
 * @file Screen.tsx
 * @description Screen wrapper component with safe area and consistent styling.
 * Provides a standard container for all screens in the app.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';

export interface ScreenProps {
  /** Screen content */
  children: React.ReactNode;
  /** Whether the screen should be scrollable */
  scrollable?: boolean;
  /** Background color override */
  backgroundColor?: string;
  /** Safe area edges to apply */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Whether to include default padding */
  padding?: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Screen wrapper component
 * Provides consistent layout and safe area handling
 */
export function Screen({
  children,
  scrollable = false,
  backgroundColor,
  edges = ['top', 'bottom'],
  padding = true,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: backgroundColor || theme.colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: backgroundColor || theme.colors.background,
    },
    content: {
      flex: 1,
      padding: padding ? theme.semanticSpacing.screenPadding : 0,
    },
    scrollContent: {
      flexGrow: 1,
      padding: padding ? theme.semanticSpacing.screenPadding : 0,
    },
  });
  
  const content = scrollable ? (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, styles.content]}>
      {children}
    </View>
  );
  
  return (
    <SafeAreaView 
      style={styles.safeArea} 
      edges={edges}
      testID={testID}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor || theme.colors.background}
      />
      {content}
    </SafeAreaView>
  );
} 