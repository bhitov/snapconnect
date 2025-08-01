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
  onOptionSelect: (
    option:
      | 'ratio'
      | 'horsemen'
      | 'lovemap'
      | 'bids'
      | 'rupturerepair'
      | 'acr'
      | 'sharedinterests'
      | 'topicchampion'
      | 'friendshipcheckin'
      | 'groupenergy'
      | 'topicvibecheck'
  ) => void;
  isRomantic?: boolean;
  isPlatonic?: boolean;
  isGroup?: boolean;
  messageCount?: number;
}

export function CoachModal({
  visible,
  onClose,
  onOptionSelect,
  isRomantic = false,
  isPlatonic = false,
  isGroup = false,
  messageCount = 0,
}: CoachModalProps) {
  const theme = useTheme();

  const handleOptionPress = (
    option:
      | 'ratio'
      | 'horsemen'
      | 'lovemap'
      | 'bids'
      | 'rupturerepair'
      | 'acr'
      | 'sharedinterests'
      | 'topicchampion'
      | 'friendshipcheckin'
      | 'groupenergy'
      | 'topicvibecheck'
  ) => {
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
            {isPlatonic ? (
              // Platonic relationships show only ACR and Topic Vibe Check
              <>
                <TouchableOpacity
                  style={[
                    styles.option,
                    {
                      borderColor: theme.colors.border,
                      opacity: messageCount >= 20 ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => messageCount >= 20 && handleOptionPress('acr')}
                  activeOpacity={messageCount >= 20 ? 0.7 : 1}
                  disabled={messageCount < 20}
                >
                  <Text
                    style={[styles.optionIcon, { color: theme.colors.primary }]}
                  >
                    🎯
                  </Text>
                  <View style={styles.optionContent}>
                    <Text
                      style={[styles.optionTitle, { color: theme.colors.text }]}
                    >
                      Active-Constructive Responding
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Analyze how you respond to each other's good news
                    </Text>
                    {messageCount < 20 && (
                      <Text
                        style={[
                          styles.optionRequirement,
                          { color: theme.colors.error },
                        ]}
                      >
                        Requires 20 messages (currently {messageCount})
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.option,
                    {
                      borderColor: theme.colors.border,
                      opacity: messageCount >= 50 ? 1 : 0.5,
                    },
                  ]}
                  onPress={() =>
                    messageCount >= 50 && handleOptionPress('topicvibecheck')
                  }
                  activeOpacity={messageCount >= 50 ? 0.7 : 1}
                  disabled={messageCount < 50}
                >
                  <Text
                    style={[styles.optionIcon, { color: theme.colors.primary }]}
                  >
                    🌟
                  </Text>
                  <View style={styles.optionContent}>
                    <Text
                      style={[styles.optionTitle, { color: theme.colors.text }]}
                    >
                      Topic Vibe Check
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Discover which topics bring positive energy to your chats
                    </Text>
                    {messageCount < 50 && (
                      <Text
                        style={[
                          styles.optionRequirement,
                          { color: theme.colors.error },
                        ]}
                      >
                        Requires 50 messages (currently {messageCount})
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            ) : isGroup ? (
              // Group conversations show only ACR and Topic Vibe Check
              <>
                <TouchableOpacity
                  style={[
                    styles.option,
                    {
                      borderColor: theme.colors.border,
                      opacity: messageCount >= 20 ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => messageCount >= 20 && handleOptionPress('acr')}
                  activeOpacity={messageCount >= 20 ? 0.7 : 1}
                  disabled={messageCount < 20}
                >
                  <Text
                    style={[styles.optionIcon, { color: theme.colors.primary }]}
                  >
                    🎯
                  </Text>
                  <View style={styles.optionContent}>
                    <Text
                      style={[styles.optionTitle, { color: theme.colors.text }]}
                    >
                      Active-Constructive Responding
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Analyze how group members respond to each other's good
                      news
                    </Text>
                    {messageCount < 20 && (
                      <Text
                        style={[
                          styles.optionRequirement,
                          { color: theme.colors.error },
                        ]}
                      >
                        Requires 20 messages (currently {messageCount})
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.option,
                    {
                      borderColor: theme.colors.border,
                      opacity: messageCount >= 50 ? 1 : 0.5,
                    },
                  ]}
                  onPress={() =>
                    messageCount >= 50 && handleOptionPress('topicvibecheck')
                  }
                  activeOpacity={messageCount >= 50 ? 0.7 : 1}
                  disabled={messageCount < 50}
                >
                  <Text
                    style={[styles.optionIcon, { color: theme.colors.primary }]}
                  >
                    🌟
                  </Text>
                  <View style={styles.optionContent}>
                    <Text
                      style={[styles.optionTitle, { color: theme.colors.text }]}
                    >
                      Topic Vibe Check
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Discover which topics bring positive energy to your group
                    </Text>
                    {messageCount < 50 && (
                      <Text
                        style={[
                          styles.optionRequirement,
                          { color: theme.colors.error },
                        ]}
                      >
                        Requires 50 messages (currently {messageCount})
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              // Romantic relationships show all options
              <>
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

                {isRomantic && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.option,
                        { borderColor: theme.colors.border },
                      ]}
                      onPress={() => handleOptionPress('bids')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionIcon,
                          { color: theme.colors.primary },
                        ]}
                      >
                        💬
                      </Text>
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionTitle,
                            { color: theme.colors.text },
                          ]}
                        >
                          Emotional Bids
                        </Text>
                        <Text
                          style={[
                            styles.optionDescription,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Analyze how you turn toward or away from each other
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.option,
                        { borderColor: theme.colors.border },
                      ]}
                      onPress={() => handleOptionPress('rupturerepair')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionIcon,
                          { color: theme.colors.primary },
                        ]}
                      >
                        🔧
                      </Text>
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionTitle,
                            { color: theme.colors.text },
                          ]}
                        >
                          Rupture & Repair
                        </Text>
                        <Text
                          style={[
                            styles.optionDescription,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Identify conflicts and successful repair attempts
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.option, { borderColor: theme.colors.border }]}
                  onPress={() => handleOptionPress('topicvibecheck')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.optionIcon, { color: theme.colors.primary }]}
                  >
                    🌟
                  </Text>
                  <View style={styles.optionContent}>
                    <Text
                      style={[styles.optionTitle, { color: theme.colors.text }]}
                    >
                      Topic Vibe Check
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Discover which topics bring positive energy to your chats
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
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
  optionRequirement: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
