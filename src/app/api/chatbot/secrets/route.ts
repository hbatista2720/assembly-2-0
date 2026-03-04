/**
 * GET /api/chatbot/secrets - Estado de tokens (enmascarados).
 * PUT /api/chatbot/secrets - Actualizar tokens (Henry).
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";
import { getTelegramToken, getGeminiApiKey, getGroqApiKey, maskSecret, clearSecretsCache } from "@lib/secrets";

export async function GET() {
  try {
    const [telegram, gemini, groq, prefRow] = await Promise.all([
      getTelegramToken(),
      getGeminiApiKey(),
      getGroqApiKey(),
      sql<{ value: string }[]>`SELECT value FROM platform_secrets WHERE key = 'ai_provider_preference' AND value IN ('gemini', 'groq') LIMIT 1`,
    ]);
    const ai_provider_preference = prefRow?.[0]?.value === "groq" ? "groq" : "gemini";
    return NextResponse.json({
      telegramConfigured: !!telegram,
      telegramMasked: telegram ? maskSecret(telegram) : null,
      geminiConfigured: !!gemini,
      geminiMasked: gemini ? maskSecret(gemini) : null,
      groqConfigured: !!groq,
      groqMasked: groq ? maskSecret(groq) : null,
      ai_provider_preference,
    });
  } catch (e) {
    console.error("[chatbot/secrets GET]", e);
    return NextResponse.json({ error: "Error al leer configuración" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegram_bot_token, gemini_api_key, groq_api_key, ai_provider_preference } = body || {};

    const updates: Array<{ key: string; value: string }> = [];
    if (typeof telegram_bot_token === "string" && telegram_bot_token.trim()) {
      updates.push({ key: "telegram_bot_token", value: telegram_bot_token.trim() });
    }
    if (typeof gemini_api_key === "string" && gemini_api_key.trim()) {
      updates.push({ key: "gemini_api_key", value: gemini_api_key.trim() });
    }
    if (typeof groq_api_key === "string" && groq_api_key.trim()) {
      updates.push({ key: "groq_api_key", value: groq_api_key.trim() });
    }
    if (ai_provider_preference === "groq" || ai_provider_preference === "gemini") {
      updates.push({ key: "ai_provider_preference", value: ai_provider_preference });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Envía al menos uno: telegram_bot_token, gemini_api_key, groq_api_key o ai_provider_preference" }, { status: 400 });
    }

    for (const { key, value } of updates) {
      await sql`
        INSERT INTO platform_secrets (key, value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    }
    clearSecretsCache();

    return NextResponse.json({ ok: true, message: "Tokens actualizados. Reinicia el bot de Telegram si lo cambiaste." });
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : "";
    if (code === "42P01") {
      return NextResponse.json(
        { error: "Ejecuta sql_snippets/platform_secrets.sql para crear la tabla platform_secrets" },
        { status: 500 }
      );
    }
    console.error("[chatbot/secrets PUT]", e);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
