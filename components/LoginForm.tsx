"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import Link from "next/link";

export default function LoginForm() {
  const { signIn, signUp, loading, error } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  // メールアドレスの重複チェック
  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok && data.exists) {
        setEmailError("このメールアドレスは既に登録されています。");
      } else {
        setEmailError("");
      }
    } catch (error) {
      console.error('Email check error:', error);
    }
  };

  // メールアドレスが変更された時の処理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isSignUp && email) {
        checkEmailExists(email);
      } else {
        setEmailError("");
      }
    }, 500); // 500ms遅延

    return () => clearTimeout(timeoutId);
  }, [email, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setEmailError("");
    
    if (isSignUp) {
      // 新規登録時は重複チェックを再度実行
      const emailExists = await checkEmailExists(email);
      if (emailError) {
        return; // エラーがある場合は送信しない
      }
      
      const err = await signUp(email, password);
      if (!err) setMessage("確認メールを送信しました。メールを確認してください。");
    } else {
      const err = await signIn(email, password);
      if (!err) setMessage("ログイン成功");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">{isSignUp ? "新規登録" : "ログイン"}</h2>
        <div>
          <Input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={`h-12 text-base ${emailError ? 'border-red-500' : ''}`}
          />
          {emailError && <div className="text-red-500 text-sm mt-1">{emailError}</div>}
        </div>
        <Input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="h-12 text-base"
        />
        <Button 
          type="submit" 
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-base font-medium" 
          disabled={loading || (isSignUp && !!emailError)}
        >
          {loading ? "処理中..." : isSignUp ? "新規登録" : "ログイン"}
        </Button>
        
        <div className="space-y-2 text-center">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm block"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setEmailError("");
              setMessage("");
            }}
          >
            {isSignUp ? "アカウントをお持ちの方はこちら" : "新規登録はこちら"}
          </button>
          
          {!isSignUp && (
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline text-sm block"
            >
              パスワードを忘れた場合
            </Link>
          )}
        </div>
        
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {message && <div className="text-green-600 text-sm text-center">{message}</div>}
      </form>
    </div>
  );
} 