import { NextRequest, NextResponse } from "next/server";
import { getTelegramToken } from "@lib/secrets";

/**
 * GET /api/chatbot/telegram-status
 * Valida el token de Telegram (getMe). Usa BD (platform_secrets) o .env.
 * ?token=xxx para validar un token sin guardarlo (preview).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const previewToken = searchParams.get("token")?.trim();
  const token = previewToken || (await getTelegramToken());
  if (!token) {
    return NextResponse.json({
      configured: false,
      valid: false,
      message: "Añade TELEGRAM_BOT_TOKEN en .env",
    });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();
    if (data.ok && data.result?.username) {
      return NextResponse.json({
        configured: true,
        valid: true,
        username: data.result.username,
        message: `Token válido → @${data.result.username}`,
      });
    }
    return NextResponse.json({
      configured: true,
      valid: false,
      message: data.description || "Token inválido",
    });
  } catch (err) {
    return NextResponse.json({
      configured: true,
      valid: false,
      message: "Error al validar token (revisa conexión)",
    });
  }
}
