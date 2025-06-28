/**
 * @file resolveMediaUrl.ts
 * @description Utility function for resolving media URLs based on environment and platform.
 * Handles Firebase Storage emulator URL transformation for development.
 */

import { Platform } from 'react-native';

import { isDev } from './isDev';

/**
 * Resolves media URLs for different environments and platforms
 *
 * In DEV environment:
 * - Android: replaces base URL with 10.0.2.2:9199 (Android emulator networking)
 * - Other platforms: replaces base URL with localhost:9199
 *
 * In production: returns URL unchanged
 *
 * @param mediaUrl - The media URL to resolve
 * @returns Resolved media URL appropriate for current environment and platform
 */
export function resolveMediaUrl(mediaUrl: string): string {
  // Return empty string if no URL provided
  if (!mediaUrl) {
    return '';
  }

  // In production, return URL as-is
  if (!isDev()) {
    return mediaUrl;
  }

  // In development, transform Firebase Storage emulator URLs
  try {
    const url = new URL(mediaUrl);

    // Check if this is a Firebase Storage URL (either emulator or production)
    const isFirebaseStorage =
      url.hostname.includes('firebasestorage.googleapis.com') ||
      url.hostname.includes('localhost') ||
      url.hostname.includes('127.0.0.1') ||
      url.hostname.includes('10.0.2.2');

    if (isFirebaseStorage) {
      // Determine the appropriate host for the current platform
      const emulatorHost =
        Platform.OS === 'android' ? '10.0.2.2:9199' : 'localhost:9199';

      // Create new URL with emulator host
      const resolvedUrl = `http://${emulatorHost}${url.pathname}${url.search}`;
      return resolvedUrl;
    }

    // If not a Firebase Storage URL, return as-is
    return mediaUrl;
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn(
      '⚠️ resolveMediaUrl: Failed to parse URL, returning original:',
      error
    );
    return mediaUrl;
  }
}
