"use client";

import { useState } from "react";

type ManualVote = {
  id: string;
  name: string;
  unit: string;
  status: "pendiente" | "registrado";
  location: "PRESENCIAL" | "ZOOM";
};

const INITIAL_VOTES: ManualVote[] = [
  { id: "1", name: "Laura Gomez", unit: "A-402", status: "pendiente", location: "PRESENCIAL" },
  { id: "2", name: "Carlos Ruiz", unit: "B-120", status: "pendiente", location: "ZOOM" },
  { id: "3", name: "Ana Torres", unit: "PH-11", status: "pendiente", location: "PRESENCIAL" },
];

export default function AdminPhLiveAssembly() {
  const [manualVotes, setManualVotes] = useState(INITIAL_VOTES);

  const handleLocationChange = (id: string, location: ManualVote["location"]) => {
    setManualVotes((prev) => prev.map((vote) => (vote.id === id ? { ...vote, location } : vote)));
  };

  const handleRegister = (id: string) => {
    setManualVotes((prev) =>
      prev.map((vote) => (vote.id === id ? { ...vote, status: "registrado" } : vote)),
    );
  };

  return (
    <>
      <div className="card glass" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <span className="pill">Asamblea en vivo</span>
            <h1 style={{ margin: "12px 0 0" }}>Panel de voto manual</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              Registrar votantes presenciales o por Zoom cuando Face ID no está disponible.
            </p>
          </div>
          <span className="pill">ID: LIVE</span>
        </div>
      </div>

      <section className="section">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Residentes con voto manual</h2>
          <div className="card-list">
            {manualVotes.map((vote) => (
              <div key={vote.id} className="list-item" style={{ alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <strong>{vote.name}</strong>
                  <div className="muted" style={{ fontSize: "12px" }}>
                    Unidad {vote.unit}
                  </div>
                </div>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span className="muted" style={{ fontSize: "12px" }}>
                    Ubicacion
                  </span>
                  <select
                    value={vote.location}
                    onChange={(event) => handleLocationChange(vote.id, event.target.value as ManualVote["location"])}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: "1px solid rgba(148,163,184,0.3)",
                      background: "rgba(15, 23, 42, 0.6)",
                      color: "#e2e8f0",
                    }}
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="ZOOM">Zoom</option>
                  </select>
                </label>
                <button
                  className="btn btn-primary btn-demo"
                  disabled={vote.status === "registrado"}
                  onClick={() => handleRegister(vote.id)}
                >
                  {vote.status === "registrado" ? "Registrado" : "Registrar voto"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
