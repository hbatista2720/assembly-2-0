import { NextResponse } from "next/server";

/** Límites para suscripción demo (Urban Tower PH: 1 edificio, 50 residentes). */
const DEMO_LIMITS = {
  plan: "DEMO",
  organizations: { current: 1, limit: 1, percentage: 100, exceeded: false },
  units: { current: 0, limit: 50, percentage: 0, exceeded: false },
  assemblies: { current: 2, limit: 2, percentage: 100, exceeded: false },
  needs_upgrade: false,
  show_banner: false,
};

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

  if (subscriptionId === "demo-subscription" || subscriptionId?.toLowerCase().includes("demo")) {
    return NextResponse.json(DEMO_LIMITS);
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
