"use client";

/**
 * FASE 10: Menú Demo (Sandbox). Punto de entrada para probar Chat Vote con datos de ejemplo.
 */

export default function DemoPage() {
  return (
    <main className="container">
      <div
        className="card"
        style={{
          maxWidth: "640px",
          margin: "48px auto",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <span className="pill" style={{ marginBottom: "12px" }}>
          Sandbox
        </span>
        <h1 style={{ marginTop: 0 }}>Probar Chat Vote en modo demo</h1>
        <p style={{ color: "#cbd5f5", marginBottom: "24px" }}>
          Accede a un PH ficticio con asamblea de prueba, votación simulada y datos que se reinician cada 24h.
        </p>
        <div className="card-list" style={{ textAlign: "left", marginBottom: "28px" }}>
          <div className="list-item">
            <span>✅</span>
            <span>PH de ejemplo pre-cargado</span>
          </div>
          <div className="list-item">
            <span>✅</span>
            <span>Asamblea de prueba lista</span>
          </div>
          <div className="list-item">
            <span>✅</span>
            <span>Votación simulada en tiempo real</span>
          </div>
          <div className="list-item">
            <span>🔄</span>
            <span>Reset automático cada 24h</span>
          </div>
        </div>
        <a
          href="/login?demo=1"
          className="btn btn-primary"
          style={{ fontSize: "18px", padding: "14px 28px" }}
        >
          Entrar al demo
        </a>
        <p className="muted" style={{ marginTop: "20px", fontSize: "13px" }}>
          Usa el correo <strong>demo@assembly2.com</strong> y el código OTP que recibas (o 123456 en modo debug).
        </p>
      </div>
    </main>
  );
}
