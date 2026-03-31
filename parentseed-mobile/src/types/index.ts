import type { emotions } from '../lib/constants';

/** Plutchik's 8 basic emotions */
export type EmotionType = (typeof emotions)[number];

/** A single journal entry stored in Supabase */
export interface Entry {
  id: string;
  user_id: string;
  /** YYYY-MM-DD in JST */
  date: string;
  emotions: EmotionType[];
  content: string;
  aiAdvice?: string;
  image_urls?: string[];
  created_at: string;
}

/** A single chat message (local representation) */
export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Aggregated weekly emotion statistics */
export interface EmotionStats {
  /** Percentage of negative emotions (0-100) */
  stressLevel: number;
  /** Percentage of positive emotions (0-100) */
  positivity: number;
  /** Count of each emotion in the period */
  emotionTotals: Partial<Record<EmotionType, number>>;
}

/** A single data point for time-series charts */
export interface TimeSeriesDataPoint {
  /** Display-formatted date label */
  date: string;
  /** Full date string YYYY-MM-DD */
  fullDate: string;
  /** Emotion counts keyed by emotion name */
  [key: string]: string | number;
}

/** Period options for chart display */
export type ChartPeriod = '1week' | '2weeks' | '1month' | '3months';

/** Chart display type */
export type ChartType = 'line' | 'bar';

/** Navigation param lists */
export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type AppTabParamList = {
  Record: undefined;
  History: undefined;
  Insights: undefined;
  Counselor: undefined;
  Growth: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  DeleteAccount: undefined;
};
