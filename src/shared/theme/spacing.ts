/**
 * @file spacing.ts
 * @description Spacing system for SnapConnect using 8px grid.
 * Defines consistent spacing values for margins, padding, and layout.
 */

// Base unit: 8px grid system
const BASE_UNIT = 8;

export const spacing = {
  // Base spacing units (8px grid)
  0: 0,
  1: BASE_UNIT * 0.5, // 4px
  2: BASE_UNIT, // 8px
  3: BASE_UNIT * 1.5, // 12px
  4: BASE_UNIT * 2, // 16px
  5: BASE_UNIT * 2.5, // 20px
  6: BASE_UNIT * 3, // 24px
  7: BASE_UNIT * 3.5, // 28px
  8: BASE_UNIT * 4, // 32px
  10: BASE_UNIT * 5, // 40px
  12: BASE_UNIT * 6, // 48px
  16: BASE_UNIT * 8, // 64px
  20: BASE_UNIT * 10, // 80px
  24: BASE_UNIT * 12, // 96px
  32: BASE_UNIT * 16, // 128px
  40: BASE_UNIT * 20, // 160px
  48: BASE_UNIT * 24, // 192px
  56: BASE_UNIT * 28, // 224px
  64: BASE_UNIT * 32, // 256px
} as const;

// Semantic spacing for common use cases
export const semanticSpacing = {
  // Component spacing
  buttonPadding: spacing[4], // 16px
  buttonPaddingSmall: spacing[3], // 12px
  buttonPaddingLarge: spacing[6], // 24px

  // Input spacing
  inputPadding: spacing[4], // 16px
  inputMargin: spacing[3], // 12px

  // Card spacing
  cardPadding: spacing[4], // 16px
  cardMargin: spacing[3], // 12px
  cardGap: spacing[2], // 8px

  // Screen spacing
  screenPadding: spacing[4], // 16px
  screenMargin: spacing[6], // 24px

  // List spacing
  listItemPadding: spacing[4], // 16px
  listItemGap: spacing[2], // 8px
  listSectionGap: spacing[6], // 24px

  // Header spacing
  headerPadding: spacing[4], // 16px
  headerHeight: 56, // 56px

  // Tab bar spacing
  tabBarHeight: spacing[10], // 40px
  tabBarPadding: spacing[2], // 8px

  // Modal spacing
  modalPadding: spacing[6], // 24px
  modalMargin: spacing[8], // 32px

  // Camera interface
  cameraButtonSize: spacing[20], // 80px
  cameraControlsGap: spacing[8], // 32px

  // Snap elements
  snapPreviewMargin: spacing[4], // 16px
  snapTextPadding: spacing[3], // 12px

  // Friends list
  friendItemHeight: spacing[16], // 64px
  friendAvatarSize: spacing[12], // 48px

  // Stories
  storyRingSize: spacing[20], // 80px
  storyGap: spacing[2], // 8px
} as const;

// Border radius values
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999, // Fully rounded
} as const;

// Shadow/elevation values
export const shadows = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.23,
    shadowRadius: 4.5,
    elevation: 8,
  },
  xl: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 6.0,
    elevation: 12,
  },
} as const;

export type SpacingValue = keyof typeof spacing;
export type SemanticSpacingValue = keyof typeof semanticSpacing;
export type BorderRadiusValue = keyof typeof borderRadius;
export type ShadowValue = keyof typeof shadows;
