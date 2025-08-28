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

    // Authorization headerからトークンを取得（フォールバック）
    let user = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      console.log('Using token from Authorization header');
      
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }
    
    // トークンがない場合、Cookieからセッションを取得
    if (!user) {
      console.log('Trying to get user from session...');
      const { data: { user: sessionUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User authentication error:', userError);
        return NextResponse.json({
          status: "error",
          message: "認証が必要です。再度ログインしてください。"
        }, { status: 401 });
      }
      
      user = sessionUser;
    }
    
    if (!user) {
      console.error('No user found');
      return NextResponse.json({
        status: "error",
        message: "ユーザーが見つかりません"
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
    console.log('Attempting to delete user:', user.id);
    const { data, error } = await supabase.auth.admin.deleteUser(user.id);
    
    if (error) {
      console.error('アカウント削除エラー:', error);
      
      // エラーの詳細をログ出力
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      return NextResponse.json({
        status: "error",
        message: `アカウントの削除ができませんでした: ${error.message}`
      }, { status: 500 });
    }

    console.log('Account deletion successful');
    
    // 削除成功後にセッションをクリア
    try {
      await supabase.auth.signOut();
      console.log('Session cleared after account deletion');
    } catch (signOutError) {
      console.log('Sign out error (expected after account deletion):', signOutError);
    }
    
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
