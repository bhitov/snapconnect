/**
 * Tech Stack Document for SnapConnect
 * 
 * This document defines all technologies used in the SnapConnect project,
 * including best practices, limitations, and conventions for each technology.
 * It serves as a reference for development decisions and implementation patterns.
 */

# SnapConnect Tech Stack

## 1. Mobile Framework: React Native with Expo (Managed Workflow)

### Role
Cross-platform mobile application development with pre-configured tooling and easy deployment.

### Best Practices
- Use Expo SDK APIs whenever possible before reaching for third-party libraries
- Keep app.json/app.config.js properly configured for both platforms
- Utilize EAS Build for production builds when Expo Go limitations are reached
- Always test on both iOS and Android devices/simulators
- Use Expo's OTA updates for quick bug fixes
- Configure expo-splash-screen properly for professional app launch
- Use expo-constants for environment-specific configuration
- Implement proper error boundaries for production stability
- Use Expo's asset optimization features

### Limitations
- Cannot use native modules that require linking
- Bundle size is larger due to Expo SDK (~20-30MB base)
- Some advanced native features may require ejecting
- Performance overhead compared to bare React Native
- Limited control over native build configuration
- Expo Go limitations: no custom native code, some APIs unavailable
- iOS builds require Apple Developer account ($99/year)
- Build queue times can be long on free tier

### Common Pitfalls
- Not testing on physical devices early enough
- Ignoring platform-specific differences (especially iOS vs Android permissions)
- Over-relying on Expo Go for production-like testing
- Not planning for eventual ejection if needed
- Forgetting to configure app.json for production (icons, splash screens, bundle IDs)
- Not handling Expo SDK version updates properly
- Using development-only features in production
- Not optimizing assets before building

### Platform-Specific Considerations
```typescript
import { Platform } from 'react-native';

// Platform-specific styling
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    elevation: Platform.OS === 'android' ? 5 : 0,
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0,
  }
});

// Platform-specific behavior
if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
}
```

### Key Commands
```bash
# Development
expo start                 # Start development server
expo start --ios          # Start and open iOS simulator
expo start --android      # Start and open Android emulator
expo start --web          # Start web version

# Building
eas build --platform ios  # Build iOS app
eas build --platform android # Build Android app
eas submit                # Submit to app stores

# Updates
expo publish              # Publish OTA update
eas update                # Modern OTA updates

# Debugging
expo doctor               # Check project health
```

### Performance Optimization
- Use React.memo() for expensive components
- Implement FlatList for long lists with getItemLayout
- Lazy load screens with React.lazy()
- Optimize images with expo-image
- Use InteractionManager for post-animation work

## 2. Programming Language: TypeScript

### Role
Type-safe JavaScript for better code quality, IDE support, and self-documenting code.

### Best Practices
- Always define types for props, state, and function parameters
- Use strict mode in tsconfig.json
- Prefer interfaces over type aliases for object shapes
- Use enums sparingly, prefer const objects with `as const`
- Enable all strict compiler options
- Use utility types (Partial, Pick, Omit, Required) effectively
- Define return types explicitly for better documentation
- Use discriminated unions for complex state
- Implement proper error types
- Use generics for reusable components

### Complete TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "jsx": "react-native",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "exclude": ["node_modules", "babel.config.js", "metro.config.js"]
}
```

### Advanced Type Patterns
```typescript
// Component props with children
interface SnapPreviewProps {
  imageUri: string;
  onSend: (recipients: string[]) => Promise<void>;
  onDiscard: () => void;
  children?: React.ReactNode;
}

// Discriminated unions for state management
type SnapState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: SnapData };

// Generic hook types
function useAsyncData<T>(
  fetcher: () => Promise<T>
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Const assertions for type safety
const SNAP_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
} as const;

type SnapType = typeof SNAP_TYPES[keyof typeof SNAP_TYPES];

// Utility types usage
type PartialSnap = Partial<SnapData>;
type SnapPreview = Pick<SnapData, 'id' | 'mediaUrl' | 'mediaType'>;
type SnapWithoutId = Omit<SnapData, 'id'>;

// Type guards
function isPhotoSnap(snap: SnapData): snap is PhotoSnap {
  return snap.mediaType === 'photo';
}

// Error handling types
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Common Pitfalls
- Using `any` type instead of `unknown` or proper types
- Not handling null/undefined in strict mode
- Overusing type assertions (as) instead of type guards
- Creating overly complex generic types
- Not using `readonly` for immutable data
- Forgetting to type event handlers properly
- Using incorrect React Native types (e.g., ViewStyle vs StyleSheet)
- Not typing async functions return values as Promise<T>

