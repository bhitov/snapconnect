/**
 * @file RootNavigator.tsx
 * @description Root navigation component for SnapConnect.
 * Handles authentication flow and main app navigation.
 */


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from './types';

// Placeholder screens for modal navigation
import { SnapPreviewScreen } from '../components/layout/SnapPreviewScreen';
import { ViewSnapScreen } from '../components/layout/ViewSnapScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator component
 * Manages authentication state and main navigation flow
 * 
 * @returns {JSX.Element} Root navigation component
 */
export function RootNavigator() {
  // TODO: Replace with actual auth state from store
  const isAuthenticated = false;

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
            <Stack.Screen name="Main" component={MainNavigator} />
            
            {/* Modal screens */}
            <Stack.Screen
              name="SnapPreview"
              component={SnapPreviewScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="ViewSnap"
              component={ViewSnapScreen}
              options={{
                presentation: 'fullScreenModal',
                gestureEnabled: false,
              }}
            />
          </>
        ) : (
          // Authentication screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 