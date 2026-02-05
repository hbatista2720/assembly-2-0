import TelegramBot from "node-telegram-bot-api";
import { sql } from "../lib/db";

const leadState: Record<number, { step: string; email?: string; phone?: string; company_name?: string }> = {};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.split("@")[1]?.toLowerCase().includes("tempmail");
}

function leadScore(email: string, phone: string, company: string): number {
  let s = 0;
  if (isValidEmail(email)) s += 25;
  if (phone.length >= 8) s += 20;
  if (company.length >= 2) s += 25;
  return Math.min(100, s + 30);
}

export function registerCommands(bot: TelegramBot) {
  bot.onText(/\/registrarme/, async (msg) => {
    const chatId = msg.chat.id;
    leadState[chatId] = { step: "email" };
    await bot.sendMessage(chatId, "📋 Para registrarte como lead, envíame tu **correo electrónico**.", {
      parse_mode: "Markdown",
    });
  });

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

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = (msg.text || "").trim();
    const state = leadState[chatId];
    if (!state || !text) return;

    if (state.step === "email") {
      if (!isValidEmail(text)) {
        await bot.sendMessage(chatId, "No parece un correo válido. Envíame un email correcto.");
        return;
      }
      state.email = text;
      state.step = "phone";
      await bot.sendMessage(chatId, "Gracias. Ahora envíame tu **teléfono** (con código de país si es posible).", {
        parse_mode: "Markdown",
      });
      return;
    }
    if (state.step === "phone") {
      state.phone = text;
      state.step = "company";
      await bot.sendMessage(chatId, "¿Nombre de tu PH o empresa?");
      return;
    }
    if (state.step === "company") {
      state.company_name = text;
      try {
        const score = leadScore(state.email!, state.phone!, state.company_name!);
        const qualified = score >= 60;
        await sql`
          INSERT INTO platform_leads (email, phone, company_name, lead_source, lead_score, lead_qualified, funnel_stage, telegram_id, qualification_data, updated_at)
          VALUES (${state.email!}, ${state.phone!}, ${state.company_name!}, 'chatbot', ${score}, ${qualified}, ${qualified ? "qualified" : "new"}, ${msg.from?.id?.toString() ?? null}, ${JSON.stringify({ via: "telegram_registrarme" })}::jsonb, NOW())
          ON CONFLICT (email) DO UPDATE SET
            phone = COALESCE(EXCLUDED.phone, platform_leads.phone),
            company_name = COALESCE(EXCLUDED.company_name, platform_leads.company_name),
            lead_score = GREATEST(platform_leads.lead_score, EXCLUDED.lead_score),
            lead_qualified = platform_leads.lead_qualified OR EXCLUDED.lead_qualified,
            funnel_stage = CASE WHEN platform_leads.funnel_stage = 'converted' THEN 'converted' ELSE EXCLUDED.funnel_stage END,
            telegram_id = COALESCE(EXCLUDED.telegram_id, platform_leads.telegram_id),
            last_interaction_at = NOW(),
            updated_at = NOW()
        `;
        await bot.sendMessage(
          chatId,
          "✅ Listo. Te hemos registrado como lead. Un asesor te contactará pronto. ¿Quieres probar el demo? Escribe /demo",
          { parse_mode: "Markdown" },
        );
      } catch (e) {
        console.error("Error guardando lead:", e);
        await bot.sendMessage(chatId, "Hubo un error al guardar. Intenta más tarde o contacta soporte.");
      }
      delete leadState[chatId];
    }
  });
}
