import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    console.log('Delete account API called');
    
    const cookieStore = await cookies();
    
    // @supabase/ssrを使用してクライアントを作成
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // リクエストを叩いたユーザーの情報を取得する（Cookieが渡っているので自動で取得される）
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return NextResponse.json({
        status: "error",
        message: "認証が必要です"
      }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // ユーザーのデータを削除（entriesテーブルなど）
    const { error: dataError } = await supabase
      .from('entries')
      .delete()
      .eq('user_id', user.id);

    if (dataError) {
      console.error('データ削除エラー:', dataError);
      // データ削除エラーがあっても続行（アカウント削除は実行）
    }

    // 削除を実行
    const { data, error } = await supabase.auth.admin.deleteUser(user.id);
    
    if (error) {
      console.error('アカウント削除エラー:', error);
      return NextResponse.json({
        status: "error",
        message: "アカウントの削除ができませんでした。"
      }, { status: 500 });
    }

    console.log('Account deletion successful');
    return NextResponse.json({
      status: "success",
      message: "アカウント削除しました。"
    });

  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({
      status: "error",
      message: "アカウントの削除中にエラーが発生しました"
    }, { status: 500 });
  }
}
