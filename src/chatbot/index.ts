import path from "path";
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });
import TelegramBot from "node-telegram-bot-api";
import { registerCommands, startRegistrarmeFlow } from "./commands";
import { sql } from "../lib/db";

const APP_URL =
  process.env.CHATBOT_API_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function getTelegramToken(): Promise<string> {
  const fromEnv = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const serviceKey = process.env.CHATBOT_SERVICE_KEY?.trim();
  try {
    const url = APP_URL + "/api/chatbot/telegram-token";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (serviceKey) headers["X-Service-Key"] = serviceKey;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const d = await res.json();
      if (d?.token) return d.token;
    }
  } catch (err) {
    console.warn("[Chatbot] No se pudo obtener token desde API, usando .env:", (err as Error)?.message);
  }
  return fromEnv;
}

const userRole: Record<number, string> = {};
const userEmail: Record<number, string> = {};
const chatHistory: Record<number, Array<{ role: string; text: string }>> = {};
const identifyState: Record<number, { step: "awaiting_email" }> = {};
const mivotoState: Record<number, { step: "awaiting_email" }> = {};

/** Perfil del residente (PH, unidad, nombre) para mensaje de bienvenida y contexto IA. */
type ResidentProfile = { organization_name: string; unit: string | null; resident_name: string };
const residentProfile: Record<number, ResidentProfile | null> = {};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  junta: "Junta / PH",
  residente: "Residente",
};

/** Mapea rol de BD a rol del bot */
function dbRoleToBot(dbRole: string): string {
  if (dbRole === "ADMIN_PLATAFORMA") return "admin";
  if (dbRole === "ADMIN_PH") return "junta";
  if (dbRole === "RESIDENTE") return "residente";
  return "landing";
}

/** Muestra botones de rol para usuarios no encontrados en BD */
const ROLE_BUTTONS = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🏢 Administrador", callback_data: "role_admin" }],
      [{ text: "🏠 Junta / PH", callback_data: "role_junta" }],
      [{ text: "👤 Residente", callback_data: "role_residente" }],
    ],
  },
};

function getMivotoButtons() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📱 Face ID (recomendado)", callback_data: "mivoto_faceid" }],
        [{ text: "✍️ Voto manual", callback_data: "mivoto_manual" }],
      ],
    },
  };
}

async function sendMivotoOptions(bot: TelegramBot, chatId: number) {
  await bot.sendMessage(
    chatId,
    `🗳️ **Tu voto en Chat Vote**

Puedes votar de 2 formas:
✅ **Face ID (recomendado)**: firma biométrica en tu dispositivo.
✅ **Manual**: el administrador valida tu identidad en la asamblea.

¿Quieres guía con Face ID o voto manual?`,
    { parse_mode: "Markdown", ...getMivotoButtons() },
  );
}

function getActionButtons(role: string) {
  const base = [
    { text: "📋 Registrarme como lead", callback_data: "action_registrarme" },
    { text: "🗳️ Mi voto", callback_data: "action_mivoto" },
    { text: "❓ Soporte", callback_data: "action_soporte" },
  ];
  if (role === "admin" || role === "junta") {
    return [
      { text: "🆕 Activar demo", callback_data: "action_demo" },
      ...base,
    ];
  }
  return base;
}

/** Obtiene la config de Telegram desde BD. Si falla la conexión, devuelve null (no lanza). */
async function getBotConfig(): Promise<{ bot_name: string; prompts?: unknown } | null> {
  try {
    const [config] = await sql`
      SELECT *
      FROM chatbot_config
      WHERE bot_name = 'telegram' AND is_active = TRUE
    `;
    return config ?? null;
  } catch (err) {
    console.warn("[Telegram] getBotConfig (BD no disponible):", (err as Error)?.message);
    return null;
  }
}