### React Native Specific Types
```typescript
import {
  ViewStyle,
  TextStyle,
  ImageStyle,
  StyleProp,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

// Style types
interface Styles {
  container: ViewStyle;
  text: TextStyle;
  image: ImageStyle;
}

// Component with style props
interface ComponentProps {
  style?: StyleProp<ViewStyle>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

// Navigation types
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Camera: undefined;
  SnapPreview: { uri: string; type: SnapType };
};

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;
```

## 3. UI Component Library: React Native Elements

### Role
Pre-built, customizable UI components for consistent cross-platform design.

### Best Practices
- Create a custom theme configuration early
- Wrap components in custom wrappers for app-specific styling
- Use the ThemeProvider at the app root
- Leverage built-in props before creating custom styles

### Theme Configuration
```typescript
const theme = {
  colors: {
    primary: '#FFFC00',    // Snapchat yellow
    secondary: '#000000',
    grey0: '#393939',
    grey1: '#595959',
    grey2: '#8C8C8C',
  },
  Button: {
    raised: true,
    buttonStyle: {
      borderRadius: 25,
    },
  },
  Input: {
    inputStyle: {
      color: 'white',
    },
    placeholderTextColor: '#8C8C8C',
  },
};
```

### Common Components
- `Header` - App navigation headers
- `Avatar` - User profile pictures
- `ListItem` - Chat/friend lists
- `Button` - CTAs and actions
- `Input` - Forms and search
- `Overlay` - Modals and popups

## 4. Backend Services: Firebase Suite

### Role
Complete backend solution including authentication, real-time database, and file storage.

### Components Used
- **Firebase Auth**: User authentication and session management
- **Realtime Database**: Chat messages and real-time updates
- **Cloud Storage**: Media file storage (photos/videos)
- **Cloud Functions**: Server-side logic (snap deletion, notifications)

### Best Practices
- Structure data for efficient queries (denormalize when needed)
- Use security rules to protect data access
- Implement proper error handling for all Firebase operations
- Cache frequently accessed data
- Use batch operations when possible
- Implement offline persistence for better UX
- Use Firebase Performance Monitoring
- Set up proper indexes for complex queries
- Use transactions for atomic updates
- Implement proper data validation

### Detailed Database Structure
```typescript
// Optimized flat structure for real-time performance
{
  // User profiles - public information
  users: {
    [userId]: {
      username: string,
      displayName: string,
      photoURL: string,
      createdAt: number,
      lastActive: number,
    }
  },
  
  // Private user data
  userPrivate: {
    [userId]: {
      email: string,
      phoneNumber?: string,
      settings: {
        notifications: boolean,
        privateProfile: boolean,
      }
    }
  },
  
  // Friend relationships (denormalized for fast queries)
  userFriends: {
    [userId]: {
      [friendId]: {
        addedAt: number,
        nickname?: string,
      }
    }
  },
  
  // Friend requests
  friendRequests: {
    [userId]: {
      sent: {
        [targetUserId]: {
          timestamp: number,
          message?: string,
        }
      },
      received: {
        [fromUserId]: {
          timestamp: number,
          message?: string,
        }
      }
    }
  },
  
  // Snaps (ephemeral messages)
  snaps: {
    [snapId]: {
      senderId: string,
      recipientId: string,
      mediaUrl: string,
      mediaType: 'photo' | 'video',
      caption?: string,
      timestamp: number,
      expiresAt: number,
      viewed: boolean,
      viewedAt?: number,
      duration: number, // viewing duration in seconds
    }
  },
  
  // Stories
  stories: {
    [userId]: {
      posts: {
        [postId]: {
          mediaUrl: string,
          mediaType: 'photo' | 'video',
          caption?: string,
          timestamp: number,
          expiresAt: number,
          privacy: 'all' | 'friends' | 'custom',
          customViewers?: string[], // if privacy is 'custom'
          views: {
            [viewerId]: {
              timestamp: number,
              completed: boolean,
            }
          }
        }
      }
    }
  },
  
  // Group chats
  groups: {
    [groupId]: {
      name: string,
      createdBy: string,
      createdAt: number,
      members: {
        [userId]: {
          role: 'admin' | 'member',
          joinedAt: number,
        }
      }
    }
  }
}
```

