/**
 * Theme Rules Document for SnapConnect
 * 
 * This document defines the visual design system including colors, typography,
 * spacing, shadows, and component-specific styling to ensure visual consistency
 * across the entire application. The theme supports both light and dark modes.
 */

# SnapConnect Theme Rules

## 1. Color System

### 1.1 Core Brand Colors
```typescript
const colors = {
  // Primary - Modern take on Snapchat yellow
  primary: '#FFD60A',        // Bright yellow for primary actions
  primaryDark: '#FFC300',    // Darker yellow for pressed states
  primaryLight: '#FFF3CD',   // Light yellow for backgrounds
  
  // Secondary - Modern purple accent
  secondary: '#7209B7',      // Deep purple for secondary actions
  secondaryDark: '#560BAD',  // Darker purple for pressed states
  secondaryLight: '#F72585', // Pink-purple for accents
  
  // Neutral Palette
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};
```

### 1.2 Semantic Colors
```typescript
const semanticColors = {
  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Functional Colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.60)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)',
    inverse: '#FFFFFF',
  },
  
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    overlay: 'rgba(0, 0, 0, 0.5)',
    camera: '#000000',
  },
  
  divider: 'rgba(0, 0, 0, 0.12)',
  
  // Social Colors
  online: '#44B700',
  offline: '#9E9E9E',
  typing: '#7209B7',
};
```

### 1.3 Dark Mode Colors
```typescript
const darkColors = {
  // Inverted backgrounds
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    overlay: 'rgba(0, 0, 0, 0.7)',
    camera: '#000000',
  },
  
  // Adjusted text colors
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.60)',
    disabled: 'rgba(255, 255, 255, 0.38)',
    hint: 'rgba(255, 255, 255, 0.38)',
    inverse: '#000000',
  },
  
  // Elevated surfaces
  surface: {
    1: '#1E1E1E',  // +5% lighter
    2: '#232323',  // +7% lighter
    3: '#252525',  // +8% lighter
    4: '#272727',  // +9% lighter
  },
  
  divider: 'rgba(255, 255, 255, 0.12)',
};
```

## 2. Typography System

### 2.1 Font Families
```typescript
const typography = {
  // Primary font stack
  fontFamily: {
    regular: 'System',  // SF Pro on iOS, Roboto on Android
    medium: 'System-Medium',
    semibold: 'System-Semibold',
    bold: 'System-Bold',
  },
  
  // Monospace for codes/numbers
  monoFamily: {
    regular: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
  },
};
```

### 2.2 Type Scale
```typescript
const typeScale = {
  // Display
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0,
  },
  
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  
  // Body
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  
  // Supporting
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  
  overline: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  
  // Interactive
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.75,
    textTransform: 'uppercase',
  },
  
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
};
```

## 3. Spacing System

### 3.1 Base Unit System
```typescript
const spacing = {
  // Base unit: 8px
  xxs: 4,   // 0.5x
  xs: 8,    // 1x
  sm: 12,   // 1.5x
  md: 16,   // 2x
  lg: 24,   // 3x
  xl: 32,   // 4x
  xxl: 48,  // 6x
  xxxl: 64, // 8x
};

// Usage function
const space = (multiplier: number) => 8 * multiplier;
```

### 3.2 Component Spacing
```typescript
const componentSpacing = {
  // Padding
  buttonPadding: {
    vertical: spacing.sm,
    horizontal: spacing.lg,
  },
  
  cardPadding: spacing.md,
  
  screenPadding: {
    horizontal: spacing.md,
    vertical: spacing.lg,
  },
  
  // Margins
  sectionMargin: spacing.xl,
  itemMargin: spacing.xs,
  
  // Icon spacing
  iconTextGap: spacing.xs,
  
  // List spacing
  listItemGap: spacing.xs,
  listSectionGap: spacing.lg,
};
```

## 4. Border & Radius System

### 4.1 Border Radius
```typescript
const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999, // Pills and circles
  
  // Component specific
  button: 24,
  card: 12,
  bottomSheet: 16,
  avatar: 9999,
  input: 8,
};
```

### 4.2 Border Widths
```typescript
const borderWidth = {
  none: 0,
  thin: StyleSheet.hairlineWidth,
  regular: 1,
  medium: 2,
  thick: 4,
  
  // Component specific
  input: 1,
  focusRing: 2,
};
```

## 5. Shadow & Elevation

### 5.1 Shadow System (iOS)
```typescript
const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
};
```

### 5.2 Elevation System (Android)
```typescript
const elevation = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
};
```

## 6. Animation & Motion

### 6.1 Timing Functions
```typescript
const animations = {
  // Durations
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  
  // Easing curves
  easing: {
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
    
    // Spring configurations
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
  },
};
```

