/**
 * @file authTypes.ts
 * @description TypeScript type definitions for authentication feature.
 * Defines user model, auth state, and form interfaces.
 */

/**
 * User model interface
 */
export interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastActive: number;
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
 * Profile update interface
 */
export interface ProfileUpdate {
  displayName?: string;
  username?: string;
  photoURL?: string;
}

/**
 * Auth error types
 */
export interface AuthError {
  code: string;
  message: string;
}

/**
 * Firebase auth user data
 */
export interface FirebaseUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

/**
 * User profile data for database
 */
export interface UserProfileData {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastActive: number;
}

/**
 * Auth action types
 */
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'CLEAR_ERROR' };
