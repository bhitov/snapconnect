/**
 * @file CoachModal.tsx
 * @description Modal component for coach analysis options
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';

interface CoachModalProps {
  visible: boolean;
  onClose: () => void;
  onOptionSelect: (option: 'ratio' | 'horsemen' | 'lovemap') => void;
}

export function CoachModal({
  visible,
  onClose,
  onOptionSelect,
}: CoachModalProps) {
  const theme = useTheme();

  const handleOptionPress = (option: 'ratio' | 'horsemen' | 'lovemap') => {
    onOptionSelect(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.modal, { backgroundColor: theme.colors.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Coach Analysis
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text
                style={[
                  styles.closeText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.option, { borderColor: theme.colors.border }]}
              onPress={() => handleOptionPress('ratio')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.optionIcon, { color: theme.colors.primary }]}
              >
                📊
              </Text>
              <View style={styles.optionContent}>
                <Text
                  style={[styles.optionTitle, { color: theme.colors.text }]}
                >
                  Positive/Negative Ratio
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Analyze the balance of positive vs negative interactions
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { borderColor: theme.colors.border }]}
              onPress={() => handleOptionPress('horsemen')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.optionIcon, { color: theme.colors.primary }]}
              >
                ⚠️
              </Text>
              <View style={styles.optionContent}>
                <Text
                  style={[styles.optionTitle, { color: theme.colors.text }]}
                >
                  Four Horsemen Analysis
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Identify criticism, contempt, and defensiveness patterns
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { borderColor: theme.colors.border }]}
              onPress={() => handleOptionPress('lovemap')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.optionIcon, { color: theme.colors.primary }]}
              >
                💕
              </Text>
              <View style={styles.optionContent}>
                <Text
                  style={[styles.optionTitle, { color: theme.colors.text }]}
                >
                  Love Map Questions
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Discover topics to deepen your connection
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
});
