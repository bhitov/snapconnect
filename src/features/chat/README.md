# Chat Feature

## Overview
Handles ephemeral messaging, snap sending/receiving, and chat management.

## Components
- `ChatList` - List of chat conversations
- `SnapItem` - Individual snap display
- `SnapViewer` - Full-screen snap viewing
- `RecipientSelector` - Friend selection for sending

## Screens
- `ChatsScreen` - Main chat list
- `ViewSnapScreen` - Full-screen snap viewing
- `SendSnapScreen` - Recipient selection

## Services
- `snap.service.ts` - Snap CRUD operations
- `chat.service.ts` - Chat management
- `notification.service.ts` - Push notifications

## Store
- `chatStore.ts` - Chat and snap state management

## Types
- Snap and chat message interfaces 