"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LeadsPage() {
  const params = useSearchParams();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const stage = params.get("stage");
  const seedLeads = useMemo(
    () => [
      {
        id: "lead-001",
        company_name: "PH Urban Tower",
        contact_name: "Laura Pérez",
        email: "laura@urbantower.com",
        phone: "+507 6000-1000",
        funnel_stage: "new",
        lead_score: 42,
        lead_qualified: false,
        created_at: "2026-01-20T09:00:00Z",
      },
      {
        id: "lead-002",
        company_name: "PH Costa Azul",
        contact_name: "Carlos Méndez",
        email: "carlos@costaazul.com",
        phone: "+507 6123-9000",
        funnel_stage: "qualified",
        lead_score: 80,
        lead_qualified: true,
        created_at: "2026-01-18T14:30:00Z",
      },
      {
        id: "lead-003",
        company_name: "PH Torres del Pacífico",
        contact_name: "Ana Torres",
        email: "ana@torrespacifico.com",
        phone: "+507 6555-3000",
        funnel_stage: "demo_active",
        lead_score: 90,
        lead_qualified: true,
        created_at: "2026-01-16T11:10:00Z",
      },
    ],
    [],
  );

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, seedLeads]);

  async function loadLeads() {
    setLoading(true);
    const filtered = stage ? seedLeads.filter((lead) => lead.funnel_stage === stage) : seedLeads;
    setLeads(filtered);
    setLoading(false);
  }

  async function handleQualify(leadId: string) {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, lead_qualified: true, lead_score: 80, funnel_stage: "qualified" }
          : lead,
      ),
    );
    toast.success("Lead calificado.");
  }

  async function handleActivateDemo(leadId: string) {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, demo_activated_at: new Date().toISOString(), funnel_stage: "demo_active" }
          : lead,
      ),
    );
    toast.success("Demo activado.");
  }

  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Gestión de Leads</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Filtra, califica y activa demos directamente desde el panel.
        </p>
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
                  <div className="muted" style={{ fontSize: "12px" }}>
                    Etapa: {lead.funnel_stage} · Score: {lead.lead_score ?? 0}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" onClick={() => handleQualify(lead.id)}>
                    Calificar
                  </button>
                  <button className="btn btn-primary" onClick={() => handleActivateDemo(lead.id)}>
                    Activar demo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
