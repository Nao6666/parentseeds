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

async function forceDeleteUsers() {
  try {
    console.log('強制ユーザー削除を開始します...');

    // 1. すべてのユーザーを取得
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('ユーザー一覧の取得に失敗:', listError);
      return;
    }

    console.log(`${users.users.length}人のユーザーが見つかりました`);

    // 2. 各ユーザーを強制削除
    for (const user of users.users) {
      console.log(`ユーザー ${user.email} (${user.id}) を強制削除中...`);
      
      try {
        // まず関連データを削除
        const { error: dataError } = await supabase
          .from('entries')
          .delete()
          .eq('user_id', user.id);

        if (dataError) {
          console.error(`データ削除エラー (${user.email}):`, dataError);
        }

        // ユーザーを強制削除
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`ユーザー削除エラー (${user.email}):`, deleteError);
          
          // 削除に失敗した場合、ユーザーを無効化
          console.log(`ユーザー ${user.email} を無効化中...`);
          const { error: banError } = await supabase.auth.admin.updateUserById(user.id, {
            ban_duration: '100000h' // 約11年間の無効化
          });
          
          if (banError) {
            console.error(`ユーザー無効化エラー (${user.email}):`, banError);
          } else {
            console.log(`ユーザー ${user.email} を無効化しました`);
          }
        } else {
          console.log(`ユーザー ${user.email} を削除しました`);
        }
      } catch (error) {
        console.error(`ユーザー ${user.email} の処理中にエラー:`, error);
      }
    }

    // 3. 削除後の確認
    console.log('\n削除後の確認中...');
    const { data: remainingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('削除後の確認に失敗:', checkError);
    } else {
      console.log(`残りのユーザー数: ${remainingUsers.users.length}`);
      if (remainingUsers.users.length > 0) {
        console.log('残っているユーザー:');
        remainingUsers.users.forEach(user => {
          console.log(`- ${user.email} (${user.id})`);
        });
      }
    }

    console.log('強制ユーザー削除が完了しました');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトを実行
forceDeleteUsers();
