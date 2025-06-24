/**
 * Phase 2: MVP - Core Functionality
 * 
 * This phase implements the minimum viable product with essential features:
 * authentication, camera capture, and basic ephemeral messaging. The goal
 * is to have a functional app where users can register, take photos, and
 * send disappearing messages to each other.
 * 
 * Duration: 5-7 days
 * Status: Not Started
 */

# Phase 2: MVP - Core Functionality

## Overview
Build the core SnapConnect experience with user authentication, camera functionality, and basic ephemeral messaging. This phase delivers a usable product that demonstrates the key value proposition.

## Success Criteria
- [ ] Users can register and login with email/password
- [ ] Camera captures photos and videos
- [ ] Users can send snaps that disappear after viewing
- [ ] Basic friend system allows users to connect
- [ ] Snaps auto-delete after 24 hours
- [ ] App handles offline/online states gracefully

## Features & Tasks

### 2.1 User Authentication
**Goal**: Implement secure user registration and login with Firebase Auth

**Steps**:
1. Create registration screen with email/password/username fields
2. Implement login screen with form validation
3. Add Firebase Auth integration with error handling
4. Create auth store with Zustand for state management
5. Implement session persistence and auto-login

### 2.2 User Profile Setup
**Goal**: Allow users to create and manage their profile

**Steps**:
1. Create profile setup screen post-registration
2. Implement avatar upload to Firebase Storage
3. Add username availability checking
4. Create user profile service for Firebase operations
5. Build profile data model and store

### 2.3 Camera Implementation
**Goal**: Build camera screen with photo/video capture

**Steps**:
1. Implement camera view with Expo Camera
2. Add photo capture with shutter animation
3. Create video recording with 3-minute limit
4. Add camera flip (front/back) functionality
5. Implement proper permissions handling

### 2.4 Media Preview & Editing
**Goal**: Allow users to preview and enhance captured media

**Steps**:
1. Create preview screen for captured media
2. Implement black & white filter using Image Manipulator
3. Add text overlay capability on snaps
4. Create discard/retake functionality
5. Add save to device option

### 2.5 Friend System (Basic)
**Goal**: Enable users to find and add friends

**Steps**:
1. Create friend search by username
2. Implement friend request sending
3. Build friend requests inbox
4. Add accept/reject friend request logic
5. Create friends list with Firebase integration

### 2.6 Snap Sending
**Goal**: Implement core snap sending functionality

**Steps**:
1. Create recipient selection screen
2. Upload snap media to Firebase Storage
3. Implement snap metadata creation in Realtime Database
4. Add send confirmation and loading states
5. Create snap sending service with retry logic

### 2.7 Snap Receiving & Viewing
**Goal**: Build snap inbox and viewing experience

**Steps**:
1. Create chats screen showing received snaps
2. Implement real-time snap listener
3. Build snap viewing screen with timer
4. Add viewed status update to Firebase
5. Implement tap-and-hold to pause timer

### 2.8 Ephemeral System
**Goal**: Ensure snaps disappear after viewing/24 hours

**Steps**:
1. Implement client-side snap expiration checking
2. Create Firebase Cloud Function for server-side deletion
3. Add automatic cleanup on app launch
4. Build snap lifecycle tracking
5. Implement secure viewing (prevent screenshots placeholder)

### 2.9 Basic Navigation Flow
**Goal**: Connect all screens with proper navigation

**Steps**:
1. Implement authenticated vs unauthenticated routing
2. Add swipe navigation between main screens
3. Create proper back navigation handling
4. Implement deep linking structure
5. Add navigation state persistence

### 2.10 Error Handling & Loading States
**Goal**: Provide smooth user experience with proper feedback

**Steps**:
1. Implement global error boundary
2. Add loading indicators for all async operations
3. Create toast notifications for success/error
4. Build offline mode detection and queuing
5. Add retry mechanisms for failed operations

## Technical Implementation Details

### Authentication Flow
```typescript
// Simplified auth flow
Register → Email Verification → Profile Setup → Main App
Login → Session Check → Main App
```

### Data Models

#### User Model
```typescript
interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastActive: number;
}
```

#### Snap Model
```typescript
interface Snap {
  id: string;
  senderId: string;
  recipientId: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  text?: string;
  createdAt: number;
  expiresAt: number;
  viewed: boolean;
  viewedAt?: number;
  duration: number; // viewing duration in seconds
}
```

### Security Rules
- Users can only read their own snaps
- Snaps can only be marked as viewed by recipient
- Friend relationships must be mutual
- Media URLs expire after 24 hours

## Performance Targets
- Camera ready in < 2 seconds
- Snap upload < 5 seconds on 4G
- Friend search results < 1 second
- App launch to camera < 3 seconds

## Deliverables

1. **Authentication System**
   - Working registration/login flows
   - Session management
   - Password reset functionality

2. **Camera Feature**
   - Photo and video capture
   - Black & white filter
   - Media preview and editing

3. **Messaging System**
   - Send snaps to friends
   - Receive and view snaps
   - Auto-deletion after viewing

4. **Friend Management**
   - Search and add friends
   - Accept/reject requests
   - View friends list

5. **Core Infrastructure**
   - Firebase integration complete
   - Error handling throughout
   - Basic offline support

## Testing Checklist
- [ ] Register new user successfully
- [ ] Login with existing credentials
- [ ] Capture and send photo snap
- [ ] Capture and send video snap
- [ ] Search and add friend
- [ ] Receive and view snap
- [ ] Verify snap deletion after viewing
- [ ] Test offline mode behavior
- [ ] Verify all error states

## Known Limitations (To Address Later)
- No group messaging yet
- No stories feature
- Basic UI without animations
- No chat history
- No advanced camera filters
- No push notifications

## Next Phase Preview
Phase 3 (Social Features) will add:
- Stories functionality
- Group messaging
- Push notifications
- Enhanced UI with animations
- Additional camera filters

---

This phase delivers the core value proposition: ephemeral photo/video messaging between friends, establishing SnapConnect as a functional social messaging app. 