/**
 * UI Rules Document for SnapConnect
 * 
 * This document defines the user interface design principles, interaction patterns,
 * and user experience guidelines that ensure consistency and usability across the app.
 * These rules prioritize mobile-first design, accessibility, and performance.
 */

# SnapConnect UI Rules

## 1. Core Design Principles

### 1.1 Camera-First Design
- The camera is the heart of the app and should be immediately accessible
- UI elements should overlay the camera view without obstructing the viewfinder
- Controls should be reachable with one thumb while holding the device
- Minimize UI chrome to maximize camera viewing area

### 1.2 Ephemeral & Immediate
- Prioritize speed over decoration - users want to capture and share quickly
- Animations should be snappy (200-300ms max)
- Reduce cognitive load with progressive disclosure
- Make common actions require minimal taps

### 1.3 Mobile-First & Touch-Optimized
- Minimum touch target size: 44x44pt (iOS) / 48x48dp (Android)
- Primary actions should be thumb-reachable in one-handed use
- Swipe gestures for primary navigation
- Long-press for secondary actions
- Haptic feedback for important interactions

### 1.4 Accessibility First
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Support Dynamic Type and font scaling
- VoiceOver/TalkBack compatibility
- Reduce motion option support
- Color should never be the only indicator

## 2. Layout & Spacing

### 2.1 Safe Areas
```typescript
// Always respect device safe areas
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  }
});
```

### 2.2 Grid System
- Base unit: 8px (all spacing should be multiples of 8)
- Margins: 16px (mobile), 24px (tablet)
- Content max-width: 600px for readability
- Maintain visual rhythm with consistent spacing

### 2.3 Responsive Breakpoints
- Small: 0-375px (small phones)
- Medium: 376-414px (standard phones)
- Large: 415-767px (large phones)
- XLarge: 768px+ (tablets)

## 3. Navigation Patterns

### 3.1 Gesture Navigation
- **Horizontal swipes**: Navigate between main screens (Chats ← Camera → Stories)
- **Vertical swipes**: Dismiss modals and overlays
- **Pinch**: Zoom in camera view
- **Double tap**: Switch camera or like content
- **Long press**: Preview or additional options

### 3.2 Navigation Hierarchy
```
Primary (Swipe/Tab):
├── Chats
├── Camera (Default)
└── Stories

Secondary (Modal):
├── Snap Preview
├── Settings
├── Profile
└── Add Friends

Tertiary (Overlay):
├── Filters
├── Stickers
└── Text Input
```

### 3.3 Transition Principles
- Use spring physics for natural feel
- Match gesture velocity for responsive transitions
- Interruptible animations
- Consistent direction (right = forward, left = back)

## 4. Component Design Rules

### 4.1 Buttons
- **Primary Action**: Full-width, high contrast, 56px height
- **Secondary Action**: Outlined or text, 48px height
- **Icon Buttons**: 44x44px minimum, with 8px padding
- **Floating Action**: Bottom-right, 56px diameter
- States: Default, Pressed, Disabled, Loading

### 4.2 Input Fields
- Height: 56px minimum
- Clear labels and placeholders
- Inline validation with helpful error messages
- Show input type keyboards (email, number)
- Auto-focus first field in forms

### 4.3 Lists & Cards
- Use lazy loading for performance
- Pull-to-refresh pattern
- Swipe actions for quick operations
- Skeleton screens while loading
- Empty states with actionable guidance

### 4.4 Modals & Sheets
- Bottom sheets for mobile actions
- Dim background (40% black overlay)
- Swipe down to dismiss
- Maximum height: 90% of screen
- Round top corners (16px radius)

## 5. Visual Feedback

### 5.1 Loading States
```typescript
// Consistent loading patterns
<View style={styles.loadingContainer}>
  <ActivityIndicator size="large" color={theme.colors.primary} />
  <Text style={styles.loadingText}>Sending snap...</Text>
</View>
```

