An overview of the project's source code, detailing files, functions, and data structures.

src/ Directory
src/features/auth
hooks/useAuthInitialization.ts: This hook initializes the authentication state by setting up a listener for Firebase authentication state changes and synchronizing it with the Zustand store.

useAuthInitialization(): A hook that returns a boolean indicating if authentication is still initializing.

screens/ForgotPasswordScreen.tsx: A component for the forgot password screen, which currently displays a "Feature Coming Soon" message.

ForgotPasswordScreen(): The main component for this screen.

screens/index.ts: Exports all authentication-related screen components.

screens/LoginScreen.tsx: This component handles user login with email and password, including form validation and navigation. It is pre-filled with test credentials.

LoginScreen(): The main component for the login screen.

screens/ProfileScreen.tsx: A screen for displaying user profile information such as avatar, name, and bio in a read-only interface.

ProfileScreen(): The main component that displays the user profile.

screens/ProfileSettingsScreen.tsx: This screen allows users to manage their profile, including updating their profile picture, bio, and logging out.

ProfileSettingsScreen(): The main component for managing profile settings.

screens/ProfileSetupScreen.tsx: A component for the post-registration profile setup, which includes avatar upload and bio creation.

ProfileSetupScreen(): The main component for the profile setup screen.

screens/RegisterScreen.tsx: This component handles new user registration, including validation for email, password, and username.

RegisterScreen(): The main component for the user registration screen.

services/authService.ts: This service manages all Firebase authentication operations, including login, registration, logout, and user profile management.

login(email, password): Logs in a user with their email and password.

register(email, password, username): Registers a new user.

logout(): Logs out the current user.

resetPassword(email): Sends a password reset email.

getCurrentUser(): Retrieves the current authenticated user's profile.

onAuthStateChanged(callback): Sets up a listener for authentication state changes.

completeProfileSetup(uid, profileData): Completes the user's profile setup.

uploadAvatar(uid, avatar): Uploads a user's avatar.

updateUserProfile(uid, updates): Updates a user's profile.

getProfileCompletionStatus(user): Checks the completion status of a user's profile.

store/authStore.ts: This file contains the Zustand store for managing authentication state, including user data, loading states, and actions for login, logout, and profile updates.

useAuthStore: A hook to access the authentication store.

types/authTypes.ts: This file defines TypeScript types related to authentication.

Data Structures: User, LoginForm, RegisterForm, ProfileSetupForm, ProfileUpdate, AuthError, FirebaseUserData, UserProfileData, AvatarUpload, ProfileCompletionStatus, AuthAction.

src/features/camera
components/CameraControls.tsx: Provides camera control buttons for flash, flip, and settings.

CameraControls(): The main component for camera controls.

components/CameraView.tsx: A wrapper for the Expo Camera component that handles camera initialization and configuration.

CameraView(): The main camera view component.

components/CaptureButton.tsx: An animated capture button for taking photos and recording videos, with visual feedback.

CaptureButton(): The main component for the capture button.

components/index.ts: Exports all camera-related components.

screens/CameraScreen.tsx: The main camera screen for photo and video capture, handling permissions and navigation.

CameraScreen(): The main component for the camera screen.

screens/index.ts: Exports all camera-related screens.

store/cameraStore.ts: A Zustand store for managing camera state, including settings, permissions, media capture, and processing.

useCameraStore: A hook to access the camera store.

types/index.ts: Defines TypeScript types for the camera feature, including settings, media capture, and preview types.

Data Structures: CameraMode, CameraType, FlashMode, MediaType, CameraSettings, CapturedMedia, CameraPermissions, RecordingState, CameraControlsState, MediaPreviewProps, FilterType, MediaFilter, TextOverlay, ProcessedMedia, CameraError, CameraState, CameraActions, CameraStore, SnapCreationData, UseCameraReturn.

index.ts: Provides a public API for the camera feature by exporting its screens, components, store, and types.

src/features/chat
components/CoachModal.tsx: A modal component that provides options for coach analysis.

CoachModal(): The main component for the coach modal.

components/LoveMapMessage.tsx: A component for displaying coach messages with special highlighting for "Love Map" questions.

LoveMapMessage(): The main component for displaying Love Map messages.

hooks/usePolling.ts: A custom hook for polling data at regular intervals, which only triggers re-renders when data changes.

