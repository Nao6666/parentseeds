import { createClient, SupabaseClient } from '@supabase/supabase-js';

// アプリケーションのURLを取得（開発環境ではlocalhost:3000、本番環境では実際のドメイン）
export const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token'
    }
  });

  // 接続テスト（クライアントサイドのみ）
  if (typeof window !== 'undefined') {
    _supabase.auth.getSession().then(({ error }) => {
      if (error?.message.includes('Auth session missing')) {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }
    });
  }

  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as Record<string | symbol, unknown>)[prop];
  },
});
