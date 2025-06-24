/**
 * Project Rules Document for SnapConnect
 * 
 * This document defines the architectural patterns, directory structure,
 * naming conventions, and development standards for building a modular,
 * scalable, and AI-friendly codebase. All code must follow these rules
 * to ensure consistency and maintainability.
 */

# SnapConnect Project Rules

## 1. Core Development Principles

### 1.1 AI-First Development
- **Single Responsibility**: Each file should have one clear purpose
- **Self-Documenting**: Code should be readable without external context
- **Explicit Over Implicit**: Be verbose when it aids understanding
- **Modular Design**: Small, composable units over monolithic structures
- **500-Line Limit**: No file should exceed 500 lines

### 1.2 TypeScript First
- **Strict Mode**: All TypeScript strict flags enabled
- **No Any**: Never use `any` type; use `unknown` if type is truly unknown
- **Type Everything**: All functions, parameters, and returns must be typed
- **Interfaces Over Types**: Use interfaces for object shapes
- **Const Assertions**: Use `as const` for literal types

### 1.3 Functional Programming
- **Pure Functions**: Prefer pure functions without side effects
- **Immutability**: Never mutate data directly
- **Function Keyword**: Use `function` for pure functions, arrow functions for callbacks
- **No Classes**: Use functional components and hooks
- **Composition**: Build complex behavior from simple functions

## 2. Directory Structure

```
snapconnect/
├── app.json                    # Expo configuration
├── App.tsx                     # Root component with providers
├── babel.config.js             # Babel configuration
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment variables template
├── README.md                  # Project documentation
│
├── src/                       # All source code
│   ├── app/                   # App-level configuration
│   │   ├── App.tsx           # Main app component
│   │   ├── Providers.tsx     # All context providers
│   │   └── ErrorBoundary.tsx # Global error handling
│   │
│   ├── features/             # Feature-based modules
│   │   ├── auth/             # Authentication feature
│   │   │   ├── components/   # Auth-specific components
│   │   │   ├── screens/      # Auth screens
│   │   │   ├── hooks/        # Auth hooks
│   │   │   ├── services/     # Auth API calls
│   │   │   ├── store/        # Auth Zustand store
│   │   │   ├── types/        # Auth TypeScript types
│   │   │   └── utils/        # Auth utilities
│   │   │
│   │   ├── camera/           # Camera feature
│   │   │   ├── components/
│   │   │   │   ├── CameraView.tsx
│   │   │   │   ├── CaptureButton.tsx
│   │   │   │   └── CameraControls.tsx
│   │   │   ├── screens/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   │
│   │   ├── chat/             # Chat/Snaps feature
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   ├── friends/          # Friends management
│   │   │   └── ...
│   │   │
│   │   └── stories/          # Stories feature
│   │       └── ...
│   │
│   ├── shared/               # Shared across features
│   │   ├── components/       # Reusable UI components
│   │   │   ├── base/        # Atomic components
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.styles.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Input/
│   │   │   │   └── Text/
│   │   │   │
│   │   │   ├── layout/      # Layout components
│   │   │   │   ├── Screen.tsx
│   │   │   │   ├── SafeArea.tsx
│   │   │   │   └── Container.tsx
│   │   │   │
│   │   │   └── feedback/    # Feedback components
│   │   │       ├── Loading.tsx
│   │   │       ├── Error.tsx
│   │   │       └── Toast.tsx
│   │   │
│   │   ├── hooks/           # Global hooks
│   │   │   ├── useTheme.ts
│   │   │   ├── useAnimation.ts
│   │   │   └── useKeyboard.ts
│   │   │
│   │   ├── navigation/      # Navigation setup
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── MainNavigator.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── services/        # Global services
│   │   │   ├── firebase/
│   │   │   │   ├── config.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── database.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   │
│   │   │   ├── api/         # API layer
│   │   │   └── storage/     # Local storage
│   │   │
│   │   ├── theme/           # Theme configuration
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── shadows.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/           # Global utilities
│   │   │   ├── constants.ts
│   │   │   ├── helpers/
│   │   │   ├── validators/
│   │   │   └── formatters/
│   │   │
│   │   └── types/           # Global TypeScript types
│   │       ├── models.ts    # Data models
│   │       ├── api.ts       # API types
│   │       └── env.d.ts     # Environment types
│   │
│   └── assets/              # Static assets
│       ├── images/
│       ├── fonts/
│       └── animations/
│
├── __tests__/               # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── scripts/                 # Build/deploy scripts
```

## 3. File Naming Conventions

