/**
 * Contexto de asamblea para residente (§F, §H)
 * Ref: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md
 *
 * GET ?profile=activa|programada|sin_asambleas (demo)
 * Sin query: default "activa". Luego puede derivar de BD/tema-activo.
 */
import { NextResponse } from "next/server";

export type AssemblyContext = "activa" | "programada" | "sin_asambleas";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profile = searchParams.get("profile")?.toLowerCase();

    if (profile === "programada") {
      return NextResponse.json({ context: "programada" as AssemblyContext });
    }
    if (profile === "sin_asambleas" || profile === "sin_asamblea") {
      return NextResponse.json({ context: "sin_asambleas" as AssemblyContext });
    }
    if (profile === "activa") {
      return NextResponse.json({ context: "activa" as AssemblyContext });
    }

    return NextResponse.json({ context: "activa" as AssemblyContext });
  } catch {
    return NextResponse.json({ context: "programada" as AssemblyContext });
  }
}
