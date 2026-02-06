"use client";

import { useEffect, useMemo, useState } from "react";
import { createAssembly, getAssemblies } from "../../../../lib/assembliesStore";

export default function AssembliesPage() {
  const [assemblies, setAssemblies] = useState(() => []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "Ordinaria",
    date: "",
    location: "",
  });

  useEffect(() => {
    setAssemblies(getAssemblies());
  }, []);

  const upcoming = useMemo(
    () => assemblies.filter((assembly) => assembly.status !== "Completada"),
    [assemblies],
  );
  const completed = useMemo(
    () => assemblies.filter((assembly) => assembly.status === "Completada"),
    [assemblies],
  );

  const handleCreate = () => {
    if (!form.title || !form.date) return;
    const newAssembly = createAssembly({
      title: form.title,
      type: form.type as "Ordinaria" | "Extraordinaria",
      date: form.date,
      location: form.location || "Salón principal",
      attendeesCount: 200,
      faceIdCount: 130,
    });
    setAssemblies((prev) => [newAssembly, ...prev]);
    setForm({ title: "", type: "Ordinaria", date: "", location: "" });
    setShowForm(false);
  };

  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Asambleas</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Crear, programar y ejecutar asambleas en vivo.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn">Filtros</button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear asamblea
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: "16px" }}>
          <h3 style={{ marginTop: 0 }}>Nueva asamblea</h3>
          <div className="card-list">
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Título</span>
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              />
            </label>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Tipo</span>
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              >
                <option value="Ordinaria">Ordinaria</option>
                <option value="Extraordinaria">Extraordinaria</option>
              </select>
            </label>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Fecha y hora</span>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              />
            </label>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Ubicación</span>
              <input
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              />
            </label>
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              Guardar asamblea
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "18px", display: "grid", gap: "16px" }}>
        {upcoming.map((item) => (
          <div key={item.id} className="list-item" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong>{item.title}</strong>
              <div className="muted" style={{ fontSize: "12px" }}>
                {item.date.replace("T", " ")} · {item.attendeesCount} electores · {item.faceIdCount} con Face ID
              </div>
            </div>
            <a className="btn btn-ghost" href={`/dashboard/admin-ph/assemblies/${item.id}`}>
              Ver detalles
            </a>
            <a className="btn btn-ghost" href={`/dashboard/admin-ph/assemblies/${item.id}/vote`}>
              Iniciar
            </a>
            <a className="btn btn-ghost" href={`/dashboard/admin-ph/monitor/${item.id}`}>
              Monitor
            </a>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "24px" }}>
        <h3 style={{ margin: "0 0 10px" }}>Completadas</h3>
        <div className="card-list">
          {completed.map((item) => (
            <div key={item.id} className="list-item">
              <span>✅</span>
              <span>
                {item.title} · {item.date.replace("T", " ")} · Acta generada
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