### Comprehensive Security Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid",
        "username": {
          ".validate": "newData.isString() && newData.val().length >= 3 && newData.val().length <= 20"
        }
      }
    },
    
    "userPrivate": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    
    "userFriends": {
      "$uid": {
        "$friendId": {
          ".read": "$uid === auth.uid || $friendId === auth.uid",
          ".write": "$uid === auth.uid",
          ".validate": "root.child('users').child($friendId).exists()"
        }
      }
    },
    
    "snaps": {
      "$snapId": {
        ".read": "(data.child('recipientId').val() === auth.uid || data.child('senderId').val() === auth.uid)",
        ".write": "(!data.exists() && newData.child('senderId').val() === auth.uid) || (data.exists() && data.child('recipientId').val() === auth.uid && newData.child('viewed').val() === true)",
        ".validate": "newData.hasChildren(['senderId', 'recipientId', 'mediaUrl', 'timestamp', 'expiresAt'])"
      }
    },
    
    "stories": {
      "$uid": {
        "posts": {
          "$postId": {
            ".read": "$uid === auth.uid || (root.child('userFriends').child($uid).child(auth.uid).exists() && data.child('privacy').val() !== 'custom') || (data.child('customViewers').hasChild(auth.uid))",
            ".write": "$uid === auth.uid"
          }
        }
      }
    }
  }
}
```

### Firebase Configuration Best Practices
```typescript
// firebase.config.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.manifest?.extra?.firebaseApiKey,
  authDomain: Constants.manifest?.extra?.firebaseAuthDomain,
  databaseURL: Constants.manifest?.extra?.firebaseDatabaseUrl,
  projectId: Constants.manifest?.extra?.firebaseProjectId,
  storageBucket: Constants.manifest?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.manifest?.extra?.firebaseMessagingSenderId,
  appId: Constants.manifest?.extra?.firebaseAppId,
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Connect to emulators in development
if (__DEV__) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectDatabaseEmulator(database, 'localhost', 9000);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { auth, database, storage };
```

### Common Pitfalls
- Not handling offline scenarios properly
- Writing inefficient queries that download entire nodes
- Not paginating large data sets
- Storing sensitive data in public nodes
- Not validating data in security rules
- Using deep nesting instead of flat structure
- Not cleaning up listeners (memory leaks)
- Ignoring Firebase quotas and limits
- Not implementing proper retry logic
- Using client-side timestamps instead of server timestamps

### Performance Optimization
```typescript
// Use queries efficiently
const recentSnaps = query(
  ref(database, 'snaps'),
  orderByChild('recipientId'),
  equalTo(userId),
  limitToLast(20)
);

// Batch writes for better performance
const updates = {
  [`users/${userId}/lastActive`]: serverTimestamp(),
  [`userStatus/${userId}/online`]: true,
  [`userStatus/${userId}/lastSeen`]: serverTimestamp(),
};
update(ref(database), updates);

// Implement connection state monitoring
const connectedRef = ref(database, '.info/connected');
onValue(connectedRef, (snapshot) => {
  if (snapshot.val() === true) {
    // Handle online state
  } else {
    // Handle offline state
  }
});
```

### Storage Best Practices
```typescript
// Upload with metadata and progress
const uploadSnap = async (uri: string, snapId: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const metadata = {
    contentType: 'image/jpeg',
    customMetadata: {
      uploadedBy: auth.currentUser?.uid,
      snapId: snapId,
    },
  };
  
  const storageRef = ref(storage, `snaps/${snapId}`);
  const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};
```

## 5. Navigation: React Navigation v6

### Role
Handle screen navigation, deep linking, and navigation state management.

### Best Practices
- Use TypeScript for type-safe navigation
- Implement proper screen tracking
- Handle deep links properly
- Use lazy loading for modal screens
- Implement custom transitions for Snapchat-like feel

### Navigation Structure
```typescript
// Type-safe navigation
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SnapPreview: { uri: string };
  ViewSnap: { snapId: string };
};

