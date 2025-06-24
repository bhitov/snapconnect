/**
 * @file AuthNavigator.tsx
 * @description Authentication navigation component.
 * Handles login, registration, and initial setup flows.
 */


import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStackParamList } from './types';

// Placeholder components - will be implemented in Phase 2
function LoginScreen() {
  return null; // TODO: Implement in Phase 2
}

function RegisterScreen() {
  return null; // TODO: Implement in Phase 2
}

function ProfileSetupScreen() {
  return null; // TODO: Implement in Phase 2
}

function ForgotPasswordScreen() {
  return null; // TODO: Implement in Phase 2
}

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Authentication navigator
 * Handles user authentication flow
 */
export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
} 