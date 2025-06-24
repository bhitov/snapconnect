/**
 * @file CaptureButton.tsx
 * @description Animated capture button for photo and video recording.
 * Features Snapchat-style interactions and visual feedback.
 */

import { useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  Extrapolate,
} from 'react-native-reanimated';

// Hooks
import { useTheme } from '@/shared/hooks/useTheme';

// Types
import type { CameraMode } from '../types';

interface CaptureButtonProps {
  mode: CameraMode;
  isRecording: boolean;
  recordingDuration: number;
  onCapture: () => void;
}

// Constants
const BUTTON_SIZE = 80;
const BORDER_WIDTH = 4;
const INNER_SIZE = BUTTON_SIZE - BORDER_WIDTH * 2;
const ANIMATION_CONFIG = {
  damping: 15,
  stiffness: 150,
};

/**
 * CaptureButton component
 *
 * @param {CaptureButtonProps} props - Component props
 * @returns {JSX.Element} Capture button component
 */
export function CaptureButton({
  mode,
  isRecording,
  recordingDuration,
  onCapture,
}: CaptureButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const innerScale = useSharedValue(1);
  const borderColor = useSharedValue(0);

  console.log(
    '📷 CaptureButton: Rendering, mode:',
    mode,
    'recording:',
    isRecording
  );

  /**
   * Animate button for recording state
   */
  useEffect(() => {
    if (isRecording) {
      // Animate to recording state
      innerScale.value = withSpring(0.6, ANIMATION_CONFIG);
      borderColor.value = withTiming(1, { duration: 300 });

      // Pulse animation during recording
      scale.value = withSpring(1.1, ANIMATION_CONFIG);
    } else {
      // Animate back to normal state
      innerScale.value = withSpring(1, ANIMATION_CONFIG);
      borderColor.value = withTiming(0, { duration: 300 });
      scale.value = withSpring(1, ANIMATION_CONFIG);
    }
  }, [isRecording, innerScale, borderColor, scale]);

  /**
   * Handle button press with animation
   */
  const handlePress = useCallback(() => {
    console.log('📷 CaptureButton: Button pressed');

    // Quick press animation
    scale.value = withSpring(0.9, ANIMATION_CONFIG, () => {
      scale.value = withSpring(isRecording ? 1.1 : 1, ANIMATION_CONFIG);
    });

    onCapture();
  }, [onCapture, scale, isRecording]);

  /**
   * Animated styles for outer button
   */
  const outerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      borderColor.value,
      [0, 1],
      ['#FFFFFF', '#FF0000']
    ),
  }));

  /**
   * Animated styles for inner button
   */
  const innerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
    borderRadius: interpolate(
      innerScale.value,
      [0.6, 1],
      [8, INNER_SIZE / 2],
      Extrapolate.CLAMP
    ),
  }));

  /**
   * Format recording duration
   */
  const formatDuration = (duration: number): string => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Mode indicator */}
      <Text style={[styles.modeText, { color: theme.colors.white }]}>
        {mode === 'photo' ? 'TAP' : 'HOLD'}
      </Text>

      {/* Capture button */}
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.outerButton,
            { borderColor: theme.colors.white },
            outerAnimatedStyle,
          ]}
        >
          <Animated.View
            style={[
              styles.innerButton,
              { backgroundColor: theme.colors.white },
              innerAnimatedStyle,
            ]}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Recording duration */}
      {isRecording && (
        <Text style={[styles.durationText, { color: theme.colors.white }]}>
          {formatDuration(recordingDuration)}
        </Text>
      )}

      {/* Mode instruction */}
      {!isRecording && (
        <Text style={[styles.instructionText, { color: theme.colors.gray2 }]}>
          {mode === 'photo' ? 'for photo' : 'for video'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },

  touchable: {
    padding: 10, // Increase touch area
  },

  outerButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerButton: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
  },

  durationText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },

  instructionText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
