import TelegramBot from "node-telegram-bot-api";
import { registerCommands } from "./commands";
import { sql } from "../lib/db";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || "", { polling: true });

console.log("🤖 Chatbot Assembly 2.0 iniciado con éxito!");

registerCommands(bot);

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
  const config = await getBotConfig();
  if (!config) {
    await bot.sendMessage(chatId, "Chatbot temporalmente desactivado.");
    return;
  }

  const landingPrompt = config.prompts?.landing;
  const welcomeMessage =
    landingPrompt ||
    `¡Hola! 👋 Soy Lex, el asistente inteligente de **Assembly 2.0**.

¿Eres administrador, junta o residente?`;
  await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });
});
