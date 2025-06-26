/**
 * @file RootNavigator.tsx
 * @description Root navigation component for SnapConnect.
 * Handles authentication flow and main app navigation.
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';

import { useAuthInitialization } from '../../features/auth/hooks/useAuthInitialization';
import {
  ProfileSettingsScreen,
  ProfileScreen,
} from '../../features/auth/screens';
import {
  useIsAuthenticated,
  useAuthStore,
} from '../../features/auth/store/authStore';
import { RecipientSelectionScreen } from '../../features/chat/screens/RecipientSelectionScreen';
import { SnapViewingScreen } from '../../features/chat/screens/SnapViewingScreen';
import { SnapPreviewScreen } from '../components/layout/SnapPreviewScreen';
import { ViewSnapScreen } from '../components/layout/ViewSnapScreen';
import { useTheme } from '../hooks/useTheme';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { navigationRef } from './navigationRef';
import { RootStackParamList } from './types';

// Placeholder screens for modal navigation

// Auth hooks and stores

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator component
 * Manages authentication state and main navigation flow
 *
 * @returns {JSX.Element} Root navigation component
 */
export function RootNavigator() {
  const theme = useTheme();
  const isInitializing = useAuthInitialization();
  const isAuthenticated = useIsAuthenticated();
  const { isProfileComplete } = useAuthStore();

  console.log(
    '🔄 RootNavigator: Rendering - isInitializing:',
    isInitializing,
    'isAuthenticated:',
    isAuthenticated,
    'isProfileComplete:',
    isProfileComplete()
  );

  // Show loading screen while auth is initializing
  if (isInitializing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading SnapConnect...
        </Text>
      </View>
    );
  }

  // Determine if user should see the main app
  const shouldShowMainApp = isAuthenticated && isProfileComplete();

  // Expose navigation ref to window for E2E testing
  useEffect(() => {
    if (navigationRef.current) {
      (window as any).__navigationRef = navigationRef.current;
    }
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {shouldShowMainApp ? (
          // Main app screens - only show when authenticated AND profile is complete
          <>
            <Stack.Screen name='Main' component={MainNavigator} />

            {/* Modal screens */}
            <Stack.Screen
              name='SnapPreview'
              component={SnapPreviewScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name='RecipientSelection'
              component={RecipientSelectionScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name='ViewSnap'
              component={SnapViewingScreen}
              options={{
                presentation: 'fullScreenModal',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name='Profile'
              component={ProfileScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name='ProfileSettings'
              component={ProfileSettingsScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
          </>
        ) : (
          // Authentication screens - show for unauthenticated users OR incomplete profiles
          <Stack.Screen name='Auth' component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * Styles for the root navigator
 */
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
