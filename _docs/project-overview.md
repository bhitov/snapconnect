# SnapConnect MVP - Product Requirements Document

## 1. Executive Summary

### Project Overview
Build a simple, functional Snapchat clone with ephemeral messaging, stories, and real-time features using React Native (Expo), TypeScript, and Firebase.

### Target Platform
- Primary: Android
- Secondary: iOS (cross-platform compatible)

### Tech Stack
- **Frontend**: React Native with Expo (managed workflow)
- **Language**: TypeScript
- **UI Library**: React Native Elements + Expo components
- **Backend**: Firebase (Auth, Realtime Database, Storage)
- **Camera**: Expo Camera API
- **Development Tools**: Expo Go for testing

## 2. Core Features (Days 1-3)

### 2.1 User Authentication
**Priority**: Day 1

**Requirements**:
- Email/password registration and login
- Google OAuth integration
- Profile creation (username, display name, profile picture)
- Secure session management

**Technical Implementation**:
```typescript
// Firebase Auth methods to implement
- createUserWithEmailAndPassword()
- signInWithEmailAndPassword()  
- signInWithPopup(GoogleAuthProvider)
- onAuthStateChanged() listener
```

### 2.2 Camera & Media Capture
**Priority**: Day 1-2

**Requirements**:
- Take photos
- Record videos (up to 3 minutes)
- Switch between front/back camera
- Simple black & white filter
- Save to temporary storage before sending

**Technical Implementation**:
```typescript
// Expo Camera API
- Camera.takePictureAsync()
- Camera.recordAsync()
- Camera.Constants.Type (front/back)
- Image manipulation for B&W filter
```

### 2.3 Friend Management
**Priority**: Day 2

**Requirements**:
- Search users by username
- Send/accept/reject friend requests
- View friends list
- Remove friends
- Real-time friend status updates

**Database Structure**:
```typescript
/users/{userId}/
  - profile: { username, displayName, photoURL }
  - friends: { [friendId]: true }
  - friendRequests: { 
      sent: { [userId]: timestamp }
      received: { [userId]: timestamp }
    }
```

### 2.4 Ephemeral Messaging (Snaps)
**Priority**: Day 2-3

**Requirements**:
- Send photo/video to specific friends
- View received snaps (one-time viewing)
- Auto-delete after 24 hours
- Real-time delivery notifications
- Unopened snap indicators

**Database Structure**:
```typescript
/snaps/{snapId}/
  - senderId: string
  - recipientId: string
  - mediaUrl: string
  - mediaType: 'photo' | 'video'
  - timestamp: number
  - viewed: boolean
  - expiresAt: number (timestamp + 24 hours)
```

### 2.5 Stories
**Priority**: Day 3

**Requirements**:
- Post snaps to story (visible to all friends)
- View friends' stories
- Stories expire after 24 hours
- Story view count and viewer list
- Real-time story updates

**Database Structure**:
```typescript
/stories/{userId}/
  - posts: {
      [postId]: {
        mediaUrl: string
        mediaType: string
        timestamp: number
        expiresAt: number
        views: { [viewerId]: timestamp }
      }
    }
```

### 2.6 Group Messaging
**Priority**: Day 3

**Requirements**:
- Create groups with multiple friends
- Send snaps to groups
- Basic group management (add/remove members)
- Group snap visibility for all members

## 3. User Interface Design

### 3.1 Screen Architecture

```
├── Auth Screens
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ProfileSetupScreen
├── Main App (Tab Navigator)
│   ├── CameraScreen (Center - Default)
│   ├── ChatsScreen (Left)
│   ├── StoriesScreen (Right)
│   └── ProfileScreen
├── Modal Screens
│   ├── PreviewScreen (after capture)
│   ├── ViewSnapScreen
│   ├── AddFriendsScreen
│   └── CreateGroupScreen
```

### 3.2 Navigation Flow

```typescript
// Navigation structure
const AppNavigator = {
  Auth: {
    Login,
    Register,
    ProfileSetup
  },
  Main: {
    TabNavigator: {
      Chats,
      Camera, // Default tab
      Stories
    }
  },
  Modals: {
    Preview,
    ViewSnap,
    AddFriends,
    CreateGroup
  }
}
```

### 3.3 UI Components (React Native Elements)

