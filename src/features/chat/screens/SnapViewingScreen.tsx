/**
 * @file SnapViewingScreen.tsx
 * @description Screen for viewing received snaps with timer functionality.
 * Supports tap-and-hold to pause timer and automatic viewed status updates.
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks/useTheme';

import { chatService } from '../services/chatService';
import { useChatStore, useViewingSession } from '../store/chatStore';

import type { Snap, SnapMessage } from '../types';
import type { RootStackParamList } from '@/shared/navigation/types';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type SnapViewingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ViewSnap'
>;
type SnapViewingScreenRouteProp = RouteProp<RootStackParamList, 'ViewSnap'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Snap viewing screen component
 */
export function SnapViewingScreen() {
  const navigation = useNavigation<SnapViewingScreenNavigationProp>();
  const route = useRoute<SnapViewingScreenRouteProp>();
  const theme = useTheme();

  // Route params
  const { snapId } = route.params;

  // Store hooks
  const viewingSession = useViewingSession();
  const {
    startViewingSnap,
    pauseViewingSnap,
    resumeViewingSnap,
    stopViewingSnap,
    markMessageAsViewed,
  } = useChatStore();

  // Local state
  const [snap, setSnap] = useState<Snap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<Video>(null);
  const pressStartTime = useRef<number>(0);

  /**
   * Load snap data
   */
  const loadSnap = useCallback(async () => {
    console.log('📸 SnapViewingScreen: Loading snap:', snapId);

    setLoading(true);
    setError(null);

    try {
      // Load snap from service - use the getMessage method from chatService
      const messageData = await chatService.getMessage(snapId);

      if (!messageData) {
        setError('Snap not found or has expired');
        setLoading(false);
        return;
      }

      // Check if this is actually a snap message
      if (messageData.type !== 'snap') {
        setError('Invalid message type - not a snap');
        setLoading(false);
        return;
      }

      // Type assertion since we've checked the type
      const snapMessage = messageData as SnapMessage;

      // Convert SnapMessage to legacy Snap format for compatibility
      const snap: Snap = {
        id: snapId,
        senderId: snapMessage.senderId,
        recipientId: snapMessage.recipientId,
        mediaUrl: snapMessage.mediaUrl,
        mediaType: snapMessage.mediaType,
        ...(snapMessage.textOverlay && {
          textOverlay: snapMessage.textOverlay,
        }),
        duration: snapMessage.duration,
        createdAt: snapMessage.createdAt,
        expiresAt: snapMessage.expiresAt,
        status: snapMessage.status,
        ...(snapMessage.deliveredAt && {
          deliveredAt: snapMessage.deliveredAt,
        }),
        ...(snapMessage.viewedAt && { viewedAt: snapMessage.viewedAt }),
      };

      // Check if snap has expired
      if (snap.expiresAt < Date.now()) {
        setError('This snap has expired');
        setLoading(false);
        return;
      }

      // Check if snap has already been viewed
      if (snap.status === 'viewed') {
        setError('This snap has already been viewed');
        setLoading(false);
        return;
      }

      // Get current user ID to check permissions
      const currentUserId = chatService.getCurrentUser();

      // Prevent sender from viewing their own snaps
      if (snap.senderId === currentUserId) {
        setError('You cannot view your own snaps');
        setLoading(false);
        return;
      }

      // Ensure only the intended recipient can view the snap
      if (snap.recipientId !== currentUserId) {
        setError('You are not authorized to view this snap');
        setLoading(false);
        return;
      }

      setSnap(snap);
      setLoading(false);

      // Start viewing session with SnapMessage format
      startViewingSnap(snapMessage);
    } catch (err) {
      console.error('❌ SnapViewingScreen: Failed to load snap:', err);
      setError('Failed to load snap');
      setLoading(false);
    }
  }, [snapId, startViewingSnap]);

  /**
   * Handle snap completion (timer ends)
   */
  const handleSnapComplete = useCallback(async () => {
    if (!snap) return;

    try {
      // Mark snap as viewed
      await markMessageAsViewed(snap.id);

      // Stop viewing session
      stopViewingSnap();

      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error(
        '❌ SnapViewingScreen: Failed to mark snap as viewed:',
        error
      );
      Alert.alert('Error', 'Failed to mark snap as viewed');
      navigation.goBack();
    }
  }, [snap, markMessageAsViewed, stopViewingSnap, navigation]);

  /**
   * Start timer countdown
   */
  const startTimer = useCallback(() => {
    if (!viewingSession) return;

    const updateTimer = () => {
      if (!viewingSession.isPaused) {
        const elapsed = Date.now() - viewingSession.startTime;
        const remaining = Math.max(0, viewingSession.totalDuration - elapsed);

        setRemainingTime(remaining);

        if (remaining <= 0) {
          handleSnapComplete();
          return;
        }
      }

      timerRef.current = setTimeout(updateTimer, 100) as unknown as number;
    };

    updateTimer();
  }, [viewingSession, handleSnapComplete]);

  /**
   * Stop timer
   */
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Handle press start (for pause functionality)
   */
  const handlePressIn = useCallback(() => {
    pressStartTime.current = Date.now();

    // Pause after 100ms of holding
    setTimeout(() => {
      if (Date.now() - pressStartTime.current >= 100) {
        if (!isPaused) {
          pauseViewingSnap();
          setIsPaused(true);
          stopTimer();

          // Pause video if it's a video snap
          if (snap?.mediaType === 'video' && videoRef.current) {
            videoRef.current.pauseAsync();
          }
        }
      }
    }, 100);
  }, [isPaused, pauseViewingSnap, stopTimer, snap]);

  /**
   * Handle press end (resume functionality)
   */
  const handlePressOut = useCallback(() => {
    const pressDuration = Date.now() - pressStartTime.current;

    if (pressDuration >= 100 && isPaused) {
      // Resume viewing
      resumeViewingSnap();
      setIsPaused(false);
      startTimer();

      // Resume video if it's a video snap
      if (snap?.mediaType === 'video' && videoRef.current) {
        videoRef.current.playAsync();
      }
    } else if (pressDuration < 100) {
      // Quick tap - exit snap
      handleSnapComplete();
    }
  }, [isPaused, resumeViewingSnap, startTimer, snap, handleSnapComplete]);

  /**
   * Load snap on component mount
   */
  useEffect(() => {
    loadSnap();

    return () => {
      stopTimer();
      stopViewingSnap();
    };
  }, []);

  /**
   * Start timer when viewing session starts
   */
  useEffect(() => {
    if (viewingSession && !viewingSession.isPaused) {
      startTimer();
    } else {
      stopTimer();
    }

    return stopTimer;
  }, [viewingSession, startTimer, stopTimer]);

  /**
   * Update remaining time from viewing session
   */
  useEffect(() => {
    if (viewingSession) {
      setRemainingTime(viewingSession.remainingTime);
      setIsPaused(viewingSession.isPaused);
    }
  }, [viewingSession]);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar barStyle='light-content' backgroundColor='#000000' />
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading snap...
        </Text>
      </View>
    );
  }

  /**
   * Render error state
   */
  if (error || !snap) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar barStyle='light-content' backgroundColor='#000000' />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error || 'Snap not found'}
        </Text>
        <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
          <View
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[styles.buttonText, { color: theme.colors.background }]}
            >
              Go Back
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  const progressPercentage = viewingSession
    ? ((viewingSession.totalDuration - remainingTime) /
        viewingSession.totalDuration) *
      100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#000000' />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.timerText}>{Math.ceil(remainingTime / 1000)}s</Text>
      </View>

      {/* Snap Content */}
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.snapContainer}>
          {snap.mediaType === 'photo' ? (
            <Image
              source={{ uri: snap.mediaUrl }}
              style={styles.media}
              resizeMode='contain'
            />
          ) : (
            <Video
              ref={videoRef}
              source={{ uri: snap.mediaUrl }}
              style={styles.media}
              shouldPlay={!isPaused}
              isLooping={false}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={false}
            />
          )}

          {/* Text Overlay */}
          {snap.textOverlay && (
            <View style={styles.textOverlayContainer}>
              <Text style={styles.textOverlay}>{snap.textOverlay}</Text>
            </View>
          )}

          {/* Pause Indicator */}
          {isPaused && (
            <View style={styles.pauseIndicator}>
              <Text style={styles.pauseText}>⏸️</Text>
              <Text style={styles.pauseLabel}>Hold to view</Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Tap to close • Hold to pause
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  snapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  textOverlayContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  textOverlay: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pauseIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    fontSize: 48,
    marginBottom: 8,
  },
  pauseLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  instructionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
  },
  instructionsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