// Navigation configuration
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
```

### Key Features to Implement
- Swipe gestures between main screens
- Modal presentations for snap viewing
- Deep linking for friend invites
- Navigation state persistence

## 6. State Management: Zustand

### Role
Lightweight state management for global app state without boilerplate.

### Best Practices
- Create separate stores for different domains
- Use TypeScript for type-safe stores
- Implement proper store hydration
- Use selectors to prevent unnecessary re-renders
- Keep stores focused and small
- Use immer for immutable updates
- Implement middleware for debugging
- Persist critical state with async storage
- Use computed values with selectors
- Implement proper error boundaries

### Complete Store Implementation
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/services/firebase';

interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
}

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
  
  // Computed
  isProfileComplete: () => boolean;
}

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        
        // Actions
        login: async (email, password) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const user = await fetchUserProfile(credential.user.uid);
            
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            throw error;
          }
        },
        
        logout: async () => {
          await auth.signOut();
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
          });
        },
        
        register: async (email, password, username) => {
          // Implementation
        },
        
        updateProfile: (updates) => {
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          });
        },
        
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },
        
        // Computed
        isProfileComplete: () => {
          const user = get().user;
          return !!(user?.username && user?.displayName);
        },
      })),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Snaps store with relationships
interface SnapsStore {
  // State
  unreadSnaps: Map<string, Snap>;
  sentSnaps: Map<string, Snap>;
  loadingSnapIds: Set<string>;
  
  // Actions
  addUnreadSnap: (snap: Snap) => void;
  markAsViewed: (snapId: string) => void;
  sendSnap: (recipients: string[], mediaUri: string) => Promise<void>;
  deleteSnap: (snapId: string) => void;
  
  // Selectors
  getUnreadCount: () => number;
  getSnapById: (snapId: string) => Snap | undefined;
}

const useSnapsStore = create<SnapsStore>()(
  immer((set, get) => ({
    unreadSnaps: new Map(),
    sentSnaps: new Map(),
    loadingSnapIds: new Set(),
    
    addUnreadSnap: (snap) => {
      set((state) => {
        state.unreadSnaps.set(snap.id, snap);
      });
    },
    
    markAsViewed: (snapId) => {
      set((state) => {
        const snap = state.unreadSnaps.get(snapId);
        if (snap) {
          snap.viewed = true;
          snap.viewedAt = Date.now();
          state.unreadSnaps.delete(snapId);
        }
      });
    },
    
    sendSnap: async (recipients, mediaUri) => {
      const tempId = generateTempId();
      set((state) => {
        state.loadingSnapIds.add(tempId);
      });
      
      try {
        // Upload and send logic
      } finally {
        set((state) => {
          state.loadingSnapIds.delete(tempId);
        });
      }
    },
    
    deleteSnap: (snapId) => {
      set((state) => {
        state.unreadSnaps.delete(snapId);
        state.sentSnaps.delete(snapId);
      });
    },
    
    getUnreadCount: () => get().unreadSnaps.size,
    
    getSnapById: (snapId) => {
      const state = get();
      return state.unreadSnaps.get(snapId) || state.sentSnaps.get(snapId);
    },
  }))
);

// Selectors for performance
const useUnreadSnapsArray = () => {
  return useSnapsStore((state) => Array.from(state.unreadSnaps.values()));
};

const useSnapLoading = (snapId: string) => {
  return useSnapsStore((state) => state.loadingSnapIds.has(snapId));
};

export { useAuthStore, useSnapsStore, useUnreadSnapsArray, useSnapLoading };
```

### Middleware Configuration
```typescript
// Store with multiple middleware
const useStore = create<StoreType>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Store implementation
        }))
      ),
      {
        name: 'app-storage',
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            // Migration logic
          }
          return persistedState;
        },
      }
    ),
    {
      name: 'AppStore',
      trace: true,
    }
  )
);
```

### Common Pitfalls
- Storing non-serializable data (functions, classes)
- Creating stores inside components
- Not memoizing selectors
- Overusing global state for local component state
- Not cleaning up subscriptions
- Mutating state directly without immer
- Creating circular dependencies between stores
- Not handling async errors properly
- Storing derived state instead of computing it
- Using deep nested state structures

### Performance Patterns
```typescript
// Shallow selectors for better performance
const useUserName = () => useAuthStore((state) => state.user?.username);

// Memoized selectors
const useFilteredSnaps = () => {
  return useSnapsStore((state) => {
    return useMemo(
      () => state.unreadSnaps.filter(snap => !snap.viewed),
      [state.unreadSnaps]
    );
  });
};

// Subscribe to specific changes
useEffect(() => {
  const unsubscribe = useAuthStore.subscribe(
    (state) => state.isAuthenticated,
    (isAuthenticated) => {
      if (!isAuthenticated) {
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    }
  );
  return unsubscribe;
}, []);
```

### Testing Zustand Stores
```typescript
// Reset stores for testing
beforeEach(() => {
  useAuthStore.setState(initialAuthState);
  useSnapsStore.setState(initialSnapsState);
});

// Test store actions
it('should login user', async () => {
  const { login } = useAuthStore.getState();
  await login('test@example.com', 'password');
  
  const { user, isAuthenticated } = useAuthStore.getState();
  expect(user).toBeDefined();
  expect(isAuthenticated).toBe(true);
});
```

