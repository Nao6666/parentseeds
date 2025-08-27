import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "メールアドレスが必要です" }, { status: 400 });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ 
      message: "パスワードリセットメールを送信しました。メールを確認してください。" 
    });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return Response.json({ error: "パスワードリセットメールの送信に失敗しました" }, { status: 500 });
  }
}
