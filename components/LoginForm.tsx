"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function LoginForm() {
  const { signIn, signUp, loading, error } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (isSignUp) {
      const err = await signUp(email, password);
      if (!err) setMessage("確認メールを送信しました。メールを確認してください。");
    } else {
      const err = await signIn(email, password);
      if (!err) setMessage("ログイン成功");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center mb-2">{isSignUp ? "新規登録" : "ログイン"}</h2>
        <Input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full h-12 bg-pink-500 hover:bg-pink-600" disabled={loading}>
          {loading ? "処理中..." : isSignUp ? "新規登録" : "ログイン"}
        </Button>
        <div className="text-center">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "アカウントをお持ちの方はこちら" : "新規登録はこちら"}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {message && <div className="text-green-600 text-sm text-center">{message}</div>}
      </form>
    </div>
  );
} 