## 7. Form Handling: React Hook Form

### Role
Performant form handling with built-in validation and minimal re-renders.

### Best Practices
- Define form schemas with TypeScript
- Use Controller for React Native inputs
- Implement proper validation rules
- Handle form errors gracefully
- Use form state for loading indicators

### Implementation Pattern
```typescript
interface LoginForm {
  email: string;
  password: string;
}

const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<LoginForm>({
  defaultValues: {
    email: '',
    password: '',
  },
});
```

## 8. Animation Library: React Native Reanimated 3

### Role
High-performance animations running on the UI thread for smooth 60fps interactions.

### Best Practices
- Use worklets for animations
- Implement gesture-based animations
- Create reusable animation hooks
- Use shared values for performance
- Test on lower-end devices
- Combine with React Native Gesture Handler
- Use layout animations for smooth transitions
- Implement interruption handling
- Profile animations with Flipper
- Use native driver always

### Complete Animation Examples
```typescript
// Snap countdown timer with progress bar
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';

interface SnapTimerProps {
  duration: number; // seconds
  onComplete: () => void;
}

const SnapTimer: React.FC<SnapTimerProps> = ({ duration, onComplete }) => {
  const progress = useSharedValue(1);
  
  useEffect(() => {
    progress.value = withTiming(0, {
      duration: duration * 1000,
      easing: Easing.linear,
    }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
    
    return () => {
      cancelAnimation(progress);
    };
  }, [duration]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
      opacity: interpolate(progress.value, [0.1, 0], [1, 0]),
    };
  });
  
  return (
    <Animated.View style={[styles.progressBar, animatedStyle]} />
  );
};

// Swipeable navigation with spring physics
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const SwipeableScreen: React.FC = () => {
  const translateX = useSharedValue(0);
  const context = useSharedValue({ startX: 0 });
  
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { startX: translateX.value };
    })
    .onUpdate((event) => {
      translateX.value = context.value.startX + event.translationX;
    })
    .onEnd((event) => {
      const SWIPE_THRESHOLD = 100;
      const VELOCITY_THRESHOLD = 500;
      
      if (
        Math.abs(event.translationX) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityX) > VELOCITY_THRESHOLD
      ) {
        // Navigate to next/previous screen
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(
          direction * SCREEN_WIDTH,
          {
            velocity: event.velocityX,
            damping: 15,
            stiffness: 100,
          },
          (finished) => {
            if (finished) {
              runOnJS(navigateToScreen)(direction);
            }
          }
        );
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

// Story ring animation
const StoryRing: React.FC<{ hasUnviewedStory: boolean }> = ({ hasUnviewedStory }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  useEffect(() => {
    if (hasUnviewedStory) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1,
        false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [hasUnviewedStory]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));
  
  return (
    <Animated.View style={[styles.ring, animatedStyle]}>
      <LinearGradient
        colors={['#8A2BE2', '#FF1493', '#FFD700']}
        style={styles.gradient}
      />
    </Animated.View>
  );
};

// Layout animations for lists
import { 
  FadeIn, 
  FadeOut, 
  Layout,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

const AnimatedListItem: React.FC = ({ item, index }) => {
  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100)}
      exiting={SlideOutLeft}
      layout={Layout.springify()}
      style={styles.listItem}
    >
      {/* Item content */}
    </Animated.View>
  );
};
```

### Gesture Animations
```typescript
// Camera zoom with pinch gesture
const CameraZoom: React.FC = () => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      scale.value = withSpring(Math.min(Math.max(scale.value, 1), 3));
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
    ],
  }));
  
  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={animatedStyle}>
        {/* Camera view */}
      </Animated.View>
    </GestureDetector>
  );
};

// Snap preview with interactive dismissal
const SnapPreview: React.FC = () => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  const dismissGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
      opacity.value = interpolate(
        translateY.value,
        [0, 300],
        [1, 0.3],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (event.translationY > 150 || event.velocityY > 500) {
        translateY.value = withTiming(SCREEN_HEIGHT);
        opacity.value = withTiming(0, {}, (finished) => {
          if (finished) runOnJS(onDismiss)();
        });
      } else {
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  
  return (
    <GestureDetector gesture={dismissGesture}>
      <Animated.View style={[styles.preview, animatedStyle]}>
        {/* Preview content */}
      </Animated.View>
    </GestureDetector>
  );
};
```

