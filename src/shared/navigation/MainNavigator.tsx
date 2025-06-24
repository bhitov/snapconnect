/**
 * @file MainNavigator.tsx
 * @description Main app navigation with tab navigation.
 * Handles the primary app screens: Chats, Camera, Stories.
 */


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { MainTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';

// Placeholder screens - will be implemented in Phase 2
function ChatsScreen() {
  const theme = useTheme();
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background 
    }}>
      <Text style={{ ...theme.typography.h2, color: theme.colors.textPrimary }}>
        Chats
      </Text>
      <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>
        Coming in Phase 2
      </Text>
    </View>
  );
}

function CameraScreen() {
  const theme = useTheme();
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.black 
    }}>
      <Text style={{ ...theme.typography.h2, color: theme.colors.white }}>
        Camera
      </Text>
      <Text style={{ ...theme.typography.body, color: theme.colors.gray300 }}>
        Coming in Phase 2
      </Text>
    </View>
  );
}

function StoriesScreen() {
  const theme = useTheme();
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background 
    }}>
      <Text style={{ ...theme.typography.h2, color: theme.colors.textPrimary }}>
        Stories
      </Text>
      <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>
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
      initialRouteName="Camera"
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
        name="Chats" 
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Chats',
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
        }}
      />
      <Tab.Screen 
        name="Stories" 
        component={StoriesScreen}
        options={{
          tabBarLabel: 'Stories',
        }}
      />
    </Tab.Navigator>
  );
} 