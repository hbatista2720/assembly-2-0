"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Campaign = {
  id: string;
  name: string;
  is_active: boolean;
  last_executed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  description?: string | null;
  target_stage?: string | null;
  frequency?: string | null;
  email_subject?: string | null;
  email_body?: string | null;
};

const TEMPLATE_VARS = "Variables: {{name}}, {{demo_link}}";

const CAMPAIGN_META: Record<string, { description: string; target: string; frequency: string; icon: string }> = {
  "Onboarding Demo": {
    description: "Envía bienvenida y guía de uso a leads que acaban de activar su demo.",
    target: "Leads con demo recién activado",
    frequency: "Al activar demo",
    icon: "👋",
  },
  "Seguimiento Post-Demo": {
    description: "Recordatorio y oferta de conversión a leads cuyo demo está por expirar o ya expiró.",
    target: "Demo por expirar o expirado",
    frequency: "5 días después del demo",
    icon: "📅",
  },
  "Reactivación de Leads": {
    description: "Recontacta leads que llevan 7+ días sin interactuar para recuperar interés.",
    target: "Leads inactivos 7+ días",
    frequency: "Semanal",
    icon: "🔄",
  },
};

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: "default-1",
    name: "Onboarding Demo",
    is_active: true,
    description: CAMPAIGN_META["Onboarding Demo"].description,
    target_stage: CAMPAIGN_META["Onboarding Demo"].target,
    frequency: CAMPAIGN_META["Onboarding Demo"].frequency,
    email_subject: "Bienvenido a Assembly 2.0 – Guía de tu demo",
    email_body: "Hola {{name}},\n\nGracias por activar tu demo. Aquí tienes el enlace para comenzar:\n\n{{demo_link}}\n\n¿Necesitas ayuda? Responde este correo.",
  },
  {
    id: "default-2",
    name: "Seguimiento Post-Demo",
    is_active: false,
    description: CAMPAIGN_META["Seguimiento Post-Demo"].description,
    target_stage: CAMPAIGN_META["Seguimiento Post-Demo"].target,
    frequency: CAMPAIGN_META["Seguimiento Post-Demo"].frequency,
    email_subject: "Tu demo de Assembly 2.0 está por expirar",
    email_body: "Hola {{name}},\n\nTu período de prueba está por vencer. ¿Quieres convertirte a un plan completo?\n\n{{demo_link}}\n\nSaludos.",
  },
  {
    id: "default-3",
    name: "Reactivación de Leads",
    is_active: true,
    description: CAMPAIGN_META["Reactivación de Leads"].description,
    target_stage: CAMPAIGN_META["Reactivación de Leads"].target,
    frequency: CAMPAIGN_META["Reactivación de Leads"].frequency,
    email_subject: "Te extrañamos en Assembly 2.0",
    email_body: "Hola {{name}},\n\nHace tiempo que no nos visitas. ¿Hay algo en lo que podamos ayudarte?\n\n{{demo_link}}\n\nEquipo Assembly 2.0",
  },
];

