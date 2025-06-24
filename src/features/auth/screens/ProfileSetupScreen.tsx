/**
 * @file ProfileSetupScreen.tsx
 * @description Profile setup screen component for post-registration setup.
 * Handles additional user profile configuration with avatar upload and bio.
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { Button } from '../../../shared/components/base/Button/Button';
import { Screen } from '../../../shared/components/layout/Screen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { resolveMediaUrl } from '../../../shared/utils/resolveMediaUrl';
import { useAuthStore, useAuthUser } from '../store/authStore';

import type { AuthStackParamList } from '../../../shared/navigation/types';
import type { ProfileSetupForm } from '../types/authTypes';

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
export function ProfileSetupScreen({ navigation: _ }: ProfileSetupScreenProps) {
  const theme = useTheme();
  const user = useAuthUser();
  const { completeProfileSetup, uploadAvatar, isLoading, error, clearError } =
    useAuthStore();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileSetupForm>({
    defaultValues: {
      displayName: user?.displayName || user?.username || '',
      bio: '',
      photoURL: user?.photoURL || '',
    },
  });

  const displayName = watch('displayName');

  /**
   * Handle image picker for avatar
   */
  const pickImage = useCallback(async () => {
    console.log('📸 ProfileSetup: Opening image picker');

    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Camera roll access is needed to select a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('✅ ProfileSetup: Image selected:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
      }
    } catch (pickError) {
      console.error('❌ ProfileSetup: Image picker error:', pickError);
      Alert.alert('Error', 'Failed to select image. Please try again.', [
        { text: 'OK' },
      ]);
    }
  }, []);

  /**
   * Take photo with camera
   */
  const takePhoto = useCallback(async () => {
    console.log('📷 ProfileSetup: Opening camera');

    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to take a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('✅ ProfileSetup: Photo captured:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
      }
    } catch (cameraError) {
      console.error('❌ ProfileSetup: Camera error:', cameraError);
      Alert.alert('Error', 'Failed to take photo. Please try again.', [
        { text: 'OK' },
      ]);
    }
  }, []);

  /**
   * Show avatar selection options
   */
  const showImagePickerOptions = useCallback(() => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to add your profile picture',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [takePhoto, pickImage]);

  /**
   * Handle profile setup completion
   */
  const onSubmit = useCallback(
    async (data: ProfileSetupForm) => {
      if (!user?.uid) {
        Alert.alert('Error', 'User not found. Please try logging in again.');
        return;
      }

      console.log('📝 ProfileSetup: Submitting profile setup:', data);
      clearError();

      try {
        let photoURL = data.photoURL;

        // Upload image if selected
        if (selectedImage) {
          console.log('📤 ProfileSetup: Uploading avatar');
          setUploadingImage(true);

          photoURL = await uploadAvatar(user.uid, {
            uri: selectedImage,
            type: 'image/jpeg',
            name: 'avatar.jpg',
          });

          setUploadingImage(false);
          console.log('✅ ProfileSetup: Avatar uploaded:', photoURL);
        }

        // Complete profile setup
        await completeProfileSetup(user.uid, {
          ...data,
          ...(photoURL && { photoURL }),
        });

        console.log('✅ ProfileSetup: Profile setup completed');
        Alert.alert(
          'Profile Complete!',
          'Your profile has been set up successfully.',
          [{ text: 'Continue' }]
        );
      } catch (setupError) {
        setUploadingImage(false);
        console.error('❌ ProfileSetup: Setup failed:', setupError);

        const errorMessage =
          setupError instanceof Error
            ? setupError.message
            : 'Failed to set up profile. Please try again.';

        Alert.alert('Setup Failed', errorMessage, [{ text: 'OK' }]);
      }
    },
    [user?.uid, selectedImage, uploadAvatar, completeProfileSetup, clearError]
  );

  /**
   * Skip profile setup
   */
  const handleSkipSetup = useCallback(async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    Alert.alert(
      'Skip Profile Setup?',
      'You can complete your profile later in settings. Continue to the app?',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Skip',
          onPress: async () => {
            try {
              console.log('⏭️ ProfileSetup: Skipping profile setup');

              // Set minimal profile data to mark as "complete"
              await completeProfileSetup(user.uid, {
                displayName:
                  user.username || (user.email?.split('@')[0] ?? 'User'),
                bio: '',
              });

              console.log(
                '✅ ProfileSetup: Profile marked as complete (skipped)'
              );
            } catch (error) {
              console.error('❌ ProfileSetup: Skip failed:', error);
              Alert.alert('Error', 'Failed to skip setup. Please try again.', [
                { text: 'OK' },
              ]);
            }
          },
        },
      ]
    );
  }, [user?.uid, user?.username, user?.email, completeProfileSetup]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing[4],
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing[2],
      textAlign: 'center',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing[6],
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing[6],
    },
    avatarButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.gray100,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarPlaceholder: {
      ...theme.typography.h3,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    avatarText: {
      ...theme.typography.bodySmall,
      color: theme.colors.primary,
      marginTop: theme.spacing[2],
    },
    formContainer: {
      gap: theme.spacing[4],
      marginBottom: theme.spacing[6],
    },
    inputContainer: {
      gap: theme.spacing[2],
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.text,
    },
    textInput: {
      ...theme.typography.body,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing[3],
      minHeight: 56,
    },
    textInputError: {
      borderColor: theme.colors.error,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
    },
    buttonContainer: {
      gap: theme.spacing[3],
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 60,
    },
    characterCount: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
  });

  return (
    <Screen>
      <StatusBar style='light' />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
      >
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Add a profile picture and tell us about yourself to help friends
          recognize you.
        </Text>

        {/* Avatar Selection */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={showImagePickerOptions}
            disabled={uploadingImage || isLoading}
          >
            {selectedImage || user?.photoURL ? (
              <>
                <Image
                  source={{ uri: resolveMediaUrl(selectedImage || user?.photoURL || '') }}
                  style={styles.avatar}
                />
                {uploadingImage && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator
                      size='large'
                      color={theme.colors.white}
                    />
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {displayName ? displayName.charAt(0).toUpperCase() : '📷'}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarText}>
            {selectedImage || user?.photoURL
              ? 'Tap to change'
              : 'Add Profile Picture'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Display Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name *</Text>
            <Controller
              control={control}
              rules={{
                required: 'Display name is required',
                minLength: {
                  value: 2,
                  message: 'Display name must be at least 2 characters',
                },
                maxLength: {
                  value: 50,
                  message: 'Display name must be less than 50 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.textInput,
                    errors.displayName && styles.textInputError,
                  ]}
                  placeholder='Enter your display name'
                  placeholderTextColor={theme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize='words'
                  returnKeyType='next'
                  maxLength={50}
                />
              )}
              name='displayName'
            />
            {errors.displayName && (
              <Text style={styles.errorText}>{errors.displayName.message}</Text>
            )}
          </View>

          {/* Bio */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <Controller
              control={control}
              rules={{
                maxLength: {
                  value: 150,
                  message: 'Bio must be less than 150 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      errors.bio && styles.textInputError,
                    ]}
                    placeholder='Tell us a bit about yourself...'
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    maxLength={150}
                  />
                  <Text style={styles.characterCount}>
                    {value?.length || 0}/150
                  </Text>
                </>
              )}
              name='bio'
            />
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio.message}</Text>
            )}
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <Text
            style={[
              styles.errorText,
              { textAlign: 'center', marginBottom: theme.spacing[4] },
            ]}
          >
            {error}
          </Text>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading || uploadingImage}
            disabled={isLoading || uploadingImage}
            fullWidth
          >
            Complete Setup
          </Button>

          <Button
            variant='ghost'
            onPress={handleSkipSetup}
            disabled={isLoading || uploadingImage}
            fullWidth
          >
            Skip for Now
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
