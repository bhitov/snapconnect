/**
 * @file LoveMapMessage.tsx
 * @description Component for displaying coach messages with special love map question highlighting and send functionality
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';

interface LoveMapMessageProps {
  text: string;
  onSendQuestion?: (question: string) => void;
}

export function LoveMapMessage({ text, onSendQuestion }: LoveMapMessageProps) {
  const theme = useTheme();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Extract question from text (look for "QUESTION: " prefix)
  const extractQuestion = (
    text: string
  ): {
    beforeQuestion: string;
    question: string;
    afterQuestion: string;
  } | null => {
    // Updated regex to better handle numbered lists and ensure clean capture groups
    const questionMatch = text.match(
      /(.*?)(?:\d+\.\s*)?QUESTION:\s*(.+?)(?:\n|$)(.*)/s
    );
    if (questionMatch) {
      // Clean up the beforeQuestion text to remove trailing numbers/periods
      let beforeText = questionMatch[1]?.trim() || '';
      // Remove trailing "2." or similar patterns
      beforeText = beforeText.replace(/\n?\d+\.\s*$/, '').trim();

      return {
        beforeQuestion: beforeText,
        question: questionMatch[2]?.trim() || '',
        afterQuestion: questionMatch[3] ? questionMatch[3].trim() : '',
      };
    }
    return null;
  };

  const questionData = extractQuestion(text);

  const handleSendQuestion = () => {
    if (questionData?.question && onSendQuestion) {
      onSendQuestion(questionData.question);
    }
  };
  if (!questionData) {
    // No special question formatting needed, render as normal text
    return (
      <View>
        <Text style={[styles.messageText, { color: '#2C3E50' }]}>{text}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {questionData.beforeQuestion &&
        questionData.beforeQuestion.length > 0 && (
          <Text style={[styles.messageText, { color: '#2C3E50' }]}>
            {questionData.beforeQuestion || 'ABC'}
          </Text>
        )}

      <View
        style={[
          styles.questionContainer,
          { borderColor: theme.colors.primary },
        ]}
      >
        <Text style={[styles.questionText, { color: theme.colors.primary }]}>
          {questionData.question || 'DEF'}
        </Text>
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSendQuestion}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.sendButtonText, { color: theme.colors.background }]}
          >
            Send Question
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  //   return (
  //     <View style={styles.container}>
  //       {questionData.beforeQuestion && questionData.beforeQuestion.length > 0 && (
  //         <Text style={[styles.messageText, { color: '#2C3E50' }]}>
  //           {questionData.beforeQuestion || 'ABC'}
  //         </Text>
  //       )}
  //
  //       <View style={[styles.questionContainer, { borderColor: theme.colors.primary }]}>
  //         <Text style={[styles.questionText, { color: theme.colors.primary }]}>
  //           {questionData.question || 'DEF'}
  //         </Text>
  //         <TouchableOpacity
  //           style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
  //           onPress={handleSendQuestion}
  //           activeOpacity={0.7}
  //         >
  //           <Text style={[styles.sendButtonText, { color: theme.colors.background }]}>
  //             Send Question
  //           </Text>
  //         </TouchableOpacity>
  //       </View>
  //
  //       {questionData.afterQuestion && questionData.afterQuestion.length > 0 && (
  //         <Text style={[styles.messageText, { color: '#2C3E50', marginTop: 8 }]}>
  //           {questionData.afterQuestion || 'AHHH'}
  //         </Text>
  //       )}
  //     </View>
  //   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  questionContainer: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#F8F9FA',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 8,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
