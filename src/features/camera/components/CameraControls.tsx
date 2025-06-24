/**
 * @file CameraControls.tsx
 * @description Camera control buttons for flash, flip, and settings.
 * Provides quick access to camera configuration options.
 */

import { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

// Store
import { useTheme } from '@/shared/hooks/useTheme';

import { useCameraStore } from '../store/cameraStore';

// Types
import type { FlashMode } from '../types';

/**
 * Flash mode icons
 */
const FLASH_ICONS = {
  auto: '⚡',
  on: '💡',
  off: '🚫',
  torch: '🔦',
} as const;

/**
 * CameraControls component
 *
 * @returns {JSX.Element} Camera controls component
 */
export function CameraControls() {
  const theme = useTheme();
  const flipAnimation = useSharedValue(0);

  const { settings, mode, toggleCamera, setFlashMode } = useCameraStore();

  console.log(
    '📷 CameraControls: Rendering with flash mode:',
    settings.flashMode
  );

  /**
   * Handle camera flip with animation
   */
  const handleFlip = useCallback(() => {
    console.log('📷 CameraControls: Flipping camera');

    flipAnimation.value = withSequence(
      withSpring(1, { damping: 15, stiffness: 150 }),
      withSpring(0, { damping: 15, stiffness: 150 })
    );

    toggleCamera();
  }, [toggleCamera, flipAnimation]);

  /**
   * Cycle flash mode
   */
  const handleFlashToggle = useCallback(() => {
    const flashModes: FlashMode[] = ['auto', 'on', 'off'];
    const currentIndex = flashModes.indexOf(settings.flashMode);
    const nextIndex = (currentIndex + 1) % flashModes.length;
    const nextMode = flashModes[nextIndex] || 'auto';

    console.log('📷 CameraControls: Cycling flash mode to:', nextMode);
    setFlashMode(nextMode);
  }, [settings.flashMode, setFlashMode]);

  /**
   * Flip animation style
   */
  const flipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 - flipAnimation.value * 0.5 }],
  }));

  return (
    <View style={styles.container}>
      {/* Flash Control */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          { backgroundColor: `${theme.colors.black}80` },
        ]}
        onPress={handleFlashToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.controlIcon}>
          {FLASH_ICONS[settings.flashMode]}
        </Text>
        <Text style={[styles.controlLabel, { color: theme.colors.white }]}>
          {settings.flashMode.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {/* Camera Flip */}
      <Animated.View style={flipAnimatedStyle}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: `${theme.colors.black}80` },
          ]}
          onPress={handleFlip}
          activeOpacity={0.7}
        >
          <Text style={styles.controlIcon}>
            {settings.type === 'front' ? '🤳' : '📷'}
          </Text>
          <Text style={[styles.controlLabel, { color: theme.colors.white }]}>
            {settings.type === 'front' ? 'FRONT' : 'BACK'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Mode Indicator */}
      <View
        style={[
          styles.modeIndicator,
          { backgroundColor: `${theme.colors.primary}20` },
        ]}
      >
        <Text style={[styles.modeText, { color: theme.colors.primary }]}>
          {mode.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  controlButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
  },

  controlIcon: {
    fontSize: 20,
    marginBottom: 2,
  },

  controlLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  modeIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 252, 0, 0.3)',
  },

  modeText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
