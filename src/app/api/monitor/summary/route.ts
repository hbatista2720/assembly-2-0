import { NextRequest, NextResponse } from "next/server";
import { applyTopicVotes, buildSummary, generateUnits } from "../../../../lib/monitoringMock";

export async function GET(request: NextRequest) {
  const assemblyId = request.nextUrl.searchParams.get("assemblyId") || "demo";
  const demo = request.nextUrl.searchParams.get("demo") === "1" || request.nextUrl.searchParams.get("demo") === "true";
  const topicId = request.nextUrl.searchParams.get("topicId") ?? null;
  const topicTitle = request.nextUrl.searchParams.get("topicTitle") ?? null;
  let units = generateUnits(assemblyId, demo);
  units = applyTopicVotes(units, topicId, topicTitle);
  const summary = buildSummary(units, { topicId: topicId ?? undefined, topicTitle: topicTitle ?? undefined });
  return NextResponse.json({ assemblyId, ...summary });
}
