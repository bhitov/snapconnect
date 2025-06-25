/**
 * @file cameraStore.ts
 * @description Camera store using Zustand for state management.
 * Handles camera settings, media capture, processing, and permissions.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { generateId } from '@/shared/utils/idGenerator';

import type {
  CameraStore,
  CameraSettings,
  CameraPermissions,
  CapturedMedia,
  FilterType,
  TextOverlay,
  MediaFilter,
  RecordingState,
} from '../types';
import type { CameraView } from 'expo-camera';
import type React from 'react';

/**
 * Default camera settings
 */
const defaultSettings: CameraSettings = {
  type: 'back',
  flashMode: 'auto',
  quality: 0.8,
  ratio: '16:9',
  enableAudio: true,
  recordingTimeLimit: 180, // 3 minutes
};

/**
 * Default permissions state
 */
const defaultPermissions: CameraPermissions = {
  camera: false,
  microphone: false,
  mediaLibrary: false,
};

/**
 * Default recording state
 */
const defaultRecording: RecordingState = {
  isRecording: false,
  duration: 0,
  maxDuration: 180000, // 3 minutes in milliseconds
};

/**
 * Available filters
 */
const availableFilters: MediaFilter[] = [
  {
    type: 'none',
    name: 'Original',
    icon: '🌟',
    enabled: true,
  },
  {
    type: 'blackwhite',
    name: 'B&W',
    icon: '⚫',
    enabled: true,
  },
  {
    type: 'sepia',
    name: 'Sepia',
    icon: '🟤',
    enabled: true,
  },
  {
    type: 'vintage',
    name: 'Vintage',
    icon: '📷',
    enabled: true,
  },
  {
    type: 'neon',
    name: 'Neon',
    icon: '💜',
    enabled: true,
  },
];

/**
 * Initial camera store state
 */
const initialState = {
  // Settings
  settings: defaultSettings,

  // Permissions
  permissions: defaultPermissions,

  // Current state
  mode: 'photo' as const,
  isReady: false,
  isLoading: false,
  error: null,

  // Recording
  recording: defaultRecording,

  // Captured media
  capturedMedia: null,
  processedMedia: null,

  // Available filters
  availableFilters,
  selectedFilter: 'none' as FilterType,

  // Text overlays
  textOverlays: [] as TextOverlay[],

  // UI state
  controlsVisible: true,
};

/**
 * Camera store using Zustand
 */
