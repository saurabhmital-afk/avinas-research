const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 8192;

// In dev, use the Vite proxy to avoid CORS; in production, call Anthropic directly.
const API_URL = import.meta.env.DEV
  ? '/api/anthropic/v1/messages'
  : 'https://api.anthropic.com/v1/messages';

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (err: string) => void;
}

export async function streamResearch(
  apiKey: string,
  prompt: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
) {
  const systemPrompt = `You are a senior business and market intelligence researcher.
Conduct thorough, analytical research using verifiable public information.
Always label assumptions with [ASSUMPTION], missing data with [DATA UNAVAILABLE],
and inferred practitioner knowledge with [ASSUMPTION — practitioner inference].
Never fabricate statistics, quotes, or financial figures.
Format your response in clean Markdown.`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    let msg = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(err);
      const detail = parsed?.error?.message ?? '';
      const type = parsed?.error?.type ?? '';
      if (type === 'credit_balance_error' || res.status === 402) {
        msg = 'Insufficient API credits. Add credits at console.anthropic.com/settings/billing. Note: Claude.ai subscriptions and API credits are separate billing accounts.';
      } else {
        msg = detail ? `${detail}${type ? ` [${type}]` : ''}` : `HTTP ${res.status} — ${err.slice(0, 200)}`;
      }
    } catch { /* ignore */ }
    callbacks.onError(msg);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) { callbacks.onError('No response body'); return; }

  const decoder = new TextDecoder();
  let full = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.delta?.text ?? parsed?.content_block?.text ?? '';
          if (text) {
            full += text;
            callbacks.onChunk(text);
          }
        } catch { /* non-JSON SSE lines */ }
      }
    }
    callbacks.onDone(full);
  } catch (e) {
    if ((e as Error).name === 'AbortError') return;
    callbacks.onError((e as Error).message);
  } finally {
    reader.releaseLock();
  }
}
