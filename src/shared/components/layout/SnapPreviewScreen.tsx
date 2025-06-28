/**
 * @file SnapPreviewScreen.tsx
 * @description Media preview screen with editing capabilities.
 * Allows users to preview captured media, apply filters, add text overlays, and take actions.
 */

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Video, ResizeMode } from 'expo-av';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { useCameraStore } from '../../../features/camera/store/cameraStore';
import { useTheme } from '../../hooks/useTheme';
import { RootStackParamList } from '../../navigation/types';
import { generateId } from '../../utils/idGenerator';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

// Constants
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  scale: number;
  rotation: number;
}

/**
 * SnapPreviewScreen component
 *
 * @returns {JSX.Element} Snap preview screen component
 */
export function SnapPreviewScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'SnapPreview'>
    >();
  const route = useRoute<RouteProp<RootStackParamList, 'SnapPreview'>>();

  const { uri, type } = route.params;

  // Get camera store actions
  const { hideCameraViewTemporarily } = useCameraStore();

  // State
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newTextInput, setNewTextInput] = useState('');

  console.log('📷 SnapPreviewScreen: Rendering with URI:', uri, 'Type:', type);

  /**
   * Add text overlay
   */
  const addTextOverlay = useCallback(() => {
    if (!newTextInput.trim()) {
      Alert.alert('Empty Text', 'Please enter some text to add.');
      return;
    }

    console.log('✏️ SnapPreviewScreen: Adding text overlay:', newTextInput);

    const newOverlay: TextOverlay = {
      id: generateId(),
      text: newTextInput.trim(),
      x: 0.5, // Center horizontally
      y: 0.5, // Center vertically
      fontSize: 24,
      color: '#FFFFFF',
      scale: 1,
      rotation: 0,
    };

    setTextOverlay(newOverlay);
    setNewTextInput('');
    setIsAddingText(false);
  }, [newTextInput]);

  /**
   * Remove text overlay
   */
  const removeTextOverlay = useCallback(() => {
    console.log('❌ SnapPreviewScreen: Removing text overlay');
    setTextOverlay(null);
  }, []);

  /**
   * Save media to device
   */
  const saveToDevice = useCallback(async () => {
    console.log('💾 SnapPreviewScreen: Saving media to device');

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Media library permission is required to save photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert('Saved!', 'Media has been saved to your photo library.', [
        { text: 'OK' },
      ]);

      console.log('✅ SnapPreviewScreen: Media saved successfully');
    } catch (error) {
      console.error('❌ SnapPreviewScreen: Save failed:', error);
      Alert.alert('Save Failed', 'Failed to save media. Please try again.');
    }
  }, [uri]);

  /**
   * Discard and retake
   */
  const handleRetake = useCallback(() => {
    console.log('🔄 SnapPreviewScreen: Retaking media');

    // Hide camera view temporarily when going back (5 seconds for testing)
    hideCameraViewTemporarily();

    navigation.goBack();
  }, [navigation, hideCameraViewTemporarily]);

  /**
   * Send snap - navigate to recipient selection
   */
  const handleSend = useCallback(() => {
    console.log('📤 SnapPreviewScreen: Sending snap');

    // Navigate to recipient selection with media data
    navigation.navigate('RecipientSelection', {
      mediaUri: uri,
      mediaType: type,
      ...(textOverlay?.text && { textOverlay: textOverlay.text }),
    });
  }, [navigation, uri, type, textOverlay]);

  /**
   * Render text overlay
   */
  const renderTextOverlay = useCallback(() => {
    if (!textOverlay) return null;

    return (
      <Animated.View
        style={[
          styles.textOverlay,
          {
            left: textOverlay.x * SCREEN_WIDTH - 50,
            top: textOverlay.y * SCREEN_HEIGHT - 25,
            transform: [
              { scale: textOverlay.scale },
              { rotate: `${textOverlay.rotation}deg` },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.overlayText,
            {
              fontSize: textOverlay.fontSize,
              color: textOverlay.color,
            },
          ]}
        >
          {textOverlay.text}
        </Text>
      </Animated.View>
    );
  }, [textOverlay]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#000000' />

      {/* Media Display */}
      <View style={styles.mediaContainer}>
        {type === 'photo' ? (
          <Image
            source={{ uri: resolveMediaUrl(uri) }}
            style={styles.media}
            resizeMode='cover'
          />
        ) : (
          <Video
            source={{ uri: resolveMediaUrl(uri) }}
            style={styles.media}
            shouldPlay={false}
            isLooping={false}
            useNativeControls
            resizeMode={ResizeMode.COVER}
          />
        )}

        {/* Text Overlay */}
        {renderTextOverlay()}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Text Controls */}
        <View style={styles.textControls}>
          {!isAddingText ? (
            <View style={styles.textButtonContainer}>
              {!textOverlay ? (
                <TouchableOpacity
                  style={[
                    styles.textButton,
                    { backgroundColor: theme.colors.white },
                  ]}
                  onPress={() => setIsAddingText(true)}
                >
                  <Text
                    style={[
                      styles.textButtonText,
                      { color: theme.colors.black },
                    ]}
                  >
                    Add Text
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.textButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.textButton,
                      {
                        backgroundColor: theme.colors.white,
                        flex: 1,
                        marginRight: 10,
                      },
                    ]}
                    onPress={() => {
                      setNewTextInput(textOverlay.text);
                      setIsAddingText(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.textButtonText,
                        { color: theme.colors.black },
                      ]}
                    >
                      Edit Text
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.textButton,
                      { backgroundColor: theme.colors.gray4, flex: 1 },
                    ]}
                    onPress={removeTextOverlay}
                  >
                    <Text
                      style={[
                        styles.textButtonText,
                        { color: theme.colors.black },
                      ]}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.textInputContainer}>
              <TextInput
                style={[styles.textInput, { color: theme.colors.white }]}
                value={newTextInput}
                onChangeText={setNewTextInput}
                placeholder='Enter text...'
                placeholderTextColor={theme.colors.gray2}
                autoFocus
                multiline
                maxLength={100}
              />
              <View style={styles.textInputActions}>
                <TouchableOpacity
                  style={[
                    styles.textActionButton,
                    { backgroundColor: theme.colors.gray4 },
                  ]}
                  onPress={() => {
                    setIsAddingText(false);
                    setNewTextInput('');
                  }}
                >
                  <Text
                    style={[
                      styles.textActionText,
                      { color: theme.colors.black },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.textActionButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={addTextOverlay}
                >
                  <Text
                    style={[
                      styles.textActionText,
                      { color: theme.colors.black },
                    ]}
                  >
                    {textOverlay ? 'Update' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.white },
            ]}
            onPress={handleRetake}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.black }]}
            >
              Go back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.white },
            ]}
            onPress={saveToDevice}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.black }]}
            >
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSend}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.black }]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  mediaContainer: {
    flex: 1,
    position: 'relative',
  },

  media: {
    width: SCREEN_WIDTH,
    height: '100%',
  },

  textOverlay: {
    position: 'absolute',
    padding: 8,
    borderRadius: 4,
    minWidth: 100,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlayText: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },

  textControls: {
    marginBottom: 20,
    alignItems: 'center',
  },

  textButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },

  textButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
  },

  textButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  textInputContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
  },

  textInput: {
    fontSize: 16,
    minHeight: 40,
    marginBottom: 10,
    textAlignVertical: 'top',
  },

  textInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  textActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },

  textActionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
