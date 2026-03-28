import { fallbackAdvice, DEFAULT_FALLBACK_ADVICE } from './constants';

const API_BASE_URL = 'https://parentseed-app-v2.vercel.app';

/**
 * Call the existing Next.js API route on Vercel.
 */
const callApi = async (
  path: string,
  body: Record<string, unknown>
): Promise<Response> => {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

/**
 * Generate AI advice for an emotion entry.
 */
export const generateAdvice = async (
  emotions: string[],
  content: string
): Promise<string> => {
  try {
    const response = await callApi('/api/generate-advice', { emotions, content });

    if (!response.ok) {
      throw new Error('Failed to generate advice');
    }

    const data = await response.json();
    return data.advice;
  } catch (error) {
    console.error('Error generating advice:', error);
    const primaryEmotion = emotions[0];
    return fallbackAdvice[primaryEmotion] || DEFAULT_FALLBACK_ADVICE;
  }
};

/**
 * Send a chat message to the AI counselor.
 */
export const sendChatMessage = async (
  message: string,
  history: Array<{ role: string; content: string }>
): Promise<string> => {
  try {
    const response = await callApi('/api/chat', { message, history });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};
