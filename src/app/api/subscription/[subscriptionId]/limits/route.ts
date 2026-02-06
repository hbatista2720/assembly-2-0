import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ subscriptionId: string }> }) {
  const { subscriptionId } = await params;

  if (subscriptionId?.toLowerCase().includes("enterprise")) {
    return NextResponse.json({
      plan: "ENTERPRISE",
      organizations: { current: 0, limit: null, percentage: 0, exceeded: false },
      units: { current: 0, limit: null, percentage: 0, exceeded: false },
      assemblies: { current: 0, limit: null, percentage: 0, exceeded: false },
      needs_upgrade: false,
      show_banner: false,
    });
  }

  return NextResponse.json({
    plan: "MULTI_PH_LITE",
    organizations: { current: 9, limit: 10, percentage: 90, exceeded: false },
    units: { current: 1200, limit: 1500, percentage: 80, exceeded: false },
    assemblies: { current: 4, limit: 5, percentage: 80, exceeded: false },
    needs_upgrade: false,
    show_banner: true,
  });
}
