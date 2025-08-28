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

  // アカウント削除
  const deleteAccount = useCallback(async () => {
    if (!user) {
      setError("ユーザーがログインしていません。");
      return { message: "ユーザーがログインしていません。" };
    }

    console.log('User info:', { id: user.id, email: user.email });
    setLoading(true);
    setError(null);

    try {
      // 現在のセッションからアクセストークンを取得（複数の方法を試行）
      let session = null;
      let sessionError = null;

      // 方法1: getSession()を試行
      const sessionResult = await supabase.auth.getSession();
      session = sessionResult.data.session;
      sessionError = sessionResult.error;

      // 方法2: セッションが取得できない場合は、現在のユーザーからセッションを再取得
      if (!session && user) {
        console.log('Trying to refresh session...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        session = refreshedSession;
        sessionError = refreshError;
      }

      // 方法3: ユーザーが存在するがセッションがない場合、強制的にセッションを取得
      if (!session && user) {
        console.log('User exists but no session, trying to get current session...');
        const { data: { session: currentSession }, error: currentError } = await supabase.auth.getSession();
        session = currentSession;
        sessionError = currentError;
      }

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

      console.log('Access token found, proceeding with account deletion');
      console.log('Token length:', session.access_token.length);
      console.log('Token preview:', session.access_token.substring(0, 20) + '...');

      // APIエンドポイントを使用してアカウント削除を実行
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();

      if (response.ok) {
        // 成功した場合はログアウト
        await supabase.auth.signOut();
        setLoading(false);
        return null;
      } else {
        setError(data.error || "アカウントの削除に失敗しました。");
        setLoading(false);
        return { message: data.error || "アカウントの削除に失敗しました。" };
      }
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