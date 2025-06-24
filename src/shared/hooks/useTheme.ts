/**
 * @file useTheme.ts
 * @description Theme hook for accessing current theme and theme switching functionality.
 * Provides easy access to colors, typography, spacing, and theme state.
 */

import { useColorScheme } from 'react-native';

import { lightTheme, darkTheme, type AppTheme } from '../theme';

/**
 * Hook for accessing the current theme
 * Automatically switches between light and dark theme based on system preference
 *
 * @returns {AppTheme} Current theme object with colors, typography, spacing, etc.
 *
 * @example
 * ```tsx
 * const theme = useTheme();
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing[4],
 *   },
 *   title: {
 *     ...theme.typography.h1,
 *     color: theme.colors.textPrimary,
 *   },
 * });
 * ```
 */
export function useTheme(): AppTheme {
  const colorScheme = useColorScheme();

  // Return dark theme if system preference is dark, otherwise light theme
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

/**
 * Hook for checking if current theme is dark mode
 *
 * @returns {boolean} True if current theme is dark mode
 *
 * @example
 * ```tsx
 * const isDark = useIsDarkMode();
 * const statusBarStyle = isDark ? 'light-content' : 'dark-content';
 * ```
 */
export function useIsDarkMode(): boolean {
  const theme = useTheme();
  return theme.isDark;
}

/**
 * Hook for getting theme colors only
 * Convenient shortcut when you only need colors
 *
 * @returns {AppTheme['colors']} Current theme colors
 *
 * @example
 * ```tsx
 * const colors = useThemeColors();
 * return <View style={{ backgroundColor: colors.primary }} />;
 * ```
 */
export function useThemeColors() {
  const theme = useTheme();
  return theme.colors;
}
