/**
 * Emotion definitions based on Plutchik's Wheel of Emotions.
 * Single source of truth for all emotion-related data.
 */

/** The 8 basic emotions from Plutchik's Wheel */
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

/** Positive emotions used for stats calculation */
export const positiveEmotions: readonly EmotionType[] = ['喜び', '信頼', '期待'];

/** Negative emotions used for stats calculation */
export const negativeEmotions: readonly EmotionType[] = ['恐れ', '悲しみ', '嫌悪', '怒り'];

// 驚き is neutral

/** Color configuration for each emotion */
interface EmotionColorSet {
  /** Chart hex color */
  chart: string;
  /** Unselected state */
  normal: { bg: string; text: string; border: string };
  /** Selected state */
  selected: { bg: string; text: string; border: string };
}

/**
 * Consolidated emotion color definitions.
 * Each emotion has chart, normal, and selected color sets.
 */
export const emotionColorMap: Record<EmotionType, EmotionColorSet> = {
  喜び: {
    chart: '#fbbf24',
    normal:   { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    selected: { bg: '#f59e0b', text: '#ffffff', border: '#d97706' },
  },
  信頼: {
    chart: '#34d399',
    normal:   { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
    selected: { bg: '#10b981', text: '#ffffff', border: '#059669' },
  },
  恐れ: {
    chart: '#60a5fa',
    normal:   { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
    selected: { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' },
  },
  驚き: {
    chart: '#38bdf8',
    normal:   { bg: '#e0f2fe', text: '#075985', border: '#bae6fd' },
    selected: { bg: '#0ea5e9', text: '#ffffff', border: '#0284c7' },
  },
  悲しみ: {
    chart: '#6366f1',
    normal:   { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
    selected: { bg: '#6366f1', text: '#ffffff', border: '#4f46e5' },
  },
  嫌悪: {
    chart: '#a78bfa',
    normal:   { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
    selected: { bg: '#8b5cf6', text: '#ffffff', border: '#7c3aed' },
  },
  怒り: {
    chart: '#ef4444',
    normal:   { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
    selected: { bg: '#ef4444', text: '#ffffff', border: '#dc2626' },
  },
  期待: {
    chart: '#fb923c',
    normal:   { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
    selected: { bg: '#f97316', text: '#ffffff', border: '#ea580c' },
  },
};

/** Fallback colors for unknown emotions (e.g. old data from before Plutchik migration) */
const FALLBACK_COLORS = {
  chart: '#9ca3af',
  normal:   { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
  selected: { bg: '#6b7280', text: '#ffffff', border: '#4b5563' },
};

/** Helper: get chart color for an emotion */
export function getChartColor(emotion: string): string {
  return (emotionColorMap as Record<string, EmotionColorSet>)[emotion]?.chart ?? FALLBACK_COLORS.chart;
}

/** Helper: get normal (unselected) colors */
export function getNormalColors(emotion: string) {
  return (emotionColorMap as Record<string, EmotionColorSet>)[emotion]?.normal ?? FALLBACK_COLORS.normal;
}

/** Helper: get selected colors */
export function getSelectedColors(emotion: string) {
  return (emotionColorMap as Record<string, EmotionColorSet>)[emotion]?.selected ?? FALLBACK_COLORS.selected;
}

/** Fallback advice when AI is unavailable */
export const fallbackAdvice: Record<EmotionType, string> = {
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

/** Maximum number of images per entry */
export const MAX_IMAGES_PER_ENTRY = 3;

/** Maximum chat message length */
export const MAX_CHAT_MESSAGE_LENGTH = 1000;

/** Maximum number of chat messages sent to API for context */
export const MAX_CHAT_HISTORY_LENGTH = 20;