function CampaignForm({
  campaign,
  onSave,
  onCancel,
  saving,
}: {
  campaign: Partial<Campaign>;
  onSave: (data: Partial<Campaign>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(campaign.name ?? "");
  const [description, setDescription] = useState(campaign.description ?? "");
  const [targetStage, setTargetStage] = useState(campaign.target_stage ?? "");
  const [frequency, setFrequency] = useState(campaign.frequency ?? "");
  const [emailSubject, setEmailSubject] = useState(campaign.email_subject ?? "");
  const [emailBody, setEmailBody] = useState(campaign.email_body ?? "");
  const [isActive, setIsActive] = useState(campaign.is_active ?? true);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave({
          name: name.trim(),
          description: description.trim() || undefined,
          target_stage: targetStage.trim() || undefined,
          frequency: frequency.trim() || undefined,
          email_subject: emailSubject.trim() || undefined,
          email_body: emailBody.trim() || undefined,
          is_active: isActive,
        });
      }}
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <label style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
        Nombre *
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ej: Onboarding Demo"
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid rgba(148,163,184,0.3)",
            background: "rgba(15,23,42,0.6)",
            color: "#e2e8f0",
          }}
        />
      </label>
      <label style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
        Descripción
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Qué hace esta campaña"
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid rgba(148,163,184,0.3)",
            background: "rgba(15,23,42,0.6)",
            color: "#e2e8f0",
            resize: "vertical",
          }}
        />
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <label style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
          Objetivo (etapa)
          <input
            type="text"
            value={targetStage}
            onChange={(e) => setTargetStage(e.target.value)}
            placeholder="Ej: Leads con demo activo"
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(15,23,42,0.6)",
              color: "#e2e8f0",
            }}
          />
        </label>
        <label style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
          Frecuencia
          <input
            type="text"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="Ej: Semanal, Al activar"
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(15,23,42,0.6)",
              color: "#e2e8f0",
            }}
          />
        </label>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "12px", color: "#a5b4fc" }}>
        📧 Plantilla del email
      </div>
      <label style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
        Asunto
        <input
          type="text"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          placeholder="Ej: Bienvenido a Assembly 2.0"
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid rgba(148,163,184,0.3)",
            background: "rgba(15,23,42,0.6)",
            color: "#e2e8f0",
          }}
        />
      </label>
      <label style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
        Cuerpo del email
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
          {["{{name}}", "{{demo_link}}"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setEmailBody((b) => b + v)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                background: "rgba(99,102,241,0.2)",
                color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,0.3)",
                cursor: "pointer",
              }}
            >
              + {v}
            </button>
          ))}
        </div>
        <textarea
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          rows={6}
          placeholder={`Hola {{name}},\n\nTu mensaje aquí...\n\n{{demo_link}}`}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid rgba(148,163,184,0.3)",
            background: "rgba(15,23,42,0.6)",
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: "13px",
            resize: "vertical",
          }}
        />
        <span className="muted" style={{ fontSize: "11px" }}>{TEMPLATE_VARS}</span>
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          style={{ width: "18px", height: "18px" }}
        />
        Campaña activa
      </label>
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export default function CrmPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [editModal, setEditModal] = useState<Campaign | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch("/api/platform-admin/campaigns", { signal: ctrl.signal });
      clearTimeout(timeout);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || `Error ${res.status}`);
        setCampaigns([]);
        return;
      }
      if (Array.isArray(data) && data.length > 0) {
        setCampaigns(
          data.map((c: any) => ({
            ...c,
            description: c.description ?? CAMPAIGN_META[c.name]?.description,
            target_stage: c.target_stage ?? CAMPAIGN_META[c.name]?.target,
            frequency: c.frequency ?? CAMPAIGN_META[c.name]?.frequency,
          }))
        );
      } else {
        setCampaigns(DEFAULT_CAMPAIGNS);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("No se pudo conectar. Mostrando campañas de ejemplo.");
      }
      setCampaigns(DEFAULT_CAMPAIGNS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  function isLocalCampaign(id: string) {
    return id.startsWith("default-");
  }

  async function toggleActive(id: string, isActive: boolean) {
    if (isLocalCampaign(id)) {
      setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !isActive } : item)));
      toast.success("Campaña actualizada (local).");
      return;
    }
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
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || "Error al actualizar.");
      }
    } catch {
      toast.error("Error al actualizar.");
    }
  }

  async function handleSaveEdit(data: Partial<Campaign>) {
    if (!editModal) return;
    setSaving(true);
    const payload = { ...editModal, ...data };
    const isLocal = isLocalCampaign(editModal.id);
    try {
      if (isLocal) {
        const res = await fetch("/api/platform-admin/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setCampaigns((prev) => prev.map((c) => (c.id === editModal.id ? { ...created, description: created.description ?? CAMPAIGN_META[created.name]?.description, target_stage: created.target_stage ?? CAMPAIGN_META[created.name]?.target, frequency: created.frequency ?? CAMPAIGN_META[created.name]?.frequency } : c)));
          setEditModal(null);
          toast.success("Campaña guardada en la base de datos.");
        } else {
          const err = await res.json().catch(() => ({}));
          setCampaigns((prev) => prev.map((c) => (c.id === editModal.id ? { ...c, ...payload } : c)));
          setEditModal(null);
          toast.success("Cambios guardados (solo en esta sesión).");
        }
      } else {
        const res = await fetch(`/api/platform-admin/campaigns/${editModal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setCampaigns((prev) => prev.map((c) => (c.id === editModal.id ? { ...c, ...updated } : c)));
          setEditModal(null);
          toast.success("Campaña actualizada.");
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err?.error || "Error al guardar.");
        }
      }
    } catch {
      setCampaigns((prev) => prev.map((c) => (c.id === editModal.id ? { ...c, ...payload } : c)));
      setEditModal(null);
      toast.success("Cambios guardados (solo en esta sesión).");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(data: Partial<Campaign>) {
    setSaving(true);
    try {
      const res = await fetch("/api/platform-admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setCampaigns((prev) => [...prev, created]);
        setCreateModal(false);
        toast.success("Campaña creada.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || "Error al crear.");
      }
    } catch {
      toast.error("Error al crear.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(campaign: Campaign) {
    if (isLocalCampaign(campaign.id)) {
      setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
      setDeleteModal(null);
      toast.success("Campaña eliminada.");
      return;
    }
    try {
      const res = await fetch(`/api/platform-admin/campaigns/${campaign.id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
        setDeleteModal(null);
        toast.success("Campaña eliminada.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || "Error al eliminar.");
      }
    } catch {
      toast.error("Error al eliminar.");
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
        toast.error(data?.error || "Error al ejecutar.");
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Error al ejecutar.");
    }
  }

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "12px" }}>
          <div>
            <h1 style={{ margin: 0 }}>CRM y Campañas</h1>
            <p className="muted" style={{ marginTop: "6px" }}>
              Automatiza emails a leads según su etapa. Edita, crea y personaliza campañas con plantillas.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
              + Crear campaña
            </button>
            <button className="btn btn-ghost" onClick={executeCampaigns}>
              Ejecutar activas ahora
            </button>
          </div>
        </div>

        {/* Guía colapsable - oculta por defecto */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: 0,
              fontSize: "14px",
              fontWeight: 600,
              opacity: 0.9,
            }}
          >
            <span>¿Qué hace este módulo?</span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{showGuide ? "▲" : "▼"}</span>
          </button>
          {showGuide && (
            <p style={{ margin: "10px 0 0", fontSize: "13px", lineHeight: 1.5, color: "#94a3b8" }}>
              Las campañas envían emails automáticos a tus leads. Edita cada una para personalizar la plantilla. Ejecutar dispara las activas.
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card"><p className="muted">Cargando campañas...</p></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {campaigns.map((campaign) => {
            const meta = CAMPAIGN_META[campaign.name];
            const icon = meta?.icon || "📧";
            const desc = campaign.description || meta?.description;
            const target = campaign.target_stage || meta?.target;
            const freq = campaign.frequency || meta?.frequency;
            return (
              <div
                key={campaign.id}
                style={{
                  padding: "20px 22px",
                  borderRadius: "14px",
                  background: campaign.is_active ? "rgba(30,41,59,0.5)" : "rgba(30,41,59,0.3)",
                  border: campaign.is_active
                    ? "1px solid rgba(99,102,241,0.25)"
                    : "1px solid rgba(148,163,184,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "22px" }}>{icon}</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "16px" }}>{campaign.name}</h3>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "5px",
                            background: campaign.is_active ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.15)",
                            color: campaign.is_active ? "#4ade80" : "#94a3b8",
                          }}
                        >
                          {campaign.is_active ? "Activa" : "Pausada"}
                        </span>
                      </div>
                    </div>
                    {desc && (
                      <p className="muted" style={{ margin: 0, fontSize: "13px", lineHeight: 1.5 }}>
                        {desc}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px" }}>
                  {target && <span className="muted">Objetivo: {target}</span>}
                  {freq && <span className="muted">Frecuencia: {freq}</span>}
                  {campaign.last_executed_at && (
                    <span className="muted">
                      Última: {new Date(campaign.last_executed_at).toLocaleString("es-PA", { dateStyle: "short" })}
                    </span>
                  )}
                </div>
                {(campaign.email_subject || campaign.email_body) && (
                  <div style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(15,23,42,0.4)", border: "1px solid rgba(148,163,184,0.1)", fontSize: "12px" }}>
                    {campaign.email_subject && <div style={{ fontWeight: 600, marginBottom: "4px" }}>{campaign.email_subject}</div>}
                    <p className="muted" style={{ margin: 0, fontSize: "11px", whiteSpace: "pre-wrap", overflow: "hidden", textOverflow: "ellipsis", maxHeight: "60px" }}>
                      {campaign.email_body || "—"}
                    </p>
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "auto" }}>
                  <button
                    className={`btn btn-sm ${campaign.is_active ? "btn-ghost" : "btn-primary"}`}
                    onClick={() => toggleActive(campaign.id, campaign.is_active)}
                  >
                    {campaign.is_active ? "Pausar" : "Activar"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditModal(campaign)}>
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDeleteModal(campaign)}
                    style={{ color: "#f87171" }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Editar */}
      {editModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Editar campaña"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setEditModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgb(15,23,42)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            <h2 style={{ margin: "0 0 20px", fontSize: "18px" }}>Editar campaña</h2>
            <CampaignForm
              campaign={editModal}
              onSave={handleSaveEdit}
              onCancel={() => setEditModal(null)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Modal Crear */}
      {createModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Crear campaña"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setCreateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgb(15,23,42)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            <h2 style={{ margin: "0 0 20px", fontSize: "18px" }}>Crear campaña</h2>
            <CampaignForm
              campaign={{}}
              onSave={handleCreate}
              onCancel={() => setCreateModal(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Eliminar campaña"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setDeleteModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgb(15,23,42)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              border: "1px solid rgba(248,113,113,0.3)",
            }}
          >
            <h2 style={{ margin: "0 0 12px", fontSize: "18px" }}>Eliminar campaña</h2>
            <p className="muted" style={{ marginBottom: "20px" }}>
              ¿Eliminar <strong>{deleteModal.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>
                Cancelar
              </button>
              <button
                className="btn"
                onClick={() => handleDelete(deleteModal)}
                style={{ background: "rgba(248,113,113,0.2)", color: "#f87171", border: "1px solid rgba(248,113,113,0.4)" }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
