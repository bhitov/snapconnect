/**
 * @file useAuthInitialization.ts
 * @description Hook for initializing authentication state and setting up auth listener.
 * Manages the connection between Firebase auth state and Zustand store.
 */

import { useEffect } from 'react';

import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

/**
 * Authentication initialization hook
 * Sets up Firebase auth state listener and syncs with Zustand store
 *
 * @returns {boolean} isInitializing - Whether auth is still initializing
 */
export function useAuthInitialization() {
  const { setUser, setInitializing, isInitializing } = useAuthStore();

  useEffect(() => {
    console.log('🔄 useAuthInitialization: Setting up auth state listener');

    // Set up auth state change listener
    const unsubscribe = authService.onAuthStateChanged(user => {
      console.log(
        '🔄 useAuthInitialization: Auth state changed:',
        user?.uid || 'null'
      );

      setUser(user);

      // Mark initialization as complete
      if (isInitializing) {
        setInitializing(false);
        console.log('✅ useAuthInitialization: Auth initialization complete');
      }
    });

    return () => {
      console.log('🧹 useAuthInitialization: Cleaning up auth listener');
      unsubscribe();
    };
  }, [setUser, setInitializing, isInitializing]);

  return isInitializing;
}
