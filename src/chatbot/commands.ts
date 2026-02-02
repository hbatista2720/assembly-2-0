import TelegramBot from "node-telegram-bot-api";

export function registerCommands(bot: TelegramBot) {
  bot.onText(/\/mivoto/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id.toString() || "";

    const reply = `🗳️ **Tu voto en Assembly 2.0**

Puedes votar de 2 formas:
✅ **Face ID (recomendado)**: firma biométrica en tu dispositivo.
✅ **Manual**: si no tienes Face ID o falla el registro.

Si votas manual:
• El administrador valida tu identidad
• Indica si estás **PRESENCIAL** o **ZOOM**

¿Quieres que te guíe con Face ID o con voto manual?`;

    try {
      await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
      console.log("Mensaje enviado", { telegramId, command: "/mivoto" });
    } catch (error) {
      console.error("Error en /mivoto:", error);
    }
  });
}
