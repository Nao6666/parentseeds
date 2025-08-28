const { createClient } = require('@supabase/supabase-js');

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteAllUsers() {
  try {
    console.log('ユーザー削除を開始します...');

    // 1. すべてのユーザーを取得
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('ユーザー一覧の取得に失敗:', listError);
      return;
    }

    console.log(`${users.users.length}人のユーザーが見つかりました`);

    // 2. 各ユーザーの関連データを削除
    for (const user of users.users) {
      console.log(`ユーザー ${user.email} (${user.id}) のデータを削除中...`);
      
      // entriesテーブルから削除
      const { error: dataError } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', user.id);

      if (dataError) {
        console.error(`データ削除エラー (${user.email}):`, dataError);
      }

      // ユーザーを削除
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error(`ユーザー削除エラー (${user.email}):`, deleteError);
      } else {
        console.log(`ユーザー ${user.email} を削除しました`);
      }
    }

    console.log('すべてのユーザー削除が完了しました');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトを実行
deleteAllUsers();
