/**
 * @file RegisterScreen.tsx
 * @description Registration screen component for new user signup.
 * Handles user registration with email, password, and username validation.
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
  TextInput,
} from 'react-native';

import { Button } from '../../../shared/components/base/Button/Button';
import { Screen } from '../../../shared/components/layout/Screen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useAuthStore } from '../store/authStore';

import type { AuthStackParamList } from '../../../shared/navigation/types';
import type { RegisterForm } from '../types/authTypes';

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

/**
 * Registration screen component
 *
 * @param {RegisterScreenProps} props - Screen props with navigation
 * @returns {JSX.Element} Registration screen component
 */
export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const theme = useTheme();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterForm>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      displayName: '',
    },
  });

  const password = watch('password');

  /**
   * Handle form submission
   */
  const onSubmit = useCallback(
    async (data: RegisterForm) => {
      console.log(
        '📝 RegisterScreen: Attempting registration with email:',
        data.email
      );

      try {
        clearError();
        await register(
          data.email.trim().toLowerCase(),
          data.password,
          data.username.trim().toLowerCase()
        );
        console.log('✅ RegisterScreen: Registration successful');
        reset(); // Clear form on success
        
        // Navigate to profile setup after successful registration
        console.log('🔄 RegisterScreen: Navigating to ProfileSetup');
        navigation.navigate('ProfileSetup');
      } catch (registerError) {
        console.error('❌ RegisterScreen: Registration failed:', registerError);
        Alert.alert(
          'Registration Failed',
          registerError instanceof Error
            ? registerError.message
            : 'An unexpected error occurred',
          [{ text: 'OK' }]
        );
      }
    },
    [register, clearError, reset, navigation]
  );

  /**
   * Navigate back to login screen
   */
  const navigateToLogin = useCallback(() => {
    console.log('🔐 RegisterScreen: Navigating to login');
    clearError();
    navigation.navigate('Login');
  }, [navigation, clearError]);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  /**
   * Toggle confirm password visibility
   */
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(!showConfirmPassword);
  }, [showConfirmPassword]);

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join SnapConnect and start sharing
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <Controller
                control={control}
                name='username'
                rules={{
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                  maxLength: {
                    value: 20,
                    message: 'Username must be less than 20 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message:
                      'Username can only contain letters, numbers, and underscores',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={text => onChange(text.toLowerCase())}
                    placeholder='Choose a unique username'
                    placeholderTextColor={theme.colors.gray400}
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoComplete='username'
                  />
                )}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username.message}</Text>
              )}
            </View>

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
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder='Enter your email'
                    placeholderTextColor={theme.colors.gray400}
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoComplete='email'
                    keyboardType='email-address'
                  />
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
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={value}
                      onChangeText={onChange}
                      placeholder='Create a password'
                      placeholderTextColor={theme.colors.gray400}
                      secureTextEntry={!showPassword}
                      autoCapitalize='none'
                      autoCorrect={false}
                      autoComplete='password-new'
                    />
                    <Button
                      variant='ghost'
                      size='small'
                      onPress={togglePasswordVisibility}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <Controller
                control={control}
                name='confirmPassword'
                rules={{
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'Passwords do not match',
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={value}
                      onChangeText={onChange}
                      placeholder='Confirm your password'
                      placeholderTextColor={theme.colors.gray400}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize='none'
                      autoCorrect={false}
                      autoComplete='password-new'
                    />
                    <Button
                      variant='ghost'
                      size='small'
                      onPress={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </Button>
                  </View>
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Register Button */}
            <View style={styles.registerButton}>
              <Button
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                testID='register-button'
                fullWidth
              >
                Create Account
              </Button>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <View style={styles.loginButton}>
              <Button
                variant='outline'
                onPress={navigateToLogin}
                disabled={isLoading}
              >
                Log In
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/**
 * Create styles for the registration screen
 */
function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing[4],
    },
    header: {
      alignItems: 'center',
      paddingTop: theme.spacing[8],
      paddingBottom: theme.spacing[6],
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
    textInput: {
      ...theme.typography.body,
      color: theme.colors.text,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border,
      flex: 1,
    },
    passwordInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingRight: theme.spacing[2],
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
    registerButton: {
      marginTop: theme.spacing[4],
      marginBottom: theme.spacing[3],
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
    loginButton: {
      minWidth: 120,
    },
  });
}
