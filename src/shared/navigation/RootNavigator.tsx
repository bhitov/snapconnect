/**
 * @file RootNavigator.tsx
 * @description Root navigation component for SnapConnect.
 * Handles authentication flow and main app navigation.
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuthInitialization } from '../../features/auth/hooks/useAuthInitialization';
import { useIsAuthenticated } from '../../features/auth/store/authStore';
import { SnapPreviewScreen } from '../components/layout/SnapPreviewScreen';
import { ViewSnapScreen } from '../components/layout/ViewSnapScreen';
import { useTheme } from '../hooks/useTheme';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
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

  console.log(
    '🔄 RootNavigator: Rendering - isInitializing:',
    isInitializing,
    'isAuthenticated:',
    isAuthenticated
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

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          // Main app screens
          <>
            <Stack.Screen name='Main' component={MainNavigator} />

            {/* Modal screens */}
            <Stack.Screen
              name='SnapPreview'
              component={SnapPreviewScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name='ViewSnap'
              component={ViewSnapScreen}
              options={{
                presentation: 'fullScreenModal',
                gestureEnabled: false,
              }}
            />
          </>
        ) : (
          // Authentication screens
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
