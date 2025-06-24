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
- `firebase.json` - Firebase project configuration for emulators, services, and database rules
- `firestore.rules` - Firestore security rules (test mode - allows all reads/writes)
- `storage.rules` - Firebase Storage security rules (test mode - allows all reads/writes)
- `database.rules.json` - Firebase Realtime Database rules with indexing for username, email, friendship, and friend request queries
- `.firebaserc` - Firebase project aliases configuration
- `README.md` - Project documentation and setup instructions
- `NEW-PROJECT-SETUP.md` - Detailed setup guide for new developers
- `env.example` - Environment variables template with Firebase config examples

### Source Code Structure

#### App Entry Point
- `App.tsx` - Root component with GestureHandlerRootView and RootNavigator

#### Shared Components (src/shared/)

##### Navigation (src/shared/navigation/)
- `RootNavigator.tsx` - Root navigation with auth flow detection, loading screen, and modal screens (SnapPreview, RecipientSelection, ViewSnap)
- `AuthNavigator.tsx` - Authentication screens navigator with Login, Register, ProfileSetup, ForgotPassword
- `MainNavigator.tsx` - Main tab navigation with Chats, Camera, Friends, Stories tabs and separate stack navigators for Chats and Friends (snap-focused, no traditional chat screens)
- `types.ts` - Navigation type definitions for all stack param lists including simplified ChatStackParamList and FriendsStackParamList

##### Components (src/shared/components/)

###### Base Components (src/shared/components/base/)
- `Button/Button.tsx` - Primary button with variants, sizes, loading states, animations
- `Button/index.ts` - Button component export

###### Layout Components (src/shared/components/layout/)
- `Screen.tsx` - Screen wrapper with safe area and consistent styling
- `SnapPreviewScreen.tsx` - Complete media preview and editing screen with filters, text overlays, and actions
- `ViewSnapScreen.tsx` - Placeholder screen for viewing received snaps

##### Hooks (src/shared/hooks/)
- `useTheme.ts` - Theme hook with dark mode detection and theme access

##### Services (src/shared/services/)
- `firebase/config.ts` - Firebase initialization and emulator configuration

##### Utilities (src/shared/utils/)
- `idGenerator.ts` - Simple ID generation utilities for creating unique IDs without external dependencies

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
- `cameraStore.ts` - Zustand store for camera state with permissions, settings, capture actions, filter system, text overlays, performance selectors, and custom ID generation

###### Camera Types (src/features/camera/types/)
- `index.ts` - Complete TypeScript definitions for camera modes, settings, media capture, filters, text overlays, recording state, errors, and store interfaces

###### Camera Feature Export
- `index.ts` - Public API export for screens, components, store, and types

##### Friends Feature (src/features/friends/) - **IMPLEMENTED IN PHASE 2.5**

###### Friends Screens (src/features/friends/screens/)
- `AddFriendsScreen.tsx` - User search and friend request sending screen with debounced search, friendship status display, and real-time request sending
- `FriendRequestsScreen.tsx` - Friend request management with tabbed interface for sent/received requests, accept/reject functionality, and real-time updates
- `FriendsListScreen.tsx` - Friends list display with friend count, online status, chat navigation, and friend request badge notifications
- `index.ts` - Friends screens export

###### Friends Store (src/features/friends/store/)
- `friendsStore.ts` - Zustand store for friends state management with friends list, friend requests, search functionality, real-time updates, performance selectors, and comprehensive error handling

###### Friends Services (src/features/friends/services/)
- `friendsService.ts` - Firebase service for friends operations with user search, friend request management, friendship creation, real-time listeners, and comprehensive error handling

###### Friends Types (src/features/friends/types/)
- `index.ts` - Complete TypeScript definitions for friend requests, friendships, search results, store interfaces, component props, Firebase documents, and error handling

##### Chat Feature (src/features/chat/) - **IMPLEMENTED IN PHASES 2.6-2.8**

