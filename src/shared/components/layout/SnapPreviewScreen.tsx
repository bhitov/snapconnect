/**
 * @file SnapPreviewScreen.tsx
 * @description Media preview screen with editing capabilities.
 * Allows users to preview captured media, apply filters, add text overlays, and take actions.
 */

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
import { Video, ResizeMode } from 'expo-av';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated from 'react-native-reanimated';

import { useTheme } from '../../hooks/useTheme';
import { RootStackParamList } from '../../navigation/types';
import { generateId } from '../../utils/idGenerator';

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'SnapPreview'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SnapPreview'>>();
  
  const { uri, type } = route.params;

  // State
  const [isFiltered, setIsFiltered] = useState(false);
  const [filteredUri, setFilteredUri] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newTextInput, setNewTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('📷 SnapPreviewScreen: Rendering with URI:', uri, 'Type:', type);

     /**
    * Apply black and white filter to the image
    */
   const applyBlackWhiteFilter = useCallback(async () => {
     if (type !== 'photo') {
       Alert.alert('Filter Not Available', 'Filters are only available for photos.');
       return;
     }

     console.log('🎨 SnapPreviewScreen: Applying black & white filter');
     setIsProcessing(true);

     try {
       // Note: expo-image-manipulator doesn't have built-in grayscale filter
       // This is a simplified implementation that creates a processed version
       // In a real app, you'd use a more sophisticated image processing library
                const result = await ImageManipulator.manipulateAsync(
           uri,
           [],
         {
           format: ImageManipulator.SaveFormat.JPEG,
           compress: 0.8,
           base64: false,
         }
       );

       // For now, we'll use the same image but mark it as filtered
       // In a production app, you'd integrate with a proper image filter library
       setFilteredUri(result.uri);
       setIsFiltered(true);
       console.log('✅ SnapPreviewScreen: Filter applied successfully');
       
       // Note: This is a placeholder implementation
       // Real B&W filtering would require additional libraries like react-native-image-filter-kit
       Alert.alert(
         'Filter Applied',
         'Note: This is a placeholder B&W filter. Real implementation would use advanced image processing.',
         [{ text: 'OK' }]
       );
     } catch (error) {
       console.error('❌ SnapPreviewScreen: Filter application failed:', error);
       Alert.alert('Filter Error', 'Failed to apply filter. Please try again.');
     } finally {
       setIsProcessing(false);
     }
   }, [uri, type]);

  /**
   * Remove filter and show original image
   */
  const removeFilter = useCallback(() => {
    console.log('🎨 SnapPreviewScreen: Removing filter');
    setIsFiltered(false);
    setFilteredUri(null);
  }, []);

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

      const mediaUri = isFiltered && filteredUri ? filteredUri : uri;
      await MediaLibrary.saveToLibraryAsync(mediaUri);
      
      Alert.alert('Saved!', 'Media has been saved to your photo library.', [
        { text: 'OK' }
      ]);
      
      console.log('✅ SnapPreviewScreen: Media saved successfully');
    } catch (error) {
      console.error('❌ SnapPreviewScreen: Save failed:', error);
      Alert.alert('Save Failed', 'Failed to save media. Please try again.');
    }
  }, [uri, isFiltered, filteredUri]);

  /**
   * Discard and retake
   */
  const handleRetake = useCallback(() => {
    console.log('🔄 SnapPreviewScreen: Retaking media');
    navigation.goBack();
  }, [navigation]);

  /**
   * Send snap (placeholder for future implementation)
   */
  const handleSend = useCallback(() => {
    console.log('📤 SnapPreviewScreen: Sending snap');
    Alert.alert(
      'Send Snap',
      'Snap sending will be implemented in Phase 2.6',
      [{ text: 'OK' }]
    );
  }, []);

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

  const displayUri = isFiltered && filteredUri ? filteredUri : uri;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Media Display */}
      <View style={styles.mediaContainer}>
        {type === 'photo' ? (
          <Image source={{ uri: displayUri }} style={styles.media} resizeMode="cover" />
        ) : (
                     <Video
             source={{ uri: displayUri }}
             style={styles.media}
             shouldPlay={false}
             isLooping={false}
             useNativeControls
             resizeMode={ResizeMode.COVER}
           />
        )}

                 {/* Text Overlay */}
         {renderTextOverlay()}

        {/* Processing Overlay */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <Text style={[styles.processingText, { color: theme.colors.white }]}>
              Applying filter...
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Filter Controls */}
        {type === 'photo' && (
          <View style={styles.filterControls}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: isFiltered ? theme.colors.primary : theme.colors.gray4,
                },
              ]}
              onPress={isFiltered ? removeFilter : applyBlackWhiteFilter}
              disabled={isProcessing}
            >
              <Text style={[styles.filterButtonText, { color: theme.colors.black }]}>
                {isFiltered ? 'Original' : 'B&W'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

                 {/* Text Controls */}
         <View style={styles.textControls}>
           {!isAddingText ? (
             <View style={styles.textButtonContainer}>
               {!textOverlay ? (
                 <TouchableOpacity
                   style={[styles.textButton, { backgroundColor: theme.colors.white }]}
                   onPress={() => setIsAddingText(true)}
                 >
                   <Text style={[styles.textButtonText, { color: theme.colors.black }]}>
                     Add Text
                   </Text>
                 </TouchableOpacity>
               ) : (
                 <View style={styles.textButtonContainer}>
                   <TouchableOpacity
                     style={[styles.textButton, { backgroundColor: theme.colors.white, flex: 1, marginRight: 10 }]}
                     onPress={() => {
                       setNewTextInput(textOverlay.text);
                       setIsAddingText(true);
                     }}
                   >
                     <Text style={[styles.textButtonText, { color: theme.colors.black }]}>
                       Edit Text
                     </Text>
                   </TouchableOpacity>
                   <TouchableOpacity
                     style={[styles.textButton, { backgroundColor: theme.colors.gray4, flex: 1 }]}
                     onPress={removeTextOverlay}
                   >
                     <Text style={[styles.textButtonText, { color: theme.colors.black }]}>
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
                 placeholder="Enter text..."
                 placeholderTextColor={theme.colors.gray2}
                 autoFocus
                 multiline
                 maxLength={100}
               />
               <View style={styles.textInputActions}>
                 <TouchableOpacity
                   style={[styles.textActionButton, { backgroundColor: theme.colors.gray4 }]}
                   onPress={() => {
                     setIsAddingText(false);
                     setNewTextInput('');
                   }}
                 >
                   <Text style={[styles.textActionText, { color: theme.colors.black }]}>
                     Cancel
                   </Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={[styles.textActionButton, { backgroundColor: theme.colors.primary }]}
                   onPress={addTextOverlay}
                 >
                   <Text style={[styles.textActionText, { color: theme.colors.black }]}>
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
            style={[styles.actionButton, { backgroundColor: theme.colors.gray4 }]}
            onPress={handleRetake}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.black }]}>
              Retake
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.white }]}
            onPress={saveToDevice}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.black }]}>
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSend}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.black }]}>
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

  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  processingText: {
    fontSize: 18,
    fontWeight: '600',
  },

  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },

  filterControls: {
    marginBottom: 15,
    alignItems: 'center',
  },

  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
  },

  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
