"use client";

export default function ResidenteVotacionPage() {
  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Votación activa</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Revisa el tema del día y emite tu voto con trazabilidad legal.
        </p>
        <a className="btn btn-ghost" href="/">
          Volver a la landing
        </a>
      </div>

      <div className="card">
        <div className="list-item">
          <span>Tema del día</span>
          <strong>Aprobación de presupuesto</strong>
        </div>
        <div className="list-item">
          <span>Estado</span>
          <strong>Abierto</strong>
        </div>
        <button className="btn btn-primary btn-demo" style={{ marginTop: "16px" }}>
          Emitir voto
        </button>
      </div>
    </main>
  );
}
