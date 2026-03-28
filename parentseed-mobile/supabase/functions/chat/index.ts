import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '認証が必要です' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: '認証に失敗しました' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, history } = await req.json();

    const conversationHistory = history
      .map((msg: { role: string; content: string }) =>
        `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
      )
      .join('\n');

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
回答に関しては、50文字程度に簡潔にまとめてください。
`;

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey!,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiText = data.content?.[0]?.text || '申し訳ありません。現在AIカウンセラーが応答できません。';

    return new Response(JSON.stringify({ response: aiText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating chat response:', error);
    return new Response(JSON.stringify({ error: '応答の生成に失敗しました' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
