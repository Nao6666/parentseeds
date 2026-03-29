import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { emotions, content } = await request.json();

    const prompt = `
あなたは育児中の親を応援する温かいサポーターです。
投稿者が「記録してよかった」「自分は頑張っている」と感じられるような、前向きで勇気づけられるメッセージを届けてください。

【投稿者の感情】${emotions.join("、")}
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

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey!,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 256,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), { status: 500 });
    }

    const data = await response.json();
    const advice = data.content?.[0]?.text || "アドバイスの生成に失敗しました";
    return Response.json({ advice });
  } catch (error) {
    console.error("Error generating advice:", error);
    return Response.json({ error: "アドバイスの生成に失敗しました" }, { status: 500 });
  }
}
