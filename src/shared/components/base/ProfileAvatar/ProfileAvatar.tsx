/**
 * @file ProfileAvatar.tsx
 * @description Profile avatar component for navigation headers.
 * Displays user's profile picture and navigates to profile settings when tapped.
 */

import { useNavigation } from '@react-navigation/native';
import { memo, useCallback } from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

import { useAuthUser } from '../../../../features/auth/store/authStore';
import { useTheme } from '../../../hooks/useTheme';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';

import type { RootStackParamList } from '../../../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type ProfileAvatarNavigationProp = StackNavigationProp<RootStackParamList>;

export interface ProfileAvatarProps {
  /** Avatar size */
  size?: 'small' | 'medium' | 'large';
  /** Show online indicator */
  showOnlineIndicator?: boolean;
}

/**
 * Profile avatar component for headers
 *
 * @param {ProfileAvatarProps} props - Component props
 * @returns {JSX.Element} Profile avatar component
 */
export const ProfileAvatar = memo<ProfileAvatarProps>(
  ({ size = 'medium', showOnlineIndicator = false }) => {
    const theme = useTheme();
    const user = useAuthUser();
    const navigation = useNavigation<ProfileAvatarNavigationProp>();

      /**
   * Handle avatar press - navigate to profile settings
   */
  const handlePress = useCallback(() => {
    console.log('👤 ProfileAvatar: Navigating to profile settings');
    navigation.navigate('ProfileSettings');
  }, [navigation]);

    // Size configuration
    const sizeConfig = {
      small: { avatar: 28, text: 12 },
      medium: { avatar: 36, text: 14 },
      large: { avatar: 44, text: 16 },
    };

    const config = sizeConfig[size];

    const styles = StyleSheet.create({
      container: {
        position: 'relative',
      },
      avatarButton: {
        width: config.avatar,
        height: config.avatar,
        borderRadius: config.avatar / 2,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
      },
      avatar: {
        width: config.avatar - 4,
        height: config.avatar - 4,
        borderRadius: (config.avatar - 4) / 2,
      },
      avatarPlaceholder: {
        fontSize: config.text,
        color: theme.colors.background,
        fontWeight: '600',
      },
      onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: config.avatar * 0.3,
        height: config.avatar * 0.3,
        borderRadius: (config.avatar * 0.3) / 2,
        backgroundColor: theme.colors.success,
        borderWidth: 2,
        borderColor: theme.colors.background,
      },
    });

    if (!user) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
        accessible
        accessibilityRole='button'
        accessibilityLabel='Profile settings'
        accessibilityHint='Navigate to profile settings'
      >
        <TouchableOpacity style={styles.avatarButton} onPress={handlePress}>
          {user.photoURL ? (
            <Image source={{ uri: resolveMediaUrl(user.photoURL) }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarPlaceholder}>
              {user.displayName?.charAt(0).toUpperCase() ||
                user.username?.charAt(0).toUpperCase() ||
                '?'}
            </Text>
          )}
        </TouchableOpacity>

        {showOnlineIndicator && (
          <TouchableOpacity style={styles.onlineIndicator} />
        )}
      </TouchableOpacity>
    );
  }
);

ProfileAvatar.displayName = 'ProfileAvatar';
