/**
 * @file typography.ts
 * @description Typography system for SnapConnect.
 * Defines font families, sizes, weights, and text styles.
 */

import { TextStyle } from 'react-native';

// Font Families
export const fontFamilies = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semiBold: 'System',
  light: 'System',
} as const;

// Font Sizes (using 8px base scale)
export const fontSizes = {
  xs: 12,    // 0.75rem
  sm: 14,    // 0.875rem
  base: 16,  // 1rem - base size
  lg: 18,    // 1.125rem
  xl: 20,    // 1.25rem
  '2xl': 24, // 1.5rem
  '3xl': 30, // 1.875rem
  '4xl': 36, // 2.25rem
  '5xl': 48, // 3rem
  '6xl': 60, // 3.75rem
  '7xl': 72, // 4.5rem
} as const;

// Font Weights
export const fontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// Line Heights (relative to font size)
export const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Text Styles for common use cases
export const textStyles = {
  // Headers
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
  } as TextStyle,
  
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  } as TextStyle,
  
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  } as TextStyle,
  
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
  } as TextStyle,
  
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,
  
  h6: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,
  
  // Body Text
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,
  
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,
  
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,
  
  // Labels and Captions
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,
  
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
  } as TextStyle,
  
  // Buttons
  buttonLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.tight,
  } as TextStyle,
  
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
  } as TextStyle,
  
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.tight,
  } as TextStyle,
  
  // Special Styles
  username: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,
  
  timestamp: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
  } as TextStyle,
  
  snapText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
    textAlign: 'center',
  } as TextStyle,
} as const;

export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type TextStyleName = keyof typeof textStyles; 