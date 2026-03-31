import { NextRequest } from "next/server";
import { callAnthropic } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const { emotions, content } = await request.json();

    if (!emotions?.length || !content) {
      return Response.json(
        { error: "感情と内容が必要です" },
        { status: 400 },
      );
    }

    const prompt = `
あなたは育児中の親を応援する温かいサポーターです。
投稿者が「記録してよかった」「自分は頑張っている」と感じられるような、前向きで勇気づけられるメッセージを届けてください。

【投稿者の感情】${(emotions as string[]).join("、")}
【投稿者の記録】${content}

【メッセージ作成のルール】
- まず投稿者の気持ちや行動を「すごい」「素敵」「立派」など肯定的な言葉で認める
- 投稿者の強みや成長ポイントを見つけて伝える
- 「〜しましょう」「〜すべき」のような指示的な表現は避ける
- 「あなたは十分頑張っている」という安心感を伝える
- ネガティブな感情があっても、それを感じること自体が愛情の証であると伝える
- 絵文字は使わない
- 100文字以内で簡潔にまとめる

メッセージ:
`;

    const advice = await callAnthropic({ prompt, maxTokens: 256 });
    return Response.json({
      advice: advice || "アドバイスの生成に失敗しました",
    });
  } catch (error) {
    console.error("Advice API error:", error);
    return Response.json(
      { error: "アドバイスの生成に失敗しました" },
      { status: 500 },
    );
  }
}
