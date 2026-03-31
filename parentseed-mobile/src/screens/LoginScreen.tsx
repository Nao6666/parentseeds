import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';
import type { AuthStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { signIn, signUp, signInWithGoogle, loading, error } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async () => {
    setMessage('');
    if (isSignUp) {
      const err = await signUp(email, password);
      if (!err) setMessage('確認メールを送信しました。メールを確認してください。');
    } else {
      const err = await signIn(email, password);
      if (!err) setMessage('ログイン成功');
    }
  }, [isSignUp, email, password, signUp, signIn]);

  const handleGoogleSignIn = useCallback(async () => {
    setMessage('');
    await signInWithGoogle();
  }, [signInWithGoogle]);

  const toggleMode = useCallback(() => {
    setIsSignUp((prev) => !prev);
    setMessage('');
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.title}>{isSignUp ? '新規登録' : 'ログイン'}</Text>

          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            placeholderTextColor={colors.gray[400]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="パスワード"
            placeholderTextColor={colors.gray[400]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Pressable
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>{isSignUp ? '新規登録' : 'ログイン'}</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>または</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
            <Text style={styles.googleText}>Googleでログイン</Text>
          </Pressable>

          <View style={styles.links}>
            <Pressable onPress={toggleMode}>
              <Text style={styles.linkText}>
                {isSignUp ? 'アカウントをお持ちの方はこちら' : '新規登録はこちら'}
              </Text>
            </Pressable>

            {!isSignUp && (
              <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.linkText}>パスワードを忘れた場合</Text>
              </Pressable>
            )}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {message && <Text style={styles.successText}>{message}</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: spacing.sm,
    color: colors.gray[900],
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  submitButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
  },
  googleButton: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  googleText: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.gray[700],
  },
  links: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkText: {
    fontSize: fontSize.sm,
    color: colors.secondary,
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
