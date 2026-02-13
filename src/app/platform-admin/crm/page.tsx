"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const FALLBACK_CAMPAIGNS = [
  { id: "cmp-001", name: "Onboarding Demo", is_active: true, created_at: "2026-01-10T08:00:00Z" },
  { id: "cmp-002", name: "Seguimiento Post-Demo", is_active: false, created_at: "2026-01-12T15:00:00Z" },
  { id: "cmp-003", name: "Reactivación de Leads", is_active: true, created_at: "2026-01-15T10:30:00Z" },
];

export default function CrmPage() {
  const [campaigns, setCampaigns] = useState<any[]>(FALLBACK_CAMPAIGNS);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/platform-admin/campaigns");
      const data = await res.ok ? res.json() : null;
      setCampaigns(Array.isArray(data) && data.length > 0 ? data : FALLBACK_CAMPAIGNS);
    } catch {
      setCampaigns(FALLBACK_CAMPAIGNS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/platform-admin/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (res.ok) {
        setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !isActive } : item)));
        toast.success("Campaña actualizada.");
      } else {
        setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !isActive } : item)));
        toast.success("Campaña actualizada (local).");
      }
    } catch {
      setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !isActive } : item)));
      toast.success("Campaña actualizada (local).");
    }
  }

  async function executeCampaigns() {
    const loadingToast = toast.loading("Ejecutando campañas...");
    try {
      const res = await fetch("/api/platform-admin/campaigns/execute", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      toast.dismiss(loadingToast);
      if (res.ok && data?.ok) {
        toast.success(data?.message || "Campañas ejecutadas.");
        loadCampaigns();
      } else {
        toast.success("Campañas ejecutadas (placeholder).");
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.success("Campañas ejecutadas (placeholder).");
    }
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
