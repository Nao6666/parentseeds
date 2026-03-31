import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Bot, Send, ExternalLink, Plus } from 'lucide-react-native';
import * as Crypto from 'expo-crypto';
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import { sendChatMessage } from '../lib/api';
import { MAX_CHAT_MESSAGE_LENGTH } from '../lib/constants';
import { supabase } from '../lib/supabaseClient';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';
import type { ChatMessage } from '../types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 0,
  role: 'assistant',
  content:
    'こんにちは！私はParentSeedのAIアシスタントです。育児中の感情や悩みについて、いつでもお気軽にご相談ください。どのようなことでお困りですか？',
  timestamp: new Date(),
};

const GOVERNMENT_RESOURCE_URL = 'https://www.cfa.go.jp/children-inquiries';

function generateSessionId(): string {
  return Crypto.randomUUID();
}

export default function CounselorScreen() {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId);
  const flatListRef = useRef<FlatList>(null);

  // Load latest session on mount
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    (async () => {
      const { data: latestMsg } = await supabase
        .from('chat_messages')
        .select('session_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (cancelled || !latestMsg?.length) return;

      const loadedSessionId = latestMsg[0].session_id;
      setSessionId(loadedSessionId);

      const { data: sessionMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', loadedSessionId)
        .order('created_at', { ascending: true });

      if (cancelled || !sessionMessages?.length) return;

      const loaded: ChatMessage[] = sessionMessages.map((m, i) => ({
        id: i + 1,
        role: m.role as 'user' | 'assistant',
        content: m.content as string,
        timestamp: new Date(m.created_at as string),
      }));
      setMessages([INITIAL_MESSAGE, ...loaded]);
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  const saveMessage = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      if (!user?.id) return;
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        session_id: sessionId,
        role,
        content,
      });
    },
    [user?.id, sessionId],
  );

  const handleNewSession = useCallback(() => {
    Alert.alert('新しい相談', '新しい相談を始めますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '始める',
        onPress: () => {
          setSessionId(generateSessionId());
          setMessages([INITIAL_MESSAGE]);
        },
      },
    ]);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await saveMessage('user', trimmed);

    try {
      // Build history from messages (excluding the initial greeting)
      const history = messages
        .filter((m) => m.id > 0)
        .map(({ role, content }) => ({ role, content }));

      const response = await sendChatMessage(trimmed, history);
      const aiMessage: ChatMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      await saveMessage('assistant', response);
    } catch {
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: '申し訳ございません。現在AIサービスに接続できません。しばらく時間をおいてから再度お試しください。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, saveMessage]);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    [],
  );

  const isInputDisabled = !input.trim() || isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <Pressable style={styles.newSessionButton} onPress={handleNewSession}>
            <Plus size={20} color={colors.secondary} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="悩みや気持ちを入力してください..."
            placeholderTextColor={colors.gray[400]}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={MAX_CHAT_MESSAGE_LENGTH}
            editable={!isLoading}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[styles.sendButton, isInputDisabled && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isInputDisabled}
          >
            <Send size={18} color={colors.white} />
          </Pressable>
        </View>

        <Text style={styles.disclaimerText}>
          深刻な問題の場合は、専門のカウンセラーにご相談ください。
        </Text>

        <Pressable
          style={styles.resourceButton}
          onPress={() => Linking.openURL(GOVERNMENT_RESOURCE_URL)}
        >
          <Bot size={14} color={colors.white} />
          <Text style={styles.resourceButtonText}>こども家庭庁 相談窓口へ</Text>
          <ExternalLink size={14} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  chatList: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  newSessionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    color: colors.gray[900],
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  disclaimerText: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  resourceButton: {
    backgroundColor: colors.blue[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  resourceButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
