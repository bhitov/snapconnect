/**
 * @file index.ts
 * @description TypeScript type definitions for camera feature.
 * Includes camera settings, media capture, and preview types.
 */

import type { CameraView } from 'expo-camera';
import type React from 'react';

/**
 * Camera mode type
 */
export type CameraMode = 'photo';

/**
 * Camera type (front/back)
 */
export type CameraType = 'front' | 'back';

/**
 * Flash mode options
 */
export type FlashMode = 'auto' | 'on' | 'off' | 'torch';

/**
 * Media type for captured content
 */
export type MediaType = 'photo';

/**
 * Camera settings interface
 */
export interface CameraSettings {
  type: CameraType;
  flashMode: FlashMode;
  quality: number; // 0-1
  ratio?: string; // e.g., '16:9', '4:3'
  enableAudio: boolean;
}

/**
 * Captured media interface
 */
export interface CapturedMedia {
  id: string;
  uri: string;
  type: MediaType;
  width: number;
  height: number;
  duration?: number; // for future use
  size: number; // file size in bytes
  timestamp: number;
}

/**
 * Camera permissions interface
 */
export interface CameraPermissions {
  camera: boolean;
  microphone: boolean;
  mediaLibrary: boolean;
}

/**
 * Camera controls state
 */
export interface CameraControlsState {
  isVisible: boolean;
  flashMode: FlashMode;
  cameraType: CameraType;
  isFlipping: boolean; // animation state for camera flip
}

/**
 * Media preview props
 */
export interface MediaPreviewProps {
  media: CapturedMedia;
  onRetake: () => void;
  onConfirm: (media: CapturedMedia) => void;
  onClose: () => void;
}

/**
 * Filter type for media processing
 */
export type FilterType = 'none' | 'blackwhite' | 'sepia' | 'vintage' | 'neon';

/**
 * Media filter interface
 */
export interface MediaFilter {
  type: FilterType;
  name: string;
  icon: string;
  enabled: boolean;
}

/**
 * Text overlay interface for snaps
 */
export interface TextOverlay {
  id: string;
  text: string;
  x: number; // position x (0-1 normalized)
  y: number; // position y (0-1 normalized)
  fontSize: number;
  color: string;
  backgroundColor?: string;
  rotation: number; // degrees
  scale: number;
}

/**
 * Processed media interface (after filters/overlays)
 */
export interface ProcessedMedia extends CapturedMedia {
  originalUri: string;
  filter?: FilterType;
  textOverlays: TextOverlay[];
  isProcessing: boolean;
}

/**
 * Camera error types
 */
export type CameraErrorType =
  | 'permission_denied'
  | 'camera_unavailable'
  | 'microphone_unavailable'
  | 'capture_failed'
  | 'processing_failed'
  | 'storage_full'
  | 'unknown';

/**
 * Camera error interface
 */
export interface CameraError {
  type: CameraErrorType;
  message: string;
  code?: string;
}

/**
 * Camera store state
 */
export interface CameraState {
  // Settings
  settings: CameraSettings;

  // Permissions
  permissions: CameraPermissions;

  // Current state
  mode: CameraMode;
  isReady: boolean;
  isLoading: boolean;
  error: CameraError | null;

  // Captured media
  capturedMedia: CapturedMedia | null;
  processedMedia: ProcessedMedia | null;

  // Available filters
  availableFilters: MediaFilter[];
  selectedFilter: FilterType;

  // Text overlays
  textOverlays: TextOverlay[];

  // UI state
  controlsVisible: boolean;

  // Camera view visibility (for temporary hiding after preview)
  cameraViewVisible: boolean;
  cameraViewDelayTimeout: number | null;
}

/**
 * Camera actions interface
 */
export interface CameraActions {
  // Permissions
  requestPermissions: () => boolean;
  checkPermissions: () => CameraPermissions;

  // Settings
  updateSettings: (settings: Partial<CameraSettings>) => void;
  toggleCamera: () => void;
  setFlashMode: (mode: FlashMode) => void;

  // Media capture
  capturePhoto: (
    cameraRef?: React.RefObject<CameraView | null>
  ) => Promise<CapturedMedia>;

  // Media processing
  applyFilter: (filter: FilterType) => Promise<void>;
  addTextOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;

  // Media management
  retakeMedia: () => void;
  saveMedia: () => Promise<void>;
  discardMedia: () => void;

  // Error handling
  clearError: () => void;
  setError: (error: CameraError) => void;

  // UI
  toggleControls: () => void;
  setControlsVisible: (visible: boolean) => void;

  // Camera view visibility management
  hideCameraViewTemporarily: (delayMs?: number) => void;
  showCameraView: () => void;
  clearCameraViewDelay: () => void;
}

/**
 * Complete camera store interface
 */
export interface CameraStore extends CameraState, CameraActions {}

/**
 * Snap creation data interface
 */
export interface SnapCreationData {
  media: ProcessedMedia;
  recipients: string[];
  viewDuration: number; // seconds (1-10)
  isStory: boolean;
}

/**
 * Camera hook return type
 */
export interface UseCameraReturn {
  // State
  cameraState: CameraState;

  // Refs
  cameraRef: React.RefObject<CameraView>;

  // Actions
  capturePhoto: () => Promise<void>;
  toggleCamera: () => void;
  setFlashMode: (mode: FlashMode) => void;

  // Permissions
  requestPermissions: () => Promise<boolean>;

  // Error handling
  clearError: () => void;
}