### 5.2 Success/Error States
- **Success**: Brief animation (checkmark), auto-dismiss
- **Error**: Red accent, clear message, retry option
- **Warning**: Yellow accent, informational
- Toast notifications for non-blocking feedback

### 5.3 Micro-interactions
- Button press: Scale down to 0.95
- Refresh: Rubber band effect
- Delete: Swipe with red background
- Send: Whoosh animation
- Capture: Camera shutter effect

## 6. Content Presentation

### 6.1 Typography Hierarchy
- **Headers**: Bold, 1.5x base size
- **Body**: Regular, base size (16px)
- **Captions**: Regular, 0.875x base size
- **Buttons**: Medium, uppercase or sentence case
- Line height: 1.5x for readability

### 6.2 Media Display
- Aspect ratios: Maintain original, center crop if needed
- Loading: Progressive with blur-up effect
- Fallbacks: Gray placeholder with icon
- Optimization: Load appropriate size for viewport

### 6.3 Empty States
- Friendly illustration or icon
- Clear explanation
- Actionable button to resolve
- Consistent with brand voice

## 7. Camera Interface

### 7.1 Capture Controls
```
Bottom Section (thumb-reachable):
[Friends] [Capture Button] [Memories]
          [Hold for Video]

Top Section:
[Profile] [Search] [Flash] [Flip Camera]
```

### 7.2 Overlay Elements
- Semi-transparent backgrounds for legibility
- Minimal UI in capture mode
- Hide controls during recording
- Clear recording indicator

### 7.3 Preview Screen
- Full-screen media preview
- Overlay controls at top/bottom
- Text input appears above keyboard
- Save/Send options clearly visible

## 8. Performance UI Rules

### 8.1 Perceived Performance
- Optimistic updates (show success immediately)
- Skeleton screens over spinners
- Progressive image loading
- Anticipate user actions with prefetching

### 8.2 Animation Performance
- Use native driver for all animations
- 60fps target for gestures
- Reduce animation in low-power mode
- Cancel animations when navigating away

### 8.3 Memory Management
- Lazy load screens and components
- Virtualized lists for long content
- Cleanup media on screen unmount
- Compress images before display

## 9. Accessibility Guidelines

### 9.1 Screen Reader Support
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Send snap to John"
  accessibilityHint="Double tap to send"
  accessibilityRole="button"
>
```

### 9.2 Visual Accessibility
- High contrast mode support
- Reduce transparency option
- Sufficient color contrast
- Focus indicators for keyboard navigation

### 9.3 Motor Accessibility
- Large touch targets
- Gesture alternatives for all actions
- Adjustable timing for timed elements
- Avoid precise gestures

## 10. Platform-Specific Adaptations

### 10.1 iOS Adaptations
- Respect iOS design language where appropriate
- Use SF Symbols for system icons
- Haptic feedback with impact generator
- Slide-over gesture from left edge

### 10.2 Android Adaptations
- Material Design influences for familiarity
- Back button/gesture support
- Android-style toasts
- Ripple effects on touch

## 11. Error Prevention & Recovery

### 11.1 Confirmation Dialogs
- Destructive actions require confirmation
- Clear consequences in dialog text
- Default to safe option (Cancel)
- Undo options where possible

### 11.2 Input Validation
- Real-time validation where helpful
- Clear error messages with solutions
- Preserve user input on errors
- Smart defaults and auto-completion

## 12. Offline Experience

### 12.1 Offline Indicators
- Subtle banner when offline
- Queue actions for when online
- Clear status of queued items
- Manual retry options

### 12.2 Cached Content
- Show cached content with indicator
- Allow offline photo capture
- Save drafts automatically
- Sync seamlessly when reconnected

---

These UI rules ensure SnapConnect delivers a fast, intuitive, and accessible experience that prioritizes the core value of ephemeral communication while maintaining high usability standards. 