"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDemoResidents, isDemoResidentsContext } from "../../../../../../lib/demoResidentsStore";

type EstatusUnidad = "Ocupada" | "Alquilada" | "Sin inquilino";
type TipoRegistro = "Face ID" | "Manual" | "Pendiente";

type ResidentRow = {
  id: string;
  unidad: string;
  tipoRegistro: TipoRegistro;
  correo: string;
  cuotaMantenimiento: number;
  porcentaje: number;
  titularPrincipal: string;
  titularSecundario: string;
  estatusUnidad: EstatusUnidad;
  politica: string;
};

type ApiUnit = {
  id: string;
  code: string;
  tower: string;
  owner: string;
  paymentStatus: "AL_DIA" | "MORA";
  isPresent: boolean;
  hasFaceId: boolean;
  voteValue: "SI" | "NO" | "ABSTENCION" | null;
  voteMethod: "FACE_ID" | "MANUAL" | null;
};

function unitsToResidentRows(units: ApiUnit[], demoResidents: { unit?: string; email?: string; nombre?: string; cuota_pct?: number; estatus_unidad?: EstatusUnidad }[]): ResidentRow[] {
  return units.map((u) => {
    const inUnit = demoResidents.filter((r) => (r.unit ?? "").trim() === (u.code ?? "").trim());
    const resident = inUnit[0];
    const tipoRegistro: TipoRegistro = u.hasFaceId ? "Face ID" : u.voteMethod === "MANUAL" ? "Manual" : "Pendiente";
    const estatusUnidad: EstatusUnidad = resident?.estatus_unidad ?? "Ocupada";
    const porcentaje = resident?.cuota_pct ?? 100 / Math.max(units.length, 1);
    const cuotaBase = 85;
    const cuotaMantenimiento = Math.round(cuotaBase * (porcentaje / 2));
    const politica = estatusUnidad === "Ocupada" ? "Propietario residente" : estatusUnidad === "Alquilada" ? "Arrendador; vota el titular" : "Sin ocupante; poder si aplica";
    return {
      id: u.id,
      unidad: u.tower && u.tower !== "A" ? `${u.tower}-${u.code}` : u.code,
      tipoRegistro,
      correo: resident?.email ?? `${u.owner?.toLowerCase().replace(/\s/g, ".") ?? "residente"}@demo.assembly2.com`,
      cuotaMantenimiento,
      porcentaje: Math.round(porcentaje * 100) / 100,
      titularPrincipal: resident?.nombre ?? u.owner ?? "—",
      titularSecundario: inUnit[1]?.nombre ?? "—",
      estatusUnidad,
      politica,
    };
  });
}

