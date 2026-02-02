import type { CSSProperties } from "react";

const ACTS = [
  { title: "Acta Asamblea Ordinaria 2025", date: "20 Dic 2025", status: "Final" },
  { title: "Acta Asamblea Extraordinaria", date: "15 Nov 2025", status: "Final" },
  { title: "Acta Mantenimiento Piscina", date: "10 Oct 2025", status: "Final" },
];

export default function ActsPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Actas</span>
            <h1 style={{ margin: "12px 0 6px" }}>Actas automaticas</h1>
            <p className="muted" style={{ margin: 0 }}>
              Generacion legal y exportacion inmediata en PDF.
            </p>
          </div>
          <button className="btn btn-primary">Generar acta nueva</button>
        </div>
      </div>

      <div className="card">
        <div className="table" style={{ "--table-columns": "1fr 2fr 1fr 1.4fr" } as CSSProperties}>
          <div className="table-row table-header">
            <span>Fecha</span>
            <span>Asamblea</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {ACTS.map((act) => (
            <div key={act.title} className="table-row">
              <span>{act.date}</span>
              <span>{act.title}</span>
              <span className="badge badge-success">{act.status}</span>
              <span style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-ghost">Ver</button>
                <button className="btn btn-ghost">PDF</button>
                <button className="btn btn-ghost">Enviar</button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Vista previa de acta</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Acta Asamblea Ordinaria 2026 · Generada automaticamente.
        </p>
        <div className="surface" style={{ marginTop: "12px" }}>
          <strong>Urban Tower - P.H.</strong>
          <p className="muted" style={{ margin: "8px 0 0" }}>
            Quorum alcanzado, resultados y firmas digitales consolidadas.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
            <button className="btn">Descargar PDF</button>
            <button className="btn btn-primary">Enviar por email</button>
          </div>
        </div>
      </div>
    </>
  );
}
