#!/usr/bin/env node
/**
 * Verifica que el token de Telegram sea correcto.
 * Uso: npm run telegram:verify
 */

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
config({ path: path.join(root, ".env") });
config({ path: path.join(root, ".env.local") });

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN no está configurado en .env o .env.local");
  process.exit(1);
}

console.log("Verificando token...");

try {
  const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const data = await res.json();

  if (data.ok && data.result) {
    const bot = data.result;
    console.log("");
    console.log("✅ Token válido");
    console.log("   Bot: @" + bot.username);
    console.log("   Nombre:", bot.first_name);
    console.log("   ID:", bot.id);
    console.log("");
    console.log("Enlace: https://t.me/" + bot.username);
  } else {
    console.error("❌ Token inválido:", data.description || data);
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Error al verificar:", err.message);
  process.exit(1);
}
