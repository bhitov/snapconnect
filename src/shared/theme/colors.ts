/**
 * @file colors.ts
 * @description Color palette for SnapConnect theme system.
 * Defines brand colors, semantic colors, and dark/light mode variations.
 */

export const colors = {
  // Brand Colors (Snapchat-inspired)
  secondary: '#FFFC00', // Snapchat yellow
  secondaryDark: '#E6E300',
  secondaryLight: '#FFFF33',

  // Secondary Colors
  primary: '#7209B7', // Deep purple
  primaryDark: '#5A0790',
  primaryLight: '#8F2BCF',

  // Neutral Colors
  black: '#000000',
  white: '#FFFFFF',

  // Grayscale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Snapchat-specific colors
  snapBlue: '#0EADFF',
  snapPurple: '#7B68EE',
  snapPink: '#FF69B4',
  snapGreen: '#32CD32',

  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundDark: '#000000',
  backgroundDarkSecondary: '#121212',

  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textInverse: '#FFFFFF',
  text: '#212121', // Alias for textPrimary

  // Surface Colors
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',

  // Border Colors
  border: '#E0E0E0',
  borderDark: '#424242',

  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
} as const;

export const darkColors = {
  ...colors,

  // Override for dark mode
  background: '#000000',
  backgroundSecondary: '#121212',

  textPrimary: '#FFFFFF',
  textSecondary: '#BDBDBD',
  textTertiary: '#757575',
  textInverse: '#212121',
  text: '#FFFFFF', // Alias for textPrimary in dark mode

  // Surface Colors for dark mode
  surface: '#121212',
  surfaceSecondary: '#1E1E1E',

  border: '#424242',

  // Adjusted overlays for dark mode
  overlay: 'rgba(255, 255, 255, 0.1)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  overlayDark: 'rgba(255, 255, 255, 0.2)',
} as const;

export type ColorScheme = typeof colors;
export type ColorName = keyof ColorScheme;
