import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { emotions, content } = await request.json();

    const prompt = `
あなたは育児やコーチングのプロフェッショナルです。新米親の感情に寄り添い、温かく具体的なアドバイスを提供してください。

感情: ${emotions.join(", ")}
内容: ${content}

以下の点を考慮してアドバイスを作成してください：
- 感情を否定せず、受け入れる姿勢を示す
- 具体的で実践可能なアドバイスを含める
- 育児の大変さを理解していることを示す
- 希望や励ましの要素を含める
- 50文字以内で簡潔にまとめる

アドバイス:
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
