import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function GET() {
  try {
    const configs = await sql`
      SELECT *
      FROM chatbot_config
      ORDER BY bot_name
    `;
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching chatbot config:", error);
    return NextResponse.json({ error: "Error al cargar configuración" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { bot_name, is_active, ai_model, temperature, max_tokens, prompts } = body || {};

    if (!bot_name) {
      return NextResponse.json({ error: "bot_name requerido" }, { status: 400 });
    }

    const [updated] = await sql`
      UPDATE chatbot_config
      SET
        is_active = ${is_active},
        ai_model = ${ai_model},
        temperature = ${temperature},
        max_tokens = ${max_tokens},
        prompts = ${sql.json(prompts)}::jsonb,
        updated_at = NOW()
      WHERE bot_name = ${bot_name}
      RETURNING *
    `;

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating chatbot config:", error);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
