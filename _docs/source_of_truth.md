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
- `RootNavigator.tsx` - Root navigation with auth flow detection, loading screen, and modal screens
- `AuthNavigator.tsx` - Authentication screens navigator with Login, Register, ProfileSetup, ForgotPassword
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

##### Auth Feature (src/features/auth/) - **IMPLEMENTED IN PHASE 2.1**

###### Auth Screens (src/features/auth/screens/)
- `LoginScreen.tsx` - Email/password login with form validation, error handling, navigation to register/forgot password
- `RegisterScreen.tsx` - User registration with email, password, username validation and availability checking
- `ForgotPasswordScreen.tsx` - Password reset screen (placeholder for future implementation)
- `ProfileSetupScreen.tsx` - Profile completion screen (placeholder for future implementation)

###### Auth Store (src/features/auth/store/)
- `authStore.ts` - Zustand store for authentication state with login, register, logout actions, session persistence

###### Auth Services (src/features/auth/services/)
- `authService.ts` - Firebase authentication service with login, register, logout, user profile management, error handling

###### Auth Types (src/features/auth/types/)
- `authTypes.ts` - TypeScript interfaces for User, LoginForm, RegisterForm, ProfileUpdate, AuthError, UserProfileData

###### Auth Hooks (src/features/auth/hooks/)
- `useAuthInitialization.ts` - Hook for setting up Firebase auth state listener and syncing with Zustand store

##### Camera Feature (src/features/camera/) - **IMPLEMENTED IN PHASE 2.3**

###### Camera Screens (src/features/camera/screens/)
- `CameraScreen.tsx` - Main camera interface with photo/video capture, permissions handling, recording timer, and navigation to preview
- `index.ts` - Camera screens export

###### Camera Components (src/features/camera/components/)
- `CameraView.tsx` - Expo Camera wrapper with proper configuration, type mapping, and permission handling
- `CameraControls.tsx` - Flash mode toggle, camera flip controls with animations, and mode indicators
- `CaptureButton.tsx` - Snapchat-style shutter button with recording animations, duration display, and responsive feedback
- `index.ts` - Camera components export

###### Camera Store (src/features/camera/store/)
- `cameraStore.ts` - Zustand store for camera state with permissions, settings, capture actions, filter system, text overlays, and performance selectors

###### Camera Types (src/features/camera/types/)
- `index.ts` - Complete TypeScript definitions for camera modes, settings, media capture, filters, text overlays, recording state, errors, and store interfaces

###### Camera Feature Export
- `index.ts` - Public API export for screens, components, store, and types

##### Other Features (Empty - To Be Implemented)
- `chat/` - Chat/messaging feature (empty)  
- `friends/` - Friends management feature (empty)
- `stories/` - Stories feature (empty)

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
- `RootNavigator()` - Root navigation component managing auth state and main navigation flow with loading screen

### src/shared/navigation/AuthNavigator.tsx
- `AuthNavigator()` - Authentication navigator with Login, Register, ProfileSetup, ForgotPassword screens

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

### Authentication Feature Functions

#### src/features/auth/store/authStore.ts
- `useAuthStore()` - Zustand store hook for authentication state
- `login(email, password)` - Login user with email and password
- `register(email, password, username)` - Register new user
- `logout()` - Logout current user
- `updateProfile(updates)` - Update user profile
- `clearError()` - Clear authentication errors
- `setUser(user)` - Set current user
- `setLoading(loading)` - Set loading state
- `setInitializing(initializing)` - Set initialization state
- `isProfileComplete()` - Check if user profile is complete
- `useAuthUser()` - Selector for current user
- `useIsAuthenticated()` - Selector for authentication status
- `useAuthLoading()` - Selector for loading state
- `useAuthError()` - Selector for error state
- `useIsInitializing()` - Selector for initialization state

#### src/features/auth/services/authService.ts
- `login(email, password)` - Firebase authentication login
- `register(email, password, username)` - Firebase user registration with profile creation
- `logout()` - Firebase logout
- `resetPassword(email)` - Send password reset email
- `getCurrentUser()` - Get current authenticated user
- `onAuthStateChanged(callback)` - Set up auth state change listener
- `checkUsernameAvailability(username)` - Check if username is available
- `createUserProfile(profile)` - Create user profile in database
- `getUserProfile(uid)` - Get user profile from database
- `updateLastActive(uid)` - Update user's last active timestamp
- `handleAuthError(error)` - Handle Firebase auth errors with user-friendly messages

