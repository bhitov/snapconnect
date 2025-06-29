/**
 * @file App.tsx
 * @description Main application entry point for SnapConnect.
 * Sets up navigation and global app configuration.
 *
 * Can conditionally show camera test screen when EXPO_PUBLIC_CAMERA_TEST=true
 */

import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CameraTestScreen from './src/camera-test/CameraTestScreen';
import {
  ModalProvider,
  useModal,
  patchAlert,
} from './src/shared/components/modal';
import { setGlobalShow } from './src/shared/components/modal/ModalContext';
import { useIsDarkMode } from './src/shared/hooks/useTheme';
import { RootNavigator } from './src/shared/navigation/RootNavigator';
import { runFirebaseDebug } from './src/shared/services/firebase/debug';
import { isDev } from './src/shared/utils/isDev';

/**
 * App content component that sets up the modal system
 */
function AppContent() {
  const isDark = useIsDarkMode();
  const { show } = useModal();

  // Set up the monkey patch once the modal provider is mounted
  useEffect(() => {
    console.log('🔧 Setting up Alert.alert monkey patch');
    setGlobalShow(show);
    patchAlert();
  }, [show]);

  return (
    <>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

/**
 * Main application component
 * Shows camera test screen if EXPO_PUBLIC_CAMERA_TEST environment variable is set
 */
export default function App() {
  const isCameraTest = process.env.EXPO_PUBLIC_CAMERA_TEST === 'true';

  if (isCameraTest) {
    console.log('🚀 SnapConnect Camera Test starting...');
    console.log('📷 Camera Test Mode - Direct to test screen');
  } else {
    console.log('🚀 SnapConnect App starting...');
    console.log('📱 Phase 1 Setup Complete - Navigation Ready');
  }

  // Run Firebase debug on startup in development
  useEffect(() => {
    if (isDev()) {
      setTimeout(() => {
        void runFirebaseDebug();
      }, 2000); // Delay to let Firebase initialize
    }
  }, []);

  // Show camera test screen if flag is set
  if (isCameraTest) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CameraTestScreen />
        <StatusBar style='light' />
      </GestureHandlerRootView>
    );
  }

  // Show normal app with modal provider
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </GestureHandlerRootView>
  );
}