### 6.2 Transition Patterns
```typescript
const transitions = {
  // Fade transitions
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: animations.duration.fast,
  },
  
  // Scale transitions
  scaleIn: {
    from: { scale: 0.95, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: animations.duration.normal,
  },
  
  // Slide transitions
  slideInRight: {
    from: { translateX: 100, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: animations.duration.normal,
  },
};
```

## 7. Component Styles

### 7.1 Button Styles
```typescript
const buttonStyles = {
  // Primary button
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    paddingVertical: componentSpacing.buttonPadding.vertical,
    paddingHorizontal: componentSpacing.buttonPadding.horizontal,
    ...shadows.md,
  },
  
  primaryText: {
    color: colors.black,
    ...typeScale.button,
  },
  
  // Secondary button
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: borderWidth.medium,
    borderColor: colors.primary,
    borderRadius: borderRadius.button,
    paddingVertical: componentSpacing.buttonPadding.vertical - borderWidth.medium,
    paddingHorizontal: componentSpacing.buttonPadding.horizontal,
  },
  
  secondaryText: {
    color: colors.primary,
    ...typeScale.button,
  },
  
  // Ghost button
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  
  ghostText: {
    color: colors.text.primary,
    ...typeScale.button,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  pressed: {
    transform: [{ scale: 0.95 }],
  },
};
```

### 7.2 Input Styles
```typescript
const inputStyles = {
  container: {
    marginBottom: spacing.md,
  },
  
  label: {
    ...typeScale.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  
  input: {
    height: 56,
    borderWidth: borderWidth.input,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    ...typeScale.body,
    color: colors.text.primary,
    backgroundColor: colors.background.paper,
  },
  
  focused: {
    borderColor: colors.primary,
    borderWidth: borderWidth.focusRing,
  },
  
  error: {
    borderColor: colors.error,
  },
  
  errorText: {
    ...typeScale.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
};
```

### 7.3 Card Styles
```typescript
const cardStyles = {
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.card,
    padding: componentSpacing.cardPadding,
    ...shadows.sm,
  },
  
  elevated: {
    ...shadows.md,
  },
  
  pressed: {
    ...shadows.none,
    opacity: 0.95,
  },
  
  header: {
    ...typeScale.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  
  content: {
    ...typeScale.body,
    color: colors.text.secondary,
  },
};
```

### 7.4 Avatar Styles
```typescript
const avatarStyles = {
  // Sizes
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  medium: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  
  large: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  
  // Story ring
  storyRing: {
    borderWidth: 2,
    borderColor: colors.secondary,
    padding: 2,
  },
  
  // Online indicator
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.white,
  },
};
```

### 7.5 Bottom Sheet Styles
```typescript
const bottomSheetStyles = {
  overlay: {
    backgroundColor: colors.background.overlay,
  },
  
  container: {
    backgroundColor: colors.background.default,
    borderTopLeftRadius: borderRadius.bottomSheet,
    borderTopRightRadius: borderRadius.bottomSheet,
    paddingTop: spacing.md,
    ...shadows.xl,
  },
  
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[400],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  
  content: {
    paddingHorizontal: componentSpacing.screenPadding.horizontal,
    paddingBottom: spacing.xl,
  },
};
```

## 8. Platform-Specific Theming

### 8.1 iOS Specific
```typescript
const iosTheme = {
  // iOS-style navigation bar
  navigationBar: {
    height: 44,
    backgroundColor: colors.background.default,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  
  // iOS-style tab bar
  tabBar: {
    height: 49,
    backgroundColor: colors.background.default,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
};
```

### 8.2 Android Specific
```typescript
const androidTheme = {
  // Material Design elevation
  cardElevation: elevation.sm,
  
  // Android-style status bar
  statusBar: {
    backgroundColor: colors.primary,
    barStyle: 'light-content',
  },
  
  // Ripple effect
  ripple: {
    color: colors.primary,
    borderless: false,
  },
};
```

## 9. Theme Provider Implementation

### 9.1 Theme Context
```typescript
import { ThemeProvider } from 'react-native-elements';

const theme = {
  colors,
  typography: typeScale,
  spacing,
  borderRadius,
  shadows: Platform.OS === 'ios' ? shadows : elevation,
  animations,
  components: {
    Button: buttonStyles,
    Input: inputStyles,
    Card: cardStyles,
    Avatar: avatarStyles,
    BottomSheet: bottomSheetStyles,
  },
};

const App = () => (
  <ThemeProvider theme={theme}>
    {/* Your app */}
  </ThemeProvider>
);
```

### 9.2 Dark Mode Support
```typescript
const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    ...theme,
    colors: isDark ? { ...theme.colors, ...darkColors } : theme.colors,
    isDark,
  };
};
```

---

This theme system provides a comprehensive visual design foundation for SnapConnect, ensuring consistency, accessibility, and a modern aesthetic across all platforms and screen sizes. 