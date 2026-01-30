import TelegramBot from "node-telegram-bot-api";
import { registerCommands } from "./commands";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || "", { polling: true });

console.log("🤖 Chatbot Assembly 2.0 iniciado con éxito!");

registerCommands(bot);

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `¡Hola! 👋 Soy Lex, el asistente inteligente de **Assembly 2.0**.

¿Eres administrador, junta o residente?`;
  await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });
});
