/**
 * @file ForgotPasswordScreen.tsx
 * @description Forgot password screen component for password reset.
 * Handles password reset email sending.
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import { Button } from '../../../shared/components/base/Button/Button';
import { Screen } from '../../../shared/components/layout/Screen';
import { useTheme } from '../../../shared/hooks/useTheme';

import type { AuthStackParamList } from '../../../shared/navigation/types';

type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;

/**
 * Forgot password screen component
 *
 * @param {ForgotPasswordScreenProps} props - Screen props with navigation
 * @returns {JSX.Element} Forgot password screen component
 */
export function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const theme = useTheme();

  /**
   * Navigate back to login screen
   */
  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  /**
   * Handle password reset (placeholder)
   */
  const handlePasswordReset = useCallback(() => {
    Alert.alert(
      'Feature Coming Soon',
      'Password reset functionality will be implemented in a future update.',
      [{ text: 'OK' }]
    );
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing[4],
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing[4],
      textAlign: 'center',
    },
    description: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing[6],
    },
    buttonContainer: {
      gap: theme.spacing[3],
      width: '100%',
      maxWidth: 300,
    },
  });

  return (
    <Screen>
      <StatusBar style='light' />

      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.description}>
          This feature is coming soon. For now, please contact support if you
          need help accessing your account.
        </Text>

        <View style={styles.buttonContainer}>
          <Button onPress={handlePasswordReset} fullWidth>
            Request Password Reset
          </Button>

          <Button variant='outline' onPress={navigateToLogin} fullWidth>
            Back to Login
          </Button>
        </View>
      </View>
    </Screen>
  );
}
