import { NextRequest, NextResponse } from "next/server";
import { generateUnits } from "../../../../lib/monitoringMock";

export async function GET(request: NextRequest) {
  const assemblyId = request.nextUrl.searchParams.get("assemblyId") || "demo";
  const demo = request.nextUrl.searchParams.get("demo") === "1" || request.nextUrl.searchParams.get("demo") === "true";
  const units = generateUnits(assemblyId, demo);
  return NextResponse.json({ assemblyId, units });
}
