/**
 * @file CameraCapture.tsx
 * @description Camera capture component for taking photos and videos.
 * Handles permissions and basic camera functionality.
 */

import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraCaptureProps {
  onMediaCaptured: (media: { uri: string; type: 'photo' | 'video' }) => void;
}

export function CameraCapture({ onMediaCaptured }: CameraCaptureProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Check if both permissions are loading
  if (!cameraPermission || !microphonePermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading permissions...</Text>
      </View>
    );
  }

  // Handle permission requests
  const requestAllPermissions = async () => {
    const cameraResult = await requestCameraPermission();
    const micResult = await requestMicrophonePermission();
    return cameraResult.granted && micResult.granted;
  };

  // Check if permissions are granted
  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera and microphone permissions required</Text>
        <Text style={styles.subText}>
          Camera: {cameraPermission.granted ? '✅' : '❌'} | 
          Microphone: {microphonePermission.granted ? '✅' : '❌'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestAllPermissions}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Take a photo
   */
  const takePhoto = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo?.uri) {
        onMediaCaptured({ uri: photo.uri, type: 'photo' });
      }
    } catch (error) {
      console.error('Photo capture failed:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  /**
   * Record video
   */
  const toggleVideoRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      if (isRecording) {
        setIsRecording(false);
        cameraRef.current.stopRecording();
      } else {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30, // 30 seconds max
        });
        
        setIsRecording(false);
        
        if (video?.uri) {
          onMediaCaptured({ uri: video.uri, type: 'video' });
        }
      }
    } catch (error) {
      console.error('Video recording failed:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  /**
   * Toggle camera facing
   */
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      />
      
      {/* Overlay positioned absolutely on top of camera */}
      <View style={styles.overlay}>
        {/* Status indicator */}
        <View style={styles.status}>
          <Text style={styles.statusText}>Camera Test</Text>
          {isRecording && (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={toggleCameraFacing}
          >
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={takePhoto}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.videoButton, 
              isRecording && styles.recording
            ]} 
            onPress={toggleVideoRecording}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'Stop' : 'Video'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
    pointerEvents: 'box-none', // Allow touches to pass through to camera
  },
  status: {
    alignItems: 'center',
    marginTop: 50,
    pointerEvents: 'none', // Status is display only
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: 10,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 50,
    pointerEvents: 'box-none', // Allow button touches
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  flipButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 35,
  },
  videoButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  recording: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 