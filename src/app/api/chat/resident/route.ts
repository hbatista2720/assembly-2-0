/**
 * POST /api/chat/resident
 * Chat para residente validado: texto libre → respuesta con Gemini.
 * Ref: Marketing/MARKETING_SUGERENCIA_CHATBOT_INTELIGENTE_GEMINI.md, BASE_CONOCIMIENTO_CHATBOT_LEX.md (PERFIL 5, TEMA 4B).
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFile } from "fs/promises";
import path from "path";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const FALLBACK_REPLY = "Soy Lex, el asistente de Assembly 2.0 para tu PH. ¿En qué puedo ayudarte? Puedes usar los botones: Votación, Asambleas, Calendario, Tema del día o Ceder poder. O escríbeme tu consulta.";

const LEX_IDENTITY_REPLY = "Me llamo Lex. Soy el asistente de Assembly 2.0 para votaciones, asambleas y gestión de tu PH. ¿En qué puedo ayudarte? Puedes usar los botones: Votación, Asambleas, Calendario, Tema del día o Ceder poder.";

/** Detecta si el mensaje pregunta por el nombre/identidad del bot. Responde siempre con Lex sin depender de Gemini. */
function isAskingForName(message: string): boolean {
  const lower = message.toLowerCase().replace(/\s+/g, " ").trim();
  const patterns = [
    /como te llamas/,
    /c[oó]mo te llamas/,
    /tu nombre/,
    /cu[aá]l es tu nombre/,
    /quien eres/,
    /qui[eé]n eres/,
    /como te llamas\s*\??\s*$/,
    /nombre del (bot|asistente|chat)/,
    /como se (llama|llaman) (el )?bot/,
  ];
  return patterns.some((p) => p.test(lower));
}

/** Carga la base de conocimiento desde docs/chatbot-knowledge-resident.md (cache en memoria). */
let knowledgeBaseCache: string | null = null;
async function loadKnowledgeBase(): Promise<string> {
  if (knowledgeBaseCache !== null) return knowledgeBaseCache;
  try {
    const dir = process.cwd();
    const filePath = path.join(dir, "docs", "chatbot-knowledge-resident.md");
    const raw = await readFile(filePath, "utf-8");
    knowledgeBaseCache = raw.slice(0, 3500).trim();
    return knowledgeBaseCache;
  } catch {
    knowledgeBaseCache = "";
    return "";
  }
}

function buildSystemPrompt(ctx: {
  email?: string;
  residentName?: string;
  unit?: string;
  organizationName?: string;
  assemblyContext?: string;
  temaActivo?: { title?: string; description?: string };
  knowledgeSnippet?: string;
}): string {
  const tema = ctx.temaActivo?.title
    ? `Tema actual en votación: "${ctx.temaActivo.title}".${ctx.temaActivo.description ? ` Descripción: ${ctx.temaActivo.description}.` : ""}`
    : "No hay tema activo en este momento.";
  const knowledgeBlock = ctx.knowledgeSnippet
    ? `\nBASE DE CONOCIMIENTO (documento residente):\n${ctx.knowledgeSnippet}\n\n`
    : "";
  return `Eres Lex, el asistente de Assembly 2.0 para residentes de Propiedades Horizontales (PH). El usuario ya está validado con su correo; NUNCA le pidas correo ni lo trates como si no estuviera registrado.

CONTEXTO DEL USUARIO:
- Correo: ${ctx.email || "—"}
- Nombre: ${ctx.residentName || "Residente"}
- Unidad: ${ctx.unit || "—"}
- PH: ${ctx.organizationName || "—"}
- Estado de asamblea: ${ctx.assemblyContext || "activa"} (activa = hay votación; programada = próxima; sin_asambleas = no hay asambleas).
- ${tema}
${knowledgeBlock}
REGLAS DE RESPUESTA – Cómo responder:

IDENTIDAD (nombre del bot):
- Si preguntan "¿cómo te llamas?", "tu nombre", "quién eres", "cuál es tu nombre", "como te llamas": responde que te llamas Lex y qué haces.
- Ejemplo: "Me llamo Lex. Soy el asistente de Assembly 2.0 para votaciones, asambleas y gestión de tu PH. ¿En qué puedo ayudarte?"

SALUDOS (hola, buenos días, buenas tardes, hey, qué tal, etc.):
- Responde con amabilidad, saluda de vuelta usando su nombre si lo conoces y ofrece ayuda.
- Ejemplo: "¡Hola! ¿En qué puedo ayudarte hoy? Puedes participar en la votación, ver asambleas, calendario, tema del día o ceder poder. ¿Qué prefieres?"

CONSULTAS GENÉRICAS ("¿qué más hay?", "ya estoy registrado", "¿qué puedo hacer?"):
- Ofrece las opciones: Votación, Tema del día, Asambleas, Calendario, Ceder poder. NUNCA digas "No encuentro ese correo".

PREGUNTAS SOBRE VOTACIÓN O TEMA:
- "¿Cómo voto?": instrucciones breves (link, Face ID, botones Sí/No/Abstención).
- "¿Cuál es el tema?": indica el tema activo y ofrecer participar.

CONOCIMIENTO RESIDENTE (PERFIL 5, TEMA 4B): cómo votar, quórum, Al Día vs En Mora (Ley 284), Face ID legal. Responde en español, breve y amigable.

REGLAS ESTRICTAS:
- NUNCA pidas correo ni validación de email; el usuario ya está validado.
- NUNCA respondas "No encuentro ese correo" a ningún mensaje.
- Para cualquier mensaje que no entiendas claramente, responde con amabilidad y ofrece las opciones (Votación, Asambleas, Calendario, Tema del día, Ceder poder).

Responde SOLO con el texto de la respuesta, sin prefijos como "Lex:" ni metadatos.`;
}

