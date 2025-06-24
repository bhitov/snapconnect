# SnapConnect Project Source of Truth

## Files and Purpose

### Root Level Configuration
- `App.tsx` - Main application entry point, sets up navigation and global providers
- `app.json` - Expo configuration with app metadata and build settings
- `package.json` - Dependencies, scripts, and project metadata
- `tsconfig.json` - TypeScript configuration with strict mode and path aliases
- `babel.config.js` - Babel configuration for React Native and path resolution
- `metro.config.js` - Metro bundler configuration
- `.eslintrc.js` - ESLint configuration with React Native and TypeScript rules
- `.prettierrc.js` - Prettier code formatting configuration
- `.gitignore` - Git ignore patterns for node_modules, .expo, build files
- `firebase.json` - Firebase project configuration for emulators and services
- `firestore.rules` - Firestore security rules (test mode - allows all reads/writes)
- `storage.rules` - Firebase Storage security rules (test mode - allows all reads/writes)
- `.firebaserc` - Firebase project aliases configuration
- `README.md` - Project documentation and setup instructions
- `NEW-PROJECT-SETUP.md` - Detailed setup guide for new developers
- `env.example` - Environment variables template with Firebase config examples

### Source Code Structure

#### App Entry Point
- `App.tsx` - Root component with GestureHandlerRootView and RootNavigator

#### Shared Components (src/shared/)

##### Navigation (src/shared/navigation/)
- `RootNavigator.tsx` - Root navigation with auth flow and modal screens
- `AuthNavigator.tsx` - Authentication screens navigator (placeholder)
- `MainNavigator.tsx` - Main tab navigation with Camera, Chats, Stories
- `types.ts` - Navigation type definitions for all stack param lists

##### Components (src/shared/components/)

###### Base Components (src/shared/components/base/)
- `Button/Button.tsx` - Primary button with variants, sizes, loading states, animations
- `Button/index.ts` - Button component export

###### Layout Components (src/shared/components/layout/)
- `Screen.tsx` - Screen wrapper with safe area and consistent styling
- `SnapPreviewScreen.tsx` - Placeholder screen for snap preview modal
- `ViewSnapScreen.tsx` - Placeholder screen for viewing received snaps

##### Hooks (src/shared/hooks/)
- `useTheme.ts` - Theme hook with dark mode detection and theme access

##### Services (src/shared/services/)
- `firebase/config.ts` - Firebase initialization and emulator configuration

##### Theme System (src/shared/theme/)
- `index.ts` - Main theme export combining all theme parts
- `colors.ts` - Color palette with Snapchat-inspired brand colors and dark mode
- `typography.ts` - Typography system with font families, sizes, weights, text styles
- `spacing.ts` - Spacing system using 8px grid with semantic spacing values

#### Features (src/features/)

##### Auth Feature (src/features/auth/)
- `README.md` - Authentication feature documentation
- `components/` - Auth-specific components (empty)
- `hooks/` - Auth hooks (empty)
- `screens/` - Auth screens (empty)
- `services/` - Auth API calls (empty)
- `store/` - Auth Zustand store (empty)
- `types/` - Auth TypeScript types (empty)
- `utils/` - Auth utilities (empty)

##### Camera Feature (src/features/camera/)
- `README.md` - Camera feature documentation
- `components/` - Camera components (empty)
- `hooks/` - Camera hooks (empty)
- `screens/` - Camera screens (empty)
- `services/` - Camera services (empty)
- `store/` - Camera state management (empty)
- `types/` - Camera types (empty)
- `utils/` - Camera utilities (empty)

##### Chat Feature (src/features/chat/)
- `README.md` - Chat/messaging feature documentation
- `components/` - Chat components (empty)
- `hooks/` - Chat hooks (empty)
- `screens/` - Chat screens (empty)
- `services/` - Chat services (empty)
- `store/` - Chat state management (empty)
- `types/` - Chat types (empty)
- `utils/` - Chat utilities (empty)

##### Friends Feature (src/features/friends/)
- `README.md` - Friends management feature documentation
- `components/` - Friends components (empty)
- `hooks/` - Friends hooks (empty)
- `screens/` - Friends screens (empty)
- `services/` - Friends services (empty)
- `store/` - Friends state management (empty)
- `types/` - Friends types (empty)
- `utils/` - Friends utilities (empty)