#### src/features/auth/hooks/useAuthInitialization.ts
- `useAuthInitialization()` - Hook for setting up Firebase auth state listener and syncing with store

#### src/features/auth/screens/LoginScreen.tsx
- `LoginScreen({ navigation })` - Login screen component with form validation
- `onSubmit(data)` - Handle login form submission
- `navigateToRegister()` - Navigate to registration screen
- `navigateToForgotPassword()` - Navigate to forgot password screen
- `togglePasswordVisibility()` - Toggle password field visibility

#### src/features/auth/screens/RegisterScreen.tsx
- `RegisterScreen({ navigation })` - Registration screen component with form validation
- `onSubmit(data)` - Handle registration form submission
- `navigateToLogin()` - Navigate back to login screen
- `togglePasswordVisibility()` - Toggle password field visibility
- `toggleConfirmPasswordVisibility()` - Toggle confirm password field visibility

#### src/features/auth/screens/ForgotPasswordScreen.tsx
- `ForgotPasswordScreen({ navigation })` - Forgot password screen (placeholder)
- `navigateToLogin()` - Navigate back to login screen
- `handlePasswordReset()` - Handle password reset (placeholder)

#### src/features/auth/screens/ProfileSetupScreen.tsx
- `ProfileSetupScreen({ navigation })` - Profile setup screen with avatar upload, display name input, bio text area, form validation, and image picker integration
- `pickImage()` - Open image picker from photo library with permissions and validation
- `takePhoto()` - Capture photo with camera including permissions and error handling
- `showImagePickerOptions()` - Display camera vs library selection alert
- `onSubmit(data)` - Handle profile setup form submission with avatar upload and profile completion

### Camera Feature Functions

#### src/features/camera/store/cameraStore.ts
- `useCameraStore()` - Zustand store hook for camera state and actions
- `requestPermissions()` - Request camera, microphone, and media library permissions
- `checkPermissions()` - Check current permission status
- `updateSettings(settings)` - Update camera settings with partial updates
- `toggleCamera()` - Switch between front and back camera
- `setFlashMode(mode)` - Set flash mode (auto, on, off, torch)
- `capturePhoto()` - Capture photo and create media object with mock implementation
- `startVideoRecording()` - Start video recording with timer and auto-stop at 3 minutes
- `stopVideoRecording()` - Stop video recording and create media object
- `applyFilter(filter)` - Apply image filter to processed media
- `addTextOverlay(overlay)` - Add text overlay to media
- `updateTextOverlay(id, updates)` - Update specific text overlay properties
- `removeTextOverlay(id)` - Remove text overlay by ID
- `retakeMedia()` - Reset captured media and return to camera view
- `saveMedia()` - Save processed media to device (mock implementation)
- `discardMedia()` - Discard captured media and reset state
- `clearError()` - Clear error state
- `setError(error)` - Set error with type and message
- `toggleControls()` - Toggle camera controls visibility
- `setControlsVisible(visible)` - Set controls visibility state
- Performance selectors: `useCameraSettings()`, `useCameraPermissions()`, `useRecordingState()`, `useCapturedMedia()`, etc.

#### src/features/camera/screens/CameraScreen.tsx
- `CameraScreen({ navigation })` - Main camera screen with permissions, capture handling, and navigation
- `initializeCamera()` - Request permissions and setup camera on screen focus
- `handleCapture()` - Handle photo/video capture based on mode
- `handleScreenTap()` - Toggle controls visibility on screen tap
- `handleErrorDismiss()` - Clear camera errors

#### src/features/camera/components/CameraView.tsx
- `CameraView({ onTap, style }, ref)` - Expo Camera wrapper component
- `mapCameraType(type)` - Convert app camera type to Expo camera type
- `mapFlashMode(flashMode)` - Convert app flash mode to Expo flash mode
- `handleCameraReady()` - Handle camera ready callback

#### src/features/camera/components/CameraControls.tsx
- `CameraControls()` - Camera control buttons for flash, flip, and mode display
- `handleFlip()` - Handle camera flip with spring animation
- `handleFlashToggle()` - Cycle through flash modes (auto → on → off)

#### src/features/camera/components/CaptureButton.tsx
- `CaptureButton({ mode, isRecording, recordingDuration, onCapture })` - Animated capture button
- `handlePress()` - Handle capture button press with animations
- `formatDuration(duration)` - Format recording duration as MM:SS

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

### Authentication Feature Variables

