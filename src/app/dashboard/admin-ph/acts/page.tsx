"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  buildActsCsv,
  generateActFromAssembly,
  getActs,
  getAssembliesSummary,
  upsertAct,
} from "../../../../lib/actsStore";

export default function ActsPage() {
  const [acts, setActs] = useState(() => []);
  const [assemblies, setAssemblies] = useState(() => []);
  const [selectedAssembly, setSelectedAssembly] = useState("");

  useEffect(() => {
    setActs(getActs());
    setAssemblies(getAssembliesSummary());
  }, []);

  const preview = useMemo(() => (acts.length ? acts[0] : null), [acts]);

  const computeSignatureHash = async (payload: string) => {
    if (typeof window === "undefined" || !window.crypto?.subtle) {
      return `SIM-${Math.abs(payload.length * 31)}`;
    }
    const data = new TextEncoder().encode(payload);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleGenerate = async () => {
    if (!selectedAssembly) return;
    const act = generateActFromAssembly(selectedAssembly);
    if (act) {
      const signatureHash = await computeSignatureHash(
        JSON.stringify({
          assembly: act.assemblyTitle,
          createdAt: act.createdAt,
          votes: act.votes,
          participation: act.participationPct,
        }),
      );
      const updatedAct = { ...act, signatureHash };
      upsertAct(updatedAct);
      setActs((prev) => [updatedAct, ...prev]);
    }
  };

  const handleExportCsv = (filename = "actas_assembly.csv") => {
    const csv = buildActsCsv(acts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!preview) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head><title>Acta ${preview.assemblyTitle}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>Acta ${preview.assemblyTitle}</h1>
          <p>Fecha: ${new Date(preview.createdAt).toLocaleString()}</p>
          <p>Participación: ${preview.participationPct}%</p>
          <p>Quórum: ${preview.quorumAchieved ? "ALCANZADO" : "PENDIENTE"}</p>
          <p>Firma digital: ${preview.signatureHash || "N/D"}</p>
          <h3>Resultados</h3>
          <ul>
            <li>SI: ${preview.votes.si}</li>
            <li>NO: ${preview.votes.no}</li>
            <li>ABSTENCIÓN: ${preview.votes.abst}</li>
          </ul>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

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
          <button className="btn btn-primary" onClick={handleGenerate}>
            Generar acta nueva
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
          <select
            value={selectedAssembly}
            onChange={(event) => setSelectedAssembly(event.target.value)}
            style={{ padding: "8px 12px", borderRadius: "10px" }}
          >
            <option value="">Selecciona asamblea</option>
            {assemblies.map((assembly) => (
              <option key={assembly.id} value={assembly.id}>
                {assembly.title}
              </option>
            ))}
          </select>
          <button className="btn btn-ghost" onClick={handleExportCsv}>
            Exportar CSV
          </button>
          <button className="btn btn-ghost" onClick={() => handleExportCsv("actas_assembly.xls")}>
            Exportar Excel
          </button>
          <button className="btn btn-ghost" onClick={handlePrint}>
            Exportar PDF
          </button>
        </div>
        <div className="table" style={{ "--table-columns": "1fr 2fr 1fr 1.4fr" } as CSSProperties}>
          <div className="table-row table-header">
            <span>Fecha</span>
            <span>Asamblea</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {acts.map((act) => (
            <div key={act.id} className="table-row">
              <span>{new Date(act.createdAt).toLocaleDateString()}</span>
              <span>{act.assemblyTitle}</span>
              <span className="badge badge-success">{act.status}</span>
              <span style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-ghost" onClick={handlePrint}>
                  Ver
                </button>
                <button className="btn btn-ghost" onClick={handlePrint}>
                  PDF
                </button>
                <button className="btn btn-ghost">Enviar</button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Vista previa de acta</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          {preview ? `${preview.assemblyTitle} · Generada automáticamente.` : "Genera una acta para ver la vista previa."}
        </p>
        <div className="surface" style={{ marginTop: "12px" }}>
          <strong>Urban Tower - P.H.</strong>
          <p className="muted" style={{ margin: "8px 0 0" }}>
            {preview
              ? `Participación ${preview.participationPct}% · Quórum ${preview.quorumAchieved ? "alcanzado" : "pendiente"}.`
              : "Quórum y resultados listos para firma digital."}
          </p>
          {preview?.signatureHash && (
            <p className="muted" style={{ margin: "8px 0 0" }}>
              Firma digital (SHA-256): {preview.signatureHash}
            </p>
          )}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
            <button className="btn" onClick={handlePrint}>
              Descargar PDF
            </button>
            <button className="btn btn-primary">Enviar por email</button>
          </div>
        </div>
      </div>
    </>
  );
}
