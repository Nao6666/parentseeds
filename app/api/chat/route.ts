import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    const conversationHistory = history
      .map((msg: any) => `${msg.role === "user" ? "ユーザー" : "AI"}: ${msg.content}`)
      .join("\n")

    const prompt = `
あなたは育児専門のAIカウンセラーです。0〜3歳の子どもを育てる新米親の相談に乗り、感情的なサポートを提供します。

以下の特徴を持って対応してください：
- 共感的で温かい口調
- 判断せず、受け入れる姿勢
- 具体的で実践可能なアドバイス
- 育児の大変さを理解していることを示す
- 必要に応じて専門家への相談を勧める
- 危険な状況では適切な機関への連絡を促す

過去の会話:
${conversationHistory}

新しいメッセージ: ${message}

親身になって、具体的で役立つ回答をしてください。
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.8,
    })

    return Response.json({ response: text })
  } catch (error) {
    console.error("Error generating chat response:", error)
    return Response.json({ error: "応答の生成に失敗しました" }, { status: 500 })
  }
}
