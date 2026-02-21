"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { findAssembly } from "../../../../../../lib/assembliesStore";

export default function AssemblyVotePage() {
  const params = useParams();
  const assemblyId = typeof params?.id === "string" ? params.id : "";
  const assembly = useMemo(() => (assemblyId ? findAssembly(assemblyId) : null), [assemblyId]);

  if (!assembly) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Asamblea no encontrada</h2>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <span className="pill">Control de votación</span>
          <h2 style={{ marginTop: "8px" }}>{assembly.title}</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            {assembly.date.replace("T", " ")} · {assembly.attendeesCount} electores
          </p>
        </div>
        <Link className="btn btn-ghost" href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(assembly.id)}`}>
          Detalle de asamblea
        </Link>
        <Link className="btn" href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assembly.id)}`}>
          Monitor Back Office
        </Link>
        <a className="btn btn-primary" href={`/presenter/demo-token?assemblyId=${encodeURIComponent(assembly.id)}`} target="_blank" rel="noopener noreferrer">
          Vista presentación
        </a>
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <h3 style={{ marginTop: 0 }}>¿Cómo se gestiona el voto?</h3>
        <ul className="muted" style={{ marginBottom: 0, paddingLeft: "20px" }}>
          <li><strong>Activar / desactivar votación por tema:</strong> en el <Link href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(assembly.id)}`}>detalle de la asamblea</Link>, en cada tema use &quot;Activar votación&quot; o &quot;Desactivar votación&quot;. Así los residentes pueden votar desde el chatbot cuando el tema está abierto.</li>
          <li><strong>Voto manual por unidad:</strong> si debe asignar o corregir el voto de una unidad concreta, use el <Link href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assembly.id)}`}>Monitor Back Office</Link>: haga clic en la casilla de la unidad y aplique el voto (con comentario si modifica).</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <h3 style={{ marginTop: 0 }}>Accesos rápidos</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <Link className="btn btn-primary" href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(assembly.id)}`}>
            Ir a detalle · Activar/desactivar temas
          </Link>
          <Link className="btn btn-ghost" href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assembly.id)}`}>
            Monitor Back Office · Voto manual por unidad
          </Link>
        </div>
      </div>
    </div>
  );
}
