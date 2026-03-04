/**
 * POST /api/chatbot/validate-token - Valida un token sin guardarlo.
 * Body: { type: "telegram" | "gemini", value: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, value } = body || {};
    const token = typeof value === "string" ? value.trim() : "";

    if (!type || !token) {
      return NextResponse.json({ valid: false, message: "Faltan type y value" }, { status: 400 });
    }

    if (type === "telegram") {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await res.json();
      if (data.ok && data.result?.username) {
        return NextResponse.json({
          valid: true,
          message: `Token válido → @${data.result.username}`,
          username: data.result.username,
        });
      }
      return NextResponse.json({
        valid: false,
        message: data.description || "Token inválido",
      });
    }

    if (type === "gemini") {
      try {
        const genAI = new GoogleGenerativeAI(token);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Di 'OK' en una palabra.");
        const text = result.response.text()?.trim();
        return NextResponse.json({
          valid: true,
          message: text ? "API key válida" : "API key aceptada (sin respuesta)",
        });
      } catch (err) {
        const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Error";
        return NextResponse.json({
          valid: false,
          message: msg.includes("API key") ? "API key inválida o sin cuota" : msg.slice(0, 100),
        });
      }
    }

    return NextResponse.json({ valid: false, message: "type debe ser telegram o gemini" }, { status: 400 });
  } catch (e) {
    console.error("[chatbot/validate-token]", e);
    return NextResponse.json({ valid: false, message: "Error al validar" }, { status: 500 });
  }
}