- **Headers**: Use `Header` component with custom styling
- **Buttons**: Use `Button` with Snapchat yellow (#FFFC00)
- **Lists**: Use `ListItem` for chats and friends
- **Input**: Use `Input` with custom styling
- **Avatars**: Use `Avatar` for profile pictures
- **Overlays**: Use `Overlay` for modals

## 4. Technical Architecture

### 4.1 Project Structure

```
snapconnect/
├── app.json
├── App.tsx
├── package.json
├── tsconfig.json
├── firebase.config.ts
├── src/
│   ├── components/
│   │   ├── Camera/
│   │   ├── Chat/
│   │   ├── Story/
│   │   └── Common/
│   ├── screens/
│   │   ├── Auth/
│   │   ├── Main/
│   │   └── Modals/
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── camera.service.ts
│   │   ├── chat.service.ts
│   │   └── story.service.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCamera.ts
│   │   └── useRealtime.ts
│   ├── utils/
│   │   ├── firebase.ts
│   │   └── media.utils.ts
│   └── types/
│       └── index.ts
```

### 4.2 State Management

Use React Context + Hooks for simplicity:

```typescript
// contexts/
- AuthContext: User authentication state
- ChatContext: Active chats and messages
- StoryContext: Stories data
- FriendsContext: Friends list and requests
```

### 4.3 Firebase Configuration

```typescript
// firebase.config.ts
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

// Initialize services
- Firebase Auth
- Firebase Realtime Database
- Firebase Storage
```

## 5. Development Setup Guide

### 5.1 Prerequisites
```bash
# Required installations
- Node.js (v16+)
- npm or yarn
- Expo CLI: npm install -g expo-cli
- Expo Go app on your Android phone
```

### 5.2 Quick Start
```bash
# Create project
expo init snapconnect --template expo-template-blank-typescript

# Install dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-elements react-native-vector-icons
npm install firebase
npm install expo-camera expo-media-library expo-image-manipulator
npm install react-native-safe-area-context react-native-screens

# Start development
expo start
# Scan QR code with Expo Go app
```

### 5.3 Environment Setup
```typescript
// .env (create this file)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
```

## 6. Key Implementation Details

### 6.1 Camera with Filter
```typescript
// Simple B&W filter implementation
const applyBlackWhiteFilter = async (photoUri: string) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    photoUri,
    [],
    { 
      compress: 0.8, 
      format: ImageManipulator.SaveFormat.JPEG,
      base64: false 
    }
  );
  // Apply grayscale in post-processing
  return manipResult.uri;
};
```

### 6.2 Ephemeral Message System
```typescript
// Auto-delete after 24 hours
const scheduleSnapDeletion = (snapId: string) => {
  const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
  database.ref(`snaps/${snapId}/expiresAt`).set(expirationTime);
  
  // Cloud Function will handle deletion
  // Or use client-side cleanup on app launch
};
```

### 6.3 Real-time Updates
```typescript
// Listen for new snaps
useEffect(() => {
  const snapsRef = database.ref(`snaps`).orderByChild('recipientId').equalTo(userId);
  
  snapsRef.on('child_added', (snapshot) => {
    const newSnap = snapshot.val();
    // Update UI with new snap
  });
  
  return () => snapsRef.off();
}, [userId]);
```

## 7. Testing Strategy

### 7.1 Development Testing
- Use Expo Go app for real-time testing
- Test on multiple Android devices/versions
- Use Firebase Emulator Suite for offline testing

### 7.2 Test Scenarios
1. **Auth Flow**: Register → Login → Logout
2. **Friend Flow**: Search → Add → Accept → Send Snap
3. **Snap Flow**: Capture → Preview → Send → View → Auto-delete
4. **Story Flow**: Post → View → Check viewers → Expire

## 8. Performance Considerations

### 8.1 Media Optimization
- Compress images to max 1080p
- Limit video to 720p for faster uploads
- Use Firebase Storage's built-in CDN

### 8.2 Database Optimization
- Index frequently queried fields
- Paginate large lists (friends, chats)
- Clean expired content regularly

## 9. Security Rules

### 9.1 Firebase Realtime Database Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('friends').child($uid).exists()",
        ".write": "$uid === auth.uid"
      }
    },
    "snaps": {
      "$snapId": {
        ".read": "data.child('recipientId').val() === auth.uid || data.child('senderId').val() === auth.uid",
        ".write": "!data.exists() && newData.child('senderId').val() === auth.uid"
      }
    }
  }
}
```

## 10. Deliverables Checklist

### Day 1-3 Completion Criteria
- [ ] Working authentication (email/password + Google)
- [ ] Camera functionality with B&W filter
- [ ] Friend system with requests
- [ ] Send and receive disappearing snaps
- [ ] Stories feature
- [ ] Basic group messaging
- [ ] Deployed to Expo (testable via Expo Go)
- [ ] Clean, organized TypeScript codebase
- [ ] Basic error handling and loading states

This PRD focuses on simplicity and speed of development while maintaining a professional structure that can be enhanced with RAG features in Phase 2.