##### Stories Feature (src/features/stories/)
- `README.md` - Stories feature documentation
- `components/` - Stories components (empty)
- `hooks/` - Stories hooks (empty)
- `screens/` - Stories screens (empty)
- `services/` - Stories services (empty)
- `store/` - Stories state management (empty)
- `types/` - Stories types (empty)
- `utils/` - Stories utilities (empty)

### Documentation (_docs/)
- `project-overview.md` - Product requirements and feature specifications
- `project-rules.md` - Architectural patterns and development standards
- `tech-stack.md` - Technology choices and implementation patterns
- `theme-rules.md` - Design system rules and theme guidelines
- `ui-rules.md` - UI component guidelines and patterns
- `user-flow.md` - User experience flows and navigation patterns
- `phases/phase-1-setup.md` - Phase 1 setup completion documentation
- `phases/phase-2-mvp.md` - Phase 2 MVP development plan
- `phases/phase-3-social.md` - Phase 3 social features plan
- `phases/phase-4-polish.md` - Phase 4 polish and optimization plan
- `phases/README.md` - Development phases overview

## Functions and Purpose

### App.tsx
- `App()` - Main application component, returns GestureHandlerRootView with RootNavigator and StatusBar

### src/shared/navigation/RootNavigator.tsx
- `RootNavigator()` - Root navigation component managing auth state and main navigation flow

### src/shared/hooks/useTheme.ts
- `useTheme()` - Hook for accessing current theme, auto-switches between light/dark based on system preference
- `useIsDarkMode()` - Hook returning boolean if current theme is dark mode
- `useThemeColors()` - Hook returning only theme colors for convenience

### src/shared/components/base/Button/Button.tsx
- `Button()` - Primary button component with variants (primary, secondary, outline, ghost), sizes (small, medium, large), loading states, and animations
- `handlePress()` - Internal function handling button press with animation

### src/shared/components/layout/Screen.tsx
- `Screen()` - Screen wrapper component providing consistent layout and safe area handling

### src/shared/services/firebase/config.ts
- `initializeFirebase()` - Initialize Firebase services with configuration
- `connectToEmulators()` - Connect to Firebase emulators for development
- `getFirebaseConfig()` - Get Firebase configuration info
- `isFirebaseConfigured()` - Check if Firebase is properly configured

### src/shared/theme/index.ts
- Exports `lightTheme`, `darkTheme`, `defaultTheme` objects

## Variables and Data Structures

### App.tsx
- `isDark` - Boolean from useIsDarkMode hook

### src/shared/navigation/types.ts
- `RootStackParamList` - Navigation params for root stack (Auth, Main, SnapPreview, ViewSnap, Profile, AddFriends, CreateGroup)
- `AuthStackParamList` - Auth navigation params (Login, Register, ProfileSetup, ForgotPassword)
- `MainTabParamList` - Main tab params (Chats, Camera, Stories)
- `ChatStackParamList` - Chat navigation params (ChatsList, Chat, FriendRequests)
- `StoriesStackParamList` - Stories navigation params (StoriesList, ViewStory, CreateStory)

### src/shared/components/base/Button/Button.tsx
- `ButtonProps` - Interface with children, onPress, variant, size, loading, disabled, testID, fullWidth
- `ANIMATION_CONFIG` - Object with damping: 15, stiffness: 150

### src/shared/theme/colors.ts
- `colors` - Object with brand colors (primary: '#FFFC00', secondary: '#7209B7'), neutral colors, semantic colors, Snapchat-specific colors
- `darkColors` - Object extending colors with dark mode overrides
- `ColorScheme` - Type alias for colors object
- `ColorName` - Type for color keys

### src/shared/theme/typography.ts
- `fontFamilies` - Object with regular, medium, bold, semiBold, light font families (all 'System')
- `fontSizes` - Object with xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72
- `fontWeights` - Object with light: '300', normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800'
- `lineHeights` - Object with tight: 1.25, normal: 1.5, relaxed: 1.625, loose: 2
- `textStyles` - Object with h1-h6, bodyLarge, body, bodySmall, label, caption, buttonLarge, button, buttonSmall, username, timestamp, snapText

