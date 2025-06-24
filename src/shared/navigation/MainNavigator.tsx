/**
 * @file MainNavigator.tsx
 * @description Main app navigation with tab navigation.
 * Handles the primary app screens: Chats, Camera, Friends, Stories.
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import { CameraScreen } from '../../features/camera/screens/CameraScreen';
import { ChatsScreen, ChatScreen } from '../../features/chat/screens';
import { 
  AddFriendsScreen,
  FriendRequestsScreen,
  FriendsListScreen 
} from '../../features/friends/screens';
import { useTheme } from '../hooks/useTheme';

import { MainTabParamList, ChatStackParamList, FriendsStackParamList } from './types';

// Chat Stack Navigator
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

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
          title: 'Chats',
        }}
      />
      <ChatStack.Screen 
        name='ChatScreen' 
        component={ChatScreen}
        options={{
          headerShown: true,
        }}
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
      <FriendsStack.Screen name='FriendRequests' component={FriendRequestsScreen} />
      <FriendsStack.Screen name='Profile' component={PlaceholderProfileScreen} />
    </FriendsStack.Navigator>
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
        name='Friends'
        component={FriendsStackNavigator}
        options={{
          tabBarLabel: 'Friends',
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
