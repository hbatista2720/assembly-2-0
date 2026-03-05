"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ChatbotPreview, { type TestProfile } from "../../../components/chatbot/ChatbotPreview";

const ENV_TELEGRAM_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "2.0";

interface ChatbotConfig {
  id: string;
  bot_name: string;
  is_active: boolean;
  ai_model: string;
  temperature: number;
  max_tokens: number;
  prompts: Record<string, string>;
  total_conversations: number;
  total_messages: number;
  success_rate: number;
  telegram_bot_username?: string | null;
}

const CONTEXT_LABELS: Record<string, string> = {
  landing: "Landing (Calificación de leads)",
  demo: "Demo (Tutor interactivo)",
  soporte: "Soporte técnico",
  residente: "Residente (Votación)",
};
const CONTEXT_DESCRIPTIONS: Record<string, string> = {
  landing: "Visitantes en tu web que aún no están registrados. Lex califica leads y ofrece demos.",
  demo: "Usuarios que probando el sistema. Lex actúa como tutor interactivo.",
  soporte: "Consultas técnicas o de ayuda. Lex resuelve dudas y dirige a soporte.",
  residente: "Residentes ya identificados. Lex ayuda con votación, asambleas y Face ID.",
};
const PROMPT_CONTEXTS = ["landing", "demo", "soporte", "residente"];

const TEST_FLOWS: { id: string; profile: TestProfile; title: string; email: string; description: string; icon: string }[] = [
  { id: "residente", profile: "residente", title: "Residente", email: "residente2@demo.assembly2.com", description: "Correo → validación BD → PIN → chat residente.", icon: "👤" },
  { id: "admin", profile: "admin", title: "Admin PH", email: "admin@torresdelpacifico.com", description: "Landing → Admin PH → correo → PIN → dashboard.", icon: "🏢" },
  { id: "demo", profile: "demo", title: "Cliente nuevo", email: "demo@assembly2.com", description: "Landing → Demo → correo → PIN → acceso demo.", icon: "🆕" },
];

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.6)",
  color: "#e2e8f0",
  width: "100%",
  fontSize: "14px",
} as const;

