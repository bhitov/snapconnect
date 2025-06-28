/**
 * @file UploadedMediaViewer.tsx
 * @description Viewer component for uploaded media from Firebase Storage.
 * Confirms that the upload worked correctly by displaying the uploaded file.
 */

import { Video, ResizeMode } from 'expo-av';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UploadedMediaViewerProps {
  downloadUrl: string;
  mediaType: 'photo' | 'video';
  onClose: () => void;
}

export function UploadedMediaViewer({
  downloadUrl,
  mediaType,
  onClose,
}: UploadedMediaViewerProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>✅ Upload Confirmed</Text>
        <Text style={styles.subHeaderText}>Viewing from Firebase Storage</Text>
      </View>

      {/* Media Viewer */}
      <View style={styles.mediaContainer}>
        {mediaType === 'photo' ? (
          <Image
            source={{ uri: downloadUrl }}
            style={styles.mediaPreview}
            resizeMode='contain'
          />
        ) : (
          <Video
            source={{ uri: downloadUrl }}
            style={styles.mediaPreview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
        )}
      </View>

      {/* URL Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Firebase URL:</Text>
        <Text style={styles.urlText} numberOfLines={2} ellipsizeMode='middle'>
          {downloadUrl}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Take Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerText: {
    color: '#34C759',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subHeaderText: {
    color: '#ccc',
    fontSize: 14,
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
  infoContainer: {
    padding: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  infoLabel: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  urlText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  controls: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
