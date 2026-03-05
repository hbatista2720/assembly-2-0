import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const DEFAULT_PROMPTS = {
  landing: "Eres Lex, asistente de ChatVote.",
  demo: "Eres tutor de ChatVote. Guía al usuario en el demo paso a paso.",
  soporte: "Eres soporte técnico de ChatVote. Resuelve dudas rápidamente.",
  residente: "Ayudas a residentes a votar y ver informacion de asambleas.",
};

/** POST: crea registros iniciales de Telegram y Web en chatbot_config si no existen */
export async function POST() {
  try {
    const defaultBots = [
      { bot_name: "telegram", is_active: true, prompts: DEFAULT_PROMPTS },
      { bot_name: "web", is_active: true, prompts: DEFAULT_PROMPTS },
    ];
    for (const bot of defaultBots) {
      await sql`
        INSERT INTO chatbot_config (bot_name, is_active, prompts)
        VALUES (${bot.bot_name}, ${bot.is_active}, ${sql.json(bot.prompts)}::jsonb)
        ON CONFLICT (bot_name) DO NOTHING
      `;
    }
    const configs = await sql`SELECT * FROM chatbot_config ORDER BY bot_name`;
    return NextResponse.json({ ok: true, configs, message: "Canales Telegram y Web inicializados." });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "42P01") {
      return NextResponse.json(
        { ok: false, error: "La tabla chatbot_config no existe. Ejecuta sql_snippets/chatbot_config.sql en la base de datos." },
        { status: 400 }
      );
    }
    console.error("Error initializing chatbot config:", error);
    return NextResponse.json({ error: "Error al inicializar configuración" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const configs = await sql`
      SELECT *
      FROM chatbot_config
      ORDER BY bot_name
    `;
    return NextResponse.json(configs);
  } catch (error: unknown) {
    const msg = error && typeof error === "object" && "code" in error ? String((error as { code: string }).code) : "";
    if (msg === "42P01") {
      return NextResponse.json([]);
    }
    console.error("Error fetching chatbot config:", error);
    return NextResponse.json({ error: "Error al cargar configuración" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bot_name,
      is_active,
      ai_model,
      temperature,
      max_tokens,
      prompts,
      telegram_bot_username,
    } = body || {};

    if (!bot_name) {
      return NextResponse.json({ error: "bot_name requerido" }, { status: 400 });
    }

    const includeTg = bot_name === "telegram" && telegram_bot_username !== undefined;
    const tgUsername = includeTg ? (String(telegram_bot_username || "").trim() || null) : null;

    let updated: { [key: string]: unknown } | undefined;
    if (includeTg) {
      try {
        [updated] = await sql`
          UPDATE chatbot_config
          SET is_active=${is_active}, ai_model=${ai_model}, temperature=${temperature},
              max_tokens=${max_tokens}, prompts=${prompts != null ? sql.json(prompts) : sql`prompts`}::jsonb,
              telegram_bot_username=${tgUsername}, updated_at=NOW()
          WHERE bot_name=${bot_name}
          RETURNING *
        `;
      } catch (e: unknown) {
        if ((e as { code?: string })?.code === "42703") {
          [updated] = await sql`
            UPDATE chatbot_config
            SET is_active=${is_active}, ai_model=${ai_model}, temperature=${temperature},
                max_tokens=${max_tokens}, prompts=${prompts != null ? sql.json(prompts) : sql`prompts`}::jsonb,
                updated_at=NOW()
            WHERE bot_name=${bot_name}
            RETURNING *
          `;
        } else throw e;
      }
    } else {
      [updated] = await sql`
        UPDATE chatbot_config
        SET is_active=${is_active}, ai_model=${ai_model}, temperature=${temperature},
            max_tokens=${max_tokens}, prompts=${prompts != null ? sql.json(prompts) : sql`prompts`}::jsonb,
            updated_at=NOW()
        WHERE bot_name=${bot_name}
        RETURNING *
      `;
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating chatbot config:", error);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
