// Server-only. GROQ_API_KEY must never be prefixed NEXT_PUBLIC_ and this
// file must never be imported from a "use client" component — grep the
// client bundle before deploying to confirm the key isn't in it.
//
// Provider: Groq (https://console.groq.com) — free tier, no credit card,
// OpenAI-compatible chat completions endpoint. Chosen over the Anthropic
// API for this project specifically because it's free to run eval loops
// against; see docs/architecture.md for the trade-off notes. Swapping to
// a different OpenAI-compatible provider (OpenRouter, Cerebras, etc.) is
// a same-shape change confined to this one file.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;

export interface LlmCallResult {
  outputText: string;
  latencyMs: number;
}

export class LlmCallError extends Error {}

/**
 * Calls the model once with a filled-in prompt. Wraps the fetch in an
 * explicit timeout — a hanging request here would otherwise stall an
 * eval run indefinitely instead of failing one result and moving on.
 */
export async function callModel(params: {
  model: string;
  systemPrompt?: string | null;
  userMessage: string;
}): Promise<LlmCallResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new LlmCallError("GROQ_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = Date.now();

  const messages = params.systemPrompt
    ? [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userMessage },
      ]
    : [{ role: "user", content: params.userMessage }];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: 1024,
        messages,
      }),
      signal: controller.signal,
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      // Groq's free tier returns 429 on rate-limit breach — surfaced as
      // a normal per-result error so one throttled call doesn't kill
      // the rest of the eval run.
      throw new LlmCallError(
        `Model call failed (${response.status}): ${body.slice(0, 200)}`
      );
    }

    const data = await response.json();
    const outputText = data.choices?.[0]?.message?.content;

    if (!outputText) {
      throw new LlmCallError("Model returned no text content");
    }

    return { outputText, latencyMs };
  } catch (err) {
    if (err instanceof LlmCallError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new LlmCallError(`Model call timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw new LlmCallError(
      err instanceof Error ? err.message : "Unknown error calling the model"
    );
  } finally {
    clearTimeout(timeout);
  }
}
