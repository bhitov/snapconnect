/**
 * @file App.tsx
 * @description Main application entry point for SnapConnect.
 * Sets up navigation and global app configuration.
 *
 * @example
 * ```tsx
 * // This is the root component - no direct usage
 * ```
 */

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootNavigator } from './src/shared/navigation/RootNavigator';
import { useIsDarkMode } from './src/shared/hooks/useTheme';

/**
 * Main application component
 * Sets up navigation and providers for the app
 */
export default function App() {
  const isDark = useIsDarkMode();
  
  console.log('🚀 SnapConnect App starting...');
  console.log('📱 Phase 1 Setup Complete - Navigation Ready');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}
