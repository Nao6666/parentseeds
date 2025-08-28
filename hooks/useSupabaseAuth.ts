import { useState, useEffect, useCallback } from 'react';
import { supabase, appUrl } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初回マウント時にユーザー取得
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    // リアルタイムで認証状態を監視
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);



  // サインアップ
  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`
      }
    });
    setLoading(false);
    
    if (error) {
      
      // Supabaseのエラーメッセージを日本語化
      if (error.message.includes("already registered") || 
          error.message.includes("already been registered") ||
          error.message.includes("already exists") ||
          error.message.includes("already confirmed") ||
          error.message.includes("User already registered") ||
          error.message.includes("already signed up")) {
        setError("このメールアドレスは既に登録されています。");
      } else if (error.message.includes("password")) {
        setError("パスワードは6文字以上で入力してください。");
      } else if (error.message.includes("email")) {
        setError("有効なメールアドレスを入力してください。");
            } else {
        setError(error.message);
      }
    }

    return error;
  }, []);

  // ログイン
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      // ログインエラーメッセージを日本語化
      if (error.message.includes("Invalid login credentials")) {
        setError("メールアドレスまたはパスワードが正しくありません。");
      } else if (error.message.includes("Email not confirmed")) {
        setError("メールアドレスの確認が完了していません。確認メールを確認してください。");
      } else {
        setError(error.message);
      }
    }
    return error;
  }, []);

  // Googleログイン
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) setError(error.message);
    return error;
  }, []);

  // パスワードリセットメール送信
  const resetPasswordForEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    return error;
  }, []);

  // パスワードリセット
  const resetPassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) setError(error.message);
    return error;
  }, []);

  // アカウント削除（簡素化版）
  const deleteAccount = useCallback(async () => {
    if (!user) {
      setError("ユーザーがログインしていません。");
      return { message: "ユーザーがログインしていません。" };
    }

    setLoading(true);
    setError(null);

    try {
      // ユーザーのデータを削除
      const { error: dataError } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', user.id);

      if (dataError) {
        console.error('データ削除エラー:', dataError);
      }

      // ユーザーを無効化（メタデータに削除フラグを設定）
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          deleted: true,
          deleted_at: new Date().toISOString()
        }
      });

      if (updateError) {
        setError("アカウントの削除に失敗しました。");
        setLoading(false);
        return { message: "アカウントの削除に失敗しました。" };
      }

      // ログアウト
      await supabase.auth.signOut();
      setLoading(false);
      return null;
      
    } catch (error) {
      setError("アカウントの削除中にエラーが発生しました。");
      setLoading(false);
      return { message: "アカウントの削除中にエラーが発生しました。" };
    }
  }, [user]);

  // ログアウト
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
    } catch (error) {
      setError("ログアウト中にエラーが発生しました。");
      setLoading(false);
      return { message: "ログアウト中にエラーが発生しました。" };
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