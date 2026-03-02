#!/usr/bin/env node
/**
 * Verifica que el token de Telegram sea correcto.
 * Uso: npm run telegram:verify
 */

const path = require("path");
const fs = require("fs");

function loadEnv() {
  const root = path.resolve(__dirname, "..");
  for (const name of [".env", ".env.local"]) {
    const p = path.join(root, name);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const m = line.match(/^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$/);
        if (m) {
          return m[1].replace(/^["']|["']$/g, "").trim();
        }
      }
    }
  }
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

const token = loadEnv();

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN no está configurado en .env o .env.local");
  process.exit(1);
}

console.log("Verificando token...");

fetch(`https://api.telegram.org/bot${token}/getMe`)
  .then((res) => res.json())
  .then((data) => {
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
  })
  .catch((err) => {
    console.error("❌ Error al verificar:", err.message);
    process.exit(1);
  });
