const VOTATIONS = [
  { topic: "Aprobación presupuesto 2026", status: "Activa", participation: "67/95", result: "63% SI" },
  { topic: "Elección junta directiva", status: "Programada", participation: "0/170", result: "Pendiente" },
  { topic: "Acta anterior", status: "Cerrada", participation: "95/95", result: "92% SI" },
];

export default function VotationsPage() {
  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Votaciones</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Control y resultados de votaciones en tiempo real.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn">Nueva votación</button>
          <a className="btn btn-primary" href="/dashboard/admin-ph/assemblies">
            Ir a asambleas
          </a>
        </div>
      </div>

      <div className="card-list" style={{ marginTop: "18px" }}>
        {VOTATIONS.map((vote) => (
          <div key={vote.topic} className="list-item" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong>{vote.topic}</strong>
              <div className="muted" style={{ fontSize: "12px" }}>
                Estado: {vote.status} · Participacion: {vote.participation}
              </div>
            </div>
            <span className="chip">{vote.result}</span>
            <button className="btn btn-ghost">Ver detalle</button>
          </div>
        ))}
      </div>
    </div>
  );
}
const VOTES = [
  { label: "Aprobacion presupuesto 2026", yes: 63, no: 27, abstain: 10 },
  { label: "Eleccion junta directiva", yes: 58, no: 32, abstain: 10 },
];

export default function VotationsPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Votaciones</span>
            <h1 style={{ margin: "12px 0 6px" }}>Resultados en tiempo real</h1>
            <p className="muted" style={{ margin: 0 }}>
              Control de quorum, participacion y resultados por tema.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-ghost">Ver historial</button>
            <button className="btn btn-primary">Crear votacion</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Votacion activa</h3>
        <div className="list-item" style={{ alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <strong>Aprobacion presupuesto 2026</strong>
            <div className="muted" style={{ fontSize: "13px" }}>
              67 votaron · 95 presentes · quorum alcanzado
            </div>
          </div>
          <button className="btn btn-primary">Cerrar votacion</button>
        </div>
      </div>

      <div className="chart-grid">
        {VOTES.map((vote) => (
          <div key={vote.label} className="chart-card">
            <h3 style={{ marginTop: 0 }}>{vote.label}</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { label: "SI", value: vote.yes, color: "#10b981" },
                { label: "NO", value: vote.no, color: "#ef4444" },
                { label: "ABS", value: vote.abstain, color: "#f59e0b" },
              ].map((row) => (
                <div key={row.label} style={{ display: "grid", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{row.label}</span>
                    <span className="muted">{row.value}%</span>
                  </div>
                  <div className="chart-bar">
                    <span style={{ width: `${row.value}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn" style={{ marginTop: "16px" }}>
              Ver detalle
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
