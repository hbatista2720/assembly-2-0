/**
 * Runner para el bot de Telegram en Docker/Node 20.
 * Evita ERR_UNKNOWN_FILE_EXTENSION usando ts-node/register en contexto CommonJS.
 */
require("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "CommonJS", moduleResolution: "node" },
});
require("../src/chatbot/index.ts");
