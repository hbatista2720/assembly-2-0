"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export default function CrmPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const seedCampaigns = useMemo(
    () => [
      { id: "cmp-001", name: "Onboarding Demo", is_active: true, created_at: "2026-01-10T08:00:00Z" },
      { id: "cmp-002", name: "Seguimiento Post-Demo", is_active: false, created_at: "2026-01-12T15:00:00Z" },
      { id: "cmp-003", name: "Reactivación de Leads", is_active: true, created_at: "2026-01-15T10:30:00Z" },
    ],
    [],
  );

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedCampaigns]);

  async function loadCampaigns() {
    setLoading(true);
    setCampaigns(seedCampaigns);
    setLoading(false);
  }

  async function toggleActive(id: string, isActive: boolean) {
    setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !isActive } : item)));
    toast.success("Campaña actualizada.");
  }

  async function executeCampaigns() {
    const loadingToast = toast.loading("Ejecutando campañas...");
    toast.dismiss(loadingToast);
    toast.success("Campañas ejecutadas.");
  }

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <h1 style={{ margin: "12px 0 0" }}>CRM y Campañas</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Automatiza comunicaciones y seguimiento por etapa del funnel.
        </p>
        <button className="btn btn-primary" onClick={executeCampaigns} style={{ marginTop: "12px" }}>
          Ejecutar campañas ahora
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Cargando campañas...</p>
        ) : campaigns.length === 0 ? (
          <p className="muted">No hay campañas configuradas.</p>
        ) : (
          <div className="card-list">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="list-item" style={{ alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <strong>{campaign.name}</strong>
                  <div className="muted" style={{ fontSize: "12px" }}>
                    Estado: {campaign.is_active ? "Activa" : "Pausada"}
                  </div>
                </div>
                <button className="btn" onClick={() => toggleActive(campaign.id, campaign.is_active)}>
                  {campaign.is_active ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