#### src/features/auth/types/authTypes.ts
- `User` - Interface with uid, email, username, displayName, photoURL, createdAt, lastActive
- `LoginForm` - Interface with email, password
- `RegisterForm` - Interface with email, password, confirmPassword, username, displayName
- `ProfileUpdate` - Interface with optional displayName, username, photoURL
- `AuthError` - Interface with code, message
- `FirebaseUserData` - Interface with uid, email, displayName, photoURL, emailVerified
- `UserProfileData` - Interface with uid, email, username, displayName, photoURL, createdAt, lastActive
- `AuthAction` - Union type for auth reducer actions

#### src/features/auth/store/authStore.ts
- `AuthState` - Interface defining auth store state and actions
- `initialState` - Initial auth state object
- `useAuthStore` - Zustand store instance with auth state and actions

#### src/features/auth/services/authService.ts
- `AuthService` - Class containing all Firebase auth operations
- `authService` - Singleton instance of AuthService

## Naming Conventions

### Files
- **PascalCase**: React components and screens (`Button.tsx`, `LoginScreen.tsx`, `CameraScreen.tsx`)
- **camelCase**: Hooks, services, and utilities (`useAuth.ts`, `authService.ts`, `formatDate.ts`)
- **kebab-case**: Folders and configuration files (`user-profile/`, `api-config.json`)
- **dot.notation**: Type and config files (`firebase.config.ts`, `authTypes.ts`)

### Components
- **PascalCase**: All React components (`Button`, `Screen`, `RootNavigator`, `LoginScreen`)
- **Interface naming**: ComponentName + Props (`ButtonProps`, `ScreenProps`, `LoginScreenProps`)

### Functions
- **camelCase**: All functions (`useTheme`, `initializeFirebase`, `handlePress`, `onSubmit`)
- **Descriptive names**: Action verb + noun (`getFirebaseConfig`, `connectToEmulators`, `navigateToRegister`)

### Variables
- **camelCase**: All variables (`isDark`, `firebaseConfig`, `textStyles`, `isAuthenticated`)
- **UPPER_SNAKE_CASE**: Constants (`BASE_UNIT`, `ANIMATION_CONFIG`)
- **Descriptive names**: Clear purpose indication (`semanticSpacing`, `borderRadius`, `authService`)

### Types and Interfaces
- **PascalCase**: All types and interfaces (`AppTheme`, `ColorScheme`, `ButtonProps`, `User`, `AuthState`)
- **Descriptive suffixes**: Props, List, Config, State, etc.

### Folders
- **kebab-case**: All folder names (`shared/`, `components/`, `base/`, `auth/`)
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

### State Management
- `zustand` - State management library

### Forms and Validation
- `react-hook-form` - Form handling library

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

### Phase 2.1 - User Authentication (✅ COMPLETE)
- ✅ Registration screen with email/password/username fields
- ✅ Login screen with form validation
- ✅ Firebase Auth integration with error handling
- ✅ Auth store with Zustand for state management
- ✅ Session persistence and auto-login
- ✅ Auth state initialization and listener setup
- ✅ App opens to login page when not authenticated
- ✅ Navigation flow between auth screens
- ✅ Password visibility toggles
- ✅ Form validation with proper error messages
- ✅ Username availability checking
- ✅ User profile creation in Firebase Realtime Database
- ✅ Auth error handling with user-friendly messages

### Phase 2.2 - User Profile Setup (✅ COMPLETE)
- ✅ Profile setup screen post-registration
- ✅ Avatar upload to Firebase Storage with camera/library selection
- ✅ Display name and bio input with validation
- ✅ Form validation with character limits
- ✅ Image picker integration with permissions
- ✅ Profile completion tracking
- ✅ Skip profile setup option

### Phase 2.3 - Camera Implementation (✅ COMPLETE)
- ✅ Camera screen with Expo Camera integration
- ✅ Photo capture with shutter animations
- ✅ Video recording with 3-minute limit and timer
- ✅ Camera flip (front/back) functionality with animations
- ✅ Flash mode controls (auto/on/off/torch)
- ✅ Permission handling for camera, microphone, and media library
- ✅ Real-time recording indicator with duration display
- ✅ Controls visibility toggle on screen tap
- ✅ Navigation to preview screen after capture
- ✅ Comprehensive error handling and loading states
- ✅ TypeScript type safety throughout
- ✅ Performance-optimized Zustand store with selectors
- ✅ Snapchat-style UI with animations

### Next Phase - MVP Continuation
- Phase 2.4: Media Preview & Editing implementation
- Basic messaging features
- Friend system development
- Stories feature implementation 