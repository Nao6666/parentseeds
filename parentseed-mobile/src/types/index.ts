export interface Entry {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD in JST
  emotions: string[];
  content: string;
  aiAdvice?: string;
  image_urls?: string[];
  created_at: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface EmotionStats {
  stressLevel: number; // percentage
  positivity: number; // percentage
  emotionTotals: Record<string, number>;
}

export interface TimeSeriesData {
  date: string; // display format
  fullDate: string; // YYYY-MM-DD
  [key: string]: string | number;
}
