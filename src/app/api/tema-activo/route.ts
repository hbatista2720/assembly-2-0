import { NextResponse } from "next/server";

/**
 * GET /api/tema-activo
 * Devuelve el tema del día y estado de votación para residentes.
 * Por ahora valores por defecto; luego puede leer de BD (asamblea activa, tema en votación).
 */
export async function GET() {
  try {
    // TODO: leer de BD (asamblea activa, tema en votación, estado abierto/cerrado)
    const tema = {
      title: "Aprobación de presupuesto",
      status: "Abierto" as const,
      id: "tema-demo",
    };
    return NextResponse.json(tema);
  } catch {
    return NextResponse.json(
      { title: "Aprobación de presupuesto", status: "Abierto" },
      { status: 200 }
    );
  }
}