### Performance Optimization
```typescript
// Optimize worklets
const optimizedWorklet = worklet((value: number) => {
  'worklet';
  // Avoid creating objects in worklets
  // Use pre-calculated values
  const result = value * CONSTANT;
  return result;
});

// Batch animations
const animateMultiple = () => {
  'worklet';
  const animations = [
    withTiming(value1.value, { duration: 300 }),
    withTiming(value2.value, { duration: 300 }),
    withTiming(value3.value, { duration: 300 }),
  ];
  
  return parallel(animations);
};

// Frame callbacks for smooth animations
import { useFrameCallback } from 'react-native-reanimated';

const SmoothFollower: React.FC = () => {
  const followerX = useSharedValue(0);
  const targetX = useSharedValue(0);
  
  useFrameCallback((frameInfo) => {
    const { timeSincePreviousFrame } = frameInfo;
    const speed = 0.1;
    
    followerX.value = interpolate(
      speed,
      [0, 1],
      [followerX.value, targetX.value]
    );
  });
};
```

### Common Pitfalls
- Not using `'worklet'` directive in custom worklets
- Creating new objects inside worklets (causes performance issues)
- Forgetting to cancel animations on unmount
- Using setState inside worklets without runOnJS
- Not handling gesture interruptions
- Animating too many properties simultaneously
- Using wrong interpolation extrapolation
- Not profiling on low-end devices
- Forgetting to use native driver
- Mixing Animated API with Reanimated

## 9. Push Notifications: Expo Notifications

### Role
Cross-platform push notifications for snap alerts and friend requests.

### Best Practices
- Request permissions at the right moment
- Handle notification events properly
- Implement notification categories
- Store push tokens securely
- Handle both foreground and background notifications

### Implementation Steps
1. Request permissions after user onboarding
2. Store FCM tokens in Firebase
3. Send notifications via Cloud Functions
4. Handle deep links from notifications
5. Implement notification preferences

## 10. Development Tools

### ESLint + Prettier
**Configuration**:
```json
{
  "extends": ["expo", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

### Reactotron
**Features to Use**:
- API request/response logging
- Redux/Zustand state inspection
- Custom commands for testing
- Performance monitoring

### Best Practices
- Run linting before commits
- Use Husky for pre-commit hooks
- Configure VS Code for auto-formatting
- Use Reactotron in development only

## 11. Testing: Jest + React Native Testing Library

### Role
Unit and integration testing for components and business logic.

### Best Practices
- Write tests for critical user flows
- Mock Firebase services properly
- Test component behavior, not implementation
- Use snapshot tests sparingly
- Aim for 70%+ code coverage

### Testing Patterns
```typescript
// Component testing
describe('SnapButton', () => {
  it('should capture photo on press', async () => {
    const onCapture = jest.fn();
    const { getByTestId } = render(
      <SnapButton onCapture={onCapture} />
    );
    
    fireEvent.press(getByTestId('snap-button'));
    expect(onCapture).toHaveBeenCalled();
  });
});
```

## 12. Image/Video Processing: Expo Image Manipulator

### Role
Basic image manipulation for filters and compression.

### Best Practices
- Compress images before upload
- Implement filters on separate thread
- Cache processed images
- Handle memory efficiently
- Provide loading feedback

### Implementation
```typescript
const applyFilter = async (uri: string, filter: FilterType) => {
  const actions = filter === 'blackwhite' 
    ? [{ grayscale: 1 }] 
    : [];
    
  return await ImageManipulator.manipulateAsync(
    uri,
    actions,
    { compress: 0.8, format: SaveFormat.JPEG }
  );
};
```

## 13. Environment Management: react-native-dotenv

### Role
Manage environment variables for different deployment environments.

### Best Practices
- Never commit .env files
- Use .env.example for documentation
- Validate env vars on app start
- Use different files for dev/staging/prod
- Type your environment variables

### Setup
```typescript
// types/env.d.ts
declare module '@env' {
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
}
```

## Additional Libraries

### React Native Gesture Handler
**Role**: Native-driven gesture management system for touch interactions.

**Best Practices**:
```typescript
// Proper gesture setup
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Wrap your app root
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {/* Your app */}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// Compose gestures effectively
const composed = Gesture.Simultaneous(
  Gesture.Pan(),
  Gesture.Pinch()
);

// Handle gesture states properly
const tapGesture = Gesture.Tap()
  .numberOfTaps(2)
  .maxDuration(250)
  .onStart(() => {
    'worklet';
    // Handle double tap
  });
