/**
 * Lee tokens/API keys: primero desde BD (platform_secrets), luego env.
 * Permite que Henry actualice tokens desde el panel sin editar .env.
 */
import { sql } from "./db";

const CACHE: Record<string, { value: string; ts: number }> = {};
const CACHE_TTL_MS = 60_000;

export async function getSecret(key: string): Promise<string | null> {
  const cached = CACHE[key];
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.value || null;
  }
  try {
    const [row] = await sql<{ value: string }[]>`
      SELECT value FROM platform_secrets WHERE key = ${key} AND value IS NOT NULL AND value != ''
      LIMIT 1
    `;
    if (row?.value) {
      CACHE[key] = { value: row.value, ts: Date.now() };
      return row.value;
    }
  } catch {
    // tabla puede no existir
  }
  return null; // no cachear: fallback a env en getTelegramToken/getGeminiApiKey
}

/** Limpia la caché tras actualizar tokens (llamar desde PUT /api/chatbot/secrets) */
export function clearSecretsCache(): void {
  Object.keys(CACHE).forEach((k) => delete CACHE[k]);
}

export async function getTelegramToken(): Promise<string> {
  const fromDb = await getSecret("telegram_bot_token");
  if (fromDb) return fromDb;
  return (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
}

export async function getGeminiApiKey(): Promise<string> {
  const fromDb = await getSecret("gemini_api_key");
  if (fromDb) return fromDb;
  return (process.env.GEMINI_API_KEY ?? "").trim();
}

export async function getGroqApiKey(): Promise<string> {
  const fromDb = await getSecret("groq_api_key");
  if (fromDb) return fromDb;
  return (process.env.GROQ_API_KEY ?? "").trim();
}

export function maskSecret(value: string): string {
  if (!value || value.length < 8) return "***";
  return value.slice(0, 4) + "••••••••" + value.slice(-4);
}
