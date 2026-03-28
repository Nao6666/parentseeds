// プルチックの感情の輪（Plutchik's Wheel of Emotions）に基づく8つの基本感情
export const emotions = [
  '喜び',     // Joy
  '信頼',     // Trust
  '恐れ',     // Fear
  '驚き',     // Surprise
  '悲しみ',   // Sadness
  '嫌悪',     // Disgust
  '怒り',     // Anger
  '期待',     // Anticipation
] as const;

export type EmotionType = (typeof emotions)[number];

// Chart colors (hex) - プルチックの感情の輪に準拠した配色
export const emotionChartColors: Record<string, string> = {
  喜び: '#fbbf24',     // 黄色
  信頼: '#34d399',     // 緑
  恐れ: '#60a5fa',     // 薄緑→青
  驚き: '#38bdf8',     // 水色
  悲しみ: '#6366f1',   // 青紫
  嫌悪: '#a78bfa',     // 紫
  怒り: '#ef4444',     // 赤
  期待: '#fb923c',     // オレンジ
};

// Unselected state colors
export const emotionColors: Record<string, { bg: string; text: string; border: string }> = {
  喜び:   { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  信頼:   { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  恐れ:   { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  驚き:   { bg: '#e0f2fe', text: '#075985', border: '#bae6fd' },
  悲しみ: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
  嫌悪:   { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  怒り:   { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  期待:   { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
};

// Selected state colors
export const emotionColorsSelected: Record<string, { bg: string; text: string; border: string }> = {
  喜び:   { bg: '#f59e0b', text: '#ffffff', border: '#d97706' },
  信頼:   { bg: '#10b981', text: '#ffffff', border: '#059669' },
  恐れ:   { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' },
  驚き:   { bg: '#0ea5e9', text: '#ffffff', border: '#0284c7' },
  悲しみ: { bg: '#6366f1', text: '#ffffff', border: '#4f46e5' },
  嫌悪:   { bg: '#8b5cf6', text: '#ffffff', border: '#7c3aed' },
  怒り:   { bg: '#ef4444', text: '#ffffff', border: '#dc2626' },
  期待:   { bg: '#f97316', text: '#ffffff', border: '#ea580c' },
};

// ポジティブ感情（ストレス計算用）
export const positiveEmotions: string[] = ['喜び', '信頼', '期待'];
export const negativeEmotions: string[] = ['恐れ', '悲しみ', '嫌悪', '怒り'];
// 驚きは中立

// Fallback advice when AI is unavailable
export const fallbackAdvice: Record<string, string> = {
  喜び: 'この喜びの瞬間を心に刻んでください。困難な時の支えになります。',
  信頼: '信頼関係を築けていることは素晴らしいです。その絆を大切にしてください。',
  恐れ: '不安や恐れを感じるのは自然なことです。深呼吸をして、一歩ずつ進んでいきましょう。',
  驚き: '新しい発見があったのですね。子どもの成長は驚きの連続です。',
  悲しみ: '悲しい気持ちを抱えるのはつらいですね。無理せず、自分を労わってください。',
  嫌悪: 'ネガティブな感情も大切なサインです。自分の気持ちに正直でいることが大切です。',
  怒り: '怒りを感じた時は、まず5秒数えてから行動してみてください。感情をコントロールできている証拠です。',
  期待: 'ワクワクする気持ちは前向きなエネルギーの源です。その期待を楽しんでください。',
};

export const DEFAULT_FALLBACK_ADVICE = '今日も育児お疲れさまでした。あなたの努力は必ず子どもに伝わっています。';
