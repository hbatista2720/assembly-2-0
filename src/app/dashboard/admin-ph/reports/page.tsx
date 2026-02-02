const REPORTS = [
  { title: "Reporte de asistencia 2026", action: "Exportar Excel" },
  { title: "Quorum historico", action: "Exportar PDF" },
  { title: "Propietarios en mora", action: "Generar lista" },
];

export default function ReportsPage() {
  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Reportes</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Analisis de asistencia, votaciones y cumplimiento.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn">Periodo 2026</button>
          <button className="btn btn-primary">Descargar todo</button>
        </div>
      </div>

      <div className="card-list" style={{ marginTop: "18px" }}>
        {REPORTS.map((report) => (
          <div key={report.title} className="list-item" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong>{report.title}</strong>
              <div className="muted" style={{ fontSize: "12px" }}>
                Datos actualizados esta semana
              </div>
            </div>
            <button className="btn btn-ghost">{report.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
const REPORTS = [
  { label: "Asistencia 2026", value: 56 },
  { label: "Participacion votaciones", value: 71 },
  { label: "Face ID adoption", value: 65 },
];

export default function ReportsPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Reportes</span>
            <h1 style={{ margin: "12px 0 6px" }}>Analitica y tendencias</h1>
            <p className="muted" style={{ margin: 0 }}>
              Resumen por periodo, asistencia y salud financiera del PH.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-ghost">Periodo 2026</button>
            <button className="btn btn-primary">Exportar</button>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {REPORTS.map((report) => (
          <div key={report.label} className="chart-card">
            <h3 style={{ marginTop: 0 }}>{report.label}</h3>
            <div className="chart-bar">
              <span style={{ width: `${report.value}%` }} />
            </div>
            <p className="muted" style={{ margin: "10px 0 0" }}>
              {report.value}% promedio anual
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Top propietarios por asistencia</h3>
        <div className="card-list">
          {["Juan Perez (10-A) · 100%", "Maria Garcia (10-B) · 100%", "Carlos Lopez (10-C) · 67%"].map(
            (item) => (
              <div key={item} className="list-item">
                <span>🏅</span>
                <span>{item}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
}
