import { fallbackAdvice, DEFAULT_FALLBACK_ADVICE, MAX_CHAT_HISTORY_LENGTH } from './constants';
import type { EmotionType } from '../types';

const API_BASE_URL = 'https://parentseed-app-v2.vercel.app';

/** POST request to the backend API with standard error handling. */
async function callApi<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/** Generate AI advice for an emotion entry. Falls back to static advice on failure. */
export async function generateAdvice(
  emotions: EmotionType[],
  content: string,
): Promise<string> {
  try {
    const data = await callApi<{ advice: string }>('/api/generate-advice', {
      emotions,
      content,
    });
    return data.advice;
  } catch (error) {
    console.warn('AI advice generation failed, using fallback:', error);
    const primaryEmotion = emotions[0];
    return fallbackAdvice[primaryEmotion] ?? DEFAULT_FALLBACK_ADVICE;
  }
}

/** Chat message format sent to the API. */
interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Send a chat message to the AI counselor.
 * Automatically trims history to the most recent messages to prevent unbounded growth.
 */
export async function sendChatMessage(
  message: string,
  history: ChatHistoryItem[],
): Promise<string> {
  // Limit history to prevent large payloads
  const trimmedHistory = history.slice(-MAX_CHAT_HISTORY_LENGTH);

  const data = await callApi<{ response: string }>('/api/chat', {
    message,
    history: trimmedHistory,
  });
  return data.response;
}
