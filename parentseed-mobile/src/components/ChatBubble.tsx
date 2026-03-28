import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot, User } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';
import { formatTime } from '../lib/dateUtils';
import type { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.containerUser : styles.containerAssistant]}>
      <View style={[styles.inner, isUser ? styles.innerUser : styles.innerAssistant]}>
        <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]}>
          {isUser ? (
            <User size={18} color={colors.white} />
          ) : (
            <Bot size={18} color={colors.white} />
          )}
        </View>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
            {message.content}
          </Text>
          <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAssistant]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function TypingIndicator() {
  return (
    <View style={styles.containerAssistant}>
      <View style={styles.innerAssistant}>
        <View style={[styles.avatar, styles.avatarAssistant]}>
          <Bot size={18} color={colors.white} />
        </View>
        <View style={[styles.bubble, styles.bubbleAssistant]}>
          <View style={styles.typingRow}>
            <View style={[styles.dot, { opacity: 0.4 }]} />
            <View style={[styles.dot, { opacity: 0.6 }]} />
            <View style={[styles.dot, { opacity: 0.8 }]} />
            <Text style={styles.typingText}>考え中...</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  containerUser: {
    alignItems: 'flex-end',
  },
  containerAssistant: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  inner: {
    flexDirection: 'row',
    maxWidth: '80%',
    gap: spacing.sm,
  },
  innerUser: {
    flexDirection: 'row-reverse',
  },
  innerAssistant: {
    flexDirection: 'row',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUser: {
    backgroundColor: colors.pink[500],
  },
  avatarAssistant: {
    backgroundColor: colors.blue[500],
  },
  bubble: {
    padding: spacing.lg,
    borderRadius: borderRadius['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexShrink: 1,
  },
  bubbleUser: {
    backgroundColor: colors.pink[500],
  },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  text: {
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  textUser: {
    color: colors.white,
  },
  textAssistant: {
    color: colors.gray[800],
  },
  time: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  timeUser: {
    color: colors.pink[100],
  },
  timeAssistant: {
    color: colors.gray[400],
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue[500],
  },
  typingText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginLeft: 4,
  },
});
