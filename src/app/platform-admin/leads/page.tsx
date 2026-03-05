"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

type Lead = {
  id: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  lead_source: string;
  funnel_stage: string;
  lead_score: number | null;
  lead_qualified: boolean | null;
  last_interaction_at: string | null;
  created_at: string | null;
};

function LeadDetailModal({ lead, stageLabels, sourceLabels, onClose }: {
  lead: Lead;
  stageLabels: Record<string, string>;
  sourceLabels: Record<string, string>;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-detail-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: "420px", margin: 16, width: "100%", maxHeight: "90vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 id="lead-detail-title" style={{ margin: 0, fontSize: "18px" }}>Vista detalle del lead</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <DetailRow label="Email" value={lead.email} />
          <DetailRow label="Teléfono" value={lead.phone || "—"} />
          <DetailRow label="Empresa / PH" value={lead.company_name || "—"} />
          <DetailRow label="Origen" value={sourceLabels[lead.lead_source] || lead.lead_source} />
          <DetailRow label="Etapa" value={stageLabels[lead.funnel_stage] || lead.funnel_stage} />
          <DetailRow label="Score" value={String(lead.lead_score ?? 0)} />
          <DetailRow label="Calificado" value={lead.lead_qualified ? "Sí" : "No"} />
          <DetailRow label="Registrado" value={lead.created_at ? new Date(lead.created_at).toLocaleString("es-PA", { dateStyle: "medium", timeStyle: "short" }) : "—"} />
          <DetailRow label="Última interacción" value={lead.last_interaction_at ? new Date(lead.last_interaction_at).toLocaleString("es-PA", { dateStyle: "medium", timeStyle: "short" }) : "—"} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span className="muted" style={{ fontSize: "12px" }}>{label}</span>
      <span style={{ fontSize: "14px" }}>{value}</span>
    </div>
  );
}

function LeadsContent() {
  const params = useSearchParams();
  const stage = params.get("stage") || undefined;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadLeads();
  }, [stage]);

  async function loadLeads() {
    setLoading(true);
    try {
      const url = stage ? `/api/leads?stage=${encodeURIComponent(stage)}` : "/api/leads";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar leads");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      setLeads([]);
      toast.error("No se pudieron cargar los leads.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQualify(leadId: string) {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, action: "qualify" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Lead calificado.");
      loadLeads();
    } catch {
      toast.error("Error al calificar.");
    }
  }

  async function handleActivateDemo(leadId: string) {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, action: "activate_demo" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Demo activado.");
      loadLeads();
    } catch {
      toast.error("Error al activar demo.");
    }
  }

  function exportLeadsCsv() {
    const headers = ["email", "phone", "company_name", "lead_source", "funnel_stage", "lead_score", "lead_qualified", "created_at"];
    const rows = leads.map((l) =>
      headers.map((h) => {
        const v = (l as any)[h];
        if (v == null) return "";
        const s = String(v);
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(",")
    );
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${stage || "todos"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Descarga iniciada.");
  }

  const stageLabels: Record<string, string> = {
    new: "Nuevos",
    qualified: "Calificados",
    demo_requested: "Demo solicitado",
    demo_active: "Demo activo",
    converted: "Convertidos",
    lost: "Perdidos",
  };

  const sourceLabels: Record<string, string> = {
    chatbot: "Chatbot",
    landing: "Landing",
    manual: "Manual",
    demo: "Demo",
  };

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <h1 style={{ margin: "12px 0 0" }}>Funnel de Leads</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Prospectos interesados en Chat Vote que llegan desde el chatbot de la landing, demo o CRM. Aquí los calificas y activas demos.
        </p>
        <div
          style={{
            marginTop: "12px",
            padding: "12px 16px",
            background: "rgba(99,102,241,0.08)",
            borderRadius: "10px",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <strong style={{ fontSize: "13px" }}>¿Para qué sirve?</strong>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: 1.5 }}>
            Ver quién mostró interés (email, empresa), filtrar por etapa del embudo, calificar leads prometedores y activar demo para que prueben la app.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px", alignItems: "center" }}>
          <a href="/platform-admin/leads" className={`btn ${!stage ? "btn-primary" : "btn-ghost"}`}>
            Todos
          </a>
          {["new", "qualified", "demo_active", "converted"].map((s) => (
            <a
              key={s}
              href={`/platform-admin/leads?stage=${s}`}
              className={`btn ${stage === s ? "btn-primary" : "btn-ghost"}`}
            >
              {stageLabels[s] || s}
            </a>
          ))}
          <button
            type="button"
            className="btn"
            onClick={exportLeadsCsv}
            disabled={loading || leads.length === 0}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Cargando leads...</p>
        ) : leads.length === 0 ? (
          <p className="muted">No hay leads registrados.</p>
        ) : (
          <div className="card-list">
            {leads.map((lead) => (
              <div key={lead.id} className="list-item" style={{ alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <strong>{lead.email}</strong>
                  {(lead.company_name || lead.phone) && (
                    <div className="muted" style={{ fontSize: "12px" }}>
                      {lead.company_name || ""} {lead.phone ? ` · ${lead.phone}` : ""}
                    </div>
                  )}
                  <div className="muted" style={{ fontSize: "12px" }}>
                    {stageLabels[lead.funnel_stage] || lead.funnel_stage} · {lead.lead_source === "chatbot" ? "Chatbot" : lead.lead_source === "landing" ? "Landing" : lead.lead_source === "demo" ? "Demo" : lead.lead_source}
                    {lead.lead_qualified ? " · ✓ Calificado" : ""} · Score: {lead.lead_score ?? 0}
                    {lead.created_at && ` · ${new Date(lead.created_at).toLocaleDateString("es-PA", { dateStyle: "short" })}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn btn-ghost" onClick={() => setDetailLead(lead)}>
                    Ver detalle
                  </button>
                  {!lead.lead_qualified && (
                    <button className="btn btn-ghost" onClick={() => handleQualify(lead.id)}>
                      Calificar
                    </button>
                  )}
                  {lead.funnel_stage !== "demo_active" && lead.funnel_stage !== "converted" && (
                    <button className="btn btn-primary" onClick={() => handleActivateDemo(lead.id)}>
                      Activar demo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {detailLead && (
        <LeadDetailModal
          lead={detailLead}
          stageLabels={stageLabels}
          sourceLabels={sourceLabels}
          onClose={() => setDetailLead(null)}
        />
      )}
    </>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="card"><p className="muted">Cargando…</p></div>}>
      <LeadsContent />
    </Suspense>
  );
}
