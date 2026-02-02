import { useEffect, useMemo, useState } from "react";
import { buildActsCsv, getActs } from "../../../../lib/actsStore";

const REPORTS = [
  { label: "Asistencia 2026", value: 56 },
  { label: "Participación votaciones", value: 71 },
  { label: "Face ID adoption", value: 65 },
];

export default function ReportsPage() {
  const [acts, setActs] = useState(() => []);

  useEffect(() => {
    setActs(getActs());
  }, []);

  const totals = useMemo(() => {
    if (!acts.length) return { si: 0, no: 0, abst: 0 };
    return acts.reduce(
      (acc, act) => ({
        si: acc.si + act.votes.si,
        no: acc.no + act.votes.no,
        abst: acc.abst + act.votes.abst,
      }),
      { si: 0, no: 0, abst: 0 },
    );
  }, [acts]);

  const handleExportCsv = (filename = "reporte_votaciones.csv") => {
    const csv = buildActsCsv(acts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

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
            <button className="btn btn-primary" onClick={() => handleExportCsv()}>
              Exportar CSV
            </button>
            <button className="btn btn-ghost" onClick={() => handleExportCsv("reporte_votaciones.xls")}>
              Exportar Excel
            </button>
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
        <h3 style={{ marginTop: 0 }}>Reporte de votación</h3>
        <div className="card-list">
          <div className="list-item">
            <span>✅ Sí</span>
            <strong>{totals.si}</strong>
          </div>
          <div className="list-item">
            <span>❌ No</span>
            <strong>{totals.no}</strong>
          </div>
          <div className="list-item">
            <span>⚪ Abstención</span>
            <strong>{totals.abst}</strong>
          </div>
        </div>
      </div>
    </>
  );
}
