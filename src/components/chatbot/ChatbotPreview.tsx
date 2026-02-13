"use client";

import { useEffect, useState } from "react";

type Message = { from: "bot" | "user"; text: string };
export type TestProfile = "residente" | "admin" | "demo";

const GREETING_LANDING = "Hola, soy Lex, asistente de Assembly 2.0. ¿Qué perfil te describe mejor: Administrador PH, Junta Directiva o solo demo? Escribe o elige una opción abajo.";
const PROMPT_RESIDENTE = "¿Cuál es el correo que tienes registrado en tu PH?";
const PROMPT_ADMIN = "¿Cuál es tu correo de trabajo para temas de PH?";
const PROMPT_DEMO = "¿Con qué correo quieres probar el sistema?";

const GREETING_BY_PROFILE: Record<TestProfile, string> = {
  residente: "Hola, soy Lex. Soy tu asistente para asambleas de PH. " + PROMPT_RESIDENTE,
  admin: GREETING_LANDING + "\n\n[Modo prueba Admin] " + PROMPT_ADMIN,
  demo: GREETING_LANDING + "\n\n[Modo prueba Cliente nuevo] " + PROMPT_DEMO,
};

const TEST_USERS: Record<TestProfile, string> = {
  residente: "residente2@demo.assembly2.com",
  admin: "admin@torresdelpacifico.com",
  demo: "nuevo@empresa.com (demo)",
};

export default function ChatbotPreview({
  onClose,
  initialProfile = "residente",
}: {
  onClose: () => void;
  initialProfile?: TestProfile;
}) {
  const [profile, setProfile] = useState<TestProfile>(initialProfile);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<"greeting" | "email" | "done">("greeting");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chatbot/config")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setMessages([{ from: "bot", text: GREETING_BY_PROFILE[profile] }]);
    setStep("email");
  }, [profile]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");

    if (step === "greeting") {
      const lower = trimmed.toLowerCase();
      if (lower.includes("residente") || lower.includes("propiet")) {
        setProfile("residente");
        setMessages((prev) => [...prev, { from: "bot", text: GREETING_BY_PROFILE.residente }]);
        setStep("email");
        return;
      }
      if (lower.includes("admin")) {
        setProfile("admin");
        setMessages((prev) => [...prev, { from: "bot", text: "[Modo Admin] " + PROMPT_ADMIN }]);
        setStep("email");
        return;
      }
      if (lower.includes("demo") || lower.includes("junta") || lower.includes("probar")) {
        setProfile("demo");
        setMessages((prev) => [...prev, { from: "bot", text: "[Modo Cliente nuevo] " + PROMPT_DEMO }]);
        setStep("email");
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Elige un perfil: escribe «residente», «administrador» o «demo» para probar cada flujo.",
        },
      ]);
      return;
    }

    if (step === "email") {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      const userExample = TEST_USERS[profile];
      const next =
        profile === "residente"
          ? "En la landing se validaría el correo contra la BD (residentes). Si existe, se envía PIN. Usuario de prueba: " + userExample
          : profile === "admin"
            ? "En la landing se validaría el correo y se enviaría PIN. Acceso Admin PH. Usuario de prueba: " + userExample
            : "En la landing se generaría acceso demo y se enviaría PIN. Usuario de prueba: " + userExample;
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: isEmail
            ? next + "\n\n(Puedes probar el flujo completo en la landing o en los enlaces de test.)"
            : "Introduce un correo válido para simular el siguiente paso. Ejemplo: " + userExample,
        },
      ]);
      if (isEmail) setStep("done");
    }
  };

  return (
    <div
      className="card glass"
      style={{
        maxWidth: "440px",
        width: "100%",
        border: "1px solid rgba(148,163,184,0.22)",
        boxShadow: "0 30px 80px rgba(2,6,23,0.65)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
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
            <img src="/avatars/chatbot.png" alt="Lex" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <strong style={{ letterSpacing: "0.01em" }}>Lex · Vista previa</strong>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Sincronizado con flujos reales</div>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cerrar
        </button>
      </div>

      <div style={{ marginTop: "12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {(["residente", "admin", "demo"] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={`btn ${profile === p ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "12px", padding: "8px 12px" }}
            onClick={() => setProfile(p)}
          >
            {p === "residente" ? "Residente" : p === "admin" ? "Administrador" : "Cliente nuevo"}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: "14px",
          display: "grid",
          gap: "12px",
          maxHeight: "300px",
          overflowY: "auto",
          paddingRight: "6px",
        }}
      >
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.from}-${index}`}
              style={{
                display: "flex",
                justifyContent: message.from === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "88%",
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
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(99,102,241,0.35)",
            background: "rgba(15,23,42,0.7)",
            color: "#e2e8f0",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button type="button" className="btn btn-primary btn-demo" onClick={handleSend}>
          Enviar
        </button>
      </div>
    </div>
  );
}
