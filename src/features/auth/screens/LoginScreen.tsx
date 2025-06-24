/**
 * @file LoginScreen.tsx
 * @description Login screen component with email/password authentication.
 * Handles user login, validation, and navigation to registration.
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { Button } from '../../../shared/components/base/Button/Button';
import { Screen } from '../../../shared/components/layout/Screen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useAuthStore } from '../store/authStore';

import type { AuthStackParamList } from '../../../shared/navigation/types';
import type { LoginForm } from '../types/authTypes';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/**
 * Login screen component
 *
 * @param {LoginScreenProps} props - Screen props with navigation
 * @returns {JSX.Element} Login screen component
 */
export function LoginScreen({ navigation }: LoginScreenProps) {
  const theme = useTheme();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handle form submission and login
   */
  const onSubmit = useCallback(
    async (data: LoginForm) => {
      console.log('🔐 LoginScreen: Attempting login with email:', data.email);

      try {
        clearError();
        await login(data.email.trim().toLowerCase(), data.password);
        console.log('✅ LoginScreen: Login successful');
        reset(); // Clear form on success
      } catch (error) {
        console.error('❌ LoginScreen: Login failed:', error);
        Alert.alert(
          'Login Failed',
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
          [{ text: 'OK' }]
        );
      }
    },
    [login, clearError, reset]
  );

  /**
   * Navigate to registration screen
   */
  const navigateToRegister = useCallback(() => {
    console.log('📝 LoginScreen: Navigating to registration');
    clearError();
    navigation.navigate('Register');
  }, [navigation, clearError]);

  /**
   * Navigate to forgot password screen
   */
  const navigateToForgotPassword = useCallback(() => {
    console.log('🔄 LoginScreen: Navigating to forgot password');
    clearError();
    navigation.navigate('ForgotPassword');
  }, [navigation, clearError]);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const styles = createStyles(theme);

  return (
    <Screen>
      <StatusBar style='light' />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>SnapConnect</Text>
            <Text style={styles.subtitle}>
              Connect with friends through snaps
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name='email'
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputText}>
                      {value || 'Enter your email'}
                    </Text>
                    <Button
                      variant='ghost'
                      size='small'
                      onPress={() => {
                        // This would open a text input modal or inline editing
                        Alert.prompt(
                          'Email',
                          'Enter your email address',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'OK',
                              onPress: text => {
                                if (text) onChange(text);
                              },
                            },
                          ],
                          'plain-text',
                          value
                        );
                      }}
                    >
                      Edit
                    </Button>
                  </View>
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name='password'
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputText}>
                      {value
                        ? showPassword
                          ? value
                          : '••••••••'
                        : 'Enter your password'}
                    </Text>
                    <View style={styles.passwordActions}>
                      <Button
                        variant='ghost'
                        size='small'
                        onPress={togglePasswordVisibility}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        variant='ghost'
                        size='small'
                        onPress={() => {
                          Alert.prompt(
                            'Password',
                            'Enter your password',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'OK',
                                onPress: text => {
                                  if (text) onChange(text);
                                },
                              },
                            ],
                            'secure-text',
                            value
                          );
                        }}
                      >
                        Edit
                      </Button>
                    </View>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <View style={styles.loginButton}>
              <Button
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                testID='login-button'
                fullWidth
              >
                Log In
              </Button>
            </View>

            {/* Forgot Password */}
            <View style={styles.forgotButton}>
              <Button
                variant='ghost'
                onPress={navigateToForgotPassword}
                disabled={isLoading}
              >
                Forgot Password?
              </Button>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <View style={styles.registerButton}>
              <Button
                variant='outline'
                onPress={navigateToRegister}
                disabled={isLoading}
              >
                Sign Up
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/**
 * Create styles for the login screen
 */
function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing[4], // 16px
    },
    header: {
      alignItems: 'center',
      paddingTop: theme.spacing[12], // 48px (2xl equivalent)
      paddingBottom: theme.spacing[8], // 32px (xl equivalent)
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.primary,
      marginBottom: theme.spacing[2],
      fontWeight: 'bold',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      flex: 1,
      paddingVertical: theme.spacing[4],
    },
    inputContainer: {
      marginBottom: theme.spacing[4],
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.text,
      marginBottom: theme.spacing[2],
      fontWeight: '600',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing[4], // 16px (md equivalent)
      paddingVertical: theme.spacing[4], // 16px (md equivalent)
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputText: {
      ...theme.typography.body,
      color: theme.colors.text,
      flex: 1,
    },
    passwordActions: {
      flexDirection: 'row',
      gap: theme.spacing[2],
    },
    errorContainer: {
      marginBottom: theme.spacing[3],
    },
    errorText: {
      ...theme.typography.bodySmall,
      color: theme.colors.error,
      marginTop: theme.spacing[1],
    },
    loginButton: {
      marginTop: theme.spacing[4],
      marginBottom: theme.spacing[3],
    },
    forgotButton: {
      alignSelf: 'center',
    },
    footer: {
      alignItems: 'center',
      paddingTop: theme.spacing[4],
      paddingBottom: theme.spacing[6],
    },
    footerText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing[3],
    },
    registerButton: {
      minWidth: 120,
    },
  });
}
