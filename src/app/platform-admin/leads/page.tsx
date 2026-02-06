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

function LeadsContent() {
  const params = useSearchParams();
  const stage = params.get("stage") || undefined;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <h1 style={{ margin: "12px 0 0" }}>Gestión de Leads</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Filtra, califica y activa demos. Datos desde chatbot y CRM.
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
          <a href="/platform-admin/leads" className={`btn ${!stage ? "btn-primary" : "btn-ghost"}`}>
            Todos
          </a>
          {["new", "qualified", "demo_active", "converted"].map((s) => (
            <a
              key={s}
              href={`/platform-admin/leads?stage=${s}`}
              className={`btn ${stage === s ? "btn-primary" : "btn-ghost"}`}
            >
              {s === "new" ? "Nuevos" : s === "qualified" ? "Calificados" : s === "demo_active" ? "Demo activo" : "Convertidos"}
            </a>
          ))}
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
                    Etapa: {lead.funnel_stage} · Score: {lead.lead_score ?? 0}
                    {lead.lead_qualified ? " · Calificado" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
