import { NextRequest, NextResponse } from "next/server";
import { buildSummary, generateUnits } from "../../../../lib/monitoringMock";

export async function GET(request: NextRequest) {
  const assemblyId = request.nextUrl.searchParams.get("assemblyId") || "demo";
  const units = generateUnits(assemblyId);
  const summary = buildSummary(units);
  return NextResponse.json({ assemblyId, ...summary });
}
