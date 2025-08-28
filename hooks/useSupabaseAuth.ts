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

  // メールアドレスの重複チェック（ログインを試行して確認）
  const checkEmailExists = useCallback(async (email: string) => {
    try {
      // ダミーパスワードでログインを試行
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy_password_for_check'
      });
      
      console.log('Email check result:', error?.message);
      
      // エラーメッセージから既存ユーザーかどうかを判断
      if (error) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          // ユーザーは存在するが、パスワードが間違っているか、メール確認が未完了
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  }, []);

  // サインアップ
  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    console.log('Attempting signup with email:', email); // デバッグ用
    
    // まずメールアドレスの重複チェック
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      setLoading(false);
      setError("このメールアドレスは既に登録されています。");
      return { message: "このメールアドレスは既に登録されています。" };
    }
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`
      }
    });
    setLoading(false);
    
    if (error) {
      // デバッグ用：実際のエラーメッセージをログ出力
      console.log('SignUp error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
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
    } else {
      console.log('SignUp successful, no error'); // デバッグ用
    }
    return error;
  }, [checkEmailExists]);

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

  // アカウント削除（一時的に簡素化）
  const deleteAccount = useCallback(async () => {
    if (!user) {
      setError("ユーザーがログインしていません。");
      return { message: "ユーザーがログインしていません。" };
    }

    console.log('User info:', { id: user.id, email: user.email });
    setLoading(true);
    setError(null);

    try {
      // 基本的なセッション確認
      console.log('Checking session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError("セッションの取得に失敗しました。");
        setLoading(false);
        return { message: "セッションの取得に失敗しました。" };
      }

      if (!session?.access_token) {
        console.error('No access token found in session');
        setError("認証トークンが見つかりません。再度ログインしてください。");
        setLoading(false);
        return { message: "認証トークンが見つかりません。再度ログインしてください。" };
      }

      console.log('Session found, token length:', session.access_token.length);

      // 一時的にエラーメッセージを表示（API呼び出しを無効化）
      setError("アカウント削除機能は現在メンテナンス中です。");
      setLoading(false);
      return { message: "アカウント削除機能は現在メンテナンス中です。" };
      
    } catch (error) {
      console.error('Unexpected error:', error);
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
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      console.log('Sign out result:', { error: error?.message });
      
      if (error) {
        console.error('Sign out error:', error);
        setError(error.message);
        setLoading(false);
        return error;
      }
      
      console.log('Sign out successful');
      setLoading(false);
      return null;
    } catch (error) {
      console.error('Unexpected sign out error:', error);
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