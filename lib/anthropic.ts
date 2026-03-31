/**
 * Shared Anthropic API client for server-side API routes.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-3-5-haiku-20241022';

interface AnthropicRequestOptions {
  prompt: string;
  maxTokens?: number;
  model?: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
}

/**
 * Call the Anthropic Messages API with a single user prompt.
 * Throws on API errors with a sanitized error message (no internal details leaked).
 */
export async function callAnthropic({
  prompt,
  maxTokens = 512,
  model = DEFAULT_MODEL,
}: AnthropicRequestOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    console.error('Anthropic API error:', response.status, await response.text());
    throw new Error('AI service temporarily unavailable');
  }

  const data: AnthropicResponse = await response.json();
  return data.content?.[0]?.text ?? '';
}
