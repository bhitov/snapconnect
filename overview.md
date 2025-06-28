Based on the provided documentation, SnapConnect is a messaging application that blends ephemeral media sharing with persistent text-based chat and provides AI-powered relationship coaching.

Core Features and User Interaction
Authentication
Users can create an account, log in, and manage their profile.

LoginScreen.tsx: Users enter their email and password to sign in. Test credentials are provided for "alex_chen@example.com" with the password "pass123word".

RegisterScreen.tsx: New users can sign up by providing a username, email, and password.

ProfileSetupScreen.tsx: After registering, users are prompted to complete their profile by adding a display name, bio, and avatar.

ProfileSettingsScreen.tsx: Users can edit their profile picture, update their bio, and log out of the application.

ProfileScreen.tsx: A read-only screen to view a user's profile information, including their avatar, name, and bio.

ForgotPasswordScreen.tsx: A placeholder screen for users who have forgotten their password.

Friends System
The app includes a complete system for managing friendships.

FriendsListScreen.tsx: This is the default screen after logging in and displays the user's current friends. From here, users can navigate to add friends or view requests.

AddFriendsScreen.tsx: Users can search for other users by username and send them friend requests.

FriendRequestsScreen.tsx: This screen has two tabs for managing incoming and outgoing friend requests. Users can accept or reject requests they've received.

Hybrid Chat & Snaps
SnapConnect supports both persistent text messages and ephemeral photo/video "snaps" within the same conversation.

ChatsScreen.tsx: This screen lists all conversations. Unread messages are indicated, and users can tap a conversation to open it.

ChatScreen.tsx: This is the main interface for a conversation. Users can type and send text messages or tap a camera icon to create a snap. The screen displays both text messages and received snaps in chronological order.

CameraScreen.tsx: Accessed from the ChatScreen or the main tab bar, this screen allows users to capture photos and videos.

SnapPreviewScreen.tsx: After capturing media, this screen allows the user to preview it, add a text overlay, and apply filters before sending.

RecipientSelectionScreen.tsx: After previewing a snap, users select one or more friends to send it to and set a viewing duration.

SnapViewingScreen.tsx: When a user taps on a received snap in the ChatScreen, this screen opens to display the photo or video for a set duration. The snap is marked as "viewed" after it has been seen.

Stories
Users can post stories that are visible to their friends for 24 hours.

StoriesScreen.tsx: This screen displays a list of friends' stories. It also features a MyStoryCard component where users can see their own active story and the number of viewers.

CameraScreen.tsx: Users create stories by capturing a photo or video here.

RecipientSelectionScreen.tsx: After capturing media, users can choose to post it to their story.

ViewStoryScreen.tsx: Tapping on a story opens this full-screen viewer, which automatically advances through the story's posts. Progress bars at the top indicate the number of posts in the story.

Groups
The application supports group chats with multiple friends.

GroupsScreen.tsx: This screen lists all group conversations the user is a part of.

CreateGroupScreen.tsx: Users can create a new group by selecting friends from their friends list and giving the group a name.

GroupInfoScreen.tsx: From a group chat, users can navigate here to see group details and a list of members.

ManageGroupMembersScreen.tsx: Admins of a group can add or remove members from this screen.

AI Relationship Coach
This feature provides Gottman-style relationship coaching within the app. The AI coach functionality has been fully implemented.

ChatScreen.tsx: From any regular chat, a user can tap a "🎓 Coach" icon in the header to start a private "coach chat".

The coach chat itself reuses the ChatScreen component, but with special styling for messages from the coach (who has the senderId of "coach"). In the coach chat header, a "Prompts" button replaces the coach icon.

CoachModal.tsx: Tapping the "Prompts" button in a coach chat opens this modal, which allows the user to request different types of conversation analysis, such as "Positive/Negative Ratio," "Four Horsemen Analysis," or "Love Map Questions". The coach then provides the analysis as a message in the chat.

ChatsScreen.tsx: On the main list of conversations, a "🎓" badge appears on any chat that has an associated coach chat, allowing for direct navigation to the coaching session.