### 3.1 General Rules
- **PascalCase**: Components, screens, and classes (`Button.tsx`, `CameraScreen.tsx`)
- **camelCase**: Functions, hooks, and utilities (`useAuth.ts`, `formatDate.ts`)
- **kebab-case**: Folders and non-code files (`user-profile/`, `api-config.json`)
- **dot.notation**: Configuration and type files (`firebase.config.ts`, `models.types.ts`)
- **Index Files**: Use `index.ts` for public API exports only

### 3.2 File Type Suffixes
```typescript
// Component files
Button.tsx              // React component
Button.styles.ts        // Styled components or styles
Button.test.tsx         // Component tests
Button.stories.tsx      // Storybook stories

// Service files
auth.service.ts         // Service layer
auth.service.test.ts    // Service tests

// Type files
user.types.ts          // Type definitions
api.types.ts           // API type definitions

// Config files
firebase.config.ts      // Configuration
theme.config.ts        // Theme configuration
```

### 3.3 Special Files
- **README.md**: Required in each feature folder
- **index.ts**: Public exports only, no logic
- **types.ts**: Local types for the module
- **constants.ts**: Module-specific constants
- **utils.ts**: Module-specific utilities

## 4. Code Organization Rules

### 4.1 File Structure Template
```typescript
/**
 * @file Button.tsx
 * @description Primary button component with multiple variants and states.
 * Supports loading, disabled, and pressed states with proper accessibility.
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="primary" 
 *   onPress={handleSubmit}
 *   loading={isSubmitting}
 * >
 *   Submit
 * </Button>
 * ```
 */

// 1. Imports - grouped and ordered
import React, { memo, useCallback } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Types
import type { ButtonProps } from './Button.types';

// Hooks
import { useTheme } from '@/shared/hooks/useTheme';
import { useHaptic } from '@/shared/hooks/useHaptic';

// Styles
import { styles } from './Button.styles';

// Constants
const ANIMATION_CONFIG = {
  damping: 15,
  stiffness: 150,
};

/**
 * Primary button component for user actions
 * 
 * @param {ButtonProps} props - Component props
 * @param {string} props.children - Button label text
 * @param {Function} props.onPress - Press event handler
 * @param {ButtonVariant} props.variant - Visual variant
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * 
 * @returns {JSX.Element} Rendered button component
 */
export const Button = memo<ButtonProps>(({
  children,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  testID,
  ...rest
}) => {
  const theme = useTheme();
  const triggerHaptic = useHaptic();
  
  /**
   * Handle button press with haptic feedback
   */
  const handlePress = useCallback(() => {
    if (!loading && !disabled) {
      triggerHaptic('impact');
      onPress?.();
    }
  }, [loading, disabled, onPress, triggerHaptic]);
  
  // Animation logic
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(disabled ? 0.95 : 1, ANIMATION_CONFIG) }],
  }));
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.container,
          styles[variant],
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        testID={testID}
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={[styles.text, styles[`${variant}Text`]]}>
            {children}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

Button.displayName = 'Button';
```

### 4.2 Import Order
1. **React imports**
2. **React Native imports**
3. **Third-party libraries**
4. **Type imports**
5. **Feature imports** (`@/features/...`)
6. **Shared imports** (`@/shared/...`)
7. **Relative imports** (`./...`)
8. **Style imports**
9. **Asset imports**

### 4.3 Export Rules
```typescript
// features/auth/index.ts - Feature public API
export { LoginScreen } from './screens/LoginScreen';
export { useAuth } from './hooks/useAuth';
export type { User, AuthState } from './types';

// Don't export implementation details
// Don't export internal utilities
// Don't export test utilities
```

## 5. Component Guidelines

### 5.1 Component Structure
- **One component per file** (except tightly coupled sub-components)
- **Props interface** defined in same file or `.types.ts`
- **Memoization** for expensive components
- **Display name** for debugging
- **JSDoc comments** for all props

### 5.2 Hooks Rules
```typescript
/**
 * @file useSnapTimer.ts
 * @description Hook for managing snap viewing timer with auto-close
 */

/**
 * Manages snap viewing timer with progress tracking
 * 
 * @param {number} duration - Timer duration in seconds
 * @param {Function} onComplete - Callback when timer completes
 * 
 * @returns {Object} Timer state and controls
 * @returns {number} returns.progress - Current progress (0-1)
 * @returns {boolean} returns.isPaused - Whether timer is paused
 * @returns {Function} returns.pause - Pause timer
 * @returns {Function} returns.resume - Resume timer
 * @returns {Function} returns.reset - Reset timer
 * 
 * @example
 * ```tsx
 * const { progress, pause, resume } = useSnapTimer(10, handleClose);
 * ```
 */
