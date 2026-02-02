import { NextRequest, NextResponse } from "next/server";
import { generateUnits } from "../../../../lib/monitoringMock";

export async function GET(request: NextRequest) {
  const assemblyId = request.nextUrl.searchParams.get("assemblyId") || "demo";
  const units = generateUnits(assemblyId);
  return NextResponse.json({ assemblyId, units });
}