export default function AdminPhLiveAssembly() {
  const params = useParams();
  const assemblyId = typeof params?.id === "string" ? params.id : "demo";
  const isDemo = typeof window !== "undefined" && isDemoResidentsContext();
  const demoParam = isDemo ? "&demo=1" : "";

  const [units, setUnits] = useState<ApiUnit[]>([]);
  const [presenterUrl, setPresenterUrl] = useState<string | null>(null);
  const [loadingPresenter, setLoadingPresenter] = useState(false);
  const [filterEstatus, setFilterEstatus] = useState<EstatusUnidad | "all">("all");
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const res = await fetch(`/api/monitor/units?assemblyId=${encodeURIComponent(assemblyId)}${demoParam}`);
      if (!res.ok) return;
      const data = await res.json();
      let list: ApiUnit[] = data.units ?? [];
      if (active && isDemo && typeof window !== "undefined") {
        const residents = getDemoResidents();
        list = list.filter((u) => residents.some((r) => (r.unit ?? "").trim() === (u.code ?? "").trim()));
        list = list.map((u) => {
          const unitCode = (u.code ?? "").trim();
          const inUnit = residents.filter((r) => (r.unit ?? "").trim() === unitCode);
          const resident = inUnit.find((r) => r.habilitado_para_asamblea) ?? inUnit[0];
          const paymentStatus = resident?.payment_status === "mora" ? "MORA" : "AL_DIA";
          const owner = resident?.nombre ?? resident?.email ?? u.owner;
          return { ...u, paymentStatus, owner };
        });
      }
      if (active) setUnits(list);
    };
    load();
    const interval = setInterval(load, 12_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId, demoParam, isDemo]);

  const demoResidents = typeof window !== "undefined" && isDemo ? getDemoResidents() : [];
  const residents = useMemo(
    () => unitsToResidentRows(units, demoResidents),
    [units, demoResidents]
  );

  const handlePresenterToken = async () => {
    setLoadingPresenter(true);
    try {
      const res = await fetch("/api/presenter/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assemblyId }),
      });
      const data = await res.json();
      if (data?.presenter_url) {
        setPresenterUrl(data.presenter_url);
        window.open(data.presenter_url, "_blank");
      }
    } finally {
      setLoadingPresenter(false);
    }
  };

  const filteredResidents = useMemo(() => {
    if (filterEstatus === "all") return residents;
    return residents.filter((r) => r.estatusUnidad === filterEstatus);
  }, [residents, filterEstatus]);

  const summary = useMemo(() => {
    const total = residents.length;
    const ocupadas = residents.filter((r) => r.estatusUnidad === "Ocupada").length;
    const alquiladas = residents.filter((r) => r.estatusUnidad === "Alquilada").length;
    const sinInquilino = residents.filter((r) => r.estatusUnidad === "Sin inquilino").length;
    const faceId = residents.filter((r) => r.tipoRegistro === "Face ID").length;
    const manual = residents.filter((r) => r.tipoRegistro === "Manual").length;
    const pendiente = residents.filter((r) => r.tipoRegistro === "Pendiente").length;
    const cuotaTotal = residents.reduce((s, r) => s + r.cuotaMantenimiento, 0);
    return {
      totalUnidades: total,
      ocupadas,
      alquiladas,
      sinInquilino,
      conFaceId: faceId,
      manual,
      pendiente,
      cuotaTotal,
    };
  }, [residents]);

  return (
    <>
      <div className="card" style={{ padding: "20px 24px", marginBottom: "16px", borderLeft: "4px solid var(--color-primary, #6366f1)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: "260px" }}>
            <span className="pill">Fase: Asamblea en vivo</span>
            <h1 style={{ margin: "10px 0 0", fontSize: "1.35rem" }}>Iniciar asamblea</h1>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: "14px" }}>
              Directorio de residentes e indicadores abajo. Use Monitor Back Office o Vista de presentación según necesite.
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowInfoModal(true)}
              style={{ marginTop: "10px", fontSize: "13px", padding: "6px 12px" }}
              title="Explicación de tipos de monitor"
            >
              ℹ️ ¿Qué es Monitor Back Office y Vista de presentación?
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
            <span className="pill" style={{ opacity: 0.9 }}>ID: LIVE</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <Link className="btn btn-primary" href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assemblyId)}`}>
                Monitor Back Office
              </Link>
              <span className="muted" style={{ fontSize: "11px" }}>Panel de control</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <button className="btn btn-ghost" onClick={handlePresenterToken} disabled={loadingPresenter} title="Vista solo lectura para proyección">
                {loadingPresenter ? "Generando…" : "Vista de presentación (solo lectura)"}
              </button>
              <span className="muted" style={{ fontSize: "11px" }}>Proyección</span>
            </div>
            {presenterUrl && (
              <span className="muted" style={{ fontSize: "11px" }}>Abierta en nueva pestaña</span>
            )}
          </div>
        </div>
      </div>

      {showInfoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "440px",
              width: "90%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "20px 24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h3 id="info-modal-title" style={{ margin: 0, fontSize: "1.1rem" }}>Monitor Back Office y Vista de presentación</h3>
              <button type="button" onClick={() => setShowInfoModal(false)} aria-label="Cerrar" style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "inherit", lineHeight: 1 }}>×</button>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: "14px" }}>
              Todo lo que cambie en el <strong>Monitor Back Office</strong> se sincroniza con la <strong>Vista de presentación (solo lectura)</strong>. Si abre la vista de presentación en otra pestaña o pantalla para proyección, verá los mismos datos actualizados.
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", lineHeight: 1.65 }}>
              <li style={{ marginBottom: "10px" }}><strong>Monitor Back Office</strong>: panel de control del dashboard para operar durante la asamblea (voto manual, asistencia, correcciones). Redirige al módulo Monitor.</li>
              <li style={{ marginBottom: "10px" }}><strong>Vista de presentación (solo lectura)</strong>: vista para proyección (quórum, resultados, unidades). Sin botones de edición. Los cambios del Back Office se reflejan aquí de forma automática.</li>
            </ul>
            <button type="button" className="btn btn-primary" style={{ marginTop: "16px" }} onClick={() => setShowInfoModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="card assembly-live-indicators" style={{ marginBottom: "20px", padding: "20px 24px", background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <span style={{ fontSize: "24px" }} aria-hidden>📊</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>Indicadores de asamblea</h2>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>Resumen para control en vivo</p>
          </div>
        </div>
        <div className="assembly-indicators-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" }}>
          <div className="assembly-indicator-card" style={{ padding: "14px 16px", background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: "12px", textAlign: "center" }}>
            <div className="muted" style={{ fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Total unidades</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text, #f1f5f9)" }}>{summary.totalUnidades}</div>
          </div>
          <div className="assembly-indicator-card" style={{ padding: "14px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "12px", textAlign: "center" }}>
            <div className="muted" style={{ fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Ocupadas</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10b981" }}>{summary.ocupadas}</div>
          </div>
          <div className="assembly-indicator-card" style={{ padding: "14px 16px", background: "rgba(148, 163, 184, 0.08)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", textAlign: "center" }}>
            <div className="muted" style={{ fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Alquiladas</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text, #f1f5f9)" }}>{summary.alquiladas}</div>
          </div>
          <div className="assembly-indicator-card" style={{ padding: "14px 16px", background: "rgba(148, 163, 184, 0.08)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", textAlign: "center" }}>
            <div className="muted" style={{ fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Sin inquilino</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text, #f1f5f9)" }}>{summary.sinInquilino}</div>
          </div>
          <div className="assembly-indicator-card" style={{ padding: "14px 16px", background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: "12px", textAlign: "center" }}>
            <div className="muted" style={{ fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Con Face ID</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>{summary.conFaceId}</div>
          </div>
          <div className="assembly-indicator-card" style={{ padding: "14px 16px", background: "rgba(148, 163, 184, 0.08)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", textAlign: "center" }}>
            <div className="muted" style={{ fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Registro manual</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text, #f1f5f9)" }}>{summary.manual}</div>
          </div>
          <div className="assembly-indicator-card" style={{ padding: "14px 16px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "12px", textAlign: "center" }}>
            <div className="muted" style={{ fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Pendiente registro</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>{summary.pendiente}</div>
          </div>
          <div className="assembly-indicator-card" style={{ padding: "14px 16px", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "12px", textAlign: "center", gridColumn: "span 1" }}>
            <div className="muted" style={{ fontSize: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Cuota total</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-primary, #6366f1)" }}>${summary.cuotaTotal}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ margin: 0, flex: 1 }}>Directorio de residentes (lista)</h2>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="muted" style={{ fontSize: "13px" }}>Estatus unidad:</span>
            <select
              value={filterEstatus}
              onChange={(e) => setFilterEstatus(e.target.value as EstatusUnidad | "all")}
              style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0", fontSize: "13px" }}
            >
              <option value="all">Todas</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Alquilada">Alquilada</option>
              <option value="Sin inquilino">Sin inquilino</option>
            </select>
          </label>
        </div>
        <p className="muted" style={{ margin: "0 0 16px", fontSize: "13px" }}>
          Unidad, tipo de registro, correo, cuota, % coeficiente, titulares principal y secundario, estatus de la unidad y política aplicable.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="assembly-residents-table" style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(148, 163, 184, 0.3)" }}>
                <th style={{ textAlign: "left", padding: "10px 8px" }}>Unidad</th>
                <th style={{ textAlign: "left", padding: "10px 8px" }}>Tipo registro</th>
                <th style={{ textAlign: "left", padding: "10px 8px" }}>Correo</th>
                <th style={{ textAlign: "right", padding: "10px 8px" }}>Cuota mant.</th>
                <th style={{ textAlign: "right", padding: "10px 8px" }}>%</th>
                <th style={{ textAlign: "left", padding: "10px 8px" }}>Titular principal</th>
                <th style={{ textAlign: "left", padding: "10px 8px" }}>Titular secundario</th>
                <th style={{ textAlign: "left", padding: "10px 8px" }}>Estatus unidad</th>
                <th style={{ textAlign: "left", padding: "10px 8px" }}>Política</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.12)" }}>
                  <td style={{ padding: "10px 8px", fontWeight: 500 }}>{r.unidad}</td>
                  <td style={{ padding: "10px 8px" }}>{r.tipoRegistro}</td>
                  <td style={{ padding: "10px 8px", fontSize: "12px" }}>{r.correo}</td>
                  <td style={{ textAlign: "right", padding: "10px 8px" }}>${r.cuotaMantenimiento}</td>
                  <td style={{ textAlign: "right", padding: "10px 8px" }}>{r.porcentaje}%</td>
                  <td style={{ padding: "10px 8px" }}>{r.titularPrincipal}</td>
                  <td style={{ padding: "10px 8px" }}>{r.titularSecundario}</td>
                  <td style={{ padding: "10px 8px" }}>{r.estatusUnidad}</td>
                  <td style={{ padding: "10px 8px", maxWidth: "200px", fontSize: "12px", color: "#94a3b8" }}>{r.politica}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredResidents.length === 0 && (
          <p className="muted" style={{ margin: "16px 0 0", textAlign: "center" }}>No hay residentes que coincidan con el filtro.</p>
        )}
      </div>

      <style>{`
        .assembly-indicator-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .assembly-indicator-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .assembly-residents-table th { color: #94a3b8; font-weight: 600; }
        .assembly-residents-table td { color: #e2e8f0; }
        .assembly-residents-table tbody tr:hover { background: rgba(148, 163, 184, 0.06); }
      `}</style>
    </>
  );
}
