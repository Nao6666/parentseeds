"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || "エラーが発生しました");
      }
    } catch (err) {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">パスワードを忘れた場合</h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          登録済みのメールアドレスを入力してください。<br />
          パスワードリセット用のリンクを送信します。
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="h-12 text-base"
          />
          <Button type="submit" className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-base font-medium" disabled={loading}>
            {loading ? "送信中..." : "リセットメールを送信"}
          </Button>
        </form>

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {message && <div className="text-green-600 text-sm text-center">{message}</div>}

        <div className="text-center">
          <Link 
            href="/" 
            className="text-blue-600 hover:underline text-sm"
          >
            ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
