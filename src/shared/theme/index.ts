/**
 * @file index.ts
 * @description Main theme system export for SnapConnect.
 * Combines colors, typography, spacing, and provides theme configuration.
 */

import { colors, darkColors } from './colors';
import { spacing, semanticSpacing, borderRadius, shadows } from './spacing';
import { textStyles, fontSizes, fontWeights } from './typography';

// Theme interface
export interface AppTheme {
  colors: Record<string, string>;
  typography: typeof textStyles;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  spacing: typeof spacing;
  semanticSpacing: typeof semanticSpacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
}

// Light theme
export const lightTheme: AppTheme = {
  colors,
  typography: textStyles,
  fontSizes,
  fontWeights,
  spacing,
  semanticSpacing,
  borderRadius,
  shadows,
  isDark: false,
};

// Dark theme
export const darkTheme: AppTheme = {
  colors: darkColors,
  typography: textStyles,
  fontSizes,
  fontWeights,
  spacing,
  semanticSpacing,
  borderRadius,
  shadows,
  isDark: true,
};

// Default theme (light)
export const defaultTheme = lightTheme;

// Export individual theme parts
export * from './colors';
export * from './typography';
export * from './spacing';

// Export theme type
export type { AppTheme as Theme };
