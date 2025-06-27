# AI Relationship Coach Feature Plan

## Feature Summary

The AI Relationship Coach feature adds personalized relationship coaching to SnapConnect, allowing users to get expert guidance on their conversations and relationships. Each chat conversation can spawn a private "coach chat" where users interact with an AI relationship coach trained in Gottman Method principles.

**Key Capabilities:**
- **Private Coaching**: One-on-one conversation with AI coach about any existing chat
- **Chat Analysis**: Detailed analysis of conversation patterns and relationship dynamics  
- **Proactive Guidance**: General relationship advice and communication strategies
- **Contextual Awareness**: Coach has access to the parent conversation for informed guidance

## User Flows

### Flow 1: User Wants to Analyze a Specific Chat

1. **Starting Point**: User is in a chat conversation with someone (friend, partner, etc.)
2. **Access Coach**: User taps the "🎓 Coach" button in the chat header
3. **Coach Chat Creation**: 
   - If no coach chat exists, system creates one automatically
   - User is navigated to the new coach chat screen
4. **Request Analysis**: User taps the "Analyze Chat" option in the coach chat menu
5. **Analysis Delivered**: Coach posts a detailed multi-paragraph analysis of the conversation patterns, communication styles, and relationship dynamics
6. **Follow-up**: User can ask follow-up questions about the analysis or request specific advice

**Example Analysis Request**: "Can you analyze my recent conversations with Sarah?"

### Flow 2: User Wants General Relationship Advice

1. **Starting Point**: User is in any chat conversation
2. **Access Coach**: User taps the "🎓 Coach" button in the chat header
3. **Coach Chat Creation**: System creates/opens coach chat for this conversation context
4. **Ask for Advice**: User types a general question like "How can I be a better communicator?"
5. **Coach Response**: AI coach provides personalized advice based on relationship science
6. **Ongoing Conversation**: User can continue asking questions, get exercises, or request specific guidance

**Example Advice Questions**: 
- "How do I bring up difficult topics?"
- "What are signs of a healthy relationship?"
- "How can I show more appreciation?"

### Flow 3: User Returns to Existing Coach Chat

1. **Starting Point**: User is on the main chats list
2. **Coach Indicator**: User sees a small "🎓" icon on conversations that have active coach chats
3. **Direct Access**: User taps the coach icon to jump directly to the coach chat
4. **Continue Coaching**: User continues their ongoing coaching conversation
5. **Switch Contexts**: User can navigate back to the parent chat or other coach chats

## Technical Implementation Plan

### Data Structure Changes

#### Conversation Interface Updates
```typescript
export interface Conversation {
  // ... existing fields
  coachChatId?: string; // Links to coach chat conversation
}

export interface ConversationDocument {
  // ... existing fields  
  coachChatId?: string; // Links to coach chat conversation
}
```

#### Coach Chat Identification
- Coach conversations have `"coach"` as one of the participants
- Coach conversations include a `parentId` field linking back to the original chat
- Coach messages use `senderId === "coach"`

### UI/UX Changes

#### ChatScreen Modifications
1. **Header Button**: Add "🎓 Coach" button to `headerRight` for non-coach conversations
2. **Coach Message Styling**: 
   - Special avatar: `🎓` icon or school symbol
   - Different background color for coach messages
   - Distinct typography/styling
3. **Coach Chat Header**: Show "Coach Chat" title and add "Analyze Chat" menu option
4. **Message Handling**: 
   - User messages in coach chat trigger `coachSend()` 
   - Display coach replies automatically

#### ChatsScreen Modifications
1. **Coach Badge**: Add small `🎓` icon to conversations with `coachChatId`
2. **Direct Navigation**: Tapping coach icon navigates to coach chat
3. **Visual Indicator**: Badge styled similar to action buttons in friends list

### Message Flow Architecture

#### Coach Chat Creation
1. User taps "🎓 Coach" button
2. Call `startCoachChat(parentCid)` 
3. Receive `coachCid` in response
4. Navigate to coach chat using existing `ChatScreen`
5. Update parent conversation with `coachChatId`

#### Coach Interaction
1. User sends message in coach chat
2. Call `coachSend(coachCid, parentCid, text)`
3. Receive coach reply
4. Display coach message with special styling

#### Chat Analysis
1. User taps "Analyze Chat" in coach chat menu
2. Call `coachAnalyze(coachCid, parentCid, n=30)`
3. Coach posts detailed analysis as new message
4. User can follow up with questions about analysis

### Navigation Structure

Coach chats are treated as regular conversations with special properties:
- Use existing `ChatScreen` component
- Navigate with `conversationId` like any other chat
- No new navigation screens needed
- Coach chat accessible from:
  - Coach button in parent chat header
  - Coach badge in main chats list

## Files to Modify

### Core Implementation
- `src/features/chat/screens/ChatScreen.tsx` - Main coach integration
- `src/features/chat/screens/ChatsScreen.tsx` - Coach badges in chat list
- `src/features/chat/types/index.ts` - Add `coachChatId` to Conversation interface
- `src/features/chat/store/chatStore.ts` - Coach chat state management

### Services
- `src/features/chat/services/coachService.ts` - Coach API calls (already implemented)
- `src/features/chat/services/chatService.ts` - Might require modification

other files may require modification too per your discretion

### Styling Updates
- Coach message styling in `ChatScreen`
- Coach badge styling in `ChatsScreen`
- Coach avatar/icon components