export const useCameraStore = create<CameraStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      ...initialState,

      // Permissions
      requestPermissions: async () => {
        console.log('📋 CameraStore: Requesting permissions');

        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // This will be implemented in the camera service
          // For now, return true to indicate permissions granted
          const permissions = {
            camera: true,
            microphone: true,
            mediaLibrary: true,
          };

          set(state => {
            state.permissions = permissions;
            state.isLoading = false;
            state.isReady = permissions.camera;
          });

          console.log('✅ CameraStore: Permissions granted');
          return permissions.camera && permissions.microphone;
        } catch (error) {
          console.error('❌ CameraStore: Permission request failed:', error);

          set(state => {
            state.error = {
              type: 'permission_denied',
              message: 'Camera permissions are required to use this feature.',
            };
            state.isLoading = false;
          });

          return false;
        }
      },

      checkPermissions: async () => {
        console.log('🔍 CameraStore: Checking permissions');

        // This will be implemented in the camera service
        const permissions = {
          camera: true,
          microphone: true,
          mediaLibrary: true,
        };

        set(state => {
          state.permissions = permissions;
          state.isReady = permissions.camera;
        });

        return permissions;
      },

      // Settings
      updateSettings: settings => {
        console.log('⚙️ CameraStore: Updating settings:', settings);

        set(state => {
          Object.assign(state.settings, settings);
        });
      },

      toggleCamera: () => {
        console.log('🔄 CameraStore: Toggling camera');

        set(state => {
          state.settings.type =
            state.settings.type === 'front' ? 'back' : 'front';
        });
      },

      setFlashMode: mode => {
        console.log('⚡ CameraStore: Setting flash mode:', mode);

        set(state => {
          state.settings.flashMode = mode;
        });
      },

      // Media capture
      capturePhoto: async (cameraRef?: React.RefObject<CameraView | null>) => {
        console.log('📸 CameraStore: Capturing photo');

        // SETTING STATE HERE TRIGGERS A RERENDER WHICH BREAKS THE CAMERA
        // set(state => {
        //   state.isLoading = true;
        //   state.error = null;
        // });

        try {
          if (!cameraRef?.current) {
            throw new Error('Camera reference not available');
          }

          console.log('📸 CameraStore: Taking picture with camera ref');
          const photo = await cameraRef.current.takePictureAsync();

          console.log('📸 CameraStore: Photo captured:', photo.uri);

          const capturedMedia: CapturedMedia = {
            id: generateId(),
            uri: photo.uri,
            type: 'photo',
            width: photo.width || 1080,
            height: photo.height || 1920,
            size: photo.uri.length * 0.75, // Rough estimate
            timestamp: Date.now(),
          };

          set(state => {
            state.capturedMedia = capturedMedia;
            state.processedMedia = {
              ...capturedMedia,
              originalUri: capturedMedia.uri,
              filter: state.selectedFilter,
              textOverlays: [],
              isProcessing: false,
            };
            state.isLoading = false;
          });

          console.log(
            '✅ CameraStore: Photo captured successfully, URI:',
            capturedMedia.uri
          );
          return capturedMedia;
        } catch (error) {
          console.error('❌ CameraStore: Photo capture failed:', error);

          set(state => {
            state.error = {
              type: 'capture_failed',
              message: 'Failed to capture photo. Please try again.',
            };
            state.isLoading = false;
          });

          throw error;
        }
      },

      startVideoRecording: async (
        cameraRef?: React.RefObject<CameraView | null>
      ) => {
        console.log('🎥 CameraStore: Starting video recording');

        set(state => {
          state.recording.isRecording = true;
          state.recording.startTime = Date.now();
          state.recording.duration = 0;
          state.controlsVisible = false;
          state.error = null;
        });

        try {
          if (!cameraRef?.current) {
            throw new Error('Camera reference not available');
          }

          console.log(
            '🎥 CameraStore: Starting video recording with camera ref'
          );

          // Start the recording and store the promise
          const recordingPromise = cameraRef.current.recordAsync({
            maxDuration: 180, // 3 minutes in seconds
          });

          // Start recording timer
          const recordingInterval = setInterval(() => {
            const state = get();
            if (!state.recording.isRecording || !state.recording.startTime) {
              clearInterval(recordingInterval);
              return;
            }

            const elapsed = Date.now() - state.recording.startTime;

            set(currentState => {
              currentState.recording.duration = elapsed;
            });

            // Auto-stop at max duration
            if (elapsed >= state.recording.maxDuration) {
              clearInterval(recordingInterval);
              get().stopVideoRecording(cameraRef);
            }
          }, 100);

          // Store the interval reference and recording promise for cleanup
          set(state => {
            (state.recording as any).intervalRef = recordingInterval;
            state.recording.recordingPromise = recordingPromise;
          });

          console.log('✅ CameraStore: Video recording started');
        } catch (error) {
          console.error(
            '❌ CameraStore: Failed to start video recording:',
            error
          );

          set(state => {
            state.recording.isRecording = false;
            state.controlsVisible = true;
            state.error = {
              type: 'recording_failed',
              message: 'Failed to start video recording. Please try again.',
            };
          });

          throw error;
        }
      },

      stopVideoRecording: async (
        cameraRef?: React.RefObject<CameraView | null>
      ) => {
        console.log('⏹️ CameraStore: Stopping video recording');

        const state = get();

        // Clear the recording interval
        if (state.recording.intervalRef) {
          clearInterval(state.recording.intervalRef);
        }

        set(currentState => {
          currentState.recording.isRecording = false;
          currentState.controlsVisible = true;
          currentState.isLoading = true;
        });

        try {
          if (!cameraRef?.current) {
            throw new Error('Camera reference not available');
          }

          console.log(
            '⏹️ CameraStore: Stopping video recording with camera ref'
          );

          // Stop the recording
          cameraRef.current.stopRecording();

          // Get the stored recording promise and await it for the video data
          const recordingPromise = state.recording.recordingPromise;
          if (!recordingPromise) {
            throw new Error('No recording promise found');
          }

          const video = await recordingPromise;

          console.log('⏹️ CameraStore: Video recording stopped:', video?.uri);

          const capturedMedia: CapturedMedia = {
            id: generateId(),
            uri: video?.uri || '',
            type: 'video',
            width: 1080, // Default values since Expo doesn't provide them
            height: 1920,
            duration: state.recording.duration,
            size: video?.uri ? video.uri.length * 0.75 : 0, // Rough estimate
            timestamp: Date.now(),
          };

          set(currentState => {
            currentState.capturedMedia = capturedMedia;
            currentState.processedMedia = {
              ...capturedMedia,
              originalUri: capturedMedia.uri,
              filter: currentState.selectedFilter,
              textOverlays: [],
              isProcessing: false,
            };
            currentState.recording = defaultRecording;
            currentState.isLoading = false;
          });

          console.log(
            '✅ CameraStore: Video recording completed, URI:',
            capturedMedia.uri
          );
          return capturedMedia;
        } catch (error) {
          console.error('❌ CameraStore: Video recording failed:', error);

          set(currentState => {
            currentState.error = {
              type: 'recording_failed',
              message: 'Failed to save video recording. Please try again.',
            };
            currentState.recording = defaultRecording;
            currentState.isLoading = false;
          });

          throw error;
        }
      },

      // Media processing
      applyFilter: async filter => {
        console.log('🎨 CameraStore: Applying filter:', filter);

        const state = get();
        if (!state.processedMedia) {
          console.warn('⚠️ CameraStore: No media to apply filter to');
          return;
        }

        set(currentState => {
          if (currentState.processedMedia) {
            currentState.processedMedia.isProcessing = true;
          }
          currentState.selectedFilter = filter;
        });

        try {
          // Simulate filter processing delay
          await new Promise(resolve => setTimeout(resolve, 500));

          set(currentState => {
            if (currentState.processedMedia) {
              currentState.processedMedia.filter = filter;
              currentState.processedMedia.isProcessing = false;
              // In real implementation, update the URI with processed image
            }
          });

          console.log('✅ CameraStore: Filter applied successfully');
        } catch (error) {
          console.error('❌ CameraStore: Filter application failed:', error);

          set(currentState => {
            if (currentState.processedMedia) {
              currentState.processedMedia.isProcessing = false;
            }
            currentState.error = {
              type: 'processing_failed',
              message: 'Failed to apply filter. Please try again.',
            };
          });
        }
      },

      addTextOverlay: overlay => {
        console.log('✏️ CameraStore: Adding text overlay');

        const newOverlay: TextOverlay = {
          ...overlay,
          id: generateId(),
        };

        set(state => {
          state.textOverlays.push(newOverlay);
          if (state.processedMedia) {
            state.processedMedia.textOverlays.push(newOverlay);
          }
        });
      },

      updateTextOverlay: (id, updates) => {
        console.log('📝 CameraStore: Updating text overlay:', id);

        set(state => {
          const overlayIndex = state.textOverlays.findIndex(o => o.id === id);
          if (overlayIndex !== -1) {
            const overlay = state.textOverlays[overlayIndex];
            if (!overlay) return;
            if (updates.text !== undefined) overlay.text = updates.text;
            if (updates.x !== undefined) overlay.x = updates.x;
            if (updates.y !== undefined) overlay.y = updates.y;
            if (updates.fontSize !== undefined)
              overlay.fontSize = updates.fontSize;
            if (updates.color !== undefined) overlay.color = updates.color;
            if (updates.backgroundColor !== undefined)
              overlay.backgroundColor = updates.backgroundColor;
            if (updates.rotation !== undefined)
              overlay.rotation = updates.rotation;
            if (updates.scale !== undefined) overlay.scale = updates.scale;
          }

          if (state.processedMedia) {
            const processedOverlayIndex =
              state.processedMedia.textOverlays.findIndex(o => o.id === id);
            if (processedOverlayIndex !== -1) {
              const processedOverlay =
                state.processedMedia.textOverlays[processedOverlayIndex];
              if (!processedOverlay) return;
              if (updates.text !== undefined)
                processedOverlay.text = updates.text;
              if (updates.x !== undefined) processedOverlay.x = updates.x;
              if (updates.y !== undefined) processedOverlay.y = updates.y;
              if (updates.fontSize !== undefined)
                processedOverlay.fontSize = updates.fontSize;
              if (updates.color !== undefined)
                processedOverlay.color = updates.color;
              if (updates.backgroundColor !== undefined)
                processedOverlay.backgroundColor = updates.backgroundColor;
              if (updates.rotation !== undefined)
                processedOverlay.rotation = updates.rotation;
              if (updates.scale !== undefined)
                processedOverlay.scale = updates.scale;
            }
          }
        });
      },

      removeTextOverlay: id => {
        console.log('🗑️ CameraStore: Removing text overlay:', id);

        set(state => {
          state.textOverlays = state.textOverlays.filter(o => o.id !== id);
          if (state.processedMedia) {
            state.processedMedia.textOverlays =
              state.processedMedia.textOverlays.filter(o => o.id !== id);
          }
        });
      },

      // Media management
      retakeMedia: () => {
        console.log('🔄 CameraStore: Retaking media');

        set(state => {
          state.capturedMedia = null;
          state.processedMedia = null;
          state.textOverlays = [];
          state.selectedFilter = 'none';
          state.error = null;
        });
      },

      saveMedia: async () => {
        console.log('💾 CameraStore: Saving media');

        const state = get();
        if (!state.processedMedia) {
          console.warn('⚠️ CameraStore: No media to save');
          return;
        }

        set(currentState => {
          currentState.isLoading = true;
          currentState.error = null;
        });

        try {
          // This will be implemented in the camera service
          await new Promise(resolve => setTimeout(resolve, 1000));

          set(currentState => {
            currentState.isLoading = false;
          });

          console.log('✅ CameraStore: Media saved successfully');
        } catch (error) {
          console.error('❌ CameraStore: Media save failed:', error);

          set(currentState => {
            currentState.error = {
              type: 'unknown',
              message: 'Failed to save media. Please try again.',
            };
            currentState.isLoading = false;
          });
        }
      },

      discardMedia: () => {
        console.log('🗑️ CameraStore: Discarding media');

        set(state => {
          state.capturedMedia = null;
          state.processedMedia = null;
          state.textOverlays = [];
          state.selectedFilter = 'none';
          state.error = null;
        });
      },

      // Error handling
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      setError: error => {
        console.error('❌ CameraStore: Setting error:', error);

        set(state => {
          state.error = error;
        });
      },

      // UI
      toggleControls: () => {
        set(state => {
          state.controlsVisible = !state.controlsVisible;
        });
      },

      setControlsVisible: visible => {
        set(state => {
          state.controlsVisible = visible;
        });
      },
    })),
    {
      name: 'CameraStore',
    }
  )
);

/**
 * Selectors for performance optimization
 */
export const useCameraSettings = () => useCameraStore(state => state.settings);
export const useCameraPermissions = () =>
  useCameraStore(state => state.permissions);
export const useRecordingState = () => useCameraStore(state => state.recording);
export const useCapturedMedia = () =>
  useCameraStore(state => state.capturedMedia);
export const useProcessedMedia = () =>
  useCameraStore(state => state.processedMedia);
export const useAvailableFilters = () =>
  useCameraStore(state => state.availableFilters);
export const useSelectedFilter = () =>
  useCameraStore(state => state.selectedFilter);
export const useTextOverlays = () =>
  useCameraStore(state => state.textOverlays);
export const useCameraError = () => useCameraStore(state => state.error);
export const useCameraLoading = () => useCameraStore(state => state.isLoading);
export const useCameraReady = () => useCameraStore(state => state.isReady);
export const useControlsVisible = () =>
  useCameraStore(state => state.controlsVisible);
