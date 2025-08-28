"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import Link from "next/link";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { deleteAccount, user } = useSupabaseAuth();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirmText !== "削除") {
      setError("「削除」と入力してください");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await deleteAccount();
      
      if (!result) {
        // 成功
        setMessage("アカウントが正常に削除されました。ログインページにリダイレクトします。");
        // 即座にリダイレクト（ログアウトは不要）
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        // エラー
        setError(result.message || "アカウントの削除に失敗しました");
      }
    } catch (err) {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">アカウント削除にはログインが必要です。</p>
          <Link href="/">
            <Button className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-base font-medium">
              ログインページに戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">アカウント削除</h2>
          <p className="text-gray-600 text-sm">
            この操作は取り消すことができません。すべてのデータが永久に削除されます。
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 mb-2">削除されるデータ</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• すべての感情記録</li>
                <li>• アカウント情報</li>
                <li>• 設定データ</li>
                <li>• その他すべての関連データ</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">
            確認のため「削除」と入力してください
          </label>
          <Input
            type="text"
            placeholder="削除"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="h-12 text-base border-red-200 focus:border-red-500"
          />
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleDeleteAccount}
            disabled={confirmText !== "削除" || loading}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-base font-medium"
          >
            {loading ? "削除中..." : "アカウントを削除"}
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
            >
              キャンセル
            </Button>
          </Link>
        </div>

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {message && <div className="text-green-600 text-sm text-center">{message}</div>}
      </div>
    </div>
  );
}
