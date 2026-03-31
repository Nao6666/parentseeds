import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, AuthError } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

/** Translate Supabase auth error messages to user-friendly Japanese. */
function translateAuthError(error: AuthError): string {
  const msg = error.message;

  // Sign-up errors
  if (/already (registered|exists|confirmed|signed up)/.test(msg)) {
    return 'このメールアドレスは既に登録されています。';
  }
  if (/password/i.test(msg)) {
    return 'パスワードは6文字以上で入力してください。';
  }
  if (/email/i.test(msg) && !/confirmed/i.test(msg)) {
    return '有効なメールアドレスを入力してください。';
  }

  // Sign-in errors
  if (msg.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。';
  }
  if (msg.includes('Email not confirmed')) {
    return 'メールアドレスの確認が完了していません。確認メールを確認してください。';
  }

  return msg;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (authError) setError(translateAuthError(authError));
    return authError;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) setError(translateAuthError(authError));
    return authError;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: 'parentseed' });
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
        return oauthError;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type === 'success') {
          const { url } = result;
          const hashParams = url.includes('#')
            ? new URLSearchParams(url.split('#')[1])
            : new URLSearchParams(new URL(url).search);

          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      }

      setLoading(false);
      return null;
    } catch {
      setError('Googleログインに失敗しました。');
      setLoading(false);
      return { message: 'Googleログインに失敗しました。' } as AuthError;
    }
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (authError) setError(authError.message);
    return authError;
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (authError) setError(authError.message);
    return authError;
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      setError('ユーザーがログインしていません。');
      return { message: 'ユーザーがログインしていません。' };
    }

    setLoading(true);
    setError(null);

    try {
      // Delete user data in parallel where possible
      const [entriesResult, , chatResult] = await Promise.allSettled([
        supabase.from('entries').delete().eq('user_id', user.id),
        supabase.from('push_tokens').delete().eq('user_id', user.id),
        supabase.from('chat_messages').delete().eq('user_id', user.id),
      ]);

      if (entriesResult.status === 'rejected') {
        console.warn('Failed to delete entries:', entriesResult.reason);
      }
      if (chatResult.status === 'rejected') {
        console.warn('Failed to delete chat messages:', chatResult.reason);
      }

      // Delete uploaded images
      const { data: imageList } = await supabase.storage
        .from('entry-images')
        .list(user.id);
      if (imageList && imageList.length > 0) {
        const filePaths = imageList.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from('entry-images').remove(filePaths);
      }

      // Flag user as deleted
      const { error: updateError } = await supabase.auth.updateUser({
        data: { deleted: true, deleted_at: new Date().toISOString() },
      });

      if (updateError) {
        setError('アカウントの削除に失敗しました。');
        setLoading(false);
        return { message: 'アカウントの削除に失敗しました。' };
      }

      await supabase.auth.signOut();
      setLoading(false);
      return null;
    } catch {
      setError('アカウントの削除中にエラーが発生しました。');
      setLoading(false);
      return { message: 'アカウントの削除中にエラーが発生しました。' };
    }
  }, [user]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) {
        setError(authError.message);
        return authError;
      }
      return null;
    } catch {
      setError('ログアウト中にエラーが発生しました。');
      return { message: 'ログアウト中にエラーが発生しました。' } as AuthError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    resetPasswordForEmail,
    resetPassword,
    deleteAccount,
    signOut,
  };
}
