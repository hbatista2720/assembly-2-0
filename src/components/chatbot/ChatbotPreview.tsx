"use client";

import { useEffect, useState } from "react";

type Message = { from: "bot" | "user"; text: string };

export default function ChatbotPreview({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chatbot/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const webConfig = Array.isArray(data) ? data.find((item: any) => item.bot_name === "web") : null;
        const prompt = webConfig?.prompts?.landing || "Hola, soy Lex. ¿En qué puedo ayudarte?";
        setMessages([{ from: "bot", text: prompt }]);
      })
      .catch(() => {
        setMessages([{ from: "bot", text: "Hola, soy Lex. ¿En qué puedo ayudarte?" }]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: "Mensaje recibido. En la landing completa, Lex te guiará según tu perfil (admin, residente, etc.)." },
    ]);
  };

  return (
    <div
      className="card glass"
      style={{
        maxWidth: "420px",
        width: "100%",
        border: "1px solid rgba(148,163,184,0.22)",
        boxShadow: "0 30px 80px rgba(2,6,23,0.65)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Assembly 2.0</div>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <div
        style={{
          marginTop: "18px",
          display: "grid",
          gap: "12px",
          maxHeight: "320px",
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
