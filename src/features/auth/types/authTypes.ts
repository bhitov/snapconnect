/**
 * @file authTypes.ts
 * @description TypeScript type definitions for authentication feature.
 * Includes user models, form interfaces, and Firebase-related types.
 */

/**
 * User interface defining the structure of user data
 */
export interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastActive: number;
  profileSetupCompleted?: boolean;
  partnerId?: string;
}

/**
 * Login form interface
 */
export interface LoginForm {
  email: string;
  password: string;
}

/**
 * Registration form interface
 */
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  displayName: string;
}

/**
 * Profile setup form interface
 */
export interface ProfileSetupForm {
  displayName: string;
  bio?: string;
  photoURL?: string;
}

/**
 * Profile update interface
 */
export interface ProfileUpdate {
  displayName?: string;
  username?: string;
  photoURL?: string;
  bio?: string;
}

/**
 * Authentication error interface
 */
export interface AuthError {
  code: string;
  message: string;
}

/**
 * Firebase user data interface
 */
export interface FirebaseUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

/**
 * User profile data interface for Firebase
 */
export interface UserProfileData {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: number;
  lastActive: number;
  profileSetupCompleted?: boolean;
}

/**
 * Avatar upload interface
 */
export interface AvatarUpload {
  uri: string;
  type: string;
  name: string;
}

/**
 * Profile completion status interface
 */
export interface ProfileCompletionStatus {
  hasUsername: boolean;
  hasDisplayName: boolean;
  hasPhoto: boolean;
  hasBio: boolean;
  isComplete: boolean;
  completionPercentage: number;
}

/**
 * Auth action types for reducer pattern
 */
export type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };
