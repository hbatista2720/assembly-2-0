export default function AdminPhDashboard() {
  return (
    <main className="container">
      <div className="card glass">
        <h1 style={{ marginTop: 0 }}>Dashboard Administrador PH</h1>
        <p className="muted" style={{ marginTop: "8px" }}>
          Vista demo en construcción. Accede al panel de voto manual desde una asamblea en vivo.
        </p>
        <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a className="btn btn-primary btn-demo" href="/dashboard/admin-ph/assembly/123/live">
            Ir a voto manual
          </a>
          <a className="btn btn-ghost" href="/">
            Volver a landing
          </a>
        </div>
      </div>
    </main>
  );
}
