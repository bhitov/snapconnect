/**
 * @file ProfileSetupScreen.tsx
 * @description Profile setup screen component for post-registration setup.
 * Handles additional user profile configuration.
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import { Button } from '../../../shared/components/base/Button/Button';
import { Screen } from '../../../shared/components/layout/Screen';
import { useTheme } from '../../../shared/hooks/useTheme';

import type { AuthStackParamList } from '../../../shared/navigation/types';

type ProfileSetupScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ProfileSetup'
>;

/**
 * Profile setup screen component
 *
 * @param {ProfileSetupScreenProps} props - Screen props with navigation
 * @returns {JSX.Element} Profile setup screen component
 */
export function ProfileSetupScreen(_props: ProfileSetupScreenProps) {
  const theme = useTheme();

  /**
   * Handle profile setup completion (placeholder)
   */
  const handleCompleteSetup = useCallback(() => {
    Alert.alert(
      'Setup Complete',
      'Profile setup functionality will be implemented in a future update.',
      [{ text: 'OK' }]
    );
  }, []);

  /**
   * Skip profile setup
   */
  const handleSkipSetup = useCallback(() => {
    Alert.alert(
      'Skip Setup',
      'You can complete your profile later in settings.',
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
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.description}>
          Add a profile picture and customize your display name to make it
          easier for friends to find you.
        </Text>

        <View style={styles.buttonContainer}>
          <Button onPress={handleCompleteSetup} fullWidth>
            Set Up Profile
          </Button>

          <Button variant='ghost' onPress={handleSkipSetup} fullWidth>
            Skip for Now
          </Button>
        </View>
      </View>
    </Screen>
  );
}
