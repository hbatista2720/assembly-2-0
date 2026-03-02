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

const token = await getTelegramToken();
if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN no configurado. Añádelo en .env o en Panel Henry > Chatbot > Tokens.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Chatbot Assembly 2.0 iniciado con éxito!");

registerCommands(bot);

const userRole: Record<number, string> = {};
const userEmail: Record<number, string> = {};
const chatHistory: Record<number, Array<{ role: string; text: string }>> = {};
const identifyState: Record<number, { step: "awaiting_email" }> = {};
const mivotoState: Record<number, { step: "awaiting_email" }> = {};

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
    `🗳️ **Tu voto en Assembly 2.0**

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

async function getBotConfig() {
  const [config] = await sql`
    SELECT *
    FROM chatbot_config
    WHERE bot_name = 'telegram' AND is_active = TRUE
  `;
  return config;
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  console.log("[Telegram] /start recibido, chatId:", chatId);
  delete userRole[chatId];
  delete userEmail[chatId];
  delete chatHistory[chatId];
  delete mivotoState[chatId];
  identifyState[chatId] = { step: "awaiting_email" };
  try {
    const config = await getBotConfig();
    if (!config) {
      await bot.sendMessage(chatId, "Chatbot temporalmente desactivado.");
      return;
    }
    await bot.sendMessage(
      chatId,
      `¡Hola! 👋 Soy **Lex**, el asistente de Assembly 2.0.

Para ayudarte, necesito identificarte. **Envía tu correo electrónico** para continuar.`,
      { parse_mode: "Markdown" },
    );
  } catch (err) {
    console.error("[Telegram] Error en /start:", err);
    try {
      await bot.sendMessage(chatId, "¡Hola! 👋 Soy Lex. Error de conexión. Intenta más tarde.");
    } catch (_) {}
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
  try {
    const res = await fetch(`${APP_URL}/api/chat/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, role, history }),
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
    try {
      const [user] = await sql<{ id: string; email: string; role: string; nombre?: string }[]>`
        SELECT id, email, role, nombre
        FROM users
        WHERE LOWER(email) = ${email} AND role = 'RESIDENTE'
        LIMIT 1
      `;
      delete mivotoState[chatId];
      if (user) {
        userRole[chatId] = "residente";
        userEmail[chatId] = user.email;
        const displayName = user.nombre || user.email.split("@")[0];
        await bot.sendMessage(chatId, `Hola **${displayName}** 👋 Te identifiqué. Aquí están las opciones de voto:`, {
          parse_mode: "Markdown",
        });
        await sendMivotoOptions(bot, chatId);
      } else {
        await bot.sendMessage(
          chatId,
          `No encontramos ese correo como **residente registrado**. ¿Estás registrado en tu PH? Prueba /registrarme o contacta a tu administrador.`,
          { parse_mode: "Markdown" },
        );
      }
    } catch (err) {
      console.error("[Telegram] Error en flujo Mi voto:", err);
      await bot.sendMessage(chatId, "Error al verificar. Intenta más tarde o escribe /start.");
    }
    return;
  }

  // Identificación por correo (pedida en /start)
  const idState = identifyState[chatId];
  if (idState?.step === "awaiting_email") {
    const email = text.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      await bot.sendMessage(chatId, "No parece un correo válido. Envíame tu email para identificarte.");
      return;
    }
    try {
      const [user] = await sql<{ id: string; email: string; role: string; nombre?: string }[]>`
        SELECT id, email, role, nombre
        FROM users
        WHERE LOWER(email) = ${email}
        LIMIT 1
      `;
      delete identifyState[chatId];
      if (user) {
        const role = dbRoleToBot(user.role);
        userRole[chatId] = role;
        userEmail[chatId] = user.email;
        const displayName = user.nombre || user.email.split("@")[0];
        const actions = getActionButtons(role);
        await bot.sendMessage(
          chatId,
          `Hola **${displayName}** 👋 Te identifiqué como ${ROLE_LABELS[role] || role}. ¿En qué te ayudo?`,
          {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: actions.map((a) => [a]) },
          },
        );
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
    } catch (err) {
      console.error("[Telegram] Error buscando usuario por email:", err);
      await bot.sendMessage(chatId, "Error al verificar. Intenta más tarde o escribe /start.");
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