export function useSnapTimer(duration: number, onComplete: () => void) {
  // Implementation
}
```

### 5.3 Service Layer Rules
- **Single responsibility** per service
- **Error handling** at service level
- **Type-safe** return values
- **Retry logic** where appropriate
- **Loading states** handled by stores

## 6. State Management Rules

### 6.1 Store Organization
```typescript
// features/auth/store/authStore.ts
interface AuthState {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions - grouped by concern
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Profile actions  
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}
```

### 6.2 When to Use Global State
- **User authentication** state
- **App-wide settings** (theme, language)
- **Cached data** that's expensive to fetch
- **Real-time data** (active chats, notifications)

### 6.3 When to Use Local State
- **Form inputs** before submission
- **UI state** (modals, dropdowns)
- **Temporary data** within a screen
- **Animation values**

## 7. Testing Rules

### 7.1 Test File Organization
```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── features/
│   └── services/
└── e2e/
    └── flows/
```

### 7.2 Test Naming
```typescript
// Component tests
describe('Button', () => {
  it('should render with primary variant', () => {});
  it('should call onPress when tapped', () => {});
  it('should show loading indicator when loading', () => {});
  it('should be disabled when disabled prop is true', () => {});
});

// Hook tests
describe('useAuth', () => {
  it('should return user when authenticated', () => {});
  it('should handle login errors', () => {});
});
```

## 8. Documentation Rules

### 8.1 File Headers
Every file must start with a JSDoc header:
```typescript
/**
 * @file ComponentName.tsx
 * @description Brief description of the component's purpose
 * @example
 * ```tsx
 * <ComponentName prop="value" />
 * ```
 */
```

### 8.2 Function Documentation
```typescript
/**
 * Brief description of what the function does
 * 
 * @param {ParamType} paramName - Description of parameter
 * @returns {ReturnType} Description of return value
 * @throws {ErrorType} Description of when this error is thrown
 * 
 * @example
 * ```typescript
 * const result = functionName(param);
 * ```
 */
```

### 8.3 Complex Logic Documentation
```typescript
// Step 1: Validate user input
// We check for email format and password strength
const validationResult = validateInput(input);

// Step 2: Prepare data for API
// Transform the data to match API expectations
const apiData = transformForAPI(validationResult);

// Step 3: Make API call with retry logic
// Retry up to 3 times with exponential backoff
const response = await callAPIWithRetry(apiData);
```

## 9. Performance Rules

### 9.1 Component Optimization
- **React.memo** for components with expensive renders
- **useMemo** for expensive computations
- **useCallback** for stable function references
- **Lazy loading** for screens and heavy components

### 9.2 List Optimization
```typescript
// Always use keyExtractor
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  getItemLayout={getItemLayout} // When possible
  removeClippedSubviews // For long lists
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### 9.3 Image Optimization
- **Lazy load** images not immediately visible
- **Progressive loading** with blur placeholders
- **Appropriate sizes** for different screens
- **Cache** frequently used images

## 10. Security Rules

### 10.1 Data Handling
- **Never log** sensitive information
- **Sanitize** all user inputs
- **Validate** data types at boundaries
- **Encrypt** sensitive local storage

### 10.2 API Security
```typescript
// services/api/client.ts
const apiClient = {
  async request(endpoint: string, options: RequestOptions) {
    // Always include auth token
    const token = await getAuthToken();
    
    // Never expose sensitive headers in logs
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-App-Version': Config.APP_VERSION,
    };
    
    // Add request timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      return response;
    } finally {
      clearTimeout(timeout);
    }
  },
};
```

## 11. Git Workflow Rules

### 11.1 Branch Naming
- `feature/[ticket-id]-brief-description`
- `bugfix/[ticket-id]-brief-description`
- `hotfix/[ticket-id]-brief-description`
- `chore/[ticket-id]-brief-description`

### 11.2 Commit Messages
```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(auth): add biometric authentication

- Add Face ID/Touch ID support for iOS
- Add fingerprint auth for Android
- Store preference in secure storage

Closes #123
```

### 11.3 PR Guidelines
- **One feature** per PR
- **Tests** must pass
- **Documentation** updated
- **Screenshots** for UI changes
- **Breaking changes** clearly marked

## 12. Common Patterns

### 12.1 Error Boundary Pattern
```typescript
// shared/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    logErrorToService(error, errorInfo);
  }
}
```

### 12.2 Loading Pattern
```typescript
// shared/hooks/useAsyncData.ts
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  dependencies: DependencyList = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    isLoading: true,
    error: null,
    data: null,
  });
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const data = await fetcher();
        if (!cancelled) {
          setState({ isLoading: false, error: null, data });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ isLoading: false, error, data: null });
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, dependencies);
  
  return state;
}
```

---

These project rules ensure SnapConnect is built with consistency, maintainability, and AI-friendly patterns. Every developer must follow these guidelines to maintain code quality and project coherence. 