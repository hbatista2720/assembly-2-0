"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { findAssembly, updateAssembly, deleteAssembly, isAssemblyCelebrated, type AssemblyTopic } from "../../../../../lib/assembliesStore";

function parseOrderOfDay(raw: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean);
}

function serializeOrderOfDay(items: string[]): string {
  return items
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text, i) => `${i + 1}. ${text}`)
    .join("\n");
}

export default function AssemblyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assemblyId = typeof params?.id === "string" ? params.id : "";
  const [assembly, setAssembly] = useState<ReturnType<typeof findAssembly>>(null);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    type: "votacion_simple",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    type: "Ordinaria" as "Ordinaria" | "Extraordinaria",
    date: "",
    location: "",
    orderOfDay: "",
    secondCallWarning: true,
    mode: "Presencial" as "Presencial" | "Virtual" | "Mixta",
    meetingLink: "",
  });

  useEffect(() => {
    if (!assemblyId) {
      setAssembly(null);
      return;
    }
    setAssembly(findAssembly(assemblyId));
  }, [assemblyId]);

  useEffect(() => {
    if (assembly) {
      setEditForm({
        title: assembly.title,
        type: assembly.type,
        date: assembly.date.slice(0, 16),
        location: assembly.location,
        orderOfDay: assembly.orderOfDay ?? "",
        secondCallWarning: assembly.secondCallWarning ?? true,
        mode: (assembly.mode as "Presencial" | "Virtual" | "Mixta") ?? "Presencial",
        meetingLink: assembly.meetingLink ?? "",
      });
    }
  }, [assembly?.id]);

  const celebrated = assembly ? isAssemblyCelebrated(assembly) : false;

  const orderOfDayItems = useMemo(() => parseOrderOfDay(editForm.orderOfDay), [editForm.orderOfDay]);

  const setOrderOfDayItem = (index: number, value: string) => {
    const next = [...orderOfDayItems];
    next[index] = value;
    setEditForm((p) => ({ ...p, orderOfDay: serializeOrderOfDay(next) }));
  };

  const addOrderOfDayItem = () =>
    setEditForm((p) => ({ ...p, orderOfDay: serializeOrderOfDay([...orderOfDayItems, ""]) }));

  const removeOrderOfDayItem = (index: number) => {
    const next = orderOfDayItems.filter((_, i) => i !== index);
    setEditForm((p) => ({ ...p, orderOfDay: serializeOrderOfDay(next) }));
  };

  const moveOrderOfDayItem = (index: number, delta: number) => {
    const next = [...orderOfDayItems];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to]!, next[index]!];
    setEditForm((p) => ({ ...p, orderOfDay: serializeOrderOfDay(next) }));
  };

  const getMinDateForType = (type: string) => {
    const now = new Date();
    const days = type === "Extraordinaria" ? 3 : 10;
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const handleSaveEdit = () => {
    if (!assembly) return;
    const trimmed = orderOfDayItems.map((t) => t.trim()).filter(Boolean);
    if (trimmed.length === 0) {
      alert("El orden del día (agenda) debe tener al menos un tema (Ley 284).");
      return;
    }
    const orderOfDaySerialized = serializeOrderOfDay(trimmed);
    const updated = updateAssembly(assembly.id, (a) => ({
      ...a,
      title: editForm.title,
      type: editForm.type,
      date: editForm.date,
      location: editForm.location,
      orderOfDay: orderOfDaySerialized || undefined,
      secondCallWarning: editForm.secondCallWarning,
      mode: editForm.mode,
      meetingLink: editForm.meetingLink || undefined,
    }));
    if (updated) {
      setAssembly(updated);
      setShowEditForm(false);
    }
  };

  const handleDelete = () => {
    if (!assembly) return;
    if (!confirm("¿Eliminar esta asamblea? Esta acción no se puede deshacer.")) return;
    const deleted = deleteAssembly(assembly.id);
    if (deleted) router.push("/dashboard/admin-ph/assemblies");
    else alert("No se puede eliminar: la asamblea ya fue celebrada y consumió crédito.");
  };

  const handleAddTopic = () => {
    if (!assembly || !topicForm.title) return;
    const newTopic: AssemblyTopic = {
      id: `topic_${Date.now()}`,
      title: topicForm.title,
      description: topicForm.description,
      type: topicForm.type as AssemblyTopic["type"],
      votingOpen: false,
    };
    const updated = updateAssembly(assembly.id, (current) => ({
      ...current,
      topics: [...current.topics, newTopic],
    }));
    setAssembly(updated);
    setShowTopicForm(false);
    setTopicForm({ title: "", description: "", type: "votacion_simple" });
  };

  const setTopicVotingOpen = (topicId: string, open: boolean) => {
    if (!assembly) return;
    const updated = updateAssembly(assembly.id, (current) => ({
      ...current,
      topics: current.topics.map((t) =>
        t.id === topicId ? { ...t, votingOpen: open } : t
      ),
    }));
    if (updated) setAssembly(updated);
  };

  if (!assemblyId) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Asamblea no indicada</h2>
        <p className="muted">No se especificó el identificador de la asamblea.</p>
        <a className="btn btn-ghost" href="/dashboard/admin-ph/assemblies" style={{ marginTop: "12px" }}>← Volver a la lista de asambleas</a>
      </div>
    );
  }

  if (!assembly) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Asamblea no encontrada</h2>
        <p className="muted">No existe una asamblea con ese identificador. Puede que se haya eliminado o el enlace sea incorrecto.</p>
        <a className="btn btn-ghost" href="/dashboard/admin-ph/assemblies" style={{ marginTop: "12px" }}>← Volver a la lista de asambleas</a>
      </div>
    );
  }

  return (
    <div className="card">
      {celebrated && (
        <div className="card" style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(148, 163, 184, 0.15)", border: "1px solid rgba(148, 163, 184, 0.25)", borderRadius: "12px" }}>
          <strong>Asamblea celebrada</strong>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
            Esta asamblea ya se realizó y consumió crédito. No se puede editar, eliminar ni reprogramar.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <span className="pill" style={{ textTransform: "uppercase", letterSpacing: "0.02em" }}>{assembly.type}</span>
          <h2 style={{ marginTop: "8px" }}>{assembly.title}</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            {assembly.date.replace("T", " ")} · {assembly.location}
          </p>
          <p className="muted">
            {assembly.attendeesCount} electores · {assembly.faceIdCount} con Face ID
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {!celebrated && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setShowEditForm(true)}>
                Editar
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowEditForm(true); }} title="Cambiar fecha y hora">
                Reprogramar
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleDelete} style={{ color: "#ef4444" }}>
                Eliminar
              </button>
            </>
          )}
          {!celebrated && (
            <a className="btn btn-ghost" href={`/dashboard/admin-ph/assemblies/${assembly.id}/vote`}>
              Iniciar votación
            </a>
          )}
          <a className="btn btn-primary" href={`/dashboard/admin-ph/monitor/${assembly.id}`}>
            Monitor Back Office
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <h3 style={{ marginTop: 0 }}>Datos de la convocatoria (Ley 284)</h3>
        <p className="muted" style={{ fontSize: "13px", margin: "0 0 12px" }}>
          Información oficial de la convocatoria según la normativa vigente.
        </p>
        <div className="card-list">
          <div className="list-item" style={{ alignItems: "center" }}>
            <span className="muted">Tipo de asamblea</span>
            <span>{assembly.type}</span>
          </div>
          <div className="list-item" style={{ alignItems: "center" }}>
            <span className="muted">Título</span>
            <span>{assembly.title}</span>
          </div>
          <div className="list-item" style={{ alignItems: "center" }}>
            <span className="muted">Fecha y hora</span>
            <span>{assembly.date.replace("T", " ")} (dd/mm/aaaa, 24h)</span>
          </div>
          <div className="list-item" style={{ alignItems: "center" }}>
            <span className="muted">Ubicación</span>
            <span>{assembly.location || "—"}</span>
          </div>
          <div className="list-item" style={{ alignItems: "flex-start" }}>
            <span className="muted">Orden del día (agenda)</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {(() => {
                const items = assembly.orderOfDay?.trim() ? parseOrderOfDay(assembly.orderOfDay) : [];
                if (items.length === 0) return <span>—</span>;
                return items.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      padding: "8px 12px",
                      background: "rgba(15, 23, 42, 0.35)",
                      borderRadius: "10px",
                      border: "1px solid rgba(148, 163, 184, 0.15)",
                      fontSize: "14px",
                    }}
                  >
                    <span className="muted" style={{ fontWeight: 600, minWidth: "20px" }}>{i + 1}.</span>
                    <span>{line}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
          <div className="list-item" style={{ alignItems: "center" }}>
            <span className="muted">Advertencia segundo llamado</span>
            <span>{assembly.secondCallWarning !== false ? "Sí" : "No"}</span>
          </div>
          <div className="list-item" style={{ alignItems: "center" }}>
            <span className="muted">Modo</span>
            <span>{assembly.mode ?? "Presencial"}</span>
          </div>
          {(assembly.mode === "Virtual" || assembly.mode === "Mixta") && assembly.meetingLink && (
            <div className="list-item" style={{ alignItems: "center" }}>
              <span className="muted">Enlace reunión</span>
              <a href={assembly.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary, #6366f1)" }}>
                {assembly.meetingLink}
              </a>
            </div>
          )}
        </div>
      </div>

      {showEditForm && !celebrated && (
        <div className="card" style={{ marginTop: "16px" }}>
          <h3 style={{ marginTop: 0 }}>Editar asamblea</h3>
          <p className="muted" style={{ fontSize: "13px", margin: "0 0 12px" }}>
            Plazos Ley 284: Extraordinaria ≥3 días, Ordinaria ≥10 días. Fecha en formato dd/mm/aaaa, hora 24h.
          </p>
          <div className="card-list">
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Título</span>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              />
            </label>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Tipo</span>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value as "Ordinaria" | "Extraordinaria" }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              >
                <option value="Ordinaria">Ordinaria</option>
                <option value="Extraordinaria">Extraordinaria</option>
              </select>
            </label>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Fecha y hora (reprogramar)</span>
              <input
                type="datetime-local"
                value={editForm.date}
                min={getMinDateForType(editForm.type)}
                onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              />
            </label>
            <div style={{ gridColumn: "1 / -1" }}>
              <span className="muted" style={{ display: "block", marginBottom: "8px", fontSize: "13px" }}>
                Orden del día (agenda) · Ley 284. Un tema por línea; puede reordenar con las flechas.
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {orderOfDayItems.length === 0 ? (
                  <p className="muted" style={{ fontSize: "13px", margin: 0 }}>
                    No hay temas. Agregue al menos uno.
                  </p>
                ) : (
                  orderOfDayItems.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 14px",
                        background: "rgba(15, 23, 42, 0.4)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <span style={{ fontWeight: 600, minWidth: "28px", color: "var(--color-text-muted, #94a3b8)" }}>
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => setOrderOfDayItem(index, e.target.value)}
                        placeholder={`Tema ${index + 1}`}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid rgba(148, 163, 184, 0.3)",
                          background: "rgba(15, 23, 42, 0.6)",
                          color: "var(--color-text, #f1f5f9)",
                          fontSize: "14px",
                        }}
                      />
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => moveOrderOfDayItem(index, -1)}
                          disabled={index === 0}
                          title="Subir"
                          style={{ padding: "8px" }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => moveOrderOfDayItem(index, 1)}
                          disabled={index === orderOfDayItems.length - 1}
                          title="Bajar"
                          style={{ padding: "8px" }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => removeOrderOfDayItem(index)}
                          title="Quitar tema"
                          style={{ padding: "8px", color: "var(--color-error, #ef4444)" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={addOrderOfDayItem}
                  style={{ alignSelf: "flex-start", marginTop: "4px" }}
                >
                  + Agregar tema al orden del día
                </button>
              </div>
            </div>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Ubicación</span>
              <input
                value={editForm.location}
                onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              />
            </label>
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Modo</span>
              <select
                value={editForm.mode}
                onChange={(e) => setEditForm((p) => ({ ...p, mode: e.target.value as "Presencial" | "Virtual" | "Mixta" }))}
                style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }}
              >
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Mixta">Mixta</option>
              </select>
            </label>
            {(editForm.mode === "Virtual" || editForm.mode === "Mixta") && (
              <label className="list-item" style={{ alignItems: "center" }}>
                <span>Enlace reunión</span>
                <input
                  type="url"
                  value={editForm.meetingLink}
                  onChange={(e) => setEditForm((p) => ({ ...p, meetingLink: e.target.value }))}
                  placeholder="https://zoom.us/..."
                  style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px", minWidth: "240px" }}
                />
              </label>
            )}
            <label className="list-item" style={{ alignItems: "center" }}>
              <span>Advertencia segundo llamado</span>
              <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={editForm.secondCallWarning}
                  onChange={(e) => setEditForm((p) => ({ ...p, secondCallWarning: e.target.checked }))}
                />
                <span className="muted" style={{ fontSize: "12px" }}>Segundo llamado 1h después (Ley 284)</span>
              </label>
            </label>
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowEditForm(false)}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>Guardar</button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <h3 style={{ marginTop: 0 }}>Temas de votación</h3>
          {!celebrated && (
            <button className="btn btn-primary" onClick={() => setShowTopicForm(true)}>
              Agregar tema
            </button>
          )}
        </div>
        {!celebrated && (
          <p className="muted" style={{ marginTop: "0", marginBottom: "12px", fontSize: "13px" }}>
            Active o cierre la votación por tema para que los residentes puedan votar desde el chatbot. El voto manual por unidad se aplica desde el <a href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assembly.id)}`}>Monitor Back Office</a> (seleccionando la unidad).
          </p>
        )}
        <div className="card-list">
          {assembly.topics.map((topic, index) => {
            const isOpen = topic.votingOpen === true;
            return (
              <div key={topic.id} className="list-item" style={{ alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <strong>
                    {index + 1}. {topic.title}
                  </strong>
                  <div className="muted" style={{ fontSize: "12px" }}>
                    {topic.description || "Sin descripción"} · {topic.type.replace("_", " ")}
                    {isOpen && (
                      <span className="pill" style={{ marginLeft: "8px", fontSize: "11px", background: "rgba(16, 185, 129, 0.2)", color: "#059669" }}>
                        Votación abierta
                      </span>
                    )}
                  </div>
                </div>
                {!celebrated && (
                  <button
                    type="button"
                    className={isOpen ? "btn btn-ghost" : "btn btn-primary"}
                    onClick={() => setTopicVotingOpen(topic.id, !isOpen)}
                  >
                    {isOpen ? "Desactivar votación" : "Activar votación"}
                  </button>
                )}
              </div>
            );
          })}
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
