"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const DEMO_RESIDENT_EMAILS = [
  "residente1@demo.assembly2.com",
  "residente2@demo.assembly2.com",
  "residente3@demo.assembly2.com",
  "residente4@demo.assembly2.com",
  "residente5@demo.assembly2.com",
];

const RESIDENT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export default function ChatPage() {
  const [chatInput, setChatInput] = useState("");
  const [chatStep, setChatStep] = useState(0);
  const [chatRole, setChatRole] = useState<"admin" | "junta" | "residente" | "demo" | "">("");
  const [residentEmailValidated, setResidentEmailValidated] = useState(false);
  type ChatCard = "votacion" | "asambleas" | "calendario" | "tema" | "poder";
  const [chatMessages, setChatMessages] = useState<Array<{ from: "bot" | "user"; text: string; card?: ChatCard }>>([]);
  const [residentVoteSent, setResidentVoteSent] = useState(false);
  const [poderSubmitted, setPoderSubmitted] = useState(false);
  const [poderEmail, setPoderEmail] = useState("");
  type AssemblyContext = "activa" | "programada" | "sin_asambleas";
  const [assemblyContext, setAssemblyContext] = useState<AssemblyContext>("activa");
  const [webPrompt] = useState("Hola, soy Lex. ¿Qué perfil tienes?");

  useEffect(() => {
    fetch("/api/chatbot/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const webConfig = Array.isArray(data) ? data.find((item: { bot_name: string }) => item.bot_name === "web") : null;
        const prompt = webConfig?.prompts?.landing || webPrompt;
        setChatMessages([{ from: "bot", text: prompt }]);
      })
      .catch(() => {
        setChatMessages([{ from: "bot", text: webPrompt }]);
      });
  }, []);

  const sessionRestored = useRef(false);

  useEffect(() => {
    try {
      const validatedAt = localStorage.getItem("assembly_resident_validated");
      const email = localStorage.getItem("assembly_resident_email");
      if (email && validatedAt) {
        const ts = Number(validatedAt);
        if (!Number.isNaN(ts) && Date.now() - ts < RESIDENT_SESSION_TTL_MS) {
          setChatRole("residente");
          setResidentEmailValidated(true);
          setChatStep(8);
          sessionRestored.current = true;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!sessionRestored.current || !residentEmailValidated || chatRole !== "residente" || chatMessages.length !== 1) return;
    if (chatMessages[0].from !== "bot") return;
    sessionRestored.current = false;
    setChatMessages((prev) => [...prev, { from: "bot", text: "Correo reconocido. Te conecto con tu administrador." }]);
  }, [residentEmailValidated, chatRole, chatMessages]);

  useEffect(() => {
    if (chatRole !== "residente" || !residentEmailValidated) return;
    const profile = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("profile")?.trim() || "" : "";
    const q = profile ? `?profile=${encodeURIComponent(profile)}` : "";
    fetch(`/api/assembly-context${q}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.context) setAssemblyContext(data.context);
      })
      .catch(() => {});
  }, [chatRole, residentEmailValidated]);

  const pushBotMessage = (text: string) => {
    setChatMessages((prev) => [...prev, { from: "bot", text }]);
  };

  const pushUserMessage = (text: string) => {
    setChatMessages((prev) => [...prev, { from: "user", text }]);
  };

  const getRoleEmailPrompt = (role: typeof chatRole) => {
    if (role === "admin") return "¿Cuál es tu correo de trabajo para temas de PH?";
    if (role === "residente") return "¿Cuál es el correo que tienes registrado en tu PH?";
    if (role === "junta") return "¿Con qué correo quieres probar el sistema?";
    return "¿Con qué correo quieres probar el sistema?";
  };

  const handleQuickActionInChat = (label: string, response: string, card: ChatCard) => {
    pushUserMessage(label);
    pushBotMessage(response);
    setChatMessages((prev) => [...prev, { from: "bot", text: "", card }]);
  };

  const handleChatSubmit = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    pushUserMessage(trimmed);

    if (!chatRole) {
      const lowered = trimmed.toLowerCase();
      if (lowered.includes("admin")) {
        setChatRole("admin");
        pushBotMessage(getRoleEmailPrompt("admin"));
        setChatStep(3);
        setChatInput("");
        return;
      }
      if (lowered.includes("junta")) {
        setChatRole("junta");
        pushBotMessage(getRoleEmailPrompt("junta"));
        setChatStep(3);
        setChatInput("");
        return;
      }
      if (lowered.includes("residente") || lowered.includes("propiet")) {
        setChatRole("residente");
        pushBotMessage(getRoleEmailPrompt("residente"));
        setChatStep(3);
        setChatInput("");
        return;
      }
      if (lowered.includes("demo")) {
        setChatRole("demo");
        pushBotMessage(getRoleEmailPrompt("demo"));
        setChatStep(3);
        setChatInput("");
        return;
      }
      pushBotMessage("Elige un perfil: Administrador PH, Junta Directiva, Residente o Solo demo.");
      setChatInput("");
      return;
    }

    if (chatStep < 3) {
      setChatInput("");
      return;
    }

    const emailLower = trimmed.toLowerCase();
    if (chatRole === "residente") {
      let recognized = false;
      try {
        const existingUsers = JSON.parse(localStorage.getItem("assembly_users") || "[]") as Array<{ email: string }>;
        if (existingUsers.some((u) => u.email?.toLowerCase() === emailLower)) recognized = true;
      } catch {
        // ignore
      }
      if (!recognized && DEMO_RESIDENT_EMAILS.includes(emailLower)) recognized = true;
      if (!recognized) {
        pushBotMessage("No encuentro ese correo. Contacta al administrador de tu PH para validar.");
        setChatInput("");
        return;
      }
      setResidentEmailValidated(true);
      try {
        localStorage.setItem("assembly_resident_email", emailLower);
        localStorage.setItem("assembly_resident_validated", String(Date.now()));
      } catch {
        // ignore
      }
      pushBotMessage("Correo reconocido. Te conecto con tu administrador.");
      setChatStep(8);
      setChatInput("");
      return;
    }

    pushBotMessage("Listo. Te enviamos el acceso de demo.");
    setChatStep(8);
    setChatInput("");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.25), transparent 55%), rgba(2,6,23,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="card glass"
        style={{
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(148,163,184,0.22)",
          boxShadow: "0 30px 80px rgba(2,6,23,0.65)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.25)",
                boxShadow: "0 10px 28px rgba(99, 102, 241, 0.4)",
              }}
            >
              <img src="/avatars/chatbot.png" alt="Lex" style={{ width: "100%", height: "100%" }} />
            </div>
            <div>
              <strong style={{ letterSpacing: "0.01em" }}>Lex · Asistente</strong>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Assembly 2.0</div>
            </div>
          </div>
          {residentEmailValidated && chatRole === "residente" ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const msg = "Estás abandonando la votación. Esto afecta el quórum. ¿Cerrar sesión?";
                if (typeof window !== "undefined" && window.confirm(msg)) {
                  const userId = localStorage.getItem("assembly_user_id");
                  const email = localStorage.getItem("assembly_resident_email") || localStorage.getItem("assembly_email");
                  const organizationId = localStorage.getItem("assembly_organization_id");
                  const payload: Record<string, string | null | undefined> = {
                    assembly_id: null,
                    resident_name: null,
                    unit: null,
                  };
                  if (userId) payload.user_id = userId;
                  if (email) payload.email = email;
                  if (organizationId) payload.organization_id = organizationId;
                  if (userId || email) {
                    fetch("/api/resident-abandon", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    }).catch(() => {});
                  }
                  try {
                    localStorage.removeItem("assembly_resident_email");
                    localStorage.removeItem("assembly_resident_validated");
                    localStorage.removeItem("assembly_user_id");
                    localStorage.removeItem("assembly_email");
                    localStorage.removeItem("assembly_organization_id");
                  } catch {}
                  window.location.href = "/";
                }
              }}
            >
              Cerrar sesión
            </button>
          ) : (
            <Link className="btn btn-ghost" href="/">
              Volver al inicio
            </Link>
          )}
        </div>

        <div
          style={{
            marginTop: "18px",
            display: "grid",
            gap: "12px",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingRight: "6px",
          }}
        >
          {chatMessages.map((message, index) => (
            <div
              key={`${message.from}-${index}-${message.card ?? ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: message.from === "user" ? "flex-end" : "flex-start",
              }}
            >
              {(message.text || !message.card) && (
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "12px 14px",
                    borderRadius: "16px",
                    background:
                      message.from === "user"
                        ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(236,72,153,0.2))"
                        : "rgba(15,23,42,0.7)",
                    color: "#e2e8f0",
                    border:
                      message.from === "user"
                        ? "1px solid rgba(129, 140, 248, 0.4)"
                        : "1px solid rgba(148,163,184,0.12)",
                  }}
                >
                  {message.text}
                </div>
              )}
              {message.from === "bot" && message.card && (
                <div
                  style={{
                    maxWidth: "78%",
                    marginTop: "6px",
                    padding: "14px",
                    borderRadius: "16px",
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    color: "#e2e8f0",
                  }}
                >
                  {message.card === "votacion" && (
                    <>
                      <div style={{ fontWeight: 600, marginBottom: "8px" }}>Aprobación de presupuesto</div>
                      <div className="muted" style={{ fontSize: "12px", marginBottom: "12px" }}>Estado: Abierto</div>
                      {!residentVoteSent ? (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {(["Sí", "No", "Abstengo"] as const).map((op) => (
                            <button
                              key={op}
                              className="btn btn-primary btn-demo"
                              style={{ borderRadius: "999px", padding: "8px 14px" }}
                              onClick={() => {
                                setResidentVoteSent(true);
                                pushUserMessage(`Voto: ${op}`);
                                pushBotMessage("Tu voto quedó registrado con trazabilidad legal.");
                              }}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="muted" style={{ fontSize: "12px" }}>Tu voto fue registrado.</span>
                      )}
                    </>
                  )}
                  {message.card === "asambleas" && (
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
                        <div>
                          <strong>Asamblea ordinaria</strong>
                          <div className="muted" style={{ fontSize: "12px" }}>10 Feb 2026</div>
                        </div>
                        <span className="pill">ACTIVA</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                        <div>
                          <strong>Asamblea extraordinaria</strong>
                          <div className="muted" style={{ fontSize: "12px" }}>24 Feb 2026</div>
                        </div>
                        <span className="pill" title="Próximamente">PROGRAMADA</span>
                      </div>
                    </div>
                  )}
                  {message.card === "calendario" && (
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
                        <span className="muted" style={{ fontSize: "12px" }}>Asamblea ordinaria</span>
                        <div><strong>10 Feb 2026 · 7:00 pm</strong></div>
                      </div>
                      <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
                        <span className="muted" style={{ fontSize: "12px" }}>Entrega de poderes</span>
                        <div><strong>07 Feb 2026 · 5:00 pm</strong></div>
                      </div>
                      <div style={{ padding: "6px 0" }}>
                        <span className="muted" style={{ fontSize: "12px" }}>Votación abierta</span>
                        <div><strong>10 Feb 2026 · 7:30 pm</strong></div>
                      </div>
                    </div>
                  )}
                  {message.card === "tema" && (
                    <>
                      <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>Aprobación de presupuesto 2026</h4>
                      <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
                        Se requiere validar el presupuesto anual y el plan de inversiones. Revisa los anexos antes de votar.
                      </p>
                      <button
                        className="btn btn-ghost"
                        style={{ marginTop: "10px", borderRadius: "999px" }}
                        onClick={() => pushBotMessage("Anexos disponibles en el portal del PH. Si no los ves, pide el enlace al administrador.")}
                      >
                        Ver anexos
                      </button>
                    </>
                  )}
                  {message.card === "poder" && (
                    <>
                      {!poderSubmitted ? (
                        <>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#94a3b8" }}>Correo del apoderado</label>
                          <input
                            type="email"
                            placeholder="apoderado@correo.com"
                            value={poderEmail}
                            onChange={(e) => setPoderEmail(e.target.value)}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              padding: "10px 12px",
                              borderRadius: "12px",
                              border: "1px solid rgba(148,163,184,0.3)",
                              background: "rgba(15,23,42,0.6)",
                              color: "#e2e8f0",
                              marginBottom: "10px",
                            }}
                          />
                          <button
                            className="btn btn-primary btn-demo"
                            style={{ borderRadius: "999px" }}
                            onClick={() => {
                              const raw = poderEmail.trim();
                              const email = raw || "";
                              const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                              if (!validEmail || !email) {
                                pushBotMessage("Indica un correo válido para el apoderado.");
                                return;
                              }
                              setPoderSubmitted(true);
                              pushUserMessage(`Poder enviado a ${email}`);
                              pushBotMessage("Recibido. Lo validamos en minutos y te confirmamos.");
                            }}
                          >
                            Enviar poder
                          </button>
                        </>
                      ) : (
                        <span className="muted" style={{ fontSize: "12px" }}>Poder enviado. Te confirmamos en minutos.</span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pills: debajo del último mensaje, encima del input */}
        {!chatRole ? (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", flexShrink: 0 }}>
            {[
              { label: "Administrador PH", value: "admin" as const },
              { label: "Junta Directiva", value: "junta" as const },
              { label: "Residente", value: "residente" as const },
              { label: "Solo demo", value: "demo" as const },
            ].map((option) => (
              <button
                key={option.value}
                className="btn btn-ghost"
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(15,23,42,0.7)",
                }}
                onClick={() => {
                  setChatRole(option.value);
                  if (option.value === "residente") setResidentEmailValidated(false);
                  pushUserMessage(option.label);
                  pushBotMessage(getRoleEmailPrompt(option.value));
                  setChatStep(3);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : chatStep >= 8 && chatRole === "residente" && residentEmailValidated ? (
          <div style={{ marginTop: "12px", flexShrink: 0 }}>
            {assemblyContext === "sin_asambleas" && (
              <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#94a3b8" }}>
                No hay asambleas programadas para el año en curso. ¿Consultar con el administrador?
              </p>
            )}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "Votación", msg: "Aquí tienes la votación activa del día.", card: "votacion" as ChatCard, primary: true, onlyWhenActive: true },
                { label: "Asambleas", msg: "Te muestro el listado de asambleas activas.", card: "asambleas" as ChatCard, primary: false, onlyWhenActive: false },
                { label: "Calendario", msg: "Aquí tienes el calendario de tu PH.", card: "calendario" as ChatCard, primary: false, onlyWhenActive: false },
                { label: "Tema del día", msg: "Tema activo: aprobación de presupuesto.", card: "tema" as ChatCard, primary: false, onlyWhenActive: true },
                { label: "Ceder poder", msg: "Cede el poder y lo validamos en minutos.", card: "poder" as ChatCard, primary: false, onlyWhenActive: false },
              ].map(({ label, msg, card, primary, onlyWhenActive }) => {
                const active = assemblyContext === "activa";
                const disabled = onlyWhenActive && !active;
                return (
                  <button
                    key={label}
                    className={primary && !disabled ? "btn btn-primary btn-demo" : "btn btn-ghost"}
                    style={{
                      borderRadius: "999px",
                      border: primary && !disabled ? undefined : "1px solid rgba(148,163,184,0.3)",
                      background: disabled ? "rgba(71,85,105,0.4)" : primary ? undefined : "rgba(15,23,42,0.7)",
                      opacity: disabled ? 0.8 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                    title={disabled ? "No hay votación activa" : undefined}
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      handleQuickActionInChat(label, msg, card);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : chatStep >= 8 ? (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", flexShrink: 0 }}>
            <Link className="btn btn-primary btn-demo" href="/login" style={{ borderRadius: "999px" }}>
              Agendar demo
            </Link>
            <Link className="btn btn-ghost" href="/administraciones" style={{ borderRadius: "999px", border: "1px solid rgba(148,163,184,0.3)" }}>
              Ver planes
            </Link>
          </div>
        ) : null}

        {(chatStep < 8 || (chatRole === "residente" && residentEmailValidated)) ? (
          <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexShrink: 0 }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={chatStep >= 8 ? "Escribe algo..." : "Escribe tu respuesta..."}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(99,102,241,0.35)",
                background: "rgba(15,23,42,0.7)",
                color: "#e2e8f0",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChatSubmit();
              }}
            />
            <button className="btn btn-primary btn-demo" onClick={handleChatSubmit}>
              Enviar
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