export default function ChatbotConfigPage() {
  const [configs, setConfigs] = useState<ChatbotConfig[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [editingContext, setEditingContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<TestProfile>("residente");
  const [showGuide, setShowGuide] = useState(false);
  const [tgUsername, setTgUsername] = useState("");
  const [tgUsernameSaving, setTgUsernameSaving] = useState(false);
  const [tgStatus, setTgStatus] = useState<{ configured: boolean; valid?: boolean; username?: string; message?: string } | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<{ geminiConfigured: boolean; model?: string } | null>(null);
  const [geminiStatusLoading, setGeminiStatusLoading] = useState(false);
  const [configTab, setConfigTab] = useState<"ajustes" | "prompts">("ajustes");
  const [secrets, setSecrets] = useState<{ telegramMasked?: string; geminiMasked?: string; groqMasked?: string; telegramConfigured?: boolean; geminiConfigured?: boolean; groqConfigured?: boolean; ai_provider_preference?: "gemini" | "groq"; otp_mode?: "test" | "production" } | null>(null);
  const [otpMode, setOtpMode] = useState<"test" | "production">("production");
  const [otpModeSaving, setOtpModeSaving] = useState(false);
  const [tgTokenInput, setTgTokenInput] = useState("");
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [groqKeyInput, setGroqKeyInput] = useState("");
  const [tokensSaving, setTokensSaving] = useState(false);
  const [tgValidating, setTgValidating] = useState(false);
  const [geminiValidating, setGeminiValidating] = useState(false);
  const [groqValidating, setGroqValidating] = useState(false);
  const [initializingChannels, setInitializingChannels] = useState(false);
  /** Proveedor de IA elegido: primero se selecciona esto, luego se configura la API key. */
  const [aiProvider, setAiProvider] = useState<"gemini" | "groq">("gemini");

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function checkTelegramToken() {
    try {
      const r = await fetch("/api/chatbot/telegram-status");
      const d = await r.json();
      setTgStatus(d);
      if (d?.valid) toast.success(d?.message || "Token válido");
      else if (d?.configured && !d?.valid) toast.error(d?.message || "Token inválido");
    } catch {
      setTgStatus({ configured: false, message: "Error al verificar" });
      toast.error("Error al verificar token");
    }
  }

  useEffect(() => {
    checkTelegramToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Comprueba que la API key de Gemini sea válida (llamada real). Verde solo si validación OK. */
  async function checkGeminiStatus() {
    setGeminiStatusLoading(true);
    try {
      const r = await fetch("/api/chatbot/validate-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await r.json();
      const valid = !!d?.valid;
      setGeminiStatus({ geminiConfigured: valid, model: d?.model });
    } catch {
      setGeminiStatus({ geminiConfigured: false });
    } finally {
      setGeminiStatusLoading(false);
    }
  }

  async function fetchSecrets() {
    try {
      const r = await fetch("/api/chatbot/secrets");
      const d = await r.json();
      setSecrets(d);
    } catch {
      setSecrets(null);
    }
  }

  async function validateTelegramToken(token?: string) {
    setTgValidating(true);
    try {
      const url = token ? `/api/chatbot/telegram-status?token=${encodeURIComponent(token)}` : "/api/chatbot/telegram-status";
      const r = await fetch(url);
      const d = await r.json();
      setTgStatus(d);
      if (d?.valid) toast.success(d?.message || "Token válido");
      else if (d?.configured && !d?.valid) toast.error(d?.message || "Token inválido");
      else if (!d?.configured) toast.error("Ingresa un token para validar");
    } catch {
      toast.error("Error al validar");
    } finally {
      setTgValidating(false);
    }
  }

  async function validateGeminiKey(apiKey?: string) {
    setGeminiValidating(true);
    try {
      const r = await fetch("/api/chatbot/validate-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiKey ? { api_key: apiKey } : {}),
      });
      const d = await r.json();
      if (d?.valid) {
        toast.success(d?.message || "API key válida");
      } else {
        const errMsg = d?.detail ? `${d.message} (${d.detail})` : (d?.message || "API key inválida");
        toast.error(errMsg);
      }
      checkGeminiStatus(); // Se llama siempre para actualizar el badge
    } catch {
      toast.error("Error al validar");
    } finally {
      setGeminiValidating(false);
    }
  }

  async function validateGroqKey(apiKey?: string) {
    setGroqValidating(true);
    try {
      const r = await fetch("/api/chatbot/validate-groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiKey ? { api_key: apiKey } : {}),
      });
      const d = await r.json();
      if (d?.valid) {
        toast.success(d?.message || "Groq válido");
      } else {
        toast.error(d?.message || d?.detail || "Groq inválido");
      }
    } catch {
      toast.error("Error al validar Groq");
    } finally {
      setGroqValidating(false);
    }
  }

  async function saveTokens() {
    const updates: Record<string, string> = {};
    if (tgTokenInput.trim()) updates.telegram_bot_token = tgTokenInput.trim();
    if (geminiKeyInput.trim()) updates.gemini_api_key = geminiKeyInput.trim();
    if (groqKeyInput.trim()) updates.groq_api_key = groqKeyInput.trim();
    if (Object.keys(updates).length === 0) {
      toast.error("Ingresa al menos un token para actualizar");
      return;
    }
    setTokensSaving(true);
    try {
      const r = await fetch("/api/chatbot/secrets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const d = await r.json();
      if (d?.ok) {
        toast.success(d?.message || "Tokens actualizados");
        setTgTokenInput("");
        setGeminiKeyInput("");
        setGroqKeyInput("");
        fetchSecrets();
        checkTelegramToken();
        checkGeminiStatus();
      } else {
        toast.error(d?.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar tokens");
    } finally {
      setTokensSaving(false);
    }
  }

  /** Guarda solo la preferencia de proveedor (Gemini/Groq) para que persista al salir del módulo. */
  async function saveAiProviderPreference(provider: "gemini" | "groq") {
    try {
      const r = await fetch("/api/chatbot/secrets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai_provider_preference: provider }),
      });
      const d = await r.json();
      if (d?.ok) {
        setAiProvider(provider);
        fetchSecrets();
      } else {
        toast.error(d?.error || "Error al guardar preferencia");
      }
    } catch {
      toast.error("Error al guardar preferencia");
    }
  }

  /** Guarda solo la API key del proveedor de IA seleccionado (Gemini o Groq). */
  async function saveAiKey() {
    const key = aiProvider === "gemini" ? geminiKeyInput.trim() : groqKeyInput.trim();
    if (!key) {
      toast.error(`Ingresa la API key de ${aiProvider === "gemini" ? "Gemini" : "Groq"}`);
      return;
    }
    setTokensSaving(true);
    try {
      const updates: Record<string, string> = aiProvider === "gemini" ? { gemini_api_key: key } : { groq_api_key: key };
      updates.ai_provider_preference = aiProvider;
      const r = await fetch("/api/chatbot/secrets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const d = await r.json();
      if (d?.ok) {
        toast.success("API key guardada");
        if (aiProvider === "gemini") setGeminiKeyInput(""); else setGroqKeyInput("");
        fetchSecrets();
        checkGeminiStatus();
      } else {
        toast.error(d?.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setTokensSaving(false);
    }
  }

  /** Guarda solo el token de Telegram (desde la tarjeta del canal). */
  async function saveTelegramTokenOnly() {
    if (!tgTokenInput.trim()) {
      toast.error("Ingresa el token de Telegram");
      return;
    }
    setTokensSaving(true);
    try {
      const r = await fetch("/api/chatbot/secrets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_bot_token: tgTokenInput.trim() }),
      });
      const d = await r.json();
      if (d?.ok) {
        toast.success(d?.message || "Token de Telegram guardado");
        setTgTokenInput("");
        fetchSecrets();
        checkTelegramToken();
      } else {
        toast.error(d?.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setTokensSaving(false);
    }
  }

  async function saveOtpMode() {
    setOtpModeSaving(true);
    try {
      const r = await fetch("/api/chatbot/secrets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp_mode: otpMode }),
      });
      const d = await r.json();
      if (d?.ok) {
        toast.success(otpMode === "test" ? "Modo OTP: prueba (PIN en chat)." : "Modo OTP: producción (PIN por correo).");
        fetchSecrets();
      } else {
        toast.error(d?.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setOtpModeSaving(false);
    }
  }

  useEffect(() => {
    checkGeminiStatus();
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, []);

  /** Cargar preferencia guardada (Gemini o Groq); si no hay, Groq si solo Groq configurado. */
  useEffect(() => {
    if (!secrets) return;
    if (secrets.ai_provider_preference === "groq" || secrets.ai_provider_preference === "gemini") {
      setAiProvider(secrets.ai_provider_preference);
    } else if (secrets.groqConfigured && !secrets.geminiConfigured) {
      setAiProvider("groq");
    } else {
      setAiProvider("gemini");
    }
  }, [secrets?.ai_provider_preference, secrets?.groqConfigured, secrets?.geminiConfigured]);

  /** Cargar modo OTP guardado. */
  useEffect(() => {
    if (secrets?.otp_mode === "test" || secrets?.otp_mode === "production") setOtpMode(secrets.otp_mode);
  }, [secrets?.otp_mode]);

  const telegramConfig = useMemo(() => configs.find((c) => c.bot_name === "telegram"), [configs]);
  const effectiveTgUsername = tgUsername || telegramConfig?.telegram_bot_username || ENV_TELEGRAM_USERNAME || "";
  const selectedConfig = useMemo(() => configs.find((c) => c.bot_name === selectedBot), [configs, selectedBot]);

  useEffect(() => {
    const u = telegramConfig?.telegram_bot_username ?? ENV_TELEGRAM_USERNAME ?? "";
    setTgUsername(u);
  }, [telegramConfig?.telegram_bot_username]);

  async function initializeChannels() {
    setInitializingChannels(true);
    try {
      const res = await fetch("/api/chatbot/config", { method: "POST" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.configs)) {
        setConfigs(data.configs);
        if (!selectedBot && data.configs.length) setSelectedBot(data.configs[0].bot_name);
        toast.success(data.message || "Canales Telegram y Web listos.");
      } else {
        toast.error(data?.error || "Error al inicializar");
      }
    } catch {
      toast.error("Error al inicializar canales");
    } finally {
      setInitializingChannels(false);
    }
  }

  async function fetchConfigs() {
    try {
      const res = await fetch("/api/chatbot/config");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setConfigs(list);
      if (!selectedBot && list.length) setSelectedBot(list[0].bot_name);
    } catch {
      toast.error("Error al cargar configuración.");
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }

  function updatePrompt(context: string, value: string) {
    setConfigs((prev) =>
      prev.map((c) =>
        c.bot_name === selectedBot ? { ...c, prompts: { ...c.prompts, [context]: value } } : c
      )
    );
  }

  function updateConfig(field: keyof ChatbotConfig, value: unknown) {
    setConfigs((prev) =>
      prev.map((c) => (c.bot_name === selectedBot ? { ...c, [field]: value } : c))
    );
  }

  async function handleSave() {
    if (!selectedConfig) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...selectedConfig };
      if (selectedConfig.bot_name === "telegram" && tgUsername !== undefined) {
        payload.telegram_bot_username = tgUsername.trim() || null;
      }
      const res = await fetch("/api/chatbot/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("Configuración guardada.");
      fetchConfigs();
    } catch {
      toast.error("Error al guardar configuración.");
    } finally {
      setSaving(false);
    }
  }

  async function saveTelegramUsername() {
    if (!telegramConfig) return;
    setTgUsernameSaving(true);
    try {
      const res = await fetch("/api/chatbot/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...telegramConfig,
          telegram_bot_username: tgUsername.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Error");
      toast.success("Usuario de Telegram guardado.");
      fetchConfigs();
    } catch {
      toast.error("Error al guardar. ¿Ejecutaste chatbot_config_telegram.sql?");
    } finally {
      setTgUsernameSaving(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    if (typeof navigator?.clipboard?.writeText === "function") {
      navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado.`)).catch(() => {});
    }
  }

  async function toggleActive(botName: string) {
    const config = configs.find((c) => c.bot_name === botName);
    if (!config) return;
    try {
      await fetch("/api/chatbot/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, is_active: !config.is_active }),
      });
      toast.success(`Chatbot ${config.is_active ? "desactivado" : "activado"}.`);
      fetchConfigs();
    } catch {
      toast.error("Error al cambiar estado.");
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🤖</div>
        <p className="muted">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost" style={{ marginBottom: "12px" }}>
          ← Volver al Dashboard
        </a>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: 48, height: 48, borderRadius: "14px", background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              🤖
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px" }}>Configuración del Chatbot</h1>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "14px" }}>
                Web, Telegram e IA. Edita prompts y parámetros.
              </p>
            </div>
          </div>
          <span className="pill" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", fontSize: "12px" }}>
            v{APP_VERSION}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          style={{ marginTop: "16px", fontSize: "13px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}
        >
          {showGuide ? "▲ Ocultar guía" : "▼ Ver guía rápida"}
        </button>
        {showGuide && (
          <div style={{ marginTop: "12px", padding: "14px 18px", borderRadius: "10px", background: "rgba(99,102,241,0.06)", fontSize: "13px", lineHeight: 1.6, color: "#94a3b8" }}>
            Primero elige el proveedor de IA (Gemini o Groq) y guarda la API key. Luego configura cada canal (Telegram con su token, Web) y los prompts por contexto.
          </div>
        )}
      </div>

      {/* 1. Configuración de IA: primero elegir proveedor (Gemini o Groq), luego API key */}
      <div
        className="card"
        style={{
          marginTop: "20px",
          padding: "24px",
          background: "linear-gradient(180deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9))",
          border: "1px solid rgba(99,184,255,0.25)",
          borderRadius: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>🤖</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px" }}>Configuración de IA</h3>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: "12px" }}>Elige el proveedor y añade tu API key. Se usará en Telegram, Web y Residentes.</p>
            </div>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "8px",
              background: (aiProvider === "gemini" && secrets?.geminiConfigured) || (aiProvider === "groq" && secrets?.groqConfigured)
                ? "rgba(34,197,94,0.2)"
                : "rgba(251,191,36,0.2)",
              color: (aiProvider === "gemini" && secrets?.geminiConfigured) || (aiProvider === "groq" && secrets?.groqConfigured) ? "#4ade80" : "#fbbf24",
            }}
          >
            {(aiProvider === "gemini" && secrets?.geminiConfigured) || (aiProvider === "groq" && secrets?.groqConfigured) ? "✓ Configurado" : "No configurado"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 500 }}>Proveedor de IA</label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                <input type="radio" name="aiProvider" checked={aiProvider === "gemini"} onChange={() => saveAiProviderPreference("gemini")} />
                Gemini (Google AI Studio)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                <input type="radio" name="aiProvider" checked={aiProvider === "groq"} onChange={() => saveAiProviderPreference("groq")} />
                Groq (console.groq.com)
              </label>
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 500 }}>
              {aiProvider === "gemini" ? "API key de Gemini" : "API key de Groq"}
            </label>
            {aiProvider === "gemini" && secrets?.geminiMasked && !geminiKeyInput && (
              <p className="muted" style={{ margin: "0 0 8px", fontSize: "12px" }}>Actual: {secrets.geminiMasked}</p>
            )}
            {aiProvider === "groq" && secrets?.groqMasked && !groqKeyInput && (
              <p className="muted" style={{ margin: "0 0 8px", fontSize: "12px" }}>Actual: {secrets.groqMasked}</p>
            )}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="password"
                value={aiProvider === "gemini" ? geminiKeyInput : groqKeyInput}
                onChange={(e) => aiProvider === "gemini" ? setGeminiKeyInput(e.target.value) : setGroqKeyInput(e.target.value)}
                placeholder={aiProvider === "gemini" ? "Pega tu API key de Google AI Studio" : "Pega tu API key de console.groq.com"}
                style={{ ...inputStyle, flex: "1 1 260px", maxWidth: "400px" }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => aiProvider === "gemini" ? validateGeminiKey(geminiKeyInput || undefined) : validateGroqKey(groqKeyInput || undefined)}
                disabled={aiProvider === "gemini" ? geminiValidating : groqValidating}
              >
                {aiProvider === "gemini" ? (geminiValidating ? "..." : "Validar") : (groqValidating ? "..." : "Validar")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveAiKey}
                disabled={tokensSaving || !(aiProvider === "gemini" ? geminiKeyInput.trim() : groqKeyInput.trim())}
              >
                {tokensSaving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>

        {/* Modelo y prompts por canal (unificado con Configuración de IA) */}
        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(148,163,184,0.2)" }}>
          <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(148,163,184,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "24px" }}>⚙️</span>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Modelo y prompts por canal</h3>
              <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "8px", background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                Proveedor activo: {aiProvider === "groq" ? "Groq" : "Gemini"}
              </span>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: "13px", maxWidth: "560px" }}>
              Ajusta modelo, tokens y creatividad para cada canal (Telegram, Web). Define la personalidad de Lex por contexto (landing, demo, soporte, residente).
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
            <div style={{ flex: "0 0 220px", minWidth: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {(["telegram", "web"] as const).filter((b) => configs.some((c) => c.bot_name === b)).map((bot) => {
                  const config = configs.find((c) => c.bot_name === bot);
                  if (!config) return null;
                  return (
                    <button
                      key={config.bot_name}
                      type="button"
                      onClick={() => setSelectedBot(config.bot_name)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        textAlign: "left",
                        background: selectedBot === config.bot_name ? "rgba(99,102,241,0.2)" : "rgba(30,41,59,0.4)",
                        border: selectedBot === config.bot_name ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(148,163,184,0.1)",
                        color: "inherit",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{config.bot_name === "telegram" ? "✈️ Telegram" : "🌐 Web"}</span>
                      <span style={{ fontSize: "10px", marginLeft: "6px", padding: "2px 6px", borderRadius: "6px", background: config.is_active ? "rgba(34,197,94,0.2)" : "rgba(148,163,184,0.2)", color: config.is_active ? "#4ade80" : "#94a3b8" }}>
                        {config.is_active ? "Activo" : "Pausado"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {configs.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p className="muted" style={{ fontSize: "13px", margin: 0 }}>
                    Aún no hay canales configurados. Crea Telegram y Web para ajustar modelo, prompts y personalidad.
                  </p>
                  <button
                    type="button"
                    onClick={initializeChannels}
                    disabled={initializingChannels}
                    className="btn btn-primary"
                    style={{ alignSelf: "flex-start" }}
                  >
                    {initializingChannels ? "Inicializando…" : "Inicializar canales (Telegram y Web)"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ flex: "1 1 400px", minWidth: 0 }}>
              {selectedConfig ? (
                <>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setConfigTab("ajustes")}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: configTab === "ajustes" ? "rgba(99,102,241,0.25)" : "rgba(30,41,59,0.5)",
                        color: configTab === "ajustes" ? "#c7d2fe" : "#94a3b8",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      ⚙️ Ajustes del modelo
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfigTab("prompts")}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: configTab === "prompts" ? "rgba(99,102,241,0.25)" : "rgba(30,41,59,0.5)",
                        color: configTab === "prompts" ? "#c7d2fe" : "#94a3b8",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      ✏️ Personalidad por contexto
                    </button>
                  </div>

                  {configTab === "ajustes" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Modelo de IA</label>
                        <select
                          value={selectedConfig.ai_model || (aiProvider === "groq" ? "llama-3.1-8b-instant" : "gemini-2.0-flash")}
                          onChange={(e) => updateConfig("ai_model", e.target.value)}
                          style={{ ...inputStyle, maxWidth: "280px" }}
                        >
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash (legacy)</option>
                          <option value="llama-3.1-8b-instant">Llama 3.1 8B (Groq)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Máx. tokens por respuesta</label>
                        <input
                          type="number"
                          min={128}
                          max={4096}
                          value={selectedConfig.max_tokens || 500}
                          onChange={(e) => updateConfig("max_tokens", Number(e.target.value))}
                          style={{ ...inputStyle, maxWidth: "140px" }}
                        />
                        <p className="muted" style={{ margin: "6px 0 0", fontSize: "12px" }}>Límite de longitud de cada respuesta (128–4096)</p>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Creatividad (temperatura): {selectedConfig.temperature ?? 0.7}</label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={selectedConfig.temperature ?? 0.7}
                          onChange={(e) => updateConfig("temperature", Number(e.target.value))}
                          style={{ maxWidth: "280px" }}
                        />
                        <p className="muted" style={{ margin: "6px 0 0", fontSize: "12px" }}>0 = más preciso · 1 = más creativo y variado</p>
                      </div>
                    </div>
                  )}

                  {configTab === "prompts" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <p className="muted" style={{ margin: "0 0 8px", fontSize: "13px" }}>
                        Define cómo se comporta Lex según el tipo de usuario. Cada contexto usa un prompt distinto.
                      </p>
                      {PROMPT_CONTEXTS.map((context) => {
                        const prompt = selectedConfig.prompts?.[context] || "";
                        return (
                          <div
                            key={context}
                            style={{
                              padding: "18px",
                              borderRadius: "14px",
                              background: "rgba(15,23,42,0.5)",
                              border: "1px solid rgba(148,163,184,0.12)",
                            }}
                          >
                            <div style={{ marginBottom: "8px" }}>
                              <strong style={{ fontSize: "14px" }}>{CONTEXT_LABELS[context] || context}</strong>
                              <p className="muted" style={{ margin: "4px 0 0", fontSize: "12px" }}>{CONTEXT_DESCRIPTIONS[context] || ""}</p>
                            </div>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingContext(editingContext === context ? null : context)} style={{ marginBottom: "10px" }}>
                              {editingContext === context ? "Cerrar editor" : "Editar prompt"}
                            </button>
                            {editingContext === context ? (
                              <textarea
                                value={prompt}
                                onChange={(e) => updatePrompt(context, e.target.value)}
                                rows={5}
                                placeholder="Ej: Eres Lex, asistente de Chat Vote. Responde de forma amigable..."
                                style={{ ...inputStyle, minHeight: "100px", resize: "vertical", width: "100%" }}
                              />
                            ) : (
                              <p className="muted" style={{ margin: 0, fontSize: "13px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{prompt || "Sin prompt configurado."}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap", paddingTop: "16px", borderTop: "1px solid rgba(148,163,184,0.12)" }}>
                    <button className="btn btn-ghost" onClick={fetchConfigs}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button>
                  </div>
                </>
              ) : configs.length > 0 ? (
                <p className="muted">Selecciona un canal (Telegram o Web) para editar ajustes y personalidad.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {/* Canal Web */}
        <div
          className="card"
          style={{
            padding: "24px",
            background: "linear-gradient(180deg, rgba(30,41,59,0.6), rgba(15,23,42,0.8))",
            border: "1px solid rgba(148,163,184,0.12)",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "28px" }}>🌐</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px" }}>Chatbot Web</h3>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: "12px" }}>Landing y widget</p>
            </div>
          </div>
          <p className="muted" style={{ fontSize: "12px", marginBottom: "12px", wordBreak: "break-all" }}>{baseUrl || "—"}/</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {baseUrl && (
              <>
                <button type="button" className="btn btn-primary" onClick={() => { setPreviewProfile("residente"); setPreviewOpen(true); }}>
                  Probar
                </button>
                <a className="btn btn-ghost" href={baseUrl + "/?openChat=1"} target="_blank" rel="noopener noreferrer">Abrir</a>
                <button className="btn btn-ghost" onClick={() => copyToClipboard(baseUrl + "/", "URL")}>Copiar</button>
              </>
            )}
          </div>
        </div>

        {/* Canal Telegram */}
        <div
          className="card"
          style={{
            padding: "24px",
            background: "linear-gradient(180deg, rgba(30,41,59,0.6), rgba(15,23,42,0.8))",
            border: "1px solid rgba(99,184,255,0.2)",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "28px" }}>✈️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px" }}>Telegram</h3>
                <p className="muted" style={{ margin: "2px 0 0", fontSize: "12px" }}>Conectar bot</p>
              </div>
            </div>
            {tgStatus && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: tgStatus.valid ? "rgba(34,197,94,0.2)" : tgStatus.configured ? "rgba(251,191,36,0.2)" : "rgba(148,163,184,0.2)",
                    color: tgStatus.valid ? "#4ade80" : tgStatus.configured ? "#fbbf24" : "#94a3b8",
                  }}
                >
                  {tgStatus.valid ? `✓ @${tgStatus.username || "OK"}` : tgStatus.configured ? "Token inválido" : "Sin token"}
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={checkTelegramToken} style={{ fontSize: "11px" }}>
                  Verificar
                </button>
              </div>
            )}
          </div>

          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 500 }}>Token del bot (Telegram)</label>
          {secrets?.telegramMasked && !tgTokenInput && (
            <p className="muted" style={{ margin: "0 0 8px", fontSize: "12px" }}>Actual: {secrets.telegramMasked}</p>
          )}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <input
              type="password"
              value={tgTokenInput}
              onChange={(e) => setTgTokenInput(e.target.value)}
              placeholder="Pega el token de @BotFather"
              style={{ ...inputStyle, flex: "1 1 200px" }}
            />
            <button type="button" className="btn btn-ghost" onClick={() => validateTelegramToken(tgTokenInput || undefined)} disabled={tgValidating}>
              {tgValidating ? "..." : "Validar"}
            </button>
            <button type="button" className="btn btn-primary" onClick={saveTelegramTokenOnly} disabled={tokensSaving || !tgTokenInput.trim()}>
              {tokensSaving ? "..." : "Guardar token"}
            </button>
          </div>
          <p className="muted" style={{ fontSize: "11px", margin: "-8px 0 12px" }}>Tras guardar, reinicia el proceso del bot para que use el nuevo token.</p>

          <label style={{ display: "block", marginBottom: "8px", fontSize: "13px" }}>Usuario del bot (sin @)</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="text"
              value={tgUsername}
              onChange={(e) => setTgUsername(e.target.value)}
              placeholder="Assembly2Bot"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={saveTelegramUsername}
              disabled={tgUsernameSaving || !telegramConfig}
            >
              {tgUsernameSaving ? "..." : "Guardar"}
            </button>
          </div>

          <p className="muted" style={{ fontSize: "11px", marginBottom: "12px" }}>
            Crea el bot en <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>@BotFather</a>. Añade <code>TELEGRAM_BOT_TOKEN</code> en .env para que responda.
          </p>

          {effectiveTgUsername && (
            <>
              <p className="muted" style={{ fontSize: "12px", marginBottom: "8px" }}>t.me/{effectiveTgUsername}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <a className="btn btn-primary" href={`https://t.me/${effectiveTgUsername}`} target="_blank" rel="noopener noreferrer">Abrir</a>
                <button className="btn btn-ghost" onClick={() => copyToClipboard(`https://t.me/${effectiveTgUsername}`, "Telegram")}>Copiar</button>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Modo OTP */}
      <div className="card" style={{ marginTop: "20px", padding: "20px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>Modo OTP (código de acceso)</h3>
        <p className="muted" style={{ margin: "0 0 16px", fontSize: "13px" }}>
          En <strong>prueba</strong> el PIN se muestra en el chat. En <strong>producción</strong> se envía por correo (requiere SMTP configurado).
        </p>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="otp_mode"
              checked={otpMode === "test"}
              onChange={() => setOtpMode("test")}
              style={{ accentColor: "#6366f1" }}
            />
            <span>Prueba (PIN en chat)</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="otp_mode"
              checked={otpMode === "production"}
              onChange={() => setOtpMode("production")}
              style={{ accentColor: "#6366f1" }}
            />
            <span>Producción (PIN por correo)</span>
          </label>
          <button type="button" className="btn btn-primary" onClick={saveOtpMode} disabled={otpModeSaving}>
            {otpModeSaving ? "Guardando…" : "Guardar"}
          </button>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <p className="muted" style={{ marginTop: "12px", fontSize: "11px" }}>
            Si <code>OTP_DEBUG=true</code> en .env, siempre se usa modo prueba.
          </p>
        )}
      </div>

      {/* Tests */}
      <div className="card" style={{ marginTop: "20px", padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Tests de prueba</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {TEST_FLOWS.map((test) => (
            <div
              key={test.id}
              style={{
                padding: "16px 18px",
                borderRadius: "12px",
                background: "rgba(30,41,59,0.4)",
                border: "1px solid rgba(148,163,184,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>{test.icon}</span>
                <strong style={{ fontSize: "14px" }}>{test.title}</strong>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: "12px", lineHeight: 1.5 }}>{test.description}</p>
              <code style={{ fontSize: "11px", color: "#94a3b8", wordBreak: "break-all" }}>{test.email}</code>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => { setPreviewProfile(test.profile); setPreviewOpen(true); }}>
                  Probar
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(test.email, "Correo")}>📋</button>
                {baseUrl && (
                  <a className="btn btn-ghost btn-sm" href={test.id === "residente" ? baseUrl + "/residentes/chat" : baseUrl + "/?openChat=1"} target="_blank" rel="noopener noreferrer">
                    Abrir
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
          onClick={() => setPreviewOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ChatbotPreview onClose={() => setPreviewOpen(false)} initialProfile={previewProfile} />
          </div>
        </div>
      )}
    </>
  );
}
