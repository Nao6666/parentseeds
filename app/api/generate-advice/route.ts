import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { emotions, content } = await request.json()

    const prompt = `
あなたは育児専門のAIカウンセラーです。新米親の感情に寄り添い、温かく具体的なアドバイスを提供してください。

感情: ${emotions.join(", ")}
内容: ${content}

以下の点を考慮してアドバイスを作成してください：
- 感情を否定せず、受け入れる姿勢を示す
- 具体的で実践可能なアドバイスを含める
- 育児の大変さを理解していることを示す
- 希望や励ましの要素を含める
- 150文字以内で簡潔にまとめる

アドバイス:
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    return Response.json({ advice: text })
  } catch (error) {
    console.error("Error generating advice:", error)
    return Response.json({ error: "アドバイスの生成に失敗しました" }, { status: 500 })
  }
}
