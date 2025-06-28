/**
 * @file ProfileSettingsScreen.tsx
 * @description Profile settings screen component for user profile management.
 * Allows users to edit profile picture, display name, username, bio, and logout.
 */

import { Ionicons } from '@expo/vector-icons';
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
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../shared/components/base/Button/Button';
import { useTheme } from '../../../shared/hooks/useTheme';
import { resolveMediaUrl } from '../../../shared/utils/resolveMediaUrl';
import { useAuthStore, useAuthUser } from '../store/authStore';

import type { RootStackParamList } from '../../../shared/navigation/types';
import type { ProfileUpdate, User } from '../types/authTypes';

// Extended user type that includes bio
type UserWithBio = User & { bio?: string };

type ProfileSettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProfileSettings'
>;

interface ProfileSettingsForm {
  bio: string;
}

/**
 * Profile settings screen component
 *
 * @param {ProfileSettingsScreenProps} props - Screen props with navigation
 * @returns {JSX.Element} Profile settings screen component
 */
export function ProfileSettingsScreen({
  navigation,
}: ProfileSettingsScreenProps) {
  const theme = useTheme();
  const user = useAuthUser();
  const {
    updateUserProfile,
    uploadAvatar,
    logout,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUnsavedChangesConfirm, setShowUnsavedChangesConfirm] =
    useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileSettingsForm>({
    defaultValues: {
      bio: (user as UserWithBio)?.bio || '',
    },
  });

  const bio = watch('bio');

  /**
   * Handle image picker for avatar
   */
  const pickImage = useCallback(async () => {
    console.log('📸 ProfileSettings: Opening image picker');

    try {
      // Request permissions (skip on web as it's not needed)
      if (Platform.OS !== 'web') {
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
      }

      // Launch image picker
      console.log('🚀 ProfileSettings: Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📋 ProfileSettings: Image picker result:', {
        canceled: result.canceled,
        hasAssets: (result.assets?.length ?? 0) > 0,
        platform: Platform.OS,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        console.log('✅ ProfileSettings: Image selected:', {
          uri: selectedAsset.uri,
          type: selectedAsset.type,
          width: selectedAsset.width,
          height: selectedAsset.height,
          platform: Platform.OS,
        });
        setSelectedImage(selectedAsset.uri);
      } else {
        console.log(
          '📸 ProfileSettings: Image picker canceled or no image selected'
        );
      }
    } catch (pickError) {
      console.error('❌ ProfileSettings: Image picker error:', pickError);
      Alert.alert('Error', 'Failed to select image. Please try again.', [
        { text: 'OK' },
      ]);
    }
  }, []);

  /**
   * Take photo with camera
   */
  const takePhoto = useCallback(async () => {
    console.log('📷 ProfileSettings: Opening camera');

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
        console.log(
          '✅ ProfileSettings: Photo captured:',
          result.assets[0].uri
        );
        setSelectedImage(result.assets[0].uri);
      }
    } catch (cameraError) {
      console.error('❌ ProfileSettings: Camera error:', cameraError);
      Alert.alert('Error', 'Failed to take photo. Please try again.', [
        { text: 'OK' },
      ]);
    }
  }, []);

  /**
   * Show avatar selection options
   */
  const showImagePickerOptions = useCallback(() => {
    console.log('🎯 ProfileSettings: Avatar button pressed - showing options');

    // On web, directly open image picker since camera is not typically available
    if (Platform.OS === 'web') {
      console.log(
        '🌐 ProfileSettings: Web platform detected, opening image picker directly'
      );
      void pickImage();
      return;
    }

    // On mobile, show camera and photo library options
    Alert.alert(
      'Change Profile Picture',
      'Choose how you want to update your profile picture',
      [
        { text: 'Camera', onPress: () => void takePhoto() },
        { text: 'Photo Library', onPress: () => void pickImage() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [takePhoto, pickImage]);

  /**
   * Handle profile update submission
   */
  const onSubmit = useCallback(
    async (data: ProfileSettingsForm) => {
      if (!user?.uid) {
        Alert.alert('Error', 'User not found. Please try logging in again.');
        return;
      }

      console.log('📝 ProfileSettings: Submitting profile update:', data);
      clearError();

      try {
        let photoURL = user.photoURL;

        // Upload image if selected
        if (selectedImage) {
          console.log('📤 ProfileSettings: Uploading avatar');
          setUploadingImage(true);

          photoURL = await uploadAvatar(user.uid, {
            uri: selectedImage,
            type: 'image/jpeg',
            name: 'avatar.jpg',
          });

          setUploadingImage(false);
          console.log('✅ ProfileSettings: Avatar uploaded:', photoURL);
        }

        // Update profile
        const updates: ProfileUpdate = {
          bio: data.bio,
          ...(photoURL && { photoURL }),
        };

        await updateUserProfile(user.uid, updates);

        console.log('✅ ProfileSettings: Profile updated successfully');

        // Use platform-appropriate success notification
        if (Platform.OS === 'web') {
          console.log('🎉 ProfileSettings: Profile updated successfully (web)');
          // On web, we could add a toast notification here in the future
        } else {
          Alert.alert(
            'Profile Updated',
            'Your profile has been updated successfully.',
            [{ text: 'OK' }]
          );
        }

        // Reset form dirty state
        reset(data);
        setSelectedImage(null);
      } catch (updateError) {
        setUploadingImage(false);
        console.error('❌ ProfileSettings: Update failed:', updateError);

        const errorMessage =
          updateError instanceof Error
            ? updateError.message
            : 'Failed to update profile. Please try again.';

        Alert.alert('Update Failed', errorMessage, [{ text: 'OK' }]);
      }
    },
    [
      user?.uid,
      user?.photoURL,
      selectedImage,
      uploadAvatar,
      updateUserProfile,
      clearError,
      reset,
    ]
  );

  /**
   * Handle logout
   */
  const handleLogout = useCallback(() => {
    console.log('🚪 ProfileSettings: Showing logout confirmation');
    setShowLogoutConfirm(true);
  }, []);

  /**
   * Confirm logout
   */
  const confirmLogout = useCallback(async () => {
    try {
      console.log('🚪 ProfileSettings: Logging out');
      setShowLogoutConfirm(false);
      await logout();
      console.log('✅ ProfileSettings: Logout successful');
    } catch (logoutError) {
      console.error('❌ ProfileSettings: Logout failed:', logoutError);
      // Use platform-specific alert for error messages as they're less critical
      if (Platform.OS === 'web') {
        window.alert('Failed to logout. Please try again.');
      } else {
        Alert.alert('Logout Failed', 'Failed to logout. Please try again.', [
          { text: 'OK' },
        ]);
      }
    }
  }, [logout]);

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    if (isDirty || selectedImage) {
      console.log('⚠️ ProfileSettings: Showing unsaved changes confirmation');
      setShowUnsavedChangesConfirm(true);
    } else {
      navigation.goBack();
    }
  }, [isDirty, selectedImage, navigation]);

  /**
   * Confirm discard changes
   */
  const confirmDiscardChanges = useCallback(() => {
    console.log('🗑️ ProfileSettings: Discarding changes and going back');
    setShowUnsavedChangesConfirm(false);
    navigation.goBack();
  }, [navigation]);

  const currentPhotoURL = selectedImage || user?.photoURL;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingRight: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
      marginLeft: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
      marginRight: 60, // Balance the back button
    },
    scrollContainer: {
      flexGrow: 1,
      padding: theme.spacing[4],
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: theme.spacing[6],
      paddingVertical: theme.spacing[4],
    },
    avatarButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing[3],
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarPlaceholder: {
      fontSize: 48,
      color: theme.colors.textSecondary,
    },
    avatarText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    formContainer: {
      gap: theme.spacing[4],
      marginBottom: theme.spacing[6],
    },
    inputContainer: {
      gap: theme.spacing[2],
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    textInput: {
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
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
      fontSize: 14,
      color: theme.colors.error,
    },
    characterCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
    buttonContainer: {
      gap: theme.spacing[3],
      marginTop: theme.spacing[4],
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
    modalContainer: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing[4],
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[6],
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing[3],
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing[6],
      textAlign: 'center',
      lineHeight: 24,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing[3],
    },
    modalButton: {
      flex: 1,
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    modalButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalButtonDanger: {
      backgroundColor: theme.colors.error,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    modalButtonTextPrimary: {
      color: theme.colors.background,
    },
    modalButtonTextSecondary: {
      color: theme.colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='auto' />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons
            name='chevron-back'
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => {
              console.log(
                '🎯 ProfileSettings: Avatar button touched, disabled:',
                uploadingImage || isLoading
              );
              showImagePickerOptions();
            }}
            disabled={uploadingImage || isLoading}
          >
            {currentPhotoURL ? (
              <>
                <Image
                  source={{ uri: resolveMediaUrl(currentPhotoURL) }}
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
                {user?.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : '👤'}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarText}>
            {currentPhotoURL
              ? Platform.OS === 'web'
                ? 'Click to change'
                : 'Tap to change'
              : 'Add Profile Picture'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Bio */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
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
            onPress={() => void handleSubmit(onSubmit)()}
            loading={isLoading || uploadingImage}
            disabled={
              isLoading || uploadingImage || (!isDirty && !selectedImage)
            }
            fullWidth
          >
            Save Changes
          </Button>

          <Button
            variant='outline'
            onPress={handleLogout}
            disabled={isLoading || uploadingImage}
            fullWidth
          >
            Logout
          </Button>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType='fade'
        onRequestClose={() => setShowLogoutConfirm(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowLogoutConfirm(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextSecondary,
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDanger]}
                  onPress={() => void confirmLogout()}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextPrimary,
                    ]}
                  >
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Unsaved Changes Confirmation Modal */}
      <Modal
        visible={showUnsavedChangesConfirm}
        transparent
        animationType='fade'
        onRequestClose={() => setShowUnsavedChangesConfirm(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Unsaved Changes</Text>
              <Text style={styles.modalMessage}>
                You have unsaved changes. Are you sure you want to go back?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowUnsavedChangesConfirm(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextSecondary,
                    ]}
                  >
                    Stay
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDanger]}
                  onPress={confirmDiscardChanges}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextPrimary,
                    ]}
                  >
                    Discard Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