/** GET: estado de configuración. ?validate=1 hace una llamada real a Gemini para validar la API en el entorno. */
export async function GET(req: Request) {
  const configured = !!(process.env.GEMINI_API_KEY ?? "").trim();
  const url = new URL(req.url);
  const doValidate = url.searchParams.get("validate") === "1";

  if (!doValidate) {
    return NextResponse.json({
      geminiConfigured: configured,
      model: GEMINI_MODEL,
    });
  }

  if (!configured) {
    return NextResponse.json({
      ok: false,
      error: "GEMINI_API_KEY no está configurada en el entorno.",
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent("Responde solo con la palabra OK.");
    const text = (result.response.text() ?? "").trim();
    const ok = text.length > 0;
    return NextResponse.json({
      ok,
      message: ok ? "API Gemini respondió correctamente." : "Gemini devolvió respuesta vacía.",
      ...(ok ? {} : { error: "Respuesta vacía" }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      error: "La llamada a Gemini falló. Revisa la clave y la red.",
      detail: message,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "message es requerido" }, { status: 400 });
    }

    if (isAskingForName(message)) {
      return NextResponse.json({ reply: LEX_IDENTITY_REPLY });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey?.trim()) {
      return NextResponse.json(
        { error: "Chat con Gemini no configurado (GEMINI_API_KEY)." },
        { status: 503 }
      );
    }

    const context = body.context || {};
    const history = Array.isArray(body.history) ? body.history : [];

    const knowledgeSnippet = await loadKnowledgeBase();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
        topP: 0.9,
      },
    });

    const systemPrompt = buildSystemPrompt({
      email: context.email,
      residentName: context.residentName,
      unit: context.unit,
      organizationName: context.organizationName,
      assemblyContext: context.assemblyContext,
      temaActivo: context.temaActivo,
      knowledgeSnippet: knowledgeSnippet || undefined,
    });

    let conversationBlock = "";
    for (const h of history.slice(-8)) {
      const role = h.role === "user" ? "Usuario" : "Lex";
      const text = typeof h.text === "string" ? h.text.trim() : "";
      if (text) conversationBlock += `${role}: ${text}\n`;
    }
    if (conversationBlock) conversationBlock += "\n";

    const fullPrompt = `${systemPrompt}\n\n---\nConversación reciente:\n${conversationBlock}Usuario: ${message}\n\nLex:`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    let reply = "";
    try {
      reply = (response.text() ?? "").trim();
    } catch {
      const candidates = (response as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates;
      if (candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = candidates[0].content.parts[0].text.trim();
      }
    }
    if (!reply) {
      console.warn("[api/chat/resident] Gemini devolvió respuesta vacía; usando fallback (revisar GEMINI_API_KEY).");
      reply = FALLBACK_REPLY;
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[api/chat/resident] Gemini error (revisar GEMINI_API_KEY o red):", err);
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}
