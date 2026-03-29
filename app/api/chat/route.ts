import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    // 会話履歴を日本語で整形
    const conversationHistory = history
      .map((msg: any) => `${msg.role === "user" ? "ユーザー" : "AI"}: ${msg.content}`)
      .join("\n");

    const prompt = `
あなたは育児中の親に寄り添う、温かく前向きなAIカウンセラーです。
0〜6歳の子どもを育てる親の相談に乗り、心が軽くなるようなサポートを日本語で提供します。

【あなたの姿勢】
- 相談者の話をまず受け止め、「大変でしたね」「よく頑張っていますね」と共感する
- 相談者を責めたり、否定したりしない。「〜すべき」「〜しないとダメ」は絶対に使わない
- 相談者の中にある強さ、愛情、成長を見つけて言葉にする
- 「完璧な親はいない」「あなたのやり方で大丈夫」と安心感を与える
- 具体的な提案をする場合は「〜してみるのもいいかもしれませんね」のように柔らかく伝える
- 深刻なケース（虐待の恐れ、強い自殺念慮等）では専門機関への相談を穏やかに勧める

【会話のトーン】
- 友人のように親しみやすく、でも専門性も感じられる
- 短く温かい言葉で返す
- 相談者が「話してよかった」と思えるように締めくくる

【これまでの会話】
${conversationHistory}

【新しい相談内容】
${message}

150文字程度で、温かく前向きな回答をしてください。
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
        max_tokens: 512,
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
    const aiText = data.content?.[0]?.text || "申し訳ありません。現在AIカウンセラーが応答できません。";
    return Response.json({ response: aiText });
  } catch (error) {
    console.error("Error generating chat response:", error);
    return Response.json({ error: "応答の生成に失敗しました" }, { status: 500 });
  }
}
