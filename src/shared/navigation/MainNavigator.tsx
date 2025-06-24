/**
 * @file MainNavigator.tsx
 * @description Main app navigation with tab navigation.
 * Handles the primary app screens: Chats, Camera, Friends, Stories.
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, TouchableOpacity } from 'react-native';

import { CameraScreen } from '../../features/camera/screens/CameraScreen';
import { ChatsScreen, ChatScreen } from '../../features/chat/screens';
import {
  AddFriendsScreen,
  FriendRequestsScreen,
  FriendsListScreen,
} from '../../features/friends/screens';
import { usePendingRequestsCount } from '../../features/friends/store/friendsStore';
import { StoriesScreen } from '../../features/stories/screens/StoriesScreen';
import { ViewStoryScreen } from '../../features/stories/screens/ViewStoryScreen';
import { useTheme } from '../hooks/useTheme';

import {
  MainTabParamList,
  ChatStackParamList,
  FriendsStackParamList,
  StoriesStackParamList,
} from './types';

// Chat Stack Navigator
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

// Chat header back button component
function ChatHeaderBackButton({ navigation }: { navigation: any }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        paddingLeft: 16,
        paddingRight: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: theme.colors.primary || '#007AFF',
          fontWeight: '500',
        }}
      >
        ← Chats
      </Text>
    </TouchableOpacity>
  );
}

function ChatStackNavigator() {
  const theme = useTheme();

  return (
    <ChatStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background || '#FFFFFF',
        },
        headerTintColor: theme.colors.text || '#000000',
        headerTitleStyle: {
          color: theme.colors.text || '#000000',
        },
      }}
    >
      <ChatStack.Screen
        name='ChatsList'
        component={ChatsScreen}
        options={{
          headerShown: false,
        }}
      />
      <ChatStack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={({ route, navigation }) => ({
          headerShown: true,
          title:
            route.params?.otherUser?.displayName ||
            route.params?.otherUser?.username ||
            'Chat',
          headerBackTitleVisible: false,
          headerLeft: () => <ChatHeaderBackButton navigation={navigation} />,
        })}
      />
    </ChatStack.Navigator>
  );
}

// Friends Stack Navigator
const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();

function FriendsStackNavigator() {
  return (
    <FriendsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <FriendsStack.Screen name='FriendsList' component={FriendsListScreen} />
      <FriendsStack.Screen name='AddFriends' component={AddFriendsScreen} />
      <FriendsStack.Screen
        name='FriendRequests'
        component={FriendRequestsScreen}
      />
      <FriendsStack.Screen
        name='Profile'
        component={PlaceholderProfileScreen}
      />
    </FriendsStack.Navigator>
  );
}

// Stories Stack Navigator
const StoriesStack = createNativeStackNavigator<StoriesStackParamList>();

function StoriesStackNavigator() {
  return (
    <StoriesStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StoriesStack.Screen name='StoriesList' component={StoriesScreen} />
      <StoriesStack.Screen name='ViewStory' component={ViewStoryScreen} />
      <StoriesStack.Screen
        name='CreateStory'
        component={PlaceholderCreateStoryScreen}
      />
    </StoriesStack.Navigator>
  );
}

// Placeholder profile screen - will be implemented later
function PlaceholderProfileScreen() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ ...theme.typography.h2, color: theme.colors.textPrimary }}>
        Profile Screen
      </Text>
      <Text
        style={{ ...theme.typography.body, color: theme.colors.textSecondary }}
      >
        Coming in Phase 3
      </Text>
    </View>
  );
}

// Placeholder view story screen - will be implemented next
function PlaceholderViewStoryScreen() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ ...theme.typography.h2, color: theme.colors.textPrimary }}>
        Story Viewer
      </Text>
      <Text
        style={{ ...theme.typography.body, color: theme.colors.textSecondary }}
      >
        Loading story viewer...
      </Text>
    </View>
  );
}

// Placeholder create story screen - will be implemented next
function PlaceholderCreateStoryScreen() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ ...theme.typography.h2, color: theme.colors.textPrimary }}>
        Create Story
      </Text>
      <Text
        style={{ ...theme.typography.body, color: theme.colors.textSecondary }}
      >
        Story creation flow...
      </Text>
    </View>
  );
}

// Friends tab icon with notification badge
function FriendsTabIcon({ color, size }: { color: string; size: number }) {
  const pendingRequestsCount = usePendingRequestsCount();
  const theme = useTheme();

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name='people' size={size} color={color} />
      {pendingRequestsCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -6,
            backgroundColor: theme.colors.error || '#FF3B30',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.colors.background || '#FFFFFF',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main app navigator with tab navigation
 * Primary interface for authenticated users
 */
export function MainNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName='Camera'
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background || '#FFFFFF',
          borderTopColor: theme.colors.border || '#E0E0E0',
          height: theme.semanticSpacing.tabBarHeight + 34, // Add safe area
        },
        tabBarActiveTintColor: theme.colors.primary || '#FFFC00',
        tabBarInactiveTintColor: theme.colors.textSecondary || '#757575',
      }}
    >
      <Tab.Screen
        name='Chats'
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='chatbubble' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name='Camera'
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='camera' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name='Friends'
        component={FriendsStackNavigator}
        options={{
          tabBarLabel: 'Friends',
          tabBarIcon: ({ color, size }) => (
            <FriendsTabIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='Stories'
        component={StoriesStackNavigator}
        options={{
          tabBarLabel: 'Stories',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='book' size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
