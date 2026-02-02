"use client";

export default function ResidenteTemaDelDiaPage() {
  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Tema del día</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Información y material de soporte de la votación activa.
        </p>
        <a className="btn btn-ghost" href="/">
          Volver a la landing
        </a>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Aprobación de presupuesto 2026</h3>
        <p className="muted">
          Se requiere validar el presupuesto anual y el plan de inversiones. Revisa los anexos antes de votar.
        </p>
        <button className="btn btn-primary btn-demo" style={{ marginTop: "12px" }}>
          Ver anexos
        </button>
      </div>
    </main>
  );
}
