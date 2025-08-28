const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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

async function checkUsers() {
  try {
    console.log('ユーザー状況を確認中...');

    // 1. すべてのユーザーを取得
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('ユーザー一覧の取得に失敗:', listError);
      return;
    }

    console.log(`\n=== ユーザー一覧 (${users.users.length}人) ===`);
    
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   メール: ${user.email}`);
      console.log(`   作成日: ${user.created_at}`);
      console.log(`   最終更新: ${user.updated_at}`);
      console.log(`   確認済み: ${user.email_confirmed_at ? 'はい' : 'いいえ'}`);
      console.log(`   削除済み: ${user.deleted_at ? 'はい' : 'いいえ'}`);
      console.log(`   無効: ${user.banned_until ? 'はい' : 'いいえ'}`);
      console.log('');
    });

    // 2. entriesテーブルの状況を確認
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('*');

    if (entriesError) {
      console.error('entriesテーブルの取得に失敗:', entriesError);
    } else {
      console.log(`\n=== entriesテーブル (${entries.length}件) ===`);
      entries.forEach((entry, index) => {
        console.log(`${index + 1}. ID: ${entry.id}, User ID: ${entry.user_id}`);
      });
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトを実行
checkUsers();
