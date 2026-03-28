import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';

export default function ForgotPasswordScreen() {
  const { resetPasswordForEmail, loading, error } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage('');
    const err = await resetPasswordForEmail(email);
    if (!err) {
      setMessage('パスワードリセットメールを送信しました。メールを確認してください。');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>パスワードリセット</Text>
          <Text style={styles.description}>
            登録したメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
          </Text>

          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            placeholderTextColor={colors.gray[400]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>リセットメールを送信</Text>
            )}
          </Pressable>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {message && <Text style={styles.successText}>{message}</Text>}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing['3xl'],
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
    color: colors.gray[900],
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    color: colors.gray[900],
  },
  button: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.red[500],
    textAlign: 'center',
  },
  successText: {
    fontSize: fontSize.sm,
    color: colors.green[600],
    textAlign: 'center',
  },
});
