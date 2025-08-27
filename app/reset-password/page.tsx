"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const { resetPassword, loading } = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URLパラメータからトークンを確認
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    
    if (accessToken && refreshToken) {
      setIsValidToken(true);
    } else {
      setError("無効なリセットリンクです。");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (newPassword.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    const err = await resetPassword(newPassword);
    if (err) {
      setError(err.message);
    } else {
      setMessage("パスワードが正常に更新されました。ログインページにリダイレクトします。");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">パスワードリセット</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => router.push("/")}
            className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-base font-medium"
          >
            ログインページに戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">新しいパスワードを設定</h2>
        <Input
          type="password"
          placeholder="新しいパスワード"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="h-12 text-base"
        />
        <Input
          type="password"
          placeholder="新しいパスワード（確認）"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="h-12 text-base"
        />
        <Button type="submit" className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-base font-medium" disabled={loading}>
          {loading ? "処理中..." : "パスワードを更新"}
        </Button>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {message && <div className="text-green-600 text-sm text-center">{message}</div>}
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">読み込み中...</h2>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