###### Chat Screens (src/features/chat/screens/)
- `ChatsScreen.tsx` - Main chats list showing conversations with real-time updates and snap/message previews
- `RecipientSelectionScreen.tsx` - Recipient selection and duration controls for snap sending
- `SnapViewingScreen.tsx` - Snap viewing with timer, pause/resume functionality, and viewed status updates
- `ChatScreen.tsx` - Individual chat screen with hybrid text and snap messaging, message list, and text input
- `index.ts` - Chat screens export

###### Chat Store (src/features/chat/store/)
- `chatStore.ts` - Zustand store for chat state with conversations, messages (both text and snaps), sending progress, viewing sessions, and recipient selection

###### Chat Services (src/features/chat/services/)
- `chatService.ts` - Firebase service for chat operations with text messaging, snap sending, conversation management, real-time listeners, and hybrid message handling

###### Chat Types (src/features/chat/types/)
- `index.ts` - Complete TypeScript definitions for hybrid messaging with text messages, snap messages, conversations, upload progress, viewing sessions, and store interfaces

##### Stories Feature (src/features/stories/) - **IMPLEMENTED IN PHASE 3.1**

###### Stories Screens (src/features/stories/screens/)
- `StoriesScreen.tsx` - Main stories screen showing friends' stories in horizontal list with add story functionality and navigation to viewer
- `ViewStoryScreen.tsx` - Full-screen story viewer with tap controls, progress tracking, auto-advance, and pause/resume functionality
- `index.ts` - Stories screens export

###### Stories Components (src/features/stories/components/)
- `StoriesList.tsx` - Horizontal FlatList of stories with performance optimizations, pull-to-refresh, and add story button
- `StoryRing.tsx` - Animated colorful border component for unviewed stories with three sizes, rotating animations, and multi-layer border design
- `StoryProgressBar.tsx` - Progress bar component showing progress through multiple story posts with animated segments
- `index.ts` - Stories components export

###### Stories Store (src/features/stories/store/)
- `storiesStore.ts` - Zustand store for stories state with story data, viewing sessions, upload progress, UI state, and performance selectors

###### Stories Services (src/features/stories/services/)
- `storiesService.ts` - Firebase service for stories operations with story creation, loading, deletion, view tracking, and real-time updates

###### Stories Types (src/features/stories/types/)
- `index.ts` - Complete TypeScript definitions for stories, posts, viewing sessions, upload progress, privacy levels, and component interfaces

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

### Shared Utilities

#### src/shared/utils/idGenerator.ts
- `generateId()` - Generate timestamp-based unique ID (format: "1703123456789_abc123def")
- `generateShortId()` - Generate shorter random ID for non-critical uniqueness
- `generateUuidLike()` - Generate UUID-like string with standard format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

### Authentication Feature Functions

#### src/features/auth/store/authStore.ts
- `useAuthStore()` - Zustand store hook for authentication state
- `login(email, password)` - Login user with email and password

### Stories Feature Functions

#### src/features/stories/store/storiesStore.ts
- `useStoriesStore()` - Zustand store hook for stories state management
- `loadStories()` - Load all friends' stories from Firebase with active post filtering
- `refreshStories()` - Refresh stories data without loading state
- `loadMyStory()` - Load current user's story data
- `createStory(data, onProgress?)` - Create new story post with upload progress tracking
- `deleteStoryPost(storyId, postId)` - Delete specific story post
- `deleteStory(storyId)` - Delete entire story
- `startViewing(story)` - Start viewing session for story with auto-advance
- `nextPost()` - Navigate to next post in viewing session
- `previousPost()` - Navigate to previous post in viewing session
- `pauseViewing()` - Pause auto-advance during viewing
- `resumeViewing()` - Resume auto-advance during viewing
- `stopViewing()` - End viewing session and cleanup
- `markPostAsViewed(storyId, postId)` - Mark story post as viewed by current user

#### src/features/stories/services/storiesService.ts
- `createStory(data, onProgress?)` - Upload story post to Firebase with media upload and progress tracking
- `getStories()` - Fetch all friends' stories with active post filtering and user data population
- `getMyStory()` - Fetch current user's story with active posts
- `deleteStoryPost(storyId, postId)` - Remove story post from Firebase
- `deleteStory(storyId)` - Remove entire story from Firebase
- `markPostAsViewed(storyId, postId)` - Update view tracking in Firebase

