"use client";

import { useEffect, useState } from "react";

type Resident = { user_id: string; email: string; face_id_enabled: boolean };

export default function OwnersPage() {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const orgId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
    setOrganizationId(orgId);
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    fetch(`/api/admin-ph/residents?organization_id=${encodeURIComponent(organizationId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Error al cargar"))))
      .then((data) => {
        setResidents(data.residents || []);
      })
      .catch(() => setError("No se pudieron cargar los residentes."))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const handleToggleFaceId = (userId: string, current: boolean) => {
    if (!organizationId || updatingId) return;
    setUpdatingId(userId);
    fetch(`/api/admin-ph/residents/${userId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: organizationId, face_id_enabled: !current }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setResidents((prev) =>
          prev.map((r) => (r.user_id === userId ? { ...r, face_id_enabled: data.face_id_enabled } : r))
        );
      })
      .catch(() => {})
      .finally(() => setUpdatingId(null));
  };

  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Propietarios / Residentes</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Gestión de residentes y configuración de Face ID (opcional). OTP siempre disponible como respaldo.
          </p>
        </div>
      </div>

      {!organizationId && (
        <p className="muted" style={{ marginTop: "18px" }}>
          No hay organización seleccionada. Inicia sesión como Admin PH.
        </p>
      )}

      {organizationId && loading && <p className="muted" style={{ marginTop: "18px" }}>Cargando residentes…</p>}
      {organizationId && error && <p style={{ marginTop: "18px", color: "var(--color-error, #ef4444)" }}>{error}</p>}

      {organizationId && !loading && !error && residents.length === 0 && (
        <p className="muted" style={{ marginTop: "18px" }}>No hay residentes en esta organización.</p>
      )}

      {organizationId && !loading && residents.length > 0 && (
        <div className="card-list" style={{ marginTop: "18px" }}>
          {residents.map((r) => (
            <div key={r.user_id} className="list-item" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <strong>{r.email}</strong>
                <div className="muted" style={{ fontSize: "12px" }}>Residente</div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: updatingId === r.user_id ? "wait" : "pointer" }}>
                <span className="muted" style={{ fontSize: "13px" }}>Permitir Face ID</span>
                <input
                  type="checkbox"
                  checked={r.face_id_enabled}
                  disabled={updatingId === r.user_id}
                  onChange={() => handleToggleFaceId(r.user_id, r.face_id_enabled)}
                  style={{ width: "18px", height: "18px" }}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
