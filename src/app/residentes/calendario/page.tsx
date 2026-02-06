"use client";

export default function ResidenteCalendarioPage() {
  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Calendario</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Próximas actividades y fechas clave del PH.
        </p>
        <a className="btn btn-ghost" href="/chat">
          Volver al chat
        </a>
      </div>

      <div className="card">
        <div className="list-item">
          <span>Asamblea ordinaria</span>
          <strong>10 Feb 2026 · 7:00 pm</strong>
        </div>
        <div className="list-item">
          <span>Entrega de poderes</span>
          <strong>07 Feb 2026 · 5:00 pm</strong>
        </div>
        <div className="list-item">
          <span>Votación abierta</span>
          <strong>10 Feb 2026 · 7:30 pm</strong>
        </div>
      </div>
    </main>
  );
}