```

**Common Issues**:
- Forgetting GestureHandlerRootView wrapper
- Gesture conflicts with ScrollView
- Not using gesture state machines properly

### React Native Safe Area Context
**Role**: Handle device safe areas (notches, home indicators) across platforms.

**Implementation**:
```typescript
import { 
  SafeAreaProvider, 
  SafeAreaView, 
  useSafeAreaInsets 
} from 'react-native-safe-area-context';

// Provider setup
function App() {
  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}

// Using safe area insets
const Screen = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }}>
      {/* Content */}
    </View>
  );
};

// Or use SafeAreaView
<SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
  {/* Automatically handles safe areas */}
</SafeAreaView>
```

### Async Storage
**Role**: Persistent key-value storage system.

**Best Practices**:
```typescript
// Storage service with error handling
class StorageService {
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Storage write error:', error);
      throw new Error('Failed to save data');
    }
  }
  
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  }
  
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }
  
  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage keys error:', error);
      return [];
    }
  }
}

// Storage keys enum for type safety
enum StorageKeys {
  USER_PREFERENCES = '@user_preferences',
  AUTH_TOKEN = '@auth_token',
  CACHED_FRIENDS = '@cached_friends',
  DRAFT_SNAP = '@draft_snap',
}

// Usage with hooks
const useStoredValue = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    StorageService.getItem<T>(key).then((stored) => {
      if (stored !== null) setValue(stored);
      setLoading(false);
    });
  }, [key]);
  
  const updateValue = useCallback(async (newValue: T) => {
    setValue(newValue);
    await StorageService.setItem(key, newValue);
  }, [key]);
  
  return { value, updateValue, loading };
};
```

**Storage Limits**:
- Android: 6MB by default (can be increased)
- iOS: No specific limit (uses device storage)
- Maximum key length: 1024 characters
- Values must be strings (JSON.stringify objects)

### React Native SVG
**Role**: Display and animate SVG graphics.

**Usage for Snapchat-like features**:
```typescript
// Animated story progress rings
import Svg, { Circle } from 'react-native-svg';
import { useAnimatedProps } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const StoryProgressRing = ({ progress }: { progress: SharedValue<number> }) => {
  const animatedProps = useAnimatedProps(() => {
    const circumference = 2 * Math.PI * 45; // radius = 45
    return {
      strokeDashoffset: circumference * (1 - progress.value),
    };
  });
  
  return (
    <Svg width={100} height={100}>
      <AnimatedCircle
        cx={50}
        cy={50}
        r={45}
        stroke="#FFFC00"
        strokeWidth={3}
        fill="none"
        strokeDasharray={`${2 * Math.PI * 45}`}
        animatedProps={animatedProps}
      />
    </Svg>
  );
};
```

### React Native Linear Gradient
**Role**: Create gradient backgrounds and effects.

**Implementation**:
```typescript
import LinearGradient from 'react-native-linear-gradient';

// Snapchat-style gradient overlays
const GradientOverlay = () => (
  <LinearGradient
    colors={['transparent', 'rgba(0,0,0,0.7)']}
    style={StyleSheet.absoluteFillObject}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  />
);

// Story gradient borders
const StoryBorder = () => (
  <LinearGradient
    colors={['#833AB4', '#FD1D1D', '#FCB045']}
    style={styles.storyBorder}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  />
);
```

## Development Workflow

### Code Standards
1. Maximum file length: 500 lines
2. Descriptive file names with proper casing
3. JSDoc comments for all functions
4. Consistent folder structure
5. No magic numbers or strings

### Git Workflow
1. Feature branches from main
2. Conventional commits
3. PR reviews required
4. CI/CD via GitHub Actions
5. Automated testing on PRs

### Performance Guidelines
1. Lazy load screens
2. Optimize image sizes
3. Implement proper caching
4. Monitor bundle size
5. Profile on real devices

## Integration Patterns

### Firebase + Zustand Integration
```typescript
// Sync Firebase data with Zustand
const useSyncFirebaseToStore = () => {
  const { setUnreadSnaps, addUnreadSnap } = useSnapsStore();
  const userId = useAuthStore((state) => state.user?.uid);
  
  useEffect(() => {
    if (!userId) return;
    
    const snapsRef = ref(database, `snaps`);
    const query = orderByChild('recipientId').equalTo(userId);
    
    const unsubscribe = onValue(query, (snapshot) => {
      const snaps = new Map();
      snapshot.forEach((child) => {
        const snap = { id: child.key, ...child.val() };
        if (!snap.viewed) {
          snaps.set(snap.id, snap);
        }
      });
      setUnreadSnaps(snaps);
    });
    
    return () => unsubscribe();
  }, [userId]);
};
```

### Navigation + Animation Integration
```typescript
// Animated navigation transitions
const screenOptions = {
  cardStyleInterpolator: ({ current, layouts }) => {
    const translateX = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width, 0],
    });
    
    const opacity = current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.1, 1],
    });
    
    return {
      cardStyle: {
        transform: [{ translateX }],
        opacity,
      },
    };
  },
};
```

### Form Validation + TypeScript
```typescript
// Type-safe form validation
interface RegistrationForm {
  email: string;
  password: string;
  username: string;
}

const registrationSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
  username: yup.string().min(3).max(20).matches(/^[a-zA-Z0-9_]+$/).required(),
});

const useRegistrationForm = () => {
  return useForm<RegistrationForm>({
    resolver: yupResolver(registrationSchema),
    mode: 'onChange',
  });
};
```

### Camera + Storage + Reanimated
```typescript
// Complete snap capture flow
const CaptureScreen = () => {
  const camera = useRef<Camera>(null);
  const opacity = useSharedValue(0);
  
  const captureSnap = async () => {
    // Flash animation
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 200 })
    );
    
    // Capture photo
    const photo = await camera.current?.takePictureAsync({
      quality: 0.8,
      base64: false,
    });
    
    if (photo) {
      // Upload to Firebase Storage
      const snapId = uuid.v4();
      const url = await uploadSnap(photo.uri, snapId);
      
      // Navigate with data
      navigation.navigate('Preview', {
        uri: photo.uri,
        cloudUrl: url,
        snapId,
      });
    }
  };
};
```

### Notifications + Background Tasks
```typescript
// Handle notifications with navigation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const useNotificationObserver = () => {
  const navigation = useNavigation();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  
  useEffect(() => {
    if (lastNotificationResponse) {
      const { snapId, type } = lastNotificationResponse.notification.request.content.data;
      
      if (type === 'snap') {
        navigation.navigate('ViewSnap', { snapId });
      } else if (type === 'friendRequest') {
        navigation.navigate('Friends', { tab: 'requests' });
      }
    }
  }, [lastNotificationResponse]);
};
```

## Debugging & Troubleshooting

### Common Development Issues

**Metro Bundler Issues**:
```bash
# Clear cache
npx react-native start --reset-cache

# Clear watchman
watchman watch-del-all

# Full reset
rm -rf node_modules
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
npm install
cd ios && pod install
```

**Firebase Connection Issues**:
```typescript
// Debug Firebase connectivity
if (__DEV__) {
  database.goOnline();
  
  const connectedRef = ref(database, '.info/connected');
  onValue(connectedRef, (snapshot) => {
    console.log('Firebase connected:', snapshot.val());
  });
}
```

**Animation Performance**:
```typescript
// Profile animations
import { enableLayoutAnimations } from 'react-native-reanimated';

if (__DEV__) {
  enableLayoutAnimations(false); // Disable for debugging
}
```

**Memory Leaks Detection**:
```typescript
// Track component mounts
const useMemoryLeakDetection = (componentName: string) => {
  useEffect(() => {
    console.log(`${componentName} mounted`);
    
    return () => {
      console.log(`${componentName} unmounted`);
    };
  }, []);
};
```

## Production Considerations

### App Size Optimization
- Use Hermes engine for Android
- Enable ProGuard for Android
- Use App Thinning for iOS
- Lazy load heavy components
- Optimize image assets

### Performance Monitoring
```typescript
// Firebase Performance Monitoring
import perf from '@react-native-firebase/perf';

const trace = await perf().startTrace('snap_upload');
trace.putAttribute('user_id', userId);
trace.putMetric('file_size', fileSize);

// Upload logic

await trace.stop();
```

### Error Tracking
```typescript
// Centralized error handling
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Firebase Crashlytics
    crashlytics().recordError(error, errorInfo.componentStack);
  }
}
```

### Security Best Practices
- Never store sensitive data in AsyncStorage without encryption
- Implement certificate pinning for API calls
- Use Firebase App Check for API protection
- Implement proper session management
- Sanitize all user inputs

---

This tech stack provides a solid foundation for building SnapConnect with modern best practices and scalability in mind. Each technology has been chosen for its specific strengths and compatibility with the others, creating a cohesive development environment. 