usePolling(): The main hook for data polling.

hooks/index.ts: Exports all chat-related hooks.

screens/ChatScreen.tsx: The screen for individual chats, displaying both text messages and snaps in chronological order.

ChatScreen(): The main component for the chat screen.

screens/ChatsScreen.tsx: The main screen for chats, showing a list of conversations with friends, including unread counts and real-time updates.

ChatsScreen(): The main component for displaying the list of chats.

screens/index.ts: Exports all chat-related screens.

screens/RecipientSelectionScreen.tsx: This screen allows users to select recipients and set a duration when sending a snap.

RecipientSelectionScreen(): The main component for selecting snap recipients.

screens/SnapViewingScreen.tsx: The screen for viewing received snaps, which includes a timer.

SnapViewingScreen(): The main component for viewing snaps.

services/chatService.ts: Manages chat functionality, including sending messages and snaps, and managing conversations with Firebase.

sendTextMessage(data): Sends a text message.

createGroup(name, memberIds, avatarUrl): Creates a group conversation.

createConversation(otherUserId): Creates or retrieves a one-on-one conversation.

sendSnap(data, onProgress): Sends a snap message.

getMessages(conversationId): Retrieves all messages for a conversation.

getConversations(): Retrieves all of the user's conversations.

markMessageAsDelivered(messageId): Marks a message as delivered.

markAllMessagesAsDelivered(conversationId): Marks all unread messages in a conversation as delivered.

services/coachService.ts: This service handles interactions with the AI relationship coach.

startCoachChat(parentCid): Starts a new coach chat.

sendCoachMessage(coachCid, parentCid, userText): Sends a message to the coach.

analyzeChat(coachCid, parentCid, messageCount): Requests the coach to analyze a conversation.

analyzeRatio(coachCid, parentCid): Requests an analysis of the positive/negative interaction ratio.

analyzeHorsemen(coachCid, parentCid): Requests an analysis for the "Four Horsemen" communication patterns.

generateLoveMap(coachCid, parentCid): Requests the generation of "Love Map" questions.

store/chatStore.ts: A Zustand store for managing chat state, including conversations, messages, and sending progress.

useChatStore: A hook to access the chat store.

types/index.ts: Defines TypeScript types for the chat and snap features.

Data Structures: MessageType, SnapMediaType, MessageStatus, SnapDuration, BaseMessage, TextMessage, SnapMessage, Message, Snap, TextMessageCreationData, SnapCreationData, MessageCreationData, SnapUploadProgress, Group, Conversation, ConversationWithUser, SendSnapData, SnapViewingSession, ChatState, ChatActions, ChatStore, TextMessageDocument, SnapDocument, ConversationDocument, ChatError, RecipientSelectionProps, ConversationItemProps, SnapViewerProps, SnapTimerProps, ChatScreenProps, MessageItemProps.

index.ts: Serves as the main export file for the chat feature, providing a public API for its screens, store, types, and services.

src/features/friends
screens/AddFriendsScreen.tsx: A screen for searching for and adding new friends.

AddFriendsScreen(): The main component for adding friends.

screens/FriendRequestsScreen.tsx: This screen is for managing both sent and received friend requests.

FriendRequestsScreen(): The main component for managing friend requests.

screens/FriendsListScreen.tsx: This screen displays the user's list of friends.

FriendsListScreen(): The main component for displaying the friends list.

screens/index.ts: Exports all friends-related screens.

services/friendsService.ts: This service handles all Firebase operations related to the friends system.

searchUsers(searchQuery): Searches for users by their username.

getFriendshipStatus(targetUserId): Retrieves the friendship status between the current user and a target user.

sendFriendRequest(data): Sends a friend request.

respondToFriendRequest(response): Responds to a friend request by either accepting or rejecting it.

cancelFriendRequest(requestId): Cancels a sent friend request.

getFriends(): Retrieves the current user's list of friends.

getFriendRequests(): Retrieves both sent and received friend requests for the current user.

removeFriend(friendshipId): Removes a friend.

onFriendRequestsChange(callback): Sets up a real-time listener for changes to friend requests.

onFriendsChange(callback): Sets up a real-time listener for changes to the friends list.

store/friendsStore.ts: A Zustand store for managing the state of the friends system, including the friends list, friend requests, and search functionality.

useFriendsStore: A hook to access the friends store.

types/index.ts: This file defines TypeScript types for the friends feature.

Data Structures: FriendRequestStatus, FriendshipStatus, FriendRequest, Friendship, FriendProfile, FriendSearchResult, SendFriendRequestData, FriendRequestResponse, FriendsState, FriendsActions, FriendsStore, FriendRequestNotification, FriendsErrorType, FriendsError, FriendRequestDocument, FriendshipDocument, FriendListItemProps, FriendRequestItemProps, SearchResultItemProps.

src/features/groups
screens/CreateGroupScreen.tsx: The screen for creating a new group chat, allowing users to select friends and set a group name.

CreateGroupScreen(): The main component for creating a group.

screens/GroupInfoScreen.tsx: This screen displays information about a group, including its members and settings.

GroupInfoScreen(): The main component for displaying group information.

screens/GroupsScreen.tsx: The main screen for groups, which shows a list of group conversations.

GroupsScreen(): The main component for the groups screen.

screens/ManageGroupMembersScreen.tsx: The screen for managing group members, including adding and removing them.

ManageGroupMembersScreen(): The main component for managing group members.

screens/index.ts: Exports all group-related screens.

src/features/stories
components/index.ts: Exports all stories-related components.

components/MyStoryCard.tsx: This component displays the user's own story, including the viewer count.

MyStoryCard(): The main component for displaying the user's story card.

components/StoriesList.tsx: A horizontally scrollable list of stories.

StoriesList(): The main component for the stories list.

components/StoryProgressBar.tsx: A progress bar that shows the progress through multiple story posts.

StoryProgressBar(): The main component for the story progress bar.

components/StoryRing.tsx: A component that displays a gradient border to indicate unviewed stories.

StoryRing(): The main component for the story ring.

screens/index.ts: Exports all stories-related screens.

screens/StoriesScreen.tsx: The main screen for stories, showing a feed of friends' stories.

StoriesScreen(): The main component for the stories screen.

screens/ViewStoryScreen.tsx: A full-screen story viewer with tap controls and progress tracking.

ViewStoryScreen(): The main component for viewing stories.

services/storiesService.ts: A Firebase service for all story-related operations.

createStory(data, onProgress): Creates a new story.

getFriendStories(): Retrieves stories from the user's friends.

getMyStory(): Retrieves the current user's story.

deleteStoryPost(storyId, postId): Deletes a specific post from a story.

deleteStory(storyId): Deletes an entire story.

markPostAsViewed(storyId, postId): Marks a story post as viewed.

getStoryViewers(storyId, postId): Retrieves the list of users who have viewed a story or post.

store/storiesStore.ts: A Zustand store for managing the state of stories, including data, viewing sessions, and upload progress.

useStoriesStore: A hook to access the stories store.

types/index.ts: Defines TypeScript types for the stories feature.

Data Structures: StoryPrivacy, StoryMediaType, StoryPostStatus, ViewData, StoryViewer, StoryPost, Story, StoryWithUser, StoryCreationData, StoryUploadProgress, StoryError, StoryDocument, StoryPostDocument, StoryViewingSession, StoriesState, StoriesActions, StoriesStore, StoryRingProps, StoryViewerProps, StoryItemProps, StoriesListProps, StoryProgressBarProps, StoriesScreenProps, ViewStoryScreenProps, CreateStoryScreenProps, PrivacyOption.

src/shared
components/base/Button/Button.tsx: A primary button component that supports multiple variants, sizes, and loading states.

Button: The main component for the button.

components/base/Button/index.ts: Exports the Button component and its props.

components/base/DropdownMenu.tsx: A reusable dropdown menu component.

DropdownMenu(): The main component for the dropdown menu.

components/base/ProfileAvatar/index.ts: Exports the ProfileAvatar component.

components/base/ProfileAvatar/ProfileAvatar.tsx: A component for displaying a user's profile avatar, which navigates to profile settings when tapped.

ProfileAvatar: The main component for the profile avatar.

components/layout/Screen.tsx: A screen wrapper component that provides a consistent layout with safe area handling.

Screen: The main component for the screen wrapper.

components/layout/SnapPreviewScreen.tsx: A screen for previewing and editing media before sending.

SnapPreviewScreen(): The main component for the snap preview screen.

components/layout/ViewSnapScreen.tsx: A placeholder screen for viewing snaps, which is planned for a future phase.

