import { NextRequest, NextResponse } from "next/server";
import { buildSummary, generateUnits } from "../../../../lib/monitoringMock";

export async function GET(request: NextRequest) {
  const assemblyId = request.nextUrl.searchParams.get("assemblyId") || "demo";
  const demo = request.nextUrl.searchParams.get("demo") === "1" || request.nextUrl.searchParams.get("demo") === "true";
  const topicId = request.nextUrl.searchParams.get("topicId") ?? undefined;
  const topicTitle = request.nextUrl.searchParams.get("topicTitle") ?? undefined;
  const units = generateUnits(assemblyId, demo);
  const summary = buildSummary(units, { topicId, topicTitle });
  return NextResponse.json({ assemblyId, ...summary });
}
