import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

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

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('already been registered') ||
        error.message.includes('already exists') ||
        error.message.includes('already confirmed') ||
        error.message.includes('User already registered') ||
        error.message.includes('already signed up')
      ) {
        setError('このメールアドレスは既に登録されています。');
      } else if (error.message.includes('password')) {
        setError('パスワードは6文字以上で入力してください。');
      } else if (error.message.includes('email')) {
        setError('有効なメールアドレスを入力してください。');
      } else {
        setError(error.message);
      }
    }

    return error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else if (error.message.includes('Email not confirmed')) {
        setError('メールアドレスの確認が完了していません。確認メールを確認してください。');
      } else {
        setError(error.message);
      }
    }
    return error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: 'parentseed' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return error;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type === 'success') {
          const url = result.url;
          // Extract tokens from URL fragment
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
    } catch (err) {
      setError('Googleログインに失敗しました。');
      setLoading(false);
      return { message: 'Googleログインに失敗しました。' };
    }
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) setError(error.message);
    return error;
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) setError(error.message);
    return error;
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      setError('ユーザーがログインしていません。');
      return { message: 'ユーザーがログインしていません。' };
    }

    setLoading(true);
    setError(null);

    try {
      // Delete user entries
      const { error: dataError } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', user.id);

      if (dataError) {
        console.error('データ削除エラー:', dataError);
      }

      // Delete push tokens
      await supabase.from('push_tokens').delete().eq('user_id', user.id);

      // Flag user as deleted
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          deleted: true,
          deleted_at: new Date().toISOString(),
        },
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        setLoading(false);
        return error;
      }
      setLoading(false);
      return null;
    } catch {
      setError('ログアウト中にエラーが発生しました。');
      setLoading(false);
      return { message: 'ログアウト中にエラーが発生しました。' };
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