#### src/features/stories/screens/StoriesScreen.tsx
- `StoriesScreen()` - Main stories screen component with story list and navigation
- `handleRefresh()` - Refresh stories data with loading state
- `handleAddStory()` - Navigate to camera for story creation
- `handleStoryPress(story)` - Navigate to story viewer with story data
- `handleErrorDismiss()` - Clear error state

#### src/features/stories/screens/ViewStoryScreen.tsx
- `ViewStoryScreen()` - Full-screen story viewer with tap controls
- `loadStory()` - Load story data for viewing (mock data implementation)
- `startProgress()` - Begin progress animation for current post
- `goToNextPost()` - Navigate to next post or close viewer
- `goToPreviousPost()` - Navigate to previous post
- `handleLeftTap()` - Handle tap on left side for previous post
- `handleRightTap()` - Handle tap on right side for next post
- `handlePauseResume()` - Toggle pause/resume for auto-advance
- `handleClose()` - Close story viewer
- `handlePostChange(index)` - Jump to specific post from progress bar
- `markAsViewed()` - Mark current post as viewed
- `getTimeAgo(timestamp)` - Format timestamp to relative time string

#### src/features/stories/components/StoriesList.tsx
- `StoriesList()` - Horizontal scrollable list of story rings
- `renderStoryItem()` - Render individual story ring item
- `handleAddStoryPress()` - Handle add story button press
- `handleStoryPress(story)` - Handle story ring press

#### src/features/stories/components/StoryRing.tsx
- `StoryRing()` - Animated story ring with colorful multi-layer border
- `handlePress()` - Handle story ring press with feedback

#### src/features/stories/components/StoryProgressBar.tsx
- `StoryProgressBar()` - Progress bars for multiple story posts
- `handleSegmentPress(index)` - Handle tap on progress segment to jump to post
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
- `capturePhoto(cameraRef)` - **REAL CAPTURE**: Capture photo using Expo Camera takePictureAsync API
- `startVideoRecording(cameraRef)` - **REAL RECORDING**: Start video recording using Expo Camera recordAsync API
- `stopVideoRecording(cameraRef)` - **REAL RECORDING**: Stop video recording using Expo Camera stopRecording API
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
- `RootStackParamList` - Navigation params for root stack (Auth, Main, SnapPreview, RecipientSelection, ViewSnap, Profile, CreateGroup)
- `AuthStackParamList` - Auth navigation params (Login, Register, ProfileSetup, ForgotPassword)
- `MainTabParamList` - Main tab params (Chats, Camera, Friends, Stories)
- `ChatStackParamList` - Chat navigation params (ChatsList only - snap-focused messaging)
- `FriendsStackParamList` - Friends navigation params (FriendsList, AddFriends, FriendRequests, Profile)
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
- ✅ Profile setup screen post-registration with full functionality
- ✅ Avatar upload to Firebase Storage with camera/library selection
- ✅ Display name and bio input with validation
- ✅ Form validation with character limits
- ✅ Image picker integration with permissions
- ✅ Profile completion tracking
- ✅ Skip profile setup option
- ✅ **NOW CONNECTED**: Registration flow properly navigates to ProfileSetup screen
- ✅ **NOW CONNECTED**: RootNavigator checks profile completion status
- ✅ **NOW CONNECTED**: AuthNavigator shows ProfileSetup for incomplete profiles