ViewSnapScreen(): The main component for the view snap screen.

hooks/useTheme.ts: A hook for accessing the current theme and switching between light and dark modes.

useTheme(): The main hook for accessing the theme.

navigation/AuthNavigator.tsx: The navigator for authentication-related screens.

AuthNavigator(): The main component for the authentication navigator.

navigation/MainNavigator.tsx: The main application navigator, which uses tab navigation for primary screens.

MainNavigator(): The main component for the tab navigator.

navigation/navigationRef.ts: Creates a navigation container ref that can be used to access navigation state.

navigationRef: An exported navigation container ref.

navigation/RootNavigator.tsx: The root navigator for the application, which handles the authentication flow and main app navigation.

RootNavigator(): The main component for the root navigator.

navigation/types.ts: This file defines TypeScript types for navigation.

Data Structures: RootStackParamList, AuthStackParamList, MainTabParamList, ChatStackParamList, FriendsStackParamList, StoriesStackParamList, GroupsStackParamList, StackNavigationProps.

services/firebase/config.ts: This file handles Firebase configuration and initialization.

initializeFirebase(): Initializes Firebase services.

connectToEmulators(): Connects to Firebase emulators for development.

getFirebaseConfig(): Retrieves the Firebase configuration.

isFirebaseConfigured(): Checks if Firebase is properly configured.

Exported Variables: app, auth, database, storage, functions, firebaseConfig.

services/firebase/debug.ts: This file contains utilities for debugging Firebase connectivity.

testFirebaseConnectivity(): Tests the connectivity to Firebase services.

checkNetworkConnectivity(): Checks the network connectivity for the Android emulator.

getEmulatorUrls(): Retrieves the emulator URLs for the current platform.

printEmulatorInfo(): Prints information about the emulator connection.

runFirebaseDebug(): Runs a complete suite of Firebase debugging checks.

theme/colors.ts: Defines the color palette for the application's theme system.

Exported Variables: colors, darkColors.

theme/index.ts: The main export for the theme system, combining colors, typography, and spacing.

Exported Variables: lightTheme, darkTheme, defaultTheme.

theme/spacing.ts: This file defines the spacing system for the application, based on an 8px grid.

Exported Variables: spacing, semanticSpacing, borderRadius, shadows.

theme/typography.ts: Defines the typography system for the application.

Exported Variables: fontFamilies, fontSizes, fontWeights, lineHeights, textStyles.

utils/idGenerator.ts: A utility for generating unique IDs.

generateId(): Generates a unique ID based on a timestamp and a random string.

generateShortId(): Generates a shorter random ID.

generateUuidLike(): Generates a string that resembles a UUID.

utils/isDev.ts: A utility to determine if the application is running in development mode.

isDev(): Returns true if the app is in development mode.

utils/resolveMediaUrl.ts: A utility for resolving media URLs based on the environment and platform.

resolveMediaUrl(mediaUrl): Resolves a media URL to be appropriate for the current environment.

functions/ Directory
src/index.ts: This file contains the Firebase Cloud Functions for the application.

startCoachChat(data): Creates a new coach chat for a given parent conversation.

coachReply(data): Generates a response from the AI coach.

coachAnalyze(data): Analyzes a conversation and provides insights.

coachRatio(data): Analyzes the positive-to-negative interaction ratio in a conversation.

coachHorsemen(data): Analyzes a conversation for the "Four Horsemen" communication patterns.

coachLoveMap(data): Generates "Love Map" questions based on the conversation.

Database Structures
users: Stores public user profiles.

Each document is keyed by userId and contains username, displayName, photoURL, createdAt, and lastActive.

conversations: Stores information about each chat conversation.

Each document is keyed by conversationId and contains an array of participants, unreadCount for each participant, and information about the lastMessage. Group conversations have an isGroup flag and a title.

groups: Contains metadata for group chats.

Each document is keyed by groupId and includes the group name, createdBy, createdAt, and a list of members with their roles.

textMessages & snaps: These collections store the actual messages.

Each message document is keyed by a unique ID and contains conversationId, senderId, recipientId, and the message content (text or mediaUrl).

stories: This collection holds data for user stories.

Each document, keyed by userId, contains a posts object with individual story posts. Each post has mediaUrl, timestamp, expiresAt, and a views object.
