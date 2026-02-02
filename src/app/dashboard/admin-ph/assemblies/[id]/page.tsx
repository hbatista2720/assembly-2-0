"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { findAssembly, updateAssembly, type AssemblyTopic } from "../../../../../lib/assembliesStore";

export default function AssemblyDetailPage() {
  const params = useParams();
  const assemblyId = typeof params?.id === "string" ? params.id : "";
  const [assembly, setAssembly] = useState(() => (assemblyId ? findAssembly(assemblyId) : null));
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    type: "votacion_simple",
  });

  useEffect(() => {
    setAssembly(assemblyId ? findAssembly(assemblyId) : null);
  }, [assemblyId]);

  const handleAddTopic = () => {
    if (!assembly || !topicForm.title) return;
    const newTopic: AssemblyTopic = {
      id: `topic_${Date.now()}`,
      title: topicForm.title,
      description: topicForm.description,
      type: topicForm.type as AssemblyTopic["type"],
    };
    const updated = updateAssembly(assembly.id, (current) => ({
      ...current,
      topics: [...current.topics, newTopic],
    }));
    setAssembly(updated);
    setShowTopicForm(false);
    setTopicForm({ title: "", description: "", type: "votacion_simple" });
  };

  if (!assembly) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Asamblea no encontrada</h2>
        <p className="muted">Regresa a la lista de asambleas.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <span className="pill">{assembly.type}</span>
          <h2 style={{ marginTop: "8px" }}>{assembly.title}</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            {assembly.date.replace("T", " ")} · {assembly.location}
          </p>
          <p className="muted">
            {assembly.attendeesCount} electores · {assembly.faceIdCount} con Face ID
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a className="btn" href={`/dashboard/admin-ph/assemblies/${assembly.id}/vote`}>
            Iniciar votación
          </a>
          <a className="btn btn-primary" href={`/dashboard/admin-ph/monitor/${assembly.id}`}>
            Abrir Monitor
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <h3 style={{ marginTop: 0 }}>Temas de votación</h3>
          <button className="btn btn-primary" onClick={() => setShowTopicForm(true)}>
            Agregar tema
          </button>
        </div>
        <div className="card-list">
          {assembly.topics.map((topic, index) => (
            <div key={topic.id} className="list-item" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <strong>
                  {index + 1}. {topic.title}
                </strong>
                <div className="muted" style={{ fontSize: "12px" }}>
                  {topic.description || "Sin descripción"} · {topic.type.replace("_", " ")}
                </div>
              </div>
              <a className="btn btn-ghost" href={`/dashboard/admin-ph/assemblies/${assembly.id}/vote?topic=${topic.id}`}>
                Votar
              </a>
            </div>
          ))}
          {assembly.topics.length === 0 && <p className="muted">Sin temas creados.</p>}
        </div>
      </div>

      {showTopicForm && (
        <div className="card" style={{ marginTop: "16px" }}>
          <h3 style={{ marginTop: 0 }}>Nuevo tema</h3>
          <div className="card-list">
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Título</span>
              <input
                value={topicForm.title}
                onChange={(event) => setTopicForm((prev) => ({ ...prev, title: event.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              />
            </label>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Descripción</span>
              <input
                value={topicForm.description}
                onChange={(event) => setTopicForm((prev) => ({ ...prev, description: event.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              />
            </label>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Tipo</span>
              <select
                value={topicForm.type}
                onChange={(event) => setTopicForm((prev) => ({ ...prev, type: event.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              >
                <option value="informativo">Informativo</option>
                <option value="votacion_simple">Votación simple</option>
                <option value="votacion_calificada">Votación calificada</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button className="btn btn-ghost" onClick={() => setShowTopicForm(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleAddTopic}>
              Guardar tema
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
