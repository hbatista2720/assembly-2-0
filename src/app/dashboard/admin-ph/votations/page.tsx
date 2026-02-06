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
