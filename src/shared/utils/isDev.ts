/**
 * @file isDev.ts
 * @description Utility function to determine if we're in development mode.
 * Defaults to __DEV__ but can be overridden with EXPO_PROD_TEST environment variable.
 */

/**
 * Check if we're in development mode
 *
 * @returns {boolean} True if in development mode, false if in production or EXPO_PROD_TEST is set
 *
 * @example
 * ```typescript
 * import { isDev } from '@/shared/utils/isDev';
 *
 * if (isDev()) {
 *   console.log('Development mode');
 * }
 * ```
 */
export function isDev(): boolean {
  // If EXPO_PROD_TEST is set to 'true', always return false (production mode)
  if (process.env.EXPO_PUBLIC_PROD_TEST === 'true') {
    return false;
  }

  // Otherwise use the default __DEV__ value
  return __DEV__;
}
