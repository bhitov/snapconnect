/**
 * User Flow Document for SnapConnect
 * 
 * This document defines the complete user journey through the SnapConnect application,
 * detailing how users navigate between features and interact with core functionality.
 * It serves as a blueprint for UI/UX decisions and application architecture.
 */

# SnapConnect User Flow

## 1. Entry & Authentication Flow

### 1.1 App Launch (First Time)
```
App Launch → Login/Register Screen
├── Login Path
│   ├── Enter Email/Password
│   ├── "Forgot Password?" → Password Reset Flow
│   └── Login Success → Permission Requests → Main App (Camera)
└── Register Path
    ├── Enter Email/Password
    ├── Create Username & Display Name
    ├── Optional: Add Profile Picture
    ├── Account Creation Success
    └── Permission Requests → Main App (Camera)
```

### 1.2 Permission Requests (Post-Registration)
**Sequential Permission Prompts:**
1. **Camera Access** - Required for core functionality
2. **Microphone Access** - Required for video recording
3. **Photo Library Access** - Optional, for saving snaps
4. **Notifications** - Recommended for snap alerts

**Flow:** Each permission shows rationale → User accepts/denies → Next permission → Complete → Navigate to Camera

### 1.3 Returning User Flow
```
App Launch → Auth Check
├── Authenticated → Main App (Camera)
└── Not Authenticated → Login/Register Screen
```

## 2. Main Navigation Structure

### 2.1 Primary Navigation (Swipe-Based)
```
[Chats] ← swipe → [Camera] ← swipe → [Stories]
   ↓                  ↓ (default)           ↓
Friends List    Capture Interface    Friends' Stories
```

### 2.2 Tab Bar Navigation (Alternative Access)
- **Left Tab**: Chats & Friends
- **Center Tab**: Camera (highlighted)
- **Right Tab**: Stories
- **Profile Icon**: Top-left corner on any screen

## 3. Core Feature Flows

### 3.1 Camera & Snap Creation Flow
```
Camera Screen (Default Landing)
├── Take Photo → Preview Screen
├── Hold for Video (max 3 min) → Preview Screen
└── Preview Screen Options:
    ├── Add Text/Caption
    ├── Apply B&W Filter
    ├── Set View Duration (1-10 seconds)
    ├── Choose Recipients
    │   ├── Select Friends (multi-select)
    │   ├── Select Groups
    │   └── Add to My Story
    ├── Send → Confirmation → Return to Camera
    └── Discard → Return to Camera
```

### 3.2 Friend Management Flow
```
Profile Screen → Friends Section
├── View Friends List
├── Add Friends
│   └── Search by Username
│       ├── User Found → Send Request → Pending
│       └── User Not Found → "No user found"
├── Friend Requests Tab
│   ├── Received Requests → Accept/Reject
│   └── Sent Requests → View/Cancel
└── Friend Actions (Long Press)
    ├── Remove Friend → Confirmation
    └── Block User → Confirmation
```

### 3.3 Viewing Snaps Flow
```
Chats Screen → Unopened Snap Indicator
├── Tap to View
│   ├── Photo: Shows for set duration
│   ├── Video: Plays once
│   └── Auto-close when timer ends
├── During View:
│   └── Tap and hold to pause timer (photos only)
└── After View:
    ├── Snap marked as "Opened"
    ├── Delete from server after 24 hours
    └── Cannot be replayed
```

### 3.4 Stories Flow

#### Posting Stories
```
Camera → Capture → Preview
└── "Add to My Story" option
    ├── Set Story Privacy
    │   ├── All Friends (default)
    │   └── Custom (select specific friends)
    └── Post → Visible for 24 hours
```

#### Viewing Stories
```
Stories Screen
├── My Story (top)
│   ├── View Story
│   ├── See Viewers List
│   └── Save/Delete Individual Snaps
└── Friends' Stories (list)
    ├── Tap to View Story
    ├── Auto-advance through snaps
    ├── Swipe up to Reply (sends chat)
    └── Tap to skip to next
```

