const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'require',
  'react-native',
  'default',
];

// Add support for TypeScript path mapping
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@/features': path.resolve(__dirname, 'src/features'),
  '@/shared': path.resolve(__dirname, 'src/shared'),
  '@/components': path.resolve(__dirname, 'src/shared/components'),
  '@/hooks': path.resolve(__dirname, 'src/shared/hooks'),
  '@/services': path.resolve(__dirname, 'src/shared/services'),
  '@/types': path.resolve(__dirname, 'src/shared/types'),
  '@/utils': path.resolve(__dirname, 'src/shared/utils'),
  '@/theme': path.resolve(__dirname, 'src/shared/theme'),
  '@/assets': path.resolve(__dirname, 'assets'),
};

// Add additional asset extensions
config.resolver.assetExts.push(
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  // Videos
  'mp4',
  'mov',
  'avi',
  'mkv',
  // Audio
  'wav',
  'mp3',
  'aac',
  // Fonts
  'ttf',
  'otf',
  'woff',
  'woff2'
);

module.exports = config;
