/**
 * Contexto de asamblea para residente (§F, §H).
 * Ref: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md
 * BD: Database_DBA/INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md
 *
 * GET ?profile=activa|programada|sin_asambleas → override demo (sin BD).
 * GET ?organization_id=xxx (sin profile) → consultar BD por asamblea activa/programada.
 * Sin params → default "activa".
 */
import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export type AssemblyContext = "activa" | "programada" | "sin_asambleas";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profile = searchParams.get("profile")?.toLowerCase();
    const organizationId = searchParams.get("organization_id")?.trim();

    if (profile === "programada") {
      return NextResponse.json({ context: "programada" as AssemblyContext });
    }
    if (profile === "sin_asambleas" || profile === "sin_asamblea") {
      return NextResponse.json({ context: "sin_asambleas" as AssemblyContext });
    }
    if (profile === "activa") {
      return NextResponse.json({ context: "activa" as AssemblyContext });
    }

    if (organizationId && UUID_REGEX.test(organizationId)) {
      const [row] = await sql<{ status: string }[]>`
        SELECT status FROM assemblies
        WHERE organization_id = ${organizationId}::uuid
          AND status IN ('active', 'scheduled')
        ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, scheduled_at DESC NULLS LAST
        LIMIT 1
      `;
      if (row?.status === "active") {
        return NextResponse.json({ context: "activa" as AssemblyContext });
      }
      if (row?.status === "scheduled") {
        return NextResponse.json({ context: "programada" as AssemblyContext });
      }
      return NextResponse.json({ context: "sin_asambleas" as AssemblyContext });
    }

    return NextResponse.json({ context: "activa" as AssemblyContext });
  } catch (e) {
    console.error("[assembly-context]", e);
    return NextResponse.json({ context: "activa" as AssemblyContext });
  }
}
