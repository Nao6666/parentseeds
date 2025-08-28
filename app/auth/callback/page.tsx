'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('認証を処理中...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLからセッション情報を取得
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setMessage('認証エラーが発生しました。');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        if (data.session) {
          setMessage('認証が完了しました！リダイレクト中...');
          // 認証成功後、ホームページにリダイレクト
          setTimeout(() => router.push('/'), 2000);
        } else {
          setMessage('セッションが見つかりません。');
          setTimeout(() => router.push('/'), 3000);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setMessage('予期しないエラーが発生しました。');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            認証処理中
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
