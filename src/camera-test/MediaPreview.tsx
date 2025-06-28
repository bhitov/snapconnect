/**
 * @file MediaPreview.tsx
 * @description Preview component for captured media with upload confirmation.
 * Shows the captured photo/video and allows user to confirm upload.
 */

import { Video, ResizeMode } from 'expo-av';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';

import { storage } from '../shared/services/firebase/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaPreviewProps {
  media: { uri: string; type: 'photo' | 'video' };
  onBack: () => void;
  onUploadComplete: (downloadUrl: string) => void;
}

export function MediaPreview({
  media,
  onBack,
  onUploadComplete,
}: MediaPreviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload media file to Firebase Storage
   */
  const uploadToFirebase = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Fetch the file as blob
      const response = await fetch(media.uri);
      const blob = await response.blob();

      // Create storage reference
      const timestamp = Date.now();
      const filename = `test-${media.type}-${timestamp}.${media.type === 'photo' ? 'jpg' : 'mp4'}`;
      const storageRef = ref(storage, `camera-test/${filename}`);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
            console.log(`Upload is ${progress}% done`);
          },
          error => {
            console.error('Upload error:', error);
            reject(error);
          },
          () => {
            void (async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('File available at:', downloadURL);
              resolve(downloadURL);
            })();
          }
        );
      });
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle upload confirmation
   */
  const handleUpload = async () => {
    try {
      const downloadUrl = await uploadToFirebase();
      Alert.alert('Success', 'Media uploaded successfully!', [
        {
          text: 'View Uploaded',
          onPress: () => onUploadComplete(downloadUrl),
        },
      ]);
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload media. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Media Preview */}
      <View style={styles.mediaContainer}>
        {media.type === 'photo' ? (
          <Image
            source={{ uri: media.uri }}
            style={styles.mediaPreview}
            resizeMode='contain'
          />
        ) : (
          <Video
            source={{ uri: media.uri }}
            style={styles.mediaPreview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
        )}
      </View>

      {/* Upload Progress */}
      {isUploading && (
        <View style={styles.uploadContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.uploadText}>Uploading... {uploadProgress}%</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={onBack}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.uploadButton,
            isUploading && styles.disabled,
          ]}
          onPress={() => void handleUpload()}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Media Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {media.type === 'photo' ? '📷 Photo' : '🎥 Video'} captured locally
        </Text>
        <Text style={styles.subInfoText}>
          Review and confirm to upload to Firebase Storage
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#FF3B30',
  },
  uploadButton: {
    backgroundColor: '#34C759',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subInfoText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
});
