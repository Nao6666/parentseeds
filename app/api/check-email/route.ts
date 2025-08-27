import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "メールアドレスが必要です" }, { status: 400 });
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
    }

    // 既存のユーザーをチェック（auth.usersテーブルを直接クエリ）
    const { data: users, error } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('Email check error:', error);
      // エラーが発生した場合は、signUpを試行してエラーメッセージを確認
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password: 'temporary_password_for_check' 
      });
      
      if (signUpError && signUpError.message.includes('already')) {
        return Response.json({ exists: true, message: "このメールアドレスは既に登録されています" });
      }
      
      return Response.json({ exists: false });
    }

    const exists = users && users.length > 0;
    
    return Response.json({ 
      exists,
      message: exists ? "このメールアドレスは既に登録されています" : "このメールアドレスは使用可能です"
    });
  } catch (error) {
    console.error("Error checking email:", error);
    return Response.json({ error: "メールアドレスの確認中にエラーが発生しました" }, { status: 500 });
  }
}
