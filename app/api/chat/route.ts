import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    // 会話履歴を日本語で整形
    const conversationHistory = history
      .map((msg: any) => `${msg.role === "user" ? "ユーザー" : "AI"}: ${msg.content}`)
      .join("\n");

    const prompt = `
あなたは育児専門のAIカウンセラーです。0〜3歳の子どもを育てる新米親の相談に乗り、感情的なサポートを日本語で提供します。

【会話の特徴】
- 共感的で温かい口調
- 判断せず、受け入れる姿勢
- 具体的で実践可能なアドバイス
- 感情をコントロールするためのコーチングを行ってください
- 育児の大変さを理解していることを示す
- 必要に応じて専門家への相談を勧める
- 危険な状況では適切な機関への連絡を促す

【これまでの会話】
${conversationHistory}

【新しい相談内容】
${message}

親身になって、具体的で役立つ回答をしてください。
回答に関しては、100文字程度に簡潔にまとめてください。
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
