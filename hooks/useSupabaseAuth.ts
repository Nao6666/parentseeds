import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
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
    
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    
    if (error) {
      // Supabaseのエラーメッセージを日本語化
      if (error.message.includes("already registered") || 
          error.message.includes("already been registered") ||
          error.message.includes("already exists")) {
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
      redirectTo: `${window.location.origin}/reset-password`,
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

  // アカウント削除
  const deleteAccount = useCallback(async () => {
    if (!user) {
      setError("ユーザーがログインしていません。");
      return { message: "ユーザーがログインしていません。" };
    }

    setLoading(true);
    setError(null);

    try {
      // ユーザーのデータを削除（entriesテーブルなど）
      const { error: dataError } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', user.id);

      if (dataError) {
        console.error('データ削除エラー:', dataError);
      }

      // アカウントを削除
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        // 管理者権限がない場合は、ユーザー自身で削除を試行
        const { error: userDeleteError } = await supabase.auth.updateUser({
          data: { deleted: true }
        });
        
        if (userDeleteError) {
          setError("アカウントの削除に失敗しました。");
          setLoading(false);
          return userDeleteError;
        }
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
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) setError(error.message);
    return error;
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