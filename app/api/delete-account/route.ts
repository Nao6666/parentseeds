import { NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアントを作成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function DELETE(request: NextRequest) {
  try {
    console.log('Delete account API called');
    console.log('Environment check starting...');
    
    // 環境変数のチェック
    console.log('Environment variables check:');
    console.log('- Supabase URL configured:', !!supabaseUrl);
    console.log('- Service role key configured:', !!supabaseServiceKey);
    console.log('- Supabase URL length:', supabaseUrl?.length || 0);
    console.log('- Service role key length:', supabaseServiceKey?.length || 0);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables:');
      console.error('- Supabase URL missing:', !supabaseUrl);
      console.error('- Service role key missing:', !supabaseServiceKey);
      return Response.json({ error: "サーバー設定エラー" }, { status: 500 });
    }
    
    // Authorization headerからトークンを取得
    let token = null;
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log('Token from header, length:', token.length);
    } else {
      console.log('No auth header provided');
      return Response.json({ error: "認証トークンが必要です" }, { status: 401 });
    }
    
    if (!token) {
      console.error('No token found in header or cookies');
      return Response.json({ error: "認証トークンが必要です" }, { status: 401 });
    }
    
    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError) {
      console.error('Auth error:', authError);
      return Response.json({ error: `認証エラー: ${authError.message}` }, { status: 401 });
    }
    
    if (!user) {
      console.error('No user found from token');
      return Response.json({ error: "ユーザーが見つかりません" }, { status: 401 });
    }
    
    console.log('User authenticated:', user.id);

    // ユーザーのデータを削除（entriesテーブルなど）
    const { error: dataError } = await supabaseAdmin
      .from('entries')
      .delete()
      .eq('user_id', user.id);

    if (dataError) {
      console.error('データ削除エラー:', dataError);
      // データ削除エラーがあっても続行（アカウント削除は実行）
    }

    // 管理者権限でアカウントを削除
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('アカウント削除エラー:', deleteError);
      return Response.json({ error: "アカウントの削除に失敗しました" }, { status: 500 });
    }

    return Response.json({ 
      message: "アカウントが正常に削除されました" 
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return Response.json({ error: "アカウントの削除中にエラーが発生しました" }, { status: 500 });
  }
}