### Phase 2.3 - Camera Implementation (✅ COMPLETE)
- ✅ Camera screen with Expo Camera integration
- ✅ **REAL PHOTO CAPTURE**: Actual photo capture using Expo Camera API with takePictureAsync
- ✅ **REAL VIDEO RECORDING**: Actual video recording using Expo Camera API with recordAsync/stopRecording
- ✅ Video recording with 3-minute limit and timer
- ✅ Camera flip (front/back) functionality with animations
- ✅ Flash mode controls (auto, on, off, torch)
- ✅ Permissions handling for camera and microphone
- ✅ Comprehensive Zustand store with camera state management
- ✅ Camera controls component with responsive animations
- ✅ Capture button with recording animations and duration display
- ✅ Error handling and loading states
- ✅ Real-time recording timer with auto-stop at 3 minutes
- ✅ Camera settings persistence and performance optimization
- ✅ **FIXED**: Removed mock data, now captures actual photos/videos with proper URIs

### Phase 2.4 - Media Preview & Editing (✅ COMPLETE)
- ✅ **IMPLEMENTED**: SnapPreviewScreen with full media preview functionality
- ✅ **IMPLEMENTED**: Photo and video preview with proper aspect ratio handling
- ✅ **IMPLEMENTED**: Black & white filter using Image Manipulator (placeholder implementation)
- ✅ **IMPLEMENTED**: Single text overlay capability with add/edit/remove functionality
- ✅ **IMPLEMENTED**: Text overlay positioning and customization (font size, color)
- ✅ **IMPLEMENTED**: Text overlay edit and removal options (Edit Text / Remove buttons)
- ✅ **IMPLEMENTED**: Discard/retake functionality (back navigation to camera)
- ✅ **IMPLEMENTED**: Save to device option with media library permissions
- ✅ **IMPLEMENTED**: Send snap action button (placeholder for Phase 2.6)
- ✅ **IMPLEMENTED**: Processing states and loading indicators
- ✅ **IMPLEMENTED**: Error handling for filter application and media saving
- ✅ **IMPLEMENTED**: Responsive UI with proper theme integration
- ✅ **IMPLEMENTED**: Video playback controls for video preview

### Phase 2.5 - Friend System (Basic) (✅ COMPLETE)
- ✅ **IMPLEMENTED**: Friend search by username with real-time Firebase queries and debounced search input
- ✅ **IMPLEMENTED**: Friend request sending with comprehensive validation and error handling
- ✅ **IMPLEMENTED**: Friend requests inbox with tabbed interface for sent/received requests
- ✅ **IMPLEMENTED**: Accept/reject friend request logic with automatic friendship creation
- ✅ **IMPLEMENTED**: Friends list with Firebase integration, real-time updates, and navigation
- ✅ **IMPLEMENTED**: Complete Zustand store with performance selectors and state management
- ✅ **IMPLEMENTED**: Firebase service with real-time listeners and comprehensive error handling
- ✅ **IMPLEMENTED**: Full TypeScript type system for friends functionality
- ✅ **IMPLEMENTED**: **DEDICATED FRIENDS TAB**: Separate Friends tab in main navigation with FriendsListScreen as main screen
- ✅ **IMPLEMENTED**: **FRIENDS STACK NAVIGATION**: AddFriends and FriendRequests accessible through Friends tab navigation
- ✅ **IMPLEMENTED**: UI components with theme integration, loading states, and responsive design
- ✅ **FIXED**: Firebase Realtime Database indexing for username search queries
- ✅ **FIXED**: Firebase undefined value validation errors in friend request creation
- ✅ **FIXED**: Proper handling of optional photoURL fields to prevent Firebase validation errors
- ✅ **FIXED**: Friend request acceptance/rejection now properly removes requests from pending list
- ✅ **FIXED**: Consistent filtering of pending-only friend requests across all functions
- ✅ **UPDATED**: Removed Add Friends functionality from Chats tab for cleaner separation of concerns

### Phase 2.6 - Snap Sending (✅ COMPLETE)
- ✅ **IMPLEMENTED**: RecipientSelectionScreen with friend selection and duration controls
- ✅ **IMPLEMENTED**: Complete snap upload to Firebase Storage with progress tracking
- ✅ **IMPLEMENTED**: Snap metadata creation in Firebase Realtime Database with conversation management
- ✅ **IMPLEMENTED**: Send confirmation and loading states with comprehensive error handling
- ✅ **IMPLEMENTED**: Snap sending service with retry logic and multi-recipient support
- ✅ **IMPLEMENTED**: Integration with SnapPreviewScreen for seamless media sending flow
- ✅ **IMPLEMENTED**: Real-time conversation updates and unread count management
- ✅ **IMPLEMENTED**: Complete Zustand store with snap sending state and progress tracking
- ✅ **FIXED**: Firebase key restriction issue - changed unreadCount from object with user ID keys to clean array format with participant indices, using direct array replacement for updates

