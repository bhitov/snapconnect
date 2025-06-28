/**
 * @file CameraView.tsx
 * @description Camera view component using Expo Camera.
 * Handles camera initialization, configuration, and provides camera ref.
 */

import { useIsFocused } from '@react-navigation/native';
import { CameraView as ExpoCamera, CameraType, FlashMode } from 'expo-camera';
import { forwardRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  type ViewStyle,
} from 'react-native';

// Store
import { useCameraStore } from '../store/cameraStore';

import type { CameraType as AppCameraType } from '../types';

interface CameraViewProps {
  onTap?: () => void;
  style?: ViewStyle;
}

/**
 * Map app camera type to Expo camera type
 */
const mapCameraType = (type: AppCameraType): CameraType => {
  return type === 'front' ? 'front' : 'back';
};

/**
 * Map app flash mode to Expo flash mode
 */
const mapFlashMode = (flashMode: string): FlashMode => {
  switch (flashMode) {
    case 'on':
      return 'on';
    case 'off':
      return 'off';
    case 'auto':
      return 'auto';
    case 'torch':
      return 'on'; // torch maps to on for simplicity
    default:
      return 'auto';
  }
};

/**
 * CameraView component
 *
 * @param {CameraViewProps} props - Component props
 * @param {React.Ref} ref - Camera ref
 * @returns {JSX.Element} Camera view component
 */
export const CameraView = forwardRef<ExpoCamera, CameraViewProps>(
  ({ onTap, style }, ref) => {
    const { settings, permissions } = useCameraStore();
    const isFocused = useIsFocused();
    const [ratio, setRatio] = useState<string | undefined>();

    console.log('📷 CameraView: Rendering with camera type:', settings.type);

    /**
     * Handle camera ready
     */
    const handleCameraReady = () => {
      console.log('📷 CameraView: Camera ready');
    };

    // Don't render if no camera permission
    if (!isFocused || !permissions.camera) {
      return <View style={[styles.container, style]} />;
    }

    return (
      <TouchableWithoutFeedback onPress={onTap}>
        <View style={[styles.container, style]}>
          <ExpoCamera
            ref={ref}
            style={styles.camera}
            facing={mapCameraType(settings.type)}
            flash={mapFlashMode(settings.flashMode)}
            onCameraReady={handleCameraReady}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

CameraView.displayName = 'CameraView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  camera: {
    flex: 1,
  },
});
