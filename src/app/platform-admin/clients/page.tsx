"use client";

import { useMemo, useState } from "react";

type ClientRecord = {
  id: string;
  name: string;
  plan: string;
  status: "Activo" | "Suspendido" | "Cancelado";
  expiresAt: string;
  buildings: number;
};

export default function ClientsPage() {
  const seedClients = useMemo<ClientRecord[]>(
    () => [
      {
        id: "ph-001",
        name: "PH Urban Tower",
        plan: "Pro Multi-PH",
        status: "Activo",
        expiresAt: "2026-03-15",
        buildings: 3,
      },
      {
        id: "ph-002",
        name: "PH Costa Azul",
        plan: "Standard",
        status: "Suspendido",
        expiresAt: "2026-02-10",
        buildings: 1,
      },
      {
        id: "ph-003",
        name: "PH Vista Mar",
        plan: "Enterprise",
        status: "Activo",
        expiresAt: "2026-04-01",
        buildings: 8,
      },
    ],
    [],
  );

  const [clients, setClients] = useState<ClientRecord[]>(seedClients);

  const updateStatus = (id: string, status: ClientRecord["status"]) => {
    setClients((prev) => prev.map((client) => (client.id === id ? { ...client, status } : client)));
  };

  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Gestion de Clientes (PH)</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Estado de suscripcion, vencimientos y acciones por cliente.
        </p>
      </div>

      <div className="card">
        <div className="table" style={{ "--table-columns": "1.6fr 1fr 1fr 1fr 1fr" } as any}>
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
      </div>
    </main>
  );
}