### Phase 2.7 - Snap Receiving & Viewing (✅ COMPLETE)
- ✅ **IMPLEMENTED**: ChatsScreen showing received snaps with real-time conversation updates
- ✅ **IMPLEMENTED**: Real-time snap listener with Firebase integration and automatic refresh
- ✅ **IMPLEMENTED**: SnapViewingScreen with timer, pause/resume functionality, and proper snap loading
- ✅ **IMPLEMENTED**: Viewed status update to Firebase with automatic conversation refresh
- ✅ **IMPLEMENTED**: Tap-and-hold to pause timer with video controls integration
- ✅ **IMPLEMENTED**: Snap expiration checking and proper error handling for expired/viewed snaps
- ✅ **IMPLEMENTED**: Complete viewing session management with Zustand store
- ✅ **IMPLEMENTED**: Real snap data loading instead of mock data with proper type safety
- ✅ **FIXED**: Firebase key restrictions resolved by using array indices instead of user ID keys

### Phase 2.8 - Hybrid Text + Snap Messaging (✅ COMPLETE)
- ✅ **IMPLEMENTED**: Extended type system with `MessageType` union ('text' | 'snap')
- ✅ **IMPLEMENTED**: `BaseMessage` interface with shared properties for all message types
- ✅ **IMPLEMENTED**: `TextMessage` and `SnapMessage` interfaces extending BaseMessage
- ✅ **IMPLEMENTED**: Unified `Message` union type for hybrid messaging
- ✅ **IMPLEMENTED**: Updated conversation types to support `lastMessage` instead of `lastSnap`
- ✅ **IMPLEMENTED**: Extended Chat service with `sendTextMessage()` for persistent text messaging
- ✅ **IMPLEMENTED**: `getMessages()` method combining text messages and snaps chronologically
- ✅ **IMPLEMENTED**: Updated `markMessageAsViewed()` to handle both text and snap messages
- ✅ **IMPLEMENTED**: Chat store updated from `currentSnaps` to `currentMessages` for unified message handling
- ✅ **IMPLEMENTED**: Individual `ChatScreen.tsx` with message list and text input
- ✅ **IMPLEMENTED**: `MessageItem` component rendering both text messages and snaps differently
- ✅ **IMPLEMENTED**: Real-time message loading and automatic read receipt marking
- ✅ **IMPLEMENTED**: Navigation integration for individual chat screens
- ✅ **FIXED**: TypeScript errors in `SnapViewingScreen.tsx` with proper type checking for Message union
- ✅ **FIXED**: Updated `getMessage()` method to return proper Message union type
- ✅ **FIXED**: Fixed function calls from `markSnapAsViewed` to `markMessageAsViewed`
- ✅ **FIXED**: Firebase database indexes added for textMessages, snaps, and conversations collections
- ✅ **FIXED**: Snap sending now redirects to chats with "View Chats" and "Take Another" options
- ✅ **FIXED**: Friends list now includes chat icon alongside snap icon for easy text messaging access
- ✅ **FIXED**: Friend requests button already includes notification badge for pending requests

### Phase 2.9+ - Not Started

#### src/shared/components/layout/SnapPreviewScreen.tsx
- `SnapPreviewScreen()` - Complete media preview screen with editing capabilities
- `applyBlackWhiteFilter()` - Apply black & white filter to photos using Image Manipulator
- `removeFilter()` - Remove applied filter and show original image
- `addTextOverlay()` - Add or update single text overlay to media with positioning and styling
- `removeTextOverlay()` - Remove the current text overlay
- `saveToDevice()` - Save media to device photo library with permissions
- `handleRetake()` - Navigate back to camera for retaking media
- `handleSend()` - Navigate to recipient selection screen with media data
- `renderTextOverlay()` - Render the single text overlay with proper positioning

