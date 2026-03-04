/**
 * GET /api/chatbot/telegram-token
 * Devuelve el token de Telegram para el proceso del bot.
 * Requiere header X-Service-Key = CHATBOT_SERVICE_KEY (opcional: si no existe, usa env directo en el bot).
 */
import { NextRequest, NextResponse } from "next/server";
import { getTelegramToken } from "@lib/secrets";

export async function GET(req: NextRequest) {
  const serviceKey = req.headers.get("x-service-key")?.trim();
  const expectedKey = process.env.CHATBOT_SERVICE_KEY?.trim();
  if (expectedKey && serviceKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = await getTelegramToken();
  if (!token) {
    return NextResponse.json({ error: "No token configured" }, { status: 404 });
  }
  return NextResponse.json({ token });
}