### 3.5 Group Messaging Flow
```
Chats Screen → Create Group Icon
├── Select Friends (multi-select)
├── Name Group
├── Create → Group Chat Opens
└── Group Features:
    ├── Send Snaps to Group
    ├── All Members See Same Snap
    ├── Group Admin Can:
    │   ├── Add Members
    │   ├── Remove Members
    │   └── Delete Group
    └── Members Can:
        └── Leave Group
```

## 4. Settings & Account Management

### 4.1 Settings Access
```
Profile Screen → Settings Icon
├── Account Settings
│   ├── Change Password
│   ├── Email Settings
│   └── Delete Account
├── Privacy Settings
│   ├── Who Can Send Me Snaps
│   ├── Who Can View My Story
│   └── Block List Management
├── Notification Settings
│   ├── Snap Notifications
│   ├── Story Notifications
│   └── Friend Request Notifications
└── App Settings
    ├── Clear Cache
    └── About/Help
```

### 4.2 Logout Flow
```
Settings → Logout
├── Confirmation Dialog
├── Clear Local Data
└── Return to Login Screen
```

## 5. User States & Transitions

### 5.1 Online/Offline Behavior
- **Online**: All features available, real-time updates
- **Offline**: 
  - Can take photos/videos (queued for sending)
  - Cannot view new snaps or stories
  - Cannot search/add friends
  - Queued items sent when connection restored

### 5.2 Empty States
- **No Friends**: "Add friends to start snapping!"
- **No Chats**: "Send a snap to start a conversation"
- **No Stories**: "No new stories"
- **No Snaps**: "No new snaps"

## 6. Error Handling & Feedback

### 6.1 Common Error Scenarios
```
Network Errors → Toast: "No connection. Please try again."
Send Failed → Option to Retry or Discard
Login Failed → Show specific error (wrong password, user not found)
Permission Denied → Explain feature limitation
```

### 6.2 Success Feedback
```
Snap Sent → Brief confirmation animation
Friend Added → Toast notification
Story Posted → Return to camera with confirmation
Account Created → Welcome message
```

## 7. Navigation Shortcuts & Gestures

### 7.1 Global Gestures
- **Swipe Right**: Navigate to Chats
- **Swipe Left**: Navigate to Stories
- **Swipe Down**: Dismiss current screen/modal
- **Double Tap**: Switch camera (front/back)
- **Pinch**: Zoom camera
- **Long Press**: Access additional options

### 7.2 Quick Actions
- **From Any Screen**: Top corners for profile/search
- **From Camera**: Quick access to recent chats
- **From Chats**: Swipe right on chat to view profile
- **From Stories**: Swipe up to reply

## 8. Data Flow & Persistence

### 8.1 What Syncs in Real-Time
- New snaps received
- Story updates
- Friend requests
- Read receipts
- Friend online status

### 8.2 What's Cached Locally
- Friend list
- Recent conversations
- Own story content
- Profile information
- App preferences

## 9. Onboarding Checkpoints

### 9.1 First-Time User Milestones
1. Complete registration
2. Grant camera permissions
3. Add first friend
4. Send first snap
5. Post first story
6. Join/create first group

### 9.2 Feature Discovery
- Tooltips on first use of features
- Gesture hints for navigation
- Feature announcements for updates

## 10. Security & Privacy Touchpoints

### 10.1 Privacy Moments
- Setting story visibility
- Accepting friend requests
- Creating groups
- Blocking users
- Screenshot detection (future feature)

### 10.2 Security Checkpoints
- Login attempts
- Password changes
- Account deletion
- Suspicious activity alerts

---

This user flow document provides a comprehensive map of how users interact with SnapConnect, ensuring consistent behavior and smooth transitions between all features. It should be referenced when building UI components and implementing navigation logic. 