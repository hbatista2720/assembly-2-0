"use client";

/**
 * Estado de carga mientras se resuelve la página del dashboard admin-ph.
 * Next.js lo muestra al navegar entre módulos, reduciendo la percepción de demora.
 */
export default function AdminPhLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "240px" }}>
      <div className="card" style={{ padding: "32px 24px", textAlign: "center" }}>
        <p className="muted" style={{ margin: 0 }}>Cargando…</p>
      </div>
    </div>
  );
}
