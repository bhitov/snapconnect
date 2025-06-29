/**
 * @file CustomAlertModal.tsx
 * @description Custom alert modal component that replaces native Alert.alert
 * Styled to match the app's design system
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';

import type { AlertButton } from 'react-native';

interface CustomAlertModalProps {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss: () => void;
}

export function CustomAlertModal({
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}: CustomAlertModalProps) {
  const theme = useTheme();

  const handleButtonPress = (button: AlertButton) => {
    // Call button's onPress if it exists
    button.onPress?.();
    // Always dismiss the modal
    onDismiss();
  };

  // Determine if this is a destructive action based on button styles
  const hasDestructiveAction = buttons.some(btn => btn.style === 'destructive');

  const getButtonStyle = (button: AlertButton, index: number) => {
    const isLastButton = index === buttons.length - 1;
    return [
      styles.button,
      !isLastButton && styles.buttonBorder,
      { borderColor: theme.colors.border },
      { backgroundColor: theme.colors.surface },
    ];
  };

  const getButtonTextStyle = (button: AlertButton) => {
    const fontWeight =
      button.style === 'cancel' ? ('400' as const) : ('600' as const);
    const color =
      button.style === 'cancel'
        ? theme.colors.textSecondary
        : button.style === 'destructive'
          ? theme.colors.error
          : theme.colors.primary;

    return { ...styles.buttonText, color, fontWeight };
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      width: '100%',
      maxWidth: 340,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      fontSize: 15,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 20,
    },
    buttonContainer: {
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.border,
      flexDirection: buttons.length === 2 ? 'row' : 'column',
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      ...(buttons.length === 2 && { flex: 1 }),
    },
    buttonBorder: {
      ...(buttons.length === 2
        ? { borderRightWidth: 0.5 }
        : { borderBottomWidth: 0.5 }),
    },
    buttonText: {
      fontSize: 17,
    },
  });

  return (
    <Modal visible transparent animationType='fade' onRequestClose={onDismiss}>
      <TouchableWithoutFeedback
        onPress={() => {
          // Only dismiss on backdrop tap if there's a cancel button or single OK button
          if (
            buttons.length === 1 ||
            buttons.some(btn => btn.style === 'cancel')
          ) {
            onDismiss();
          }
        }}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.content}>
                {title && <Text style={styles.title}>{title}</Text>}
                {message && <Text style={styles.message}>{message}</Text>}
              </View>

              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={getButtonStyle(button, index)}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}
                  >
                    <Text style={getButtonTextStyle(button)}>
                      {button.text || 'OK'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