/** Verifica usuario por correo vía API de la app (usa la misma BD que la app). */
async function verifyUserByEmail(
  email: string,
  options?: { roleFilter?: "RESIDENTE" }
): Promise<{ id: string; email: string; role: string } | null> {
  try {
    const res = await fetch(`${APP_URL}/api/chatbot/verify-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), roleFilter: options?.roleFilter ?? null }),
    });
    const data = await res.json();
    if (data?.ok && data?.user) return data.user;
    return null;
  } catch (err) {
    console.error("[Telegram] Error llamando verify-user:", (err as Error)?.message);
    return null;
  }
}

/** Obtiene perfil del residente (PH, unidad, nombre) desde la app, igual que la versión web. */
async function fetchResidentProfile(email: string): Promise<ResidentProfile | null> {
  try {
    const res = await fetch(`${APP_URL}/api/resident-profile?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.organization_name)
      return {
        organization_name: String(data.organization_name),
        unit: data.unit ?? null,
        resident_name: data.resident_name ?? email.split("@")[0],
      };
    return null;
  } catch (err) {
    console.warn("[Telegram] Error obteniendo perfil residente:", (err as Error)?.message);
    return null;
  }
}

function registerHandlers(bot: TelegramBot) {
const WELCOME_START =
  "¡Hola! 👋 Soy Lex, el asistente de Chat Vote.\n\nPara ayudarte, necesito identificarte. Envía tu correo electrónico para continuar.";
/** Mensaje corto sin emoji por si la API de Telegram falla con el mensaje completo (encoding/red). */
const WELCOME_START_FALLBACK = "¡Hola! Soy Lex, asistente de Chat Vote. Envía tu correo electrónico para continuar.";
const WELCOME_START_ERROR = "¡Hola! Soy Lex. Error de conexión. Intenta más tarde.";

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  console.log("[Telegram] /start recibido, chatId:", chatId);
  delete userRole[chatId];
  delete userEmail[chatId];
  delete chatHistory[chatId];
  delete mivotoState[chatId];
  delete residentProfile[chatId];
  identifyState[chatId] = { step: "awaiting_email" };
  await getBotConfig(); // opcional: si falla no bloquea; solo para logs
  try {
    await bot.sendMessage(chatId, WELCOME_START);
  } catch (err) {
    const errMsg = (err as Error)?.message ?? String(err);
    console.error("[Telegram] Error enviando mensaje /start:", errMsg);
    try {
      await bot.sendMessage(chatId, WELCOME_START_FALLBACK);
    } catch (err2) {
      console.error("[Telegram] Fallback también falló:", (err2 as Error)?.message);
      try {
        await bot.sendMessage(chatId, WELCOME_START_ERROR);
      } catch (_) {}
    }
  }
});

