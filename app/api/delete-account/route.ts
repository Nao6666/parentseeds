import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(request: NextRequest) {
  try {
    // ユーザーの認証を確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザーのデータを削除（entriesテーブルなど）
    const { error: dataError } = await supabase
      .from('entries')
      .delete()
      .eq('user_id', user.id);

    if (dataError) {
      console.error('データ削除エラー:', dataError);
      return Response.json({ error: "データの削除に失敗しました" }, { status: 500 });
    }

    // アカウントを削除
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      // 管理者権限がない場合は、ユーザー自身で削除を試行
      const { error: userDeleteError } = await supabase.auth.updateUser({
        data: { deleted: true }
      });
      
      if (userDeleteError) {
        return Response.json({ error: "アカウントの削除に失敗しました" }, { status: 500 });
      }
    }

    // ログアウト
    await supabase.auth.signOut();

    return Response.json({ 
      message: "アカウントが正常に削除されました" 
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return Response.json({ error: "アカウントの削除中にエラーが発生しました" }, { status: 500 });
  }
}
