import { NextRequest, NextResponse } from "next/server";

/**
 * Votos "Aprobar orden del día" por asamblea. Clave: unitCode (ej. A1).
 * El chatbot envía POST cuando un residente vota (assemblyId, unitCode del residente, value: SI|NO|ABSTENCION).
 * El monitor lee GET y escribe POST para voto manual; solo pueden votar unidades al día.
 */
const votesByAssembly: Record<string, Record<string, "SI" | "NO" | "ABSTENCION">> = {};

/**
 * GET /api/monitor/order-of-day-vote?assemblyId=...
 * Devuelve los votos actuales para el orden del día (desde chatbot o voto manual). Para mostrar en el tablero del monitor.
 */
export async function GET(request: NextRequest) {
  const assemblyId = request.nextUrl.searchParams.get("assemblyId");
  if (!assemblyId) {
    return NextResponse.json({ error: "assemblyId requerido" }, { status: 400 });
  }
  const votes = votesByAssembly[assemblyId] ?? {};
  return NextResponse.json({ votes });
}

/**
 * POST /api/monitor/order-of-day-vote
 * Registra, actualiza o borra el voto de una unidad (desde chatbot por residente o voto manual del admin).
 * Body: { assemblyId: string, unitCode: string, value: "SI" | "NO" | "ABSTENCION" | null }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      assemblyId?: string;
      unitCode?: string;
      value?: "SI" | "NO" | "ABSTENCION" | null;
    };
    const { assemblyId, unitCode, value } = body;
    if (!assemblyId || !unitCode) {
      return NextResponse.json(
        { error: "assemblyId y unitCode requeridos" },
        { status: 400 }
      );
    }
    if (value !== "SI" && value !== "NO" && value !== "ABSTENCION" && value != null) {
      return NextResponse.json(
        { error: "value debe ser SI, NO, ABSTENCION o null" },
        { status: 400 }
      );
    }
    if (!votesByAssembly[assemblyId]) {
      votesByAssembly[assemblyId] = {};
    }
    if (value == null) {
      delete votesByAssembly[assemblyId][unitCode];
    } else {
      votesByAssembly[assemblyId][unitCode] = value;
    }
    return NextResponse.json({ ok: true, votes: votesByAssembly[assemblyId] });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