bot.onText(/\/mivoto/, async (msg) => {
  const chatId = msg.chat.id;
  const email = userEmail[chatId];
  const role = userRole[chatId];
  if (email && role === "residente") {
    await sendMivotoOptions(bot, chatId);
  } else {
    mivotoState[chatId] = { step: "awaiting_email" };
    await bot.sendMessage(
      chatId,
      `🗳️ **Mi voto**

Para consultar tu voto necesito identificar tu cuenta de residente. **Envía tu correo electrónico registrado** para continuar.`,
      { parse_mode: "Markdown" },
    );
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const data = query.data || "";
  if (!chatId) return;

  if (data.startsWith("role_")) {
    const role = data.replace("role_", "");
    userRole[chatId] = role;
    const labels: Record<string, string> = {
      admin: "Administrador",
      junta: "Junta / PH",
      residente: "Residente",
    };
    await bot.answerCallbackQuery(query.id);
    const actions = getActionButtons(role);
    await bot.sendMessage(chatId, `Perfecto, ${labels[role]}. ¿En qué te ayudo?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: actions.map((a) => [a]),
      },
    });
    return;
  }

  if (data.startsWith("action_")) {
    await bot.answerCallbackQuery(query.id);
    const action = data.replace("action_", "");
    if (action === "registrarme") {
      await startRegistrarmeFlow(bot, chatId);
    } else if (action === "mivoto") {
      const email = userEmail[chatId];
      const role = userRole[chatId];
      if (email && role === "residente") {
        await sendMivotoOptions(bot, chatId);
      } else {
        mivotoState[chatId] = { step: "awaiting_email" };
        await bot.sendMessage(
          chatId,
          `🗳️ **Mi voto**

Para consultar tu voto necesito identificar tu cuenta de residente. **Envía tu correo electrónico registrado** para continuar.`,
          { parse_mode: "Markdown" },
        );
      }
    } else if (action === "soporte") {
      await bot.sendMessage(chatId, "❓ Escribe tu consulta y te atenderemos lo antes posible.");
    } else if (action === "demo") {
      await bot.sendMessage(chatId, "🆕 Visita https://assembly20.com/demo/register para activar tu demo.");
    }
    return;
  }

  if (data === "mivoto_faceid") {
    await bot.answerCallbackQuery(query.id);
    await bot.sendMessage(
      chatId,
      `📱 **Guía Face ID**

1. Entra a la app o web de tu PH cuando haya asamblea activa.
2. Inicia sesión con tu correo (si no lo has hecho).
3. Al votar, te pedirá **Face ID** o **huella** para firmar tu voto.
4. Asegúrate de tener Face ID habilitado en tu dispositivo.

¿Necesitas que el Admin PH active Face ID para tu cuenta? Contacta a tu administrador.`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  if (data === "mivoto_manual") {
    await bot.answerCallbackQuery(query.id);
    await bot.sendMessage(
      chatId,
      `✍️ **Voto manual**

Si no tienes Face ID o prefieres votar manualmente:
1. Asiste a la asamblea (presencial o por Zoom).
2. El administrador validará tu identidad.
3. Indica si estás **PRESENCIAL** o **ZOOM**.
4. Te indicarán cómo emitir tu voto.

¿Más dudas? Escribe tu consulta o /start para ver opciones.`,
      { parse_mode: "Markdown" },
    );
    return;
  }
});

async function getAiReply(chatId: number, message: string): Promise<string> {
  const role = userRole[chatId] || "landing";
  const history = (chatHistory[chatId] || []).slice(-10);
  const profile = role === "residente" ? residentProfile[chatId] ?? null : null;
  try {
    const res = await fetch(`${APP_URL}/api/chat/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        role,
        history,
        residentProfile: profile
          ? {
              organization_name: profile.organization_name,
              unit: profile.unit,
              resident_name: profile.resident_name,
            }
          : undefined,
      }),
    });
    const data = await res.json();
    return data.reply || "¿En qué más puedo ayudarte?";
  } catch (err) {
    console.error("[Telegram] Error llamando API IA:", err);
    return "Disculpa, no pude procesar tu mensaje. ¿GEMINI_API_KEY está configurada? Escribe /start para ver opciones.";
  }
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  if (!text) return;

  if (text.startsWith("/")) return;

  const { leadState } = await import("./commands");
  const inLeadFlow = !!leadState[chatId];
  if (inLeadFlow) return;

  // Flujo Mi voto: pedir email si aún no identificado
  const mvState = mivotoState[chatId];
  if (mvState?.step === "awaiting_email") {
    const email = text.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      await bot.sendMessage(chatId, "No parece un correo válido. Envíame tu email registrado como residente.");
      return;
    }
    delete mivotoState[chatId];
    const user = await verifyUserByEmail(email, { roleFilter: "RESIDENTE" });
    if (user) {
      userRole[chatId] = "residente";
      userEmail[chatId] = user.email;
      const profile = await fetchResidentProfile(user.email);
      if (profile) residentProfile[chatId] = profile;
      const phName = profile?.organization_name ?? "tu PH";
      const displayName = profile?.resident_name ?? user.email.split("@")[0];
      await bot.sendMessage(
        chatId,
        `Hola **${displayName}** 👋 Te identifiqué como residente del PH **${phName}**. Aquí están las opciones de voto:`,
        { parse_mode: "Markdown" },
      );
      await sendMivotoOptions(bot, chatId);
    } else {
      await bot.sendMessage(
        chatId,
        `No encontramos ese correo como **residente registrado**. ¿Estás registrado en tu PH? Prueba /registrarme o contacta a tu administrador.`,
        { parse_mode: "Markdown" },
      );
    }
    return;
  }

  // Identificación por correo (pedida en /start)
  const idState = identifyState[chatId];
  if (idState?.step === "awaiting_email") {
    const email = text.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      // Si parece una pregunta o saludo (hola, cómo te llamas, qué es esto...), usar la IA para responder y que se sienta conversacional
      const lower = text.toLowerCase().replace(/\s+/g, " ").trim();
      const isConversational =
        /^(hola|hello|hi|buenas|hey|qué tal|que tal|buenos?\s*d[ií]as|buenas\s*tardes|good\s*morning)/i.test(lower) ||
        /(cómo te llamas|como te llamas|tu nombre|quien eres|quién eres|qué es (este )?chat|que es (este )?chat|qué es esto|que es esto|para qué sirves|ayuda)/i.test(lower) ||
        (lower.length >= 3 && lower.length < 50 && /[a-záéíóúñ]/i.test(lower) && !/^\d+$/.test(lower));
      if (isConversational) {
        (chatHistory[chatId] = chatHistory[chatId] || []).push({ role: "user", text });
        const reply = await getAiReply(chatId, text);
        (chatHistory[chatId] = chatHistory[chatId] || []).push({ role: "assistant", text: reply });
        await bot.sendMessage(
          chatId,
          `${reply}\n\n💡 **Para desbloquear más opciones** (Mi voto, Registrarme, etc.), envía tu **correo electrónico** para identificarte.`,
          { parse_mode: "Markdown" },
        );
        return;
      }
      await bot.sendMessage(chatId, "No parece un correo válido. Envíame tu email para identificarte.");
      return;
    }
    delete identifyState[chatId];
    const user = await verifyUserByEmail(email);
    if (user) {
      const role = dbRoleToBot(user.role);
      userRole[chatId] = role;
      userEmail[chatId] = user.email;

      // Residente: obtener perfil (PH, unidad) igual que la web y mostrar bienvenida con su PH
      if (role === "residente") {
        const profile = await fetchResidentProfile(user.email);
        if (profile) residentProfile[chatId] = profile;
        else residentProfile[chatId] = null;
        const phName = profile?.organization_name ?? "tu PH";
        const actions = getActionButtons(role);
        await bot.sendMessage(
          chatId,
          `Hola **${profile?.resident_name ?? user.email.split("@")[0]}** 👋\n\nTe identifiqué como **Residente** del PH **${phName}**.\n\nSoy Lex, tu asistente para votaciones, asambleas y gestión de tu PH en Chat Vote. ¿En qué te ayudo?`,
          {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: actions.map((a) => [a]) },
          },
        );
        // Registrar canal Telegram como activo (sesión única)
        try {
          await fetch(`${APP_URL}/api/resident/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, channel: "telegram" }),
          });
        } catch (_) {}
      } else {
        const displayName = user.email.split("@")[0];
        const actions = getActionButtons(role);
        await bot.sendMessage(
          chatId,
          `Hola **${displayName}** 👋 Te identifiqué como ${ROLE_LABELS[role] || role}. ¿En qué te ayudo?`,
          {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: actions.map((a) => [a]) },
          },
        );
      }
    } else {
      await bot.sendMessage(
        chatId,
        `No te encontré en el sistema con ese correo. ¿Quieres **registrarte como lead** o elegir un perfil para consultas generales?`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📋 Registrarme como lead", callback_data: "action_registrarme" }],
              ...ROLE_BUTTONS.reply_markup.inline_keyboard,
            ],
          },
        },
      );
    }
    return;
  }

  if (text.toLowerCase() === "hola" || text.toLowerCase() === "hello" || text.toLowerCase() === "hi") {
    if (!userRole[chatId]) {
      await bot.sendMessage(chatId, "¡Hola! 👋 Envía /start e ingresa tu correo para identificarte.", { parse_mode: "Markdown" });
      return;
    }
  }

  (chatHistory[chatId] = chatHistory[chatId] || []).push({ role: "user", text });
  const reply = await getAiReply(chatId, text);
  (chatHistory[chatId] = chatHistory[chatId] || []).push({ role: "assistant", text: reply });

  await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
});
}

async function main() {
  const token = await getTelegramToken();
  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN no configurado. Añádelo en .env o en Panel Henry > Chatbot > Tokens.");
    process.exit(1);
  }
  const bot = new TelegramBot(token, { polling: true });
  console.log("🤖 Chatbot Chat Vote iniciado con éxito!");
  registerCommands(bot);
  registerHandlers(bot);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
