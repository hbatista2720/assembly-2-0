import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";
import { buildSummary, generateUnits } from "../../../../lib/monitoringMock";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token es requerido" }, { status: 400 });
  }

  if (token === "demo-token") {
    const units = generateUnits("demo");
    return NextResponse.json({
      assemblyId: "demo",
      ...buildSummary(units),
    });
  }

  try {
    const [record] = await sql`
      SELECT assembly_id, expires_at
      FROM presenter_tokens
      WHERE token = ${token}
      LIMIT 1
    `;

    if (!record) {
      return NextResponse.json({ error: "Token inválido" }, { status: 404 });
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: "Token expirado" }, { status: 410 });
    }

    const assemblyId = record.assembly_id as string;
    const units = generateUnits(assemblyId);
    return NextResponse.json({
      assemblyId,
      ...buildSummary(units),
    });
  } catch {
    return NextResponse.json({ error: "No se pudo validar token" }, { status: 500 });
  }
}