### Chat Feature Functions

#### src/features/chat/screens/ChatScreen.tsx
- `ChatScreen()` - Individual chat screen with hybrid text and snap messaging
- `loadMessages()` - Load messages for the conversation with real-time updates
- `handleSendMessage()` - Send text message with validation and conversation updates
- `handleSnapPress(snap)` - Handle snap message press to navigate to viewing screen
- `handleCameraPress()` - Navigate to main tab for camera access
- `renderMessage(message)` - Render individual message item with type-specific display
- `scrollToBottom()` - Auto-scroll to bottom when new messages arrive

#### src/features/chat/screens/SnapViewingScreen.tsx
- `SnapViewingScreen()` - Snap viewing screen with timer and pause functionality
- `loadSnap()` - Load snap data with type checking for Message union type
- `handleSnapComplete()` - Handle snap completion with viewed status update
- `startTimer()` - Start countdown timer with pause/resume support
- `stopTimer()` - Stop and cleanup timer
- `handlePressIn()` - Handle press start for pause functionality
- `handlePressOut()` - Handle press end for resume functionality

#### src/features/chat/screens/RecipientSelectionScreen.tsx
- `RecipientSelectionScreen()` - Recipient selection with friend list, duration controls, and story posting options
- `handleRecipientToggle(friendId)` - Toggle friend selection for snap sending
- `handleSendSnap()` - Send snap to selected recipients with progress tracking
- `handlePostStory(privacy)` - Post snap as story with specified privacy level (friends/public)
- `renderFriendItem(friend)` - Render friend item with selection state
- `renderDurationOption(duration)` - Render duration selection option
- `renderStoryOption(option)` - Render story privacy option with icon and description

### Friends Feature Functions

#### src/features/friends/store/friendsStore.ts
- `useFriendsStore()` - Zustand store hook for friends state and actions
- `loadFriends()` - Load friends list from Firebase with error handling
- `refreshFriends()` - Refresh friends list with loading state
- `loadFriendRequests()` - Load sent and received friend requests from Firebase
- `sendFriendRequest(data)` - Send friend request with validation and status updates
- `respondToFriendRequest(response)` - Accept or reject friend request with friendship creation
- `cancelFriendRequest(requestId)` - Cancel sent friend request
- `searchUsers(query)` - Search users by username with debouncing and friendship status
- `clearSearch()` - Clear search results and query
- `removeFriend(friendshipId)`

#### src/features/chat/services/chatService.ts
- `sendTextMessage(data)` - Send persistent text message with conversation management
- `createConversation(otherUserId)` - Create or get existing conversation between two users
- `sendSnap(data, onProgress)` - Send snap with media upload, metadata creation, and progress tracking
- `getConversations()` - Get all conversations for current user with populated user data
- `getMessages(conversationId)` - Get all messages (text and snaps) in a conversation chronologically
- `getTextMessages(conversationId)` - Private method to get text messages for a conversation
- `getSnapMessages(conversationId)` - Private method to get snap messages for a conversation
- `getSnaps(conversationId)` - Legacy method - get all snaps in a conversation
- `getMessage(messageId)` - Get message data by ID (supports both text and snap messages)
- `getMessageData(messageId)` - Private method for getting message data from both collections
- `markMessageAsViewed(messageId)` - Mark message as viewed (supports both text and snap messages)
- `markSnapAsViewed(snapId)` - Legacy method - mark snap as viewed (calls markMessageAsViewed)
- `onConversationsChange(callback)` - Real-time listener for conversation updates
- `onMessagesChange(conversationId, callback)` - Real-time listener for message updates (text and snaps)
- `cleanupExpiredMessages()` - Remove expired messages from storage and database
- `handleError(error)` - Convert Firebase errors to user-friendly messages
- `uploadMedia(mediaUri, mediaType, onProgress)` - Upload media to Firebase Storage
- `findConversation(user1Id, user2Id)` - Find existing conversation between users
- `updateConversationWithMessage(conversationId, messageId, messageType, timestamp, recipientId)` - Update conversation metadata with message info
- `getUserData(userId)` - Get user profile data

