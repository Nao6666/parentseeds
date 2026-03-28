export const emotions = ['喜び', '不安', '怒り', '悲しみ', '疲労', '罪悪感', '愛情'] as const;

export type EmotionType = (typeof emotions)[number];

// Chart colors (hex)
export const emotionChartColors: Record<string, string> = {
  喜び: '#fbbf24',
  不安: '#3b82f6',
  怒り: '#ef4444',
  悲しみ: '#6b7280',
  疲労: '#8b5cf6',
  罪悪感: '#f97316',
  愛情: '#ec4899',
};

// Unselected state colors
export const emotionColors: Record<string, { bg: string; text: string; border: string }> = {
  喜び: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  不安: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  怒り: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  悲しみ: { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' },
  疲労: { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  罪悪感: { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
  愛情: { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
};

// Selected state colors
export const emotionColorsSelected: Record<string, { bg: string; text: string; border: string }> = {
  喜び: { bg: '#f59e0b', text: '#ffffff', border: '#d97706' },
  不安: { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' },
  怒り: { bg: '#ef4444', text: '#ffffff', border: '#dc2626' },
  悲しみ: { bg: '#6b7280', text: '#ffffff', border: '#4b5563' },
  疲労: { bg: '#8b5cf6', text: '#ffffff', border: '#7c3aed' },
  罪悪感: { bg: '#f97316', text: '#ffffff', border: '#ea580c' },
  愛情: { bg: '#ec4899', text: '#ffffff', border: '#db2777' },
};

// Lucide icon names for each emotion
export const emotionIconNames: Record<string, string> = {
  喜び: 'Smile',
  不安: 'AlertTriangle',
  怒り: 'Zap',
  悲しみ: 'CloudRain',
  疲労: 'Battery',
  罪悪感: 'X',
  愛情: 'HeartHandshake',
};

// Fallback advice when AI is unavailable
export const fallbackAdvice: Record<string, string> = {
  不安: '不安な気持ちは育児において自然な反応です。深呼吸をして、一歩ずつ進んでいきましょう。',
  怒り: '怒りを感じた時は、まず5秒数えてから行動してみてください。感情をコントロールできている証拠です。',
  疲労: '疲れている時は休息が必要です。可能な時に短時間でも休んで、自分を労わってください。',
  罪悪感: '完璧な親はいません。あなたが子どもを愛していることが最も大切です。',
  喜び: 'この喜びの瞬間を心に刻んでください。困難な時の支えになります。',
  愛情: '愛情を感じられることは素晴らしいことです。その気持ちを大切にしてください。',
};

export const DEFAULT_FALLBACK_ADVICE = '今日も育児お疲れさまでした。あなたの努力は必ず子どもに伝わっています。';
