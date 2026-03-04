/**
 * POST /api/chatbot/validate-groq
 * Valida una API key de Groq sin guardarla.
 * Body: { api_key?: string } - si no se envía, usa la configurada (BD o env).
 */
import { NextRequest, NextResponse } from "next/server";
import { getGroqApiKey } from "@lib/secrets";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const previewKey = typeof body.api_key === "string" ? body.api_key.trim() : "";
    const apiKey = previewKey || (await getGroqApiKey());

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        valid: false,
        message: "No hay API key para validar. Ingresa una clave y haz clic en Validar.",
      });
    }

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "Di solo: OK" }],
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429) {
        return NextResponse.json({
          ok: true,
          valid: true,
          message: "API key válida. Cuota temporalmente agotada (espera unos minutos).",
        });
      }
      return NextResponse.json({
        ok: false,
        valid: false,
        message: res.status === 401 || res.status === 403 ? "API key inválida." : "Groq devolvió error.",
        detail: errText.slice(0, 200),
      });
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    const valid = text.length > 0;

    return NextResponse.json({
      ok: true,
      valid,
      message: valid ? "API key válida. Groq respondió correctamente." : "Groq devolvió respuesta vacía.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[validate-groq] Error:", msg);
    const isNetwork = /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|fetch failed/i.test(msg);
    const short = isNetwork
      ? "Error de red. Revisa firewall/DNS en el VPS."
      : msg.length > 120
        ? msg.slice(0, 120) + "..."
        : msg;
    return NextResponse.json({
      ok: false,
      valid: false,
      message: "La API key no es válida o hay un error de red.",
      detail: short,
    });
  }
}
