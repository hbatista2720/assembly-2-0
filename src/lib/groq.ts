/**
 * Cliente Groq (API compatible con OpenAI). Uso en chat cuando GROQ_API_KEY está configurada.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

export type GroqMessage = { role: "system" | "user" | "assistant"; content: string };

export async function generateWithGroq(
  apiKey: string,
  systemPrompt: string,
  history: Array<{ role: string; text: string }>,
  userMessage: string,
  options: { model?: string; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const model = options.model || process.env.GROQ_MODEL || DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? 512;
  const temperature = options.temperature ?? 0.7;

  const messages: GroqMessage[] = [{ role: "system", content: systemPrompt }];
  for (const h of history) {
    const role = h.role === "user" ? "user" : "assistant";
    const content = typeof h.text === "string" ? h.text.trim() : "";
    if (content) messages.push({ role, content });
  }
  messages.push({ role: "user", content: userMessage });

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
  return reply;
}
