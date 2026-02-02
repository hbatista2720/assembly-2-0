"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface ChatbotConfig {
  id: string;
  bot_name: string;
  is_active: boolean;
  ai_model: string;
  temperature: number;
  max_tokens: number;
  prompts: {
    landing?: string;
    demo?: string;
    soporte?: string;
    residente?: string;
  };
  total_conversations: number;
  total_messages: number;
  success_rate: number;
}

const CONTEXT_LABELS: Record<string, string> = {
  landing: "Landing (Calificacion de leads)",
  demo: "Demo (Tutor interactivo)",
  soporte: "Soporte tecnico",
  residente: "Residente (Votacion)",
};
const PROMPT_CONTEXTS = ["landing", "demo", "soporte", "residente"];

export default function ChatbotConfigPage() {
  const [configs, setConfigs] = useState<ChatbotConfig[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [editingContext, setEditingContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const selectedConfig = useMemo(
    () => configs.find((config) => config.bot_name === selectedBot),
    [configs, selectedBot],
  );

  async function fetchConfigs() {
    try {
      const res = await fetch("/api/chatbot/config");
      const data = await res.json();
      setConfigs(data || []);
      if (!selectedBot && data?.length) {
        setSelectedBot(data[0].bot_name);
      }
    } catch (error) {
      toast.error("Error al cargar configuración.");
    } finally {
      setLoading(false);
    }
  }

  function updatePrompt(context: string, value: string) {
    setConfigs((prev) =>
      prev.map((config) =>
        config.bot_name === selectedBot
          ? {
              ...config,
              prompts: { ...config.prompts, [context]: value },
            }
          : config,
      ),
    );
  }

  function updateConfig(field: keyof ChatbotConfig, value: any) {
    setConfigs((prev) =>
      prev.map((config) =>
        config.bot_name === selectedBot
          ? {
              ...config,
              [field]: value,
            }
          : config,
      ),
    );
  }

  async function handleSave() {
    if (!selectedConfig) return;
    setSaving(true);
    try {
      const res = await fetch("/api/chatbot/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedConfig),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("Configuración guardada.");
      fetchConfigs();
    } catch (error) {
      toast.error("Error al guardar configuración.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(botName: string) {
    const config = configs.find((item) => item.bot_name === botName);
    if (!config) return;
    try {
      await fetch("/api/chatbot/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          is_active: !config.is_active,
        }),
      });
      toast.success(`Chatbot ${config.is_active ? "desactivado" : "activado"}.`);
      fetchConfigs();
    } catch (error) {
      toast.error("Error al cambiar estado.");
    }
  }

  if (loading) {
    return (
      <main className="container">
        <div className="card">Cargando configuracion...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Configuracion de Chatbots</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Edita prompts, parametros y activa/desactiva chatbots.
        </p>
      </div>

      <div className="split">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Chatbots</h3>
          <div className="card-list">
            {configs.map((config) => (
              <button
                key={config.bot_name}
                className={`btn ${selectedBot === config.bot_name ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSelectedBot(config.bot_name)}
                style={{ justifyContent: "space-between" }}
              >
                <span style={{ textTransform: "capitalize" }}>{config.bot_name}</span>
                <span className="muted" style={{ fontSize: "12px" }}>
                  {config.is_active ? "Activo" : "Pausado"}
                </span>
              </button>
            ))}
          </div>
          <div className="card-list" style={{ marginTop: "12px" }}>
            {configs.map((config) => (
              <div key={`${config.bot_name}-metrics`} className="list-item">
                <span style={{ textTransform: "capitalize" }}>{config.bot_name}</span>
                <span className="muted" style={{ fontSize: "12px" }}>
                  {config.total_conversations} conv · {config.total_messages} msgs · {config.success_rate}%
                </span>
              </div>
            ))}
          </div>
          <div className="card-list" style={{ marginTop: "12px" }}>
            {configs.map((config) => (
              <button
                key={`${config.bot_name}-toggle`}
                className="btn btn-ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleActive(config.bot_name);
                }}
              >
                {config.is_active ? `Desactivar ${config.bot_name}` : `Activar ${config.bot_name}`}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          {selectedConfig ? (
            <>
              <h3 style={{ marginTop: 0 }}>Parametros IA</h3>
              <div className="two-col" style={{ marginBottom: "16px" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  Modelo IA
                  <select
                    value={selectedConfig.ai_model}
                    onChange={(event) => updateConfig("ai_model", event.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "12px",
                      border: "1px solid rgba(148,163,184,0.3)",
                      background: "rgba(15, 23, 42, 0.6)",
                      color: "#e2e8f0",
                    }}
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: "6px" }}>
                  Max tokens
                  <input
                    type="number"
                    min={128}
                    max={4096}
                    step={64}
                    value={selectedConfig.max_tokens}
                    onChange={(event) => updateConfig("max_tokens", Number(event.target.value))}
                    style={{
                      padding: "10px",
                      borderRadius: "12px",
                      border: "1px solid rgba(148,163,184,0.3)",
                      background: "rgba(15, 23, 42, 0.6)",
                      color: "#e2e8f0",
                    }}
                  />
                </label>
              </div>
              <label style={{ display: "grid", gap: "6px", marginBottom: "16px" }}>
                Temperatura ({selectedConfig.temperature})
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={selectedConfig.temperature}
                  onChange={(event) => updateConfig("temperature", Number(event.target.value))}
                />
              </label>

              <h3 style={{ marginTop: "0" }}>Prompts por contexto</h3>
              <div className="card-list">
                {PROMPT_CONTEXTS.map((context) => {
                  const prompt = selectedConfig.prompts?.[context as keyof typeof selectedConfig.prompts] || "";
                  return (
                  <div key={context} className="card" style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <strong>{CONTEXT_LABELS[context] || context}</strong>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setEditingContext(editingContext === context ? null : context)}
                      >
                        {editingContext === context ? "Cerrar" : "Editar"}
                      </button>
                    </div>
                    {editingContext === context ? (
                      <textarea
                        value={prompt}
                        onChange={(event) => updatePrompt(context, event.target.value)}
                        rows={6}
                        style={{
                          marginTop: "10px",
                          width: "100%",
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1px solid rgba(148,163,184,0.3)",
                          background: "rgba(15, 23, 42, 0.6)",
                          color: "#e2e8f0",
                        }}
                      />
                    ) : (
                      <p className="muted" style={{ marginTop: "10px" }}>
                        {prompt || "Sin prompt configurado."}
                      </p>
                    )}
                  </div>
                );
                })}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={fetchConfigs}>
                  Cancelar
                </button>
                <button className="btn btn-primary btn-demo" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </>
          ) : (
            <p className="muted">Selecciona un chatbot para editar.</p>
          )}
        </div>
      </div>
    </main>
  );
}
