/**
 * @file AuthNavigator.tsx
 * @description Authentication navigation component.
 * Handles login, registration, and initial setup flows.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ForgotPasswordScreen } from '../../features/auth/screens/ForgotPasswordScreen';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { ProfileSetupScreen } from '../../features/auth/screens/ProfileSetupScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';

import { AuthStackParamList } from './types';

// Import actual auth screens

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Authentication navigator
 * Handles user authentication flow
 *
 * @returns {JSX.Element} Authentication navigator component
 */
export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName='Login'
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name='Login'
        component={LoginScreen}
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name='Register'
        component={RegisterScreen}
        options={{
          title: 'Sign Up',
        }}
      />
      <Stack.Screen
        name='ProfileSetup'
        component={ProfileSetupScreen}
        options={{
          title: 'Complete Profile',
          gestureEnabled: false, // Prevent going back
        }}
      />
      <Stack.Screen
        name='ForgotPassword'
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
