/**
 * @file CameraTestScreen.tsx
 * @description Main camera test screen orchestrating the workflow.
 * Manages the flow between capture, preview, and uploaded media viewing.
 */

import { useState } from 'react';

import { CameraCapture } from './CameraCapture';
import { MediaPreview } from './MediaPreview';
import { UploadedMediaViewer } from './UploadedMediaViewer';

type ScreenState = 'camera' | 'preview' | 'uploaded';

interface CapturedMedia {
  uri: string;
  type: 'photo' | 'video';
}

interface UploadedMedia {
  downloadUrl: string;
  type: 'photo' | 'video';
}

export default function CameraTestScreen() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('camera');
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(
    null
  );
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(
    null
  );

  /**
   * Handle media captured from camera
   */
  const handleMediaCaptured = (media: CapturedMedia) => {
    setCapturedMedia(media);
    setCurrentScreen('preview');
  };

  /**
   * Handle going back to camera from preview
   */
  const handleBackToCamera = () => {
    setCapturedMedia(null);
    setCurrentScreen('camera');
  };

  /**
   * Handle upload completion
   */
  const handleUploadComplete = (downloadUrl: string) => {
    if (capturedMedia) {
      setUploadedMedia({
        downloadUrl,
        type: capturedMedia.type,
      });
      setCurrentScreen('uploaded');
    }
  };

  /**
   * Handle closing uploaded media viewer
   */
  const handleCloseUploadedViewer = () => {
    setCapturedMedia(null);
    setUploadedMedia(null);
    setCurrentScreen('camera');
  };

  // Render appropriate screen based on current state
  switch (currentScreen) {
    case 'camera':
      return <CameraCapture onMediaCaptured={handleMediaCaptured} />;

    case 'preview':
      return capturedMedia ? (
        <MediaPreview
          media={capturedMedia}
          onBack={handleBackToCamera}
          onUploadComplete={handleUploadComplete}
        />
      ) : null;

    case 'uploaded':
      return uploadedMedia ? (
        <UploadedMediaViewer
          downloadUrl={uploadedMedia.downloadUrl}
          mediaType={uploadedMedia.type}
          onClose={handleCloseUploadedViewer}
        />
      ) : null;

    default:
      return <CameraCapture onMediaCaptured={handleMediaCaptured} />;
  }
}
