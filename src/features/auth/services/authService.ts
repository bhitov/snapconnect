/**
 * @file authService.ts
 * @description Authentication service for Firebase operations.
 * Handles login, registration, logout, and user profile management.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';

import { auth, database } from '../../../shared/services/firebase/config';

import type { User, UserProfileData } from '../types/authTypes';

/**
 * Authentication service class
 */
class AuthService {
  /**
   * Login user with email and password
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User>} User data
   */
  async login(email: string, password: string): Promise<User> {
    console.log('🔐 AuthService: Starting login for email:', email);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      console.log(
        '✅ AuthService: Firebase login successful for UID:',
        firebaseUser.uid
      );

      // Get user profile from database
      const userProfile = await this.getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        console.error('❌ AuthService: User profile not found in database');
        throw new Error('User profile not found. Please contact support.');
      }

      // Update last active timestamp
      await this.updateLastActive(firebaseUser.uid);

      console.log('✅ AuthService: Login completed successfully');
      return userProfile;
    } catch (error) {
      console.error('❌ AuthService: Login failed:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register new user
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Unique username
   * @returns {Promise<User>} User data
   */
  async register(
    email: string,
    password: string,
    username: string
  ): Promise<User> {
    console.log(
      '📝 AuthService: Starting registration for email:',
      email,
      'username:',
      username
    );

    try {
      // Check if username is available
      const isUsernameAvailable =
        await this.checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw new Error(
          'Username is already taken. Please choose a different one.'
        );
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      console.log(
        '✅ AuthService: Firebase user created with UID:',
        firebaseUser.uid
      );

      // Create user profile data
      const userProfile: UserProfileData = {
        uid: firebaseUser.uid,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        displayName: username, // Default display name to username
        createdAt: Date.now(),
        lastActive: Date.now(),
        ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
      };

      // Save profile to database
      await this.createUserProfile(userProfile);

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: username,
      });

      console.log('✅ AuthService: Registration completed successfully');
      return userProfile;
    } catch (error) {
      console.error('❌ AuthService: Registration failed:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    console.log('🚪 AuthService: Starting logout');

    try {
      if (auth.currentUser) {
        await this.updateLastActive(auth.currentUser.uid);
      }

      await signOut(auth);
      console.log('✅ AuthService: Logout successful');
    } catch (error) {
      console.error('❌ AuthService: Logout failed:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   *
   * @param {string} email - User email
   */
  async resetPassword(email: string): Promise<void> {
    console.log('🔄 AuthService: Sending password reset email to:', email);

    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ AuthService: Password reset email sent');
    } catch (error) {
      console.error('❌ AuthService: Password reset failed:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user
   *
   * @returns {Promise<User | null>} Current user or null
   */
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    const userProfile = await this.getUserProfile(firebaseUser.uid);
    return userProfile;
  }

  /**
   * Set up auth state listener
   *
   * @param {Function} callback - Callback function for auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    console.log('👂 AuthService: Setting up auth state listener');

    return onAuthStateChanged(auth, async firebaseUser => {
      console.log(
        '🔄 AuthService: Auth state changed, user:',
        firebaseUser?.uid || 'null'
      );

      if (firebaseUser) {
        try {
          const userProfile = await this.getUserProfile(firebaseUser.uid);
          callback(userProfile);
        } catch (error) {
          console.error('❌ AuthService: Error getting user profile:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  /**
   * Check if username is available
   *
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if available
   */
  private async checkUsernameAvailability(username: string): Promise<boolean> {
    console.log('🔍 AuthService: Checking username availability:', username);

    try {
      const usernamesRef = ref(database, `usernames/${username.toLowerCase()}`);
      const snapshot = await get(usernamesRef);

      const isAvailable = !snapshot.exists();
      console.log(
        '✅ AuthService: Username availability check result:',
        isAvailable
      );

      return isAvailable;
    } catch (error) {
      console.error(
        '❌ AuthService: Username availability check failed:',
        error
      );
      throw new Error('Failed to check username availability');
    }
  }

  /**
   * Create user profile in database
   *
   * @param {UserProfileData} profile - User profile data
   */
  private async createUserProfile(profile: UserProfileData): Promise<void> {
    console.log('💾 AuthService: Creating user profile for UID:', profile.uid);

    try {
      const updates = {
        [`users/${profile.uid}`]: profile,
        [`usernames/${profile.username.toLowerCase()}`]: profile.uid,
      };

      await update(ref(database), updates);
      console.log('✅ AuthService: User profile created successfully');
    } catch (error) {
      console.error('❌ AuthService: Failed to create user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Get user profile from database
   *
   * @param {string} uid - User ID
   * @returns {Promise<User | null>} User profile or null
   */
  private async getUserProfile(uid: string): Promise<User | null> {
    console.log('📖 AuthService: Getting user profile for UID:', uid);

    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        console.log('⚠️ AuthService: User profile not found for UID:', uid);
        return null;
      }

      const userData = snapshot.val() as User;
      console.log('✅ AuthService: User profile retrieved successfully');

      return userData;
    } catch (error) {
      console.error('❌ AuthService: Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Update user's last active timestamp
   *
   * @param {string} uid - User ID
   */
  private async updateLastActive(uid: string): Promise<void> {
    try {
      const userRef = ref(database, `users/${uid}/lastActive`);
      await set(userRef, Date.now());
    } catch (error) {
      console.error('❌ AuthService: Failed to update last active:', error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Handle authentication errors and return user-friendly messages
   *
   * @param {unknown} error - Firebase error
   * @returns {Error} Formatted error
   */
  private handleAuthError(error: unknown): Error {
    // Type guard for Firebase auth errors
    const isFirebaseError = (
      err: unknown
    ): err is { code: string; message: string } => {
      return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        'message' in err
      );
    };

    console.error('🔥 AuthService: Handling auth error:', error);

    if (isFirebaseError(error) && error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          return new Error('Please enter a valid email address.');
        case 'auth/user-disabled':
          return new Error(
            'This account has been disabled. Please contact support.'
          );
        case 'auth/user-not-found':
          return new Error('No account found with this email address.');
        case 'auth/wrong-password':
          return new Error('Invalid password. Please try again.');
        case 'auth/email-already-in-use':
          return new Error('An account with this email already exists.');
        case 'auth/weak-password':
          return new Error('Password should be at least 6 characters long.');
        case 'auth/network-request-failed':
          return new Error(
            'Network error. Please check your connection and try again.'
          );
        case 'auth/too-many-requests':
          return new Error('Too many failed attempts. Please try again later.');
        case 'auth/operation-not-allowed':
          return new Error('This sign-in method is not enabled.');
        case 'auth/invalid-credential':
          return new Error(
            'Invalid credentials. Please check your email and password.'
          );
        default:
          return new Error(
            error.message || 'An unexpected error occurred. Please try again.'
          );
      }
    }

    // Handle non-Firebase errors
    if (error instanceof Error) {
      return error;
    }

    return new Error('An unexpected error occurred.');
  }
}

/**
 * Singleton auth service instance
 */
export const authService = new AuthService();
