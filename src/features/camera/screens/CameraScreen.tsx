/**
 * @file CameraScreen.tsx
 * @description Main camera screen for photo and video capture.
 * Handles permissions, camera state, and navigation to preview.
 */

import {
  useFocusEffect,
  type CompositeScreenProps,
} from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView as ExpoCamera } from 'expo-camera';
import { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions,
  Text,
} from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';

import { CameraView, CameraControls, CaptureButton } from '../components';
import { useCameraStore, useCameraViewVisible } from '../store/cameraStore';

import type {
  MainTabParamList,
  RootStackParamList,
} from '@/shared/navigation/types';

// Constants
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CameraScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MainTabParamList, 'Camera'>,
  NativeStackScreenProps<RootStackParamList>
>;

/**
 * Camera screen component
 *
 * @param {CameraScreenProps} props - Screen props with navigation
 * @returns {JSX.Element} Camera screen component
 */
export function CameraScreen({ navigation }: CameraScreenProps) {
  const theme = useTheme();
  const cameraRef = useRef<ExpoCamera>(null);

  const {
    // State
    isReady,
    isLoading,
    error,
    mode,
    capturedMedia,
    recording,
    controlsVisible,
    permissions,

    // Actions
    requestPermissions,
    capturePhoto,
    startVideoRecording,
    stopVideoRecording,
    clearError,
    setControlsVisible,
    hideCameraViewTemporarily,
    clearCameraViewDelay,
  } = useCameraStore();

  const cameraViewVisible = useCameraViewVisible();

  console.log(
    '📷 CameraScreen: Rendering with mode:',
    mode,
    'isReady:',
    isReady
  );

  /**
   * Initialize camera permissions on screen focus
   */
  useFocusEffect(
    useCallback(() => {
      console.log('📷 CameraScreen: Screen focused, requesting permissions');

      const initializeCamera = async () => {
        try {
          const granted = await requestPermissions();
          if (!granted) {
            Alert.alert(
              'Camera Permission Required',
              'SnapConnect needs camera access to take photos and videos.',
              [
                {
                  text: 'Settings',
                  onPress: () => {
                    /* Navigate to settings */
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }
        } catch (permissionError) {
          console.error(
            '❌ CameraScreen: Permission request failed:',
            permissionError
          );
        }
      };

      initializeCamera();

      return () => {
        console.log('📷 CameraScreen: Screen unfocused');
        // Clear any ongoing camera view delay when leaving the screen
        clearCameraViewDelay();
      };
    }, [requestPermissions, clearCameraViewDelay])
  );



  /**
   * Navigate to preview when media is captured
   */
  useEffect(() => {
    if (capturedMedia) {
      console.log(
        '📷 CameraScreen: Navigating to preview with media:',
        capturedMedia.id
      );
      navigation.navigate('SnapPreview', {
        uri: capturedMedia.uri,
        type: capturedMedia.type,
      });
    }
  }, [capturedMedia, navigation]);

  /**
   * Handle camera capture
   */
  const handleCapture = useCallback(async () => {
    console.log('📷 CameraScreen: Handling capture, mode:', mode);

    try {
      if (mode === 'photo') {
        await capturePhoto(cameraRef);
      } else if (mode === 'video') {
        if (recording.isRecording) {
          await stopVideoRecording(cameraRef);
        } else {
          await startVideoRecording(cameraRef);
        }
      }
    } catch (captureError) {
      console.error('❌ CameraScreen: Capture failed:', captureError);
      Alert.alert(
        'Capture Failed',
        'Failed to capture media. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [
    mode,
    recording.isRecording,
    capturePhoto,
    startVideoRecording,
    stopVideoRecording,
    cameraRef,
  ]);

  /**
   * Handle tap to focus/hide controls
   */
  const handleScreenTap = useCallback(() => {
    console.log('📷 CameraScreen: Screen tapped, toggling controls');
    setControlsVisible(!controlsVisible);
  }, [controlsVisible, setControlsVisible]);

  /**
   * Handle error dismissal
   */
  const handleErrorDismiss = useCallback(() => {
    clearError();
  }, [clearError]);

  // Show loading screen while permissions are being requested
  if (!permissions.camera || isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle='light-content' backgroundColor='#000000' />
        <Text style={[styles.loadingText, { color: theme.colors.white }]}>
          {!permissions.camera
            ? 'Requesting camera permissions...'
            : 'Loading camera...'}
        </Text>
      </View>
    );
  }

  // Show error screen
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar barStyle='light-content' backgroundColor='#000000' />
        <Text style={[styles.errorTitle, { color: theme.colors.white }]}>
          Camera Error
        </Text>
        <Text style={[styles.errorMessage, { color: theme.colors.gray2 }]}>
          {error.message}
        </Text>
        <Text
          style={[styles.errorDismiss, { color: theme.colors.primary }]}
          onPress={handleErrorDismiss}
        >
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#000000' />

      {/* Camera View */}
      {cameraViewVisible ? (
        <CameraView
          ref={cameraRef}
          onTap={handleScreenTap}
          style={styles.camera}
        />
      ) : (
        <View style={[styles.camera, styles.hiddenCameraView]}>
          <Text style={[styles.hiddenCameraText, { color: theme.colors.white }]}>
            Camera loading...
          </Text>
        </View>
      )}

      {/* Camera Controls Overlay */}
      {controlsVisible && (
        <View style={styles.controlsOverlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <CameraControls />
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <CaptureButton
              mode={mode}
              isRecording={recording.isRecording}
              recordingDuration={recording.duration}
              onCapture={handleCapture}
            />
          </View>
        </View>
      )}

      {/* Recording Indicator */}
      {recording.isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={[styles.recordingText, { color: theme.colors.white }]}>
            REC {Math.floor(recording.duration / 1000)}s
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },

  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },

  errorDismiss: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  camera: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },

  topControls: {
    paddingTop: 60, // Account for status bar and notch
    paddingHorizontal: 20,
  },

  bottomControls: {
    paddingBottom: 50, // Account for home indicator
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  recordingIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 6,
  },

  recordingText: {
    fontSize: 14,
    fontWeight: '600',
  },

  hiddenCameraView: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  hiddenCameraText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
