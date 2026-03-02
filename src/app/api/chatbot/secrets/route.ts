/**
 * GET /api/chatbot/secrets - Estado de tokens (enmascarados).
 * PUT /api/chatbot/secrets - Actualizar tokens (Henry).
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";
import { getTelegramToken, getGeminiApiKey, maskSecret, clearSecretsCache } from "../../../../lib/secrets";

export async function GET() {
  try {
    const [telegram, gemini] = await Promise.all([getTelegramToken(), getGeminiApiKey()]);
    return NextResponse.json({
      telegramConfigured: !!telegram,
      telegramMasked: telegram ? maskSecret(telegram) : null,
      geminiConfigured: !!gemini,
      geminiMasked: gemini ? maskSecret(gemini) : null,
    });
  } catch (e) {
    console.error("[chatbot/secrets GET]", e);
    return NextResponse.json({ error: "Error al leer configuración" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegram_bot_token, gemini_api_key } = body || {};

    const updates: Array<{ key: string; value: string }> = [];
    if (typeof telegram_bot_token === "string" && telegram_bot_token.trim()) {
      updates.push({ key: "telegram_bot_token", value: telegram_bot_token.trim() });
    }
    if (typeof gemini_api_key === "string" && gemini_api_key.trim()) {
      updates.push({ key: "gemini_api_key", value: gemini_api_key.trim() });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Envía telegram_bot_token y/o gemini_api_key" }, { status: 400 });
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
