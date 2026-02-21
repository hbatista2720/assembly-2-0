"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type ClientRecord = {
  id: string;
  name: string;
  plan: string;
  status: "Activo" | "Suspendido" | "Cancelado";
  expiresAt: string;
  buildings: number;
};

const SEED_CLIENTS: ClientRecord[] = [
  { id: "ph-001", name: "Urban Tower PH", plan: "Pro Multi-PH", status: "Activo", expiresAt: "2026-03-15", buildings: 3 },
  { id: "ph-002", name: "PH Costa Azul", plan: "Standard", status: "Suspendido", expiresAt: "2026-02-10", buildings: 1 },
  { id: "ph-003", name: "PH Vista Mar", plan: "Enterprise", status: "Activo", expiresAt: "2026-04-01", buildings: 8 },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>(SEED_CLIENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const res = await fetch("/api/platform-admin/clients");
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setClients(data.map((c: any) => ({
          id: c.id,
          name: c.name,
          plan: c.plan || "Standard",
          status: c.status || "Activo",
          expiresAt: c.expiresAt || "2026-06-01",
          buildings: c.buildings ?? 1,
        })));
      }
    } catch {
      toast.error("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: ClientRecord["status"]) {
    try {
      const res = await fetch("/api/platform-admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      toast.success("Estado actualizado.");
    } catch {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      toast.success("Estado actualizado (local).");
    }
  }

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <h1 style={{ margin: "12px 0 0" }}>Gestión de Clientes (PH)</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Estado de suscripción, vencimientos y acciones por cliente.
        </p>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Cargando clientes...</p>
        ) : (
          <div className="table" style={{ "--table-columns": "1.6fr 1fr 1fr 1fr 1fr" } as React.CSSProperties}>
            <div className="table-row table-header">
              <span>Cliente</span>
              <span>Plan</span>
              <span>Estado</span>
              <span>Vence</span>
              <span>Acciones</span>
            </div>
            {clients.map((client) => (
              <div key={client.id} className="table-row">
                <span>
                  <strong>{client.name}</strong>
                  <div className="muted" style={{ fontSize: "12px" }}>
                    {client.buildings} PH
                  </div>
                </span>
                <span>{client.plan}</span>
                <span className="badge badge-info">{client.status}</span>
                <span>{client.expiresAt}</span>
                <span style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" onClick={() => updateStatus(client.id, "Activo")}>
                    Activar
                  </button>
                  <button className="btn" onClick={() => updateStatus(client.id, "Suspendido")}>
                    Suspender
                  </button>
                  <button className="btn btn-ghost" onClick={() => updateStatus(client.id, "Cancelado")}>
                    Cancelar
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
