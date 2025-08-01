/**
 * @file ProfileScreen.tsx
 * @description Simple profile viewing screen for displaying user information.
 * Shows avatar, name, and bio in a clean read-only interface.
 */

import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../shared/hooks/useTheme';
import { resolveMediaUrl } from '../../../shared/utils/resolveMediaUrl';
import { chatService } from '../../chat/services/chatService';
import { useAuthUser } from '../store/authStore';

import type { RootStackParamList } from '../../../shared/navigation/types';
import type { User } from '../types/authTypes';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type UserWithBio = User & { bio?: string };

/**
 * Profile viewing screen component
 *
 * @param {ProfileScreenProps} props - Screen props with navigation
 * @returns {JSX.Element} Profile screen component
 */
export function ProfileScreen({ navigation, route }: ProfileScreenProps) {
  const theme = useTheme();
  const currentUser = useAuthUser();
  const [profileUser, setProfileUser] = useState<UserWithBio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user ID from route params, default to current user
  const userId = route.params?.userId || currentUser?.uid;
  const isOwnProfile = userId === currentUser?.uid;

  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        if (isOwnProfile && currentUser) {
          // Use current user data if viewing own profile
          setProfileUser(currentUser);
        } else {
          // Fetch other user's data
          const userData = await chatService.getUserData(userId);
          setProfileUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setProfileUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUserProfile();
  }, [userId, isOwnProfile, currentUser]);

  const user = profileUser;

  console.log('👤 ProfileScreen: Viewing profile:', {
    userId,
    isOwnProfile,
    hasUser: !!user,
    displayName: user?.displayName,
  });

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    console.log('← ProfileScreen: Going back');
    navigation.goBack();
  }, [navigation]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingRight: 16,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 4,
    },

    scrollContainer: {
      flexGrow: 1,
      padding: theme.spacing[6],
      alignItems: 'center',
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: theme.spacing[8],
      paddingVertical: theme.spacing[6],
    },
    avatarContainer: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing[4],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    avatar: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    avatarPlaceholder: {
      fontSize: 56,
      color: theme.colors.textSecondary,
    },
    displayName: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing[1],
      textAlign: 'center',
    },
    username: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing[4],
      textAlign: 'center',
    },
    bioSection: {
      width: '100%',
      maxWidth: 400,
      paddingHorizontal: theme.spacing[4],
    },
    bioLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing[2],
      textAlign: 'center',
    },
    bioText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      textAlign: 'center',
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    noBioText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: theme.spacing[4],
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 18,
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons
              name='chevron-back'
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.backButtonText, { color: theme.colors.primary }]}
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centered}>
          <Text
            style={[styles.errorText, { color: theme.colors.textSecondary }]}
          >
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons
              name='chevron-back'
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.backButtonText, { color: theme.colors.primary }]}
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centered}>
          <Text
            style={[styles.errorText, { color: theme.colors.textSecondary }]}
          >
            User not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons
            name='chevron-back'
            size={24}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.backButtonText, { color: theme.colors.primary }]}
          >
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user.photoURL ? (
              <Image
                source={{ uri: resolveMediaUrl(user.photoURL) }}
                style={styles.avatar}
              />
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {user.displayName?.charAt(0).toUpperCase() ||
                  user.username?.charAt(0).toUpperCase() ||
                  '👤'}
              </Text>
            )}
          </View>

          {/* Name */}
          <Text style={styles.displayName}>
            {user.displayName || user.username || 'No Name'}
          </Text>

          {/* Username (if different from display name) */}
          {user.username &&
            user.displayName &&
            user.username !== user.displayName && (
              <Text style={styles.username}>@{user.username}</Text>
            )}
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.bioLabel}>About</Text>
          {user?.bio ? (
            <Text style={styles.bioText}>{user.bio}</Text>
          ) : (
            <Text style={styles.noBioText}>
              {isOwnProfile
                ? 'Add a bio to tell others about yourself'
                : 'No bio available'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