#### src/features/chat/store/chatStore.ts
- `useChatStore()` - Zustand store hook for chat state and actions
- `loadConversations()` - Load conversations from Firebase with user data population
- `refreshConversations()` - Refresh conversations with loading state management
- `createConversation(otherUserId)` - Create new conversation between users
- `loadMessages(conversationId)` - Load messages (text and snaps) for specific conversation
- `sendTextMessage(data)` - Send text message with conversation updates
- `sendSnap(data)` - Send snap with progress tracking and conversation updates
- `markMessageAsViewed(messageId)` - Mark message as viewed (supports both text and snap messages)
- `startViewingSnap(snap)` - Initialize snap viewing session with timer
- `pauseViewingSnap()` - Pause viewing session and timer
- `resumeViewingSnap()` - Resume viewing session with remaining time
- `stopViewingSnap()` - End viewing session and cleanup
- `setSelectedRecipients(recipients)` - Set recipient list for snap sending
- `addRecipient(recipientId)` - Add recipient to selection
- `removeRecipient(recipientId)` - Remove recipient from selection
- `clearRecipients()` - Clear all selected recipients
- `clearError()` - Clear all error states
- `clearSendError()` - Clear send error state
- `clearMessagesError()` - Clear messages error state
- Performance selectors: `useConversations()`, `useConversationsLoading()`, `useCurrentMessages()`, `useSendingMessages()`, `useViewingSession()`, `useSelectedRecipients()`, etc.

### src/features/chat/types/index.ts
- `MessageType` - Union type for message types ('text' | 'snap')
- `SnapMediaType` - Type for photo/video media types
- `MessageStatus` - Type for message status (sent, delivered, viewed, expired)
- `SnapDuration` - Type for viewing duration (1-10 seconds)
- `BaseMessage` - Base interface with shared properties for all message types
- `TextMessage` - Text message interface extending BaseMessage with persistent text content
- `SnapMessage` - Snap message interface extending BaseMessage with media, text overlay, duration, expiration
- `Message` - Union type for all message types (TextMessage | SnapMessage)
- `Snap` - Legacy snap interface for backward compatibility
- `TextMessageCreationData` - Text message creation data with text and recipient
- `SnapCreationData` - Snap data before upload (local URI, recipient, media type, text, duration)
- `MessageCreationData` - Union type for message creation data
- `SnapUploadProgress` - Upload progress tracking with snapId, progress percentage, status, error
- `Conversation` - Basic conversation interface with participants, last message info, unread count, timestamps
- `ConversationWithUser` - Conversation with populated user data and last message preview
- `TextMessageDocument` - Firebase text message document structure
- `SnapDocument` - Firebase snap document structure
- `ConversationDocument` - Firebase conversation document structure with participants array and unreadCount array using indices
- `SendSnapData` - Form data for snap sending with recipients and duration
- `SnapViewingSession` - Viewing session state with timing and pause functionality
- `ChatState`, `ChatActions`, `ChatStore` - Complete store interfaces for hybrid messaging state management
- `ChatError`, `ChatErrorType` - Error handling types
- Component prop interfaces: `RecipientSelectionProps`, `ConversationItemProps`, `SnapViewerProps`, `SnapTimerProps`, `ChatScreenProps`, `MessageItemProps`

### RecipientSelectionScreen Variables

#### src/features/chat/screens/RecipientSelectionScreen.tsx
- `DURATION_OPTIONS` - Array of SnapDuration values [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] for snap viewing duration
- `STORY_OPTIONS` - Array of story privacy options with privacy levels, titles, descriptions, and icons:
  - Friends Only: privacy 'friends', icon '👥', "Share with all your friends"
  - Public: privacy 'all', icon '🌎', "Share with everyone"