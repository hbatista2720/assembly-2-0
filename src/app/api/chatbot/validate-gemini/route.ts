/**
 * POST /api/chatbot/validate-gemini
 * Valida una API key de Gemini sin guardarla.
 * Body: { api_key?: string } - si no se envía, usa la configurada (BD o env).
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey } from "../../../../lib/secrets";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const previewKey = typeof body.api_key === "string" ? body.api_key.trim() : "";
    const apiKey = previewKey || (await getGeminiApiKey());

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        valid: false,
        message: "No hay API key para validar. Ingresa una clave y haz clic en Validar.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent("Responde solo: OK");
    const text = (result.response.text() ?? "").trim();
    const valid = text.length > 0;

    return NextResponse.json({
      ok: true,
      valid,
      message: valid ? "API key válida. Gemini respondió correctamente." : "Gemini devolvió respuesta vacía.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      valid: false,
      message: "La API key no es válida o hay un error de red.",
      detail: msg,
    });
  }
}