### src/shared/theme/spacing.ts
- `BASE_UNIT` - Constant 8 (8px grid system)
- `spacing` - Object with 0-64 spacing values based on 8px grid
- `semanticSpacing` - Object with component-specific spacing (buttonPadding, cardPadding, screenPadding, etc.)
- `borderRadius` - Object with none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 20, '3xl': 24, full: 9999
- `shadows` - Object with sm, md, lg, xl shadow definitions

### src/shared/theme/index.ts
- `AppTheme` - Interface defining theme structure
- `lightTheme` - Complete light theme object
- `darkTheme` - Complete dark theme object
- `defaultTheme` - Alias for lightTheme

### src/shared/services/firebase/config.ts
- `firebaseConfig` - Object with Firebase configuration from environment variables
- `app` - FirebaseApp instance
- `auth` - Auth service instance
- `database` - Database service instance
- `storage` - FirebaseStorage service instance
- `functions` - Functions service instance

## Naming Conventions

### Files
- **PascalCase**: React components and screens (`Button.tsx`, `CameraScreen.tsx`)
- **camelCase**: Hooks, services, and utilities (`useAuth.ts`, `formatDate.ts`)
- **kebab-case**: Folders and configuration files (`user-profile/`, `api-config.json`)
- **dot.notation**: Type and config files (`firebase.config.ts`, `types.ts`)

### Components
- **PascalCase**: All React components (`Button`, `Screen`, `RootNavigator`)
- **Interface naming**: ComponentName + Props (`ButtonProps`, `ScreenProps`)

### Functions
- **camelCase**: All functions (`useTheme`, `initializeFirebase`, `handlePress`)
- **Descriptive names**: Action verb + noun (`getFirebaseConfig`, `connectToEmulators`)

### Variables
- **camelCase**: All variables (`isDark`, `firebaseConfig`, `textStyles`)
- **UPPER_SNAKE_CASE**: Constants (`BASE_UNIT`, `ANIMATION_CONFIG`)
- **Descriptive names**: Clear purpose indication (`semanticSpacing`, `borderRadius`)

### Types and Interfaces
- **PascalCase**: All types and interfaces (`AppTheme`, `ColorScheme`, `ButtonProps`)
- **Descriptive suffixes**: Props, List, Config, etc.

### Folders
- **kebab-case**: All folder names (`shared/`, `components/`, `base/`)
- **Feature-based**: Organized by domain (`auth/`, `camera/`, `chat/`)

## Development Scripts (package.json)

### Core Scripts
- `start` - Start Expo development server
- `android` - Start with Android emulator
- `ios` - Start with iOS simulator
- `web` - Start web version
- `build` - Build with EAS Build
- `typecheck` - Run TypeScript type checking
- `format` - Format code with Prettier
- `lint` - Run ESLint
- `test` - Run Jest tests

### Firebase Scripts
- `emulator` - Start Firebase emulators
- `emulator:ui` - Start Firebase emulator UI

## Dependencies

### Core Framework
- `expo` - React Native framework
- `react` - React library
- `react-native` - React Native core

### Navigation
- `@react-navigation/native` - Navigation core
- `@react-navigation/native-stack` - Stack navigator
- `@react-navigation/bottom-tabs` - Tab navigator

### UI and Animation
- `react-native-elements` - UI component library
- `react-native-reanimated` - Animation library
- `react-native-gesture-handler` - Gesture handling
- `react-native-safe-area-context` - Safe area handling

### Backend and Storage
- `firebase` - Firebase SDK
- `@react-native-async-storage/async-storage` - Local storage

### Development Tools
- `typescript` - TypeScript compiler
- `eslint` - Code linting
- `prettier` - Code formatting
- `jest` - Testing framework

## Project Status

### Phase 1 - Setup (✅ COMPLETE)
- Project structure established
- Navigation system implemented
- Theme system fully configured
- Base components created
- Firebase configuration ready
- Development environment set up

### Next Phase - MVP Development
- User authentication implementation
- Camera functionality
- Basic messaging features
- Friend system
- Stories feature 