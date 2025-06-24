# Stories Feature

## Overview
Handles story creation, viewing, and management with 24-hour expiration.

## Components
- `StoryRing` - Circular story indicator with gradient
- `StoryViewer` - Full-screen story viewing interface
- `StoryItem` - Individual story post
- `StoriesList` - Horizontal scrollable stories

## Screens
- `StoriesScreen` - Main stories feed
- `ViewStoryScreen` - Full-screen story viewing
- `CreateStoryScreen` - Add to story

## Services
- `story.service.ts` - Story CRUD operations
- `viewer.service.ts` - Story viewing tracking

## Store
- `storiesStore.ts` - Stories state management

## Types
- Story post and viewing interfaces 