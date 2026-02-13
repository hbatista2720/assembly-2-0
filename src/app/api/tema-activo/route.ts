import { NextRequest, NextResponse } from "next/server";

/** Estado del tema activo para residentes/chatbot; actualizado desde el Monitor Back Office. */
let temaActivoStore: { title: string; status: "Abierto" | "Cerrado"; id?: string } = {
  title: "Aprobación de presupuesto",
  status: "Abierto",
  id: "tema-demo",
};

/**
 * GET /api/tema-activo
 * Devuelve el tema del día y estado de votación para residentes (chatbot).
 */
export async function GET() {
  try {
    return NextResponse.json({
      title: temaActivoStore.title,
      status: temaActivoStore.status,
      id: temaActivoStore.id,
    });
  } catch {
    return NextResponse.json(
      { title: temaActivoStore.title, status: temaActivoStore.status },
      { status: 200 }
    );
  }
}

/**
 * POST /api/tema-activo
 * Actualiza el tema activo (desde Monitor Back Office). Sincroniza con chatbot de residentes.
 * Body: { title?: string, status?: "Abierto" | "Cerrado", id?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { title?: string; status?: "Abierto" | "Cerrado"; id?: string };
    if (body.title != null) temaActivoStore.title = body.title;
    if (body.status === "Abierto" || body.status === "Cerrado") temaActivoStore.status = body.status;
    if (body.id != null) temaActivoStore.id = body.id;
    return NextResponse.json({ ok: true, tema: temaActivoStore });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
