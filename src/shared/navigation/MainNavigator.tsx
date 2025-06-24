/**
 * @file MainNavigator.tsx
 * @description Main app navigation with tab navigation.
 * Handles the primary app screens: Chats, Camera, Stories.
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import { CameraScreen } from '../../features/camera/screens/CameraScreen';
import { FriendsListScreen, FriendRequestsScreen } from '../../features/friends/screens';
import { useTheme } from '../hooks/useTheme';

import { MainTabParamList, ChatStackParamList } from './types';

// Chat Stack Navigator
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ChatStack.Screen
        name="ChatsList"
        component={FriendsListScreen}
      />
      <ChatStack.Screen
        name="FriendRequests"
        component={FriendRequestsScreen}
      />
      <ChatStack.Screen
        name="Chat"
        component={PlaceholderChatScreen}
      />
    </ChatStack.Navigator>
  );
}

// Placeholder chat screen - will be implemented in Phase 2.7
function PlaceholderChatScreen() {
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
        Chat Screen
      </Text>
      <Text
        style={{ ...theme.typography.body, color: theme.colors.textSecondary }}
      >
        Coming in Phase 2.7
      </Text>
    </View>
  );
}

function StoriesScreen() {
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
        Stories
      </Text>
      <Text
        style={{ ...theme.typography.body, color: theme.colors.textSecondary }}
      >
        Coming in Phase 2
      </Text>
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
        }}
      />
      <Tab.Screen
        name='Camera'
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
        }}
      />
      <Tab.Screen
        name='Stories'
        component={StoriesScreen}
        options={{
          tabBarLabel: 'Stories',
        }}
      />
    </Tab.Navigator>
  );
}
