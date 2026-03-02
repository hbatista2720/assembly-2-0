/**
 * POST /api/chat/telegram
 * Chat con IA (Gemini) para Telegram. Usa prompts de chatbot_config y base de conocimiento.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "../../../../lib/db";
import { getGeminiApiKey } from "../../../../lib/secrets";
import { readFile } from "fs/promises";
import path from "path";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

let knowledgeCache: string | null = null;
async function loadKnowledge(): Promise<string> {
  if (knowledgeCache !== null) return knowledgeCache;
  try {
    const fp = path.join(process.cwd(), "docs", "chatbot-knowledge-resident.md");
    knowledgeCache = (await readFile(fp, "utf-8")).slice(0, 3500).trim();
  } catch {
    knowledgeCache = "";
  }
  return knowledgeCache;
}

/** GET: estado de Gemini para el chatbot de Telegram */
export async function GET() {
  const apiKey = await getGeminiApiKey();
  const configured = !!apiKey;
  return NextResponse.json({
    geminiConfigured: configured,
    model: GEMINI_MODEL,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const role = typeof body.role === "string" ? body.role : "landing";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "message es requerido" }, { status: 400 });
    }

    const apiKey = (await getGeminiApiKey())?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { reply: "La IA no está configurada. Configura la API key de Gemini en Panel Henry > Chatbot > Tokens." },
        { status: 200 }
      );
    }

    const [config] = await sql`
      SELECT prompts, ai_model, temperature, max_tokens
      FROM chatbot_config
      WHERE bot_name = 'telegram' AND is_active = TRUE
    `;

    const prompts = (config?.prompts as Record<string, string>) || {};
    const ctxPrompt =
      prompts[role] ||
      prompts.landing ||
      "Eres Lex, asistente de Assembly 2.0. Responde de forma amigable y breve en español. Ayudas con demos, leads, votaciones y asambleas de PH.";
    const modelName = config?.ai_model || GEMINI_MODEL;
    const temperature = Number(config?.temperature) ?? 0.7;
    const maxTokens = Number(config?.max_tokens) ?? 512;

    const knowledge = await loadKnowledge();
    const knowledgeBlock = knowledge
      ? `\nBASE DE CONOCIMIENTO:\n${knowledge}\n\n`
      : "";

    const systemPrompt = `${ctxPrompt}
${knowledgeBlock}
REGLAS: Responde SOLO el texto de la respuesta, sin prefijos. Sé natural y breve. Si no sabes algo, ofrece contactar soporte o usar /registrarme, /mivoto.`;

    let convBlock = "";
    for (const h of history.slice(-6)) {
      const r = h.role === "user" ? "Usuario" : "Lex";
      const t = typeof h.text === "string" ? h.text.trim() : "";
      if (t) convBlock += `${r}: ${t}\n`;
    }
    if (convBlock) convBlock += "\n";

    const fullPrompt = `${systemPrompt}\n\n---\n${convBlock}Usuario: ${message}\n\nLex:`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.9,
      },
    });

    const result = await model.generateContent(fullPrompt);
    let reply = (result.response.text() ?? "").trim();
    if (!reply) {
      reply =
        "¿En qué más puedo ayudarte? Puedes escribir /registrarme para registrarte como lead o /mivoto para información sobre votación.";
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[api/chat/telegram]", err);
    return NextResponse.json({
      reply: "Disculpa, hubo un error. Intenta de nuevo o escribe /start para ver opciones.",
    });
  }
}
