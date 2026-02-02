const UPCOMING = [
  {
    title: "Asamblea Ordinaria 2026",
    date: "15 Feb 2026 · 6:00 PM",
    attendees: "170 electores",
    faceId: "130 con Face ID",
  },
  {
    title: "Asamblea Extraordinaria - Piscina",
    date: "28 Feb 2026 · 7:00 PM",
    attendees: "200 electores",
    faceId: "135 con Face ID",
  },
];

const COMPLETED = [
  "Asamblea Ordinaria 2025 · 20 Dic 2025 · Acta generada",
  "Asamblea Extraordinaria · 15 Nov 2025 · Acta generada",
  "Asamblea Extraordinaria · 10 Oct 2025 · Acta generada",
];

export default function AssembliesPage() {
  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Asambleas</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Crear, programar y ejecutar asambleas en vivo.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn">Filtros</button>
          <button className="btn btn-primary">Crear asamblea</button>
        </div>
      </div>

      <div style={{ marginTop: "18px", display: "grid", gap: "16px" }}>
        {UPCOMING.map((item) => (
          <div key={item.title} className="list-item" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong>{item.title}</strong>
              <div className="muted" style={{ fontSize: "12px" }}>
                {item.date} · {item.attendees} · {item.faceId}
              </div>
            </div>
            <a className="btn btn-ghost" href="/dashboard/admin-ph/assembly/123/live">
              Iniciar
            </a>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "24px" }}>
        <h3 style={{ margin: "0 0 10px" }}>Completadas</h3>
        <div className="card-list">
          {COMPLETED.map((item) => (
            <div key={item} className="list-item">
              <span>✅</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const UPCOMING = [
  {
    title: "Asamblea Ordinaria 2026",
    date: "15 Feb 2026 · 6:00 PM",
    info: "200 invitados · 130 con Face ID",
  },
  {
    title: "Asamblea Extraordinaria - Piscina",
    date: "28 Feb 2026 · 7:00 PM",
    info: "200 invitados · 135 con Face ID",
  },
];

const COMPLETED = [
  { title: "Asamblea Ordinaria 2025", date: "20 Dic 2025", status: "Acta generada" },
  { title: "Asamblea Extraordinaria", date: "15 Nov 2025", status: "Acta generada" },
  { title: "Asamblea Extraordinaria - Mantenimiento", date: "10 Oct 2025", status: "Acta generada" },
];

export default function AssembliesPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Asambleas</span>
            <h1 style={{ margin: "12px 0 6px" }}>Gestor de asambleas</h1>
            <p className="muted" style={{ margin: 0 }}>
              Programa, prepara convocatorias y activa votaciones en vivo.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-ghost">Filtros</button>
            <button className="btn btn-primary">Crear Asamblea</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Proximas asambleas</h3>
        <div className="card-list">
          {UPCOMING.map((assembly) => (
            <div key={assembly.title} className="list-item" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <strong>{assembly.title}</strong>
                <div className="muted" style={{ fontSize: "13px" }}>
                  {assembly.date} · {assembly.info}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button className="btn btn-ghost">Ver detalles</button>
                <a className="btn btn-primary" href="/dashboard/admin-ph/assembly/123/live">
                  Iniciar asamblea
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Asambleas completadas</h3>
        <div className="card-list">
          {COMPLETED.map((assembly) => (
            <div key={assembly.title} className="list-item">
              <span>✅</span>
              <div style={{ flex: 1 }}>
                <strong>{assembly.title}</strong>
                <div className="muted" style={{ fontSize: "13px" }}>
                  {assembly.date} · {assembly.status}
                </div>
              </div>
              <button className="btn btn-ghost">Ver acta</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
