import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "../../../../lib/db";

const ensurePresenterTokensTable = async () => {
  await sql`
    DO $$
    BEGIN
      IF to_regclass('public.presenter_tokens') IS NULL THEN
        IF to_regclass('public.assemblies') IS NULL THEN
          CREATE TABLE presenter_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            assembly_id UUID NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        ELSE
          CREATE TABLE presenter_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            assembly_id UUID NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        END IF;

        CREATE INDEX IF NOT EXISTS idx_presenter_tokens_assembly ON presenter_tokens(assembly_id);
        CREATE INDEX IF NOT EXISTS idx_presenter_tokens_token ON presenter_tokens(token);
      END IF;
    END
    $$;
  `;
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const assemblyId = body?.assemblyId;

  if (!assemblyId) {
    return NextResponse.json({ error: "assemblyId es requerido" }, { status: 400 });
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assemblyId);
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (!isUuid) {
    return NextResponse.json({
      presenter_url: "/presenter/demo-token",
      expires_at: expiresAt.toISOString(),
      warning: "assemblyId no es UUID, token en modo demo.",
    });
  }

  try {
    await ensurePresenterTokensTable();
    await sql`
      INSERT INTO presenter_tokens (assembly_id, token, expires_at)
      VALUES (${assemblyId}::UUID, ${token}, ${expiresAt.toISOString()})
    `;
  } catch {
    return NextResponse.json(
      {
        presenter_url: `/presenter/${token}`,
        expires_at: expiresAt.toISOString(),
        warning: "No se pudo guardar el token en BD.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    presenter_url: `/presenter/${token}`,
    expires_at: expiresAt.toISOString(),
  });
}
