"use client";

export default function ResidentePoderPage() {
  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Ceder poder</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Envía tu poder digital y el sistema lo valida en minutos.
        </p>
        <a className="btn btn-ghost" href="/">
          Volver a la landing
        </a>
      </div>

      <div className="card">
        <label style={{ display: "grid", gap: "8px" }}>
          Correo del apoderado
          <input
            type="email"
            placeholder="apoderado@correo.com"
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(15, 23, 42, 0.6)",
              color: "#e2e8f0",
            }}
          />
        </label>
        <button className="btn btn-primary btn-demo" style={{ marginTop: "16px" }}>
          Enviar poder
        </button>
      </div>
    </main>
  );
}
