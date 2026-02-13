import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";
import { buildSummary, generateUnits } from "../../../../lib/monitoringMock";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const topicId = request.nextUrl.searchParams.get("topicId") ?? undefined;
  const topicTitle = request.nextUrl.searchParams.get("topicTitle") ?? undefined;
  if (!token) {
    return NextResponse.json({ error: "token es requerido" }, { status: 400 });
  }

  const summaryOptions = (topicId != null || (topicTitle != null && topicTitle.trim() !== ""))
    ? { topicId, topicTitle: topicTitle ?? undefined }
    : undefined;

  if (token === "demo-token") {
    const units = generateUnits("demo");
    const summary = buildSummary(units, summaryOptions);
    const topics = [
      { id: "current", label: summary.votation.topic },
      ...summary.history.map((h, i) => ({ id: `tema-${i + 1}`, label: h })),
    ];
    return NextResponse.json({
      assemblyId: "demo",
      ...summary,
      units,
      topics,
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
    const summary = buildSummary(units, summaryOptions);
    const topics = [
      { id: "current", label: summary.votation.topic },
      ...summary.history.map((h, i) => ({ id: `tema-${i + 1}`, label: h })),
    ];
    return NextResponse.json({
      assemblyId,
      ...summary,
      units,
      topics,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo validar token" }, { status: 500 });
  }
}
