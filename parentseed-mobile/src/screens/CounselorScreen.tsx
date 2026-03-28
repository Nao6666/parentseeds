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
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import { sendChatMessage } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';
import type { ChatMessage } from '../types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 1,
  role: 'assistant',
  content:
    'こんにちは！私はParentSeedのAIアシスタントです。育児中の感情や悩みについて、いつでもお気軽にご相談ください。どのようなことでお困りですか？',
  timestamp: new Date(),
};

function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
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

    (async () => {
      // Get the latest session
      const { data: latestMsg } = await supabase
        .from('chat_messages')
        .select('session_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (latestMsg && latestMsg.length > 0) {
        const latestSessionId = latestMsg[0].session_id;
        setSessionId(latestSessionId);

        // Load messages for this session
        const { data: sessionMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .eq('session_id', latestSessionId)
          .order('created_at', { ascending: true });

        if (sessionMessages && sessionMessages.length > 0) {
          const loaded: ChatMessage[] = sessionMessages.map((m, i) => ({
            id: i + 1,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at),
          }));
          setMessages([INITIAL_MESSAGE, ...loaded]);
        }
      }
    })();
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
    [user?.id, sessionId]
  );

  const handleNewSession = () => {
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
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Save user message
    await saveMessage('user', currentInput);

    try {
      const response = await sendChatMessage(currentInput, messages);
      const aiMessage: ChatMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Save AI response
      await saveMessage('assistant', response);
    } catch {
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content:
          '申し訳ございません。現在AIサービスに接続できません。しばらく時間をおいてから再度お試しください。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
      />

      {/* Input */}
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
            maxLength={1000}
            editable={!isLoading}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} color={colors.white} />
          </Pressable>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimerText}>
          深刻な問題の場合は、専門のカウンセラーにご相談ください。
        </Text>

        {/* Government resource link */}
        <Pressable
          style={styles.resourceButton}
          onPress={() => Linking.openURL('https://www.cfa.go.jp/children-inquiries')}
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
