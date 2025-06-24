/**
 * @file authStore.ts
 * @description Authentication store using Zustand for state management.
 * Handles user authentication state, login/logout actions, and session persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { authService } from '../services/authService';

import type { User } from '../types/authTypes';

/**
 * Authentication store state interface
 */
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  completeProfileSetup: (
    uid: string,
    profileData: import('../types/authTypes').ProfileSetupForm
  ) => Promise<void>;
  uploadAvatar: (
    uid: string,
    avatar: import('../types/authTypes').AvatarUpload
  ) => Promise<string>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitializing: (initializing: boolean) => void;

  // Computed
  isProfileComplete: () => boolean;
}

/**
 * Initial state for the auth store
 */
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

/**
 * Authentication store using Zustand
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        ...initialState,

        // Actions
        login: async (email, password) => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const user = await authService.login(email, password);

            set(state => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch (error) {
            set(state => {
              state.error =
                error instanceof Error ? error.message : 'Login failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        register: async (email, password, username) => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const user = await authService.register(email, password, username);

            set(state => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch (error) {
            set(state => {
              state.error =
                error instanceof Error ? error.message : 'Registration failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        logout: async () => {
          set(state => {
            state.isLoading = true;
          });

          try {
            await authService.logout();

            set(state => {
              state.user = null;
              state.isAuthenticated = false;
              state.isLoading = false;
              state.error = null;
            });
          } catch (error) {
            set(state => {
              state.error =
                error instanceof Error ? error.message : 'Logout failed';
              state.isLoading = false;
            });
          }
        },

        updateProfile: updates => {
          set(state => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          });
        },

        completeProfileSetup: async (uid, profileData) => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const updatedUser = await authService.completeProfileSetup(
              uid,
              profileData
            );

            set(state => {
              state.user = updatedUser;
              state.isLoading = false;
            });
          } catch (error) {
            set(state => {
              state.error =
                error instanceof Error ? error.message : 'Profile setup failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        uploadAvatar: async (uid, avatar) => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const photoURL = await authService.uploadAvatar(uid, avatar);

            set(state => {
              state.isLoading = false;
            });

            return photoURL;
          } catch (error) {
            set(state => {
              state.error =
                error instanceof Error ? error.message : 'Avatar upload failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        clearError: () => {
          set(state => {
            state.error = null;
          });
        },

        setUser: user => {
          set(state => {
            state.user = user;
            state.isAuthenticated = !!user;
          });
        },

        setLoading: loading => {
          set(state => {
            state.isLoading = loading;
          });
        },

        setInitializing: initializing => {
          set(state => {
            state.isInitializing = initializing;
          });
        },

        // Computed
        isProfileComplete: () => {
          const user = get().user;
          return !!(user?.username && user?.displayName);
        },
      })),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => state => {
          if (state) {
            state.setInitializing(false);
          }
        },
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);

/**
 * Selectors for performance optimization
 */
export const useAuthUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useIsInitializing = () =>
  useAuthStore(state => state.isInitializing);
