import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// アプリケーションのURLを取得（開発環境ではlocalhost:3000、本番環境では実際のドメイン）
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set');
console.log('App URL:', appUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token'
  }
});

// アプリケーションURLをエクスポート
export { appUrl };

// 接続テスト
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
    // セッションエラーの場合、ローカルストレージをクリア
    if (typeof window !== 'undefined' && error.message.includes('Auth session missing')) {
      console.log('Clearing corrupted session data...');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    }
  } else {
    console.log('Supabase connected successfully');
  }
}); 