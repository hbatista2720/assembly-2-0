import { NextRequest, NextResponse } from "next/server";

/**
 * Almacén en memoria del último evento de notificación por asamblea.
 * El chatbot (o cliente residente) puede consultar GET para mostrar el aviso a residentes activos.
 */
const lastNotifyByAssembly: Record<
  string,
  { event: string; label: string; at: string }
> = {};

/**
 * GET /api/monitor/notify-residents?assemblyId=...
 * Devuelve la última notificación para esta asamblea (para mostrar a residentes en el chatbot).
 */
export async function GET(request: NextRequest) {
  const assemblyId = request.nextUrl.searchParams.get("assemblyId");
  if (!assemblyId) {
    return NextResponse.json(
      { error: "assemblyId requerido" },
      { status: 400 }
    );
  }
  const last = lastNotifyByAssembly[assemblyId];
  return NextResponse.json(last ?? null);
}

/**
 * POST /api/monitor/notify-residents
 * Registra un evento para notificar a residentes activos en el chatbot.
 * Body: { assemblyId: string, event: string, label?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      assemblyId?: string;
      event?: string;
      label?: string;
    };
    const assemblyId = body.assemblyId;
    const event = body.event ?? "event";
    const label = body.label ?? event;
    if (!assemblyId) {
      return NextResponse.json(
        { error: "assemblyId requerido" },
        { status: 400 }
      );
    }
    lastNotifyByAssembly[assemblyId] = {
      event,
      label,
      at: new Date().toISOString(),
    };
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
