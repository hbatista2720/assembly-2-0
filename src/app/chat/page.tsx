"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DEMO_RESIDENT_EMAILS = [
  "residente1@demo.assembly2.com",
  "residente2@demo.assembly2.com",
  "residente3@demo.assembly2.com",
  "residente4@demo.assembly2.com",
  "residente5@demo.assembly2.com",
  "residente1@torresdelpacifico.com",
  "residente2@torresdelpacifico.com",
  "residente3@torresdelpacifico.com",
];

const RESIDENT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const ABANDON_CONFIRM_PHRASE = "Si abandonar";

const RESIDENTES_CHAT_PROMPT = "Soy Lex, chatbot para asambleas de PH (propiedades horizontales). ¿Cuál es el correo que tienes registrado en tu PH?";
/** Saludo visible al abrir el chat tipo landing. El prompt de config no se muestra al usuario. */
const LANDING_CHAT_GREETING =
  "Hola, soy Lex, asistente de Assembly 2.0. ¿Qué perfil te describe mejor: Administrador PH, Junta Directiva o solo demo? Escribe o elige una opción abajo.";

export default function ChatPage() {
  const pathname = usePathname();
  const isResidentesChat = pathname === "/residentes/chat" || (typeof pathname === "string" && pathname.startsWith("/residentes/chat"));
  const [chatInput, setChatInput] = useState("");
  const [chatStep, setChatStep] = useState(0);
  const [chatRole, setChatRole] = useState<"admin" | "junta" | "residente" | "demo" | "">("");
  const [residentEmailValidated, setResidentEmailValidated] = useState(false);
  type ChatCard = "votacion" | "asambleas" | "calendario" | "tema" | "poder";
  const [chatMessages, setChatMessages] = useState<Array<{ from: "bot" | "user"; text: string; card?: ChatCard }>>([]);
  const MAX_VOTE_MODIFICATIONS = 2;
  const [residentVoteSent, setResidentVoteSent] = useState(false);
  const [residentLastVote, setResidentLastVote] = useState<"Sí" | "No" | "Abstengo" | null>(null);
  const [residentVoteModifyCount, setResidentVoteModifyCount] = useState(0);
  const [residentVoteParticiparClicked, setResidentVoteParticiparClicked] = useState(false);
  const [poderSubmitted, setPoderSubmitted] = useState(false);
  const [hasPendingPowerRequest, setHasPendingPowerRequest] = useState(false);
  const [poderEmail, setPoderEmail] = useState("");
  const [poderApoderadoTipo, setPoderApoderadoTipo] = useState<"residente_ph" | "titular_mayor_edad">("residente_ph");
  const [poderApoderadoNombre, setPoderApoderadoNombre] = useState("");
  const [poderApoderadoCedula, setPoderApoderadoCedula] = useState("");
  const [poderApoderadoTelefono, setPoderApoderadoTelefono] = useState("");
  const [poderVigencia, setPoderVigencia] = useState("");
  type AssemblyContext = "activa" | "programada" | "sin_asambleas";
  const [assemblyContext, setAssemblyContext] = useState<AssemblyContext>("activa");
  type ResidentProfile = { organization_id?: string; organization_name: string; unit: string | null; resident_name: string; email: string } | null;
  const [residentProfile, setResidentProfile] = useState<ResidentProfile>(null);
  const [temaActivo, setTemaActivo] = useState<{ title?: string; description?: string; status?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [abandonConfirmPhrase, setAbandonConfirmPhrase] = useState("");
  const [residentEmailPending, setResidentEmailPending] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages]);

  useEffect(() => {
    if (isResidentesChat) {
      setChatMessages([{ from: "bot", text: RESIDENTES_CHAT_PROMPT }]);
      setChatRole("residente");
      setChatStep(3);
      return;
    }
    fetch("/api/chatbot/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setChatMessages([{ from: "bot", text: LANDING_CHAT_GREETING }]);
      })
      .catch(() => {
        setChatMessages([{ from: "bot", text: LANDING_CHAT_GREETING }]);
      });
  }, [isResidentesChat]);

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
    const email = typeof window !== "undefined" ? localStorage.getItem("assembly_resident_email") || "" : "";
    const prefix = email.split("@")[0] || "";
    const displayName = /^residente\d*$/i.test(prefix) ? `Residente ${prefix.replace(/^residente/i, "") || "1"}` : prefix || "residente";
    setChatMessages((prev) => [...prev, { from: "bot", text: `Hola ${displayName}. Soy Lex, tu asistente para votaciones, asambleas y gestión de tu PH en Assembly 2.0.` }]);
  }, [residentEmailValidated, chatRole, chatMessages]);

  const isWaitingPin = chatRole === "residente" && chatStep === 4 && residentEmailPending;

  useEffect(() => {
    if (chatRole !== "residente" || !residentEmailValidated) return;
    const profile = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("profile")?.trim() || "" : "";
    const organizationId = residentProfile?.organization_id ?? (typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null);
    let q = "";
    if (profile) q = `?profile=${encodeURIComponent(profile)}`;
    else if (organizationId) q = `?organization_id=${encodeURIComponent(organizationId)}`;
    fetch(`/api/assembly-context${q}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.context) setAssemblyContext(data.context);
      })
      .catch(() => {});
  }, [chatRole, residentEmailValidated, residentProfile?.organization_id]);

  useEffect(() => {
    if (chatRole !== "residente" || !residentEmailValidated) return;
    fetch("/api/tema-activo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.title) setTemaActivo({ title: data.title, description: data.description, status: data?.status });
      })
      .catch(() => {});
  }, [chatRole, residentEmailValidated]);

  useEffect(() => {
    if (chatRole !== "residente" || !residentEmailValidated) return;
    const userId = typeof window !== "undefined" ? localStorage.getItem("assembly_user_id") : null;
    if (!userId) return;
    fetch(`/api/power-requests?user_id=${encodeURIComponent(userId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.has_pending) setHasPendingPowerRequest(true);
      })
      .catch(() => {});
  }, [chatRole, residentEmailValidated]);

  useEffect(() => {
    if (chatRole !== "residente" || !residentEmailValidated) return;
    const email = typeof window !== "undefined" ? localStorage.getItem("assembly_resident_email") : null;
    if (!email) return;
    fetch(`/api/resident-profile?email=${encodeURIComponent(email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.organization_name != null) {
          setResidentProfile({
            organization_id: data.organization_id,
            organization_name: data.organization_name ?? "PH",
            unit: data.unit ?? null,
            resident_name: data.resident_name ?? data.email ?? email,
            email: data.email ?? email,
          });
        }
        if (data?.user_id) try { localStorage.setItem("assembly_user_id", data.user_id); } catch {}
        if (data?.organization_id) try { localStorage.setItem("assembly_organization_id", data.organization_id); } catch {}
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

    if (chatRole === "residente" && residentEmailValidated && chatStep >= 8) {
      const isModificar = /^\s*modificar(\s+voto)?\s*$/i.test(trimmed.trim());
      if (isModificar && residentVoteSent && residentLastVote) {
        setChatInput("");
        pushUserMessage(trimmed.trim());
        if (residentVoteModifyCount >= MAX_VOTE_MODIFICATIONS) {
          pushBotMessage("Ya alcanzaste el límite de 2 correcciones de voto. No puedes modificar nuevamente.");
          return;
        }
        const votacionAbierta = temaActivo?.status === "Abierto";
        if (votacionAbierta) {
          setResidentVoteSent(false);
          setResidentLastVote(null);
          setResidentVoteModifyCount((c) => c + 1);
          const remaining = MAX_VOTE_MODIFICATIONS - residentVoteModifyCount - 1;
          if (remaining === 1) {
            pushBotMessage("Tu voto fue anulado. Puedes votar de nuevo. Te queda 1 oportunidad para modificar tu voto.");
          } else if (remaining === 0) {
            pushBotMessage("Tu voto fue anulado. Puedes votar de nuevo. Esta fue tu última corrección permitida.");
          } else {
            pushBotMessage("Tu voto fue anulado. Puedes votar de nuevo con los botones de arriba.");
          }
        } else {
          pushBotMessage("La votación ya fue cerrada por el administrador. No puedes modificar tu voto.");
        }
        return;
      }

      setChatInput("");
      const email = typeof window !== "undefined" ? localStorage.getItem("assembly_resident_email") || "" : "";
      const history = chatMessages.slice(-12).map((m) => ({ role: m.from === "user" ? "user" : "model", text: m.text }));
      fetch("/api/chat/resident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          context: {
            email: residentProfile?.email || email,
            residentName: residentProfile?.resident_name ?? undefined,
            unit: residentProfile?.unit ?? undefined,
            organizationName: residentProfile?.organization_name ?? undefined,
            assemblyContext,
            temaActivo: temaActivo ?? undefined,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.reply) pushBotMessage(data.reply);
          else pushBotMessage(data.error || "No pude procesar tu mensaje. ¿Quieres usar los botones de abajo?");
        })
        .catch(() => pushBotMessage("No pude conectar. Intenta de nuevo o usa los botones (Votación, Asambleas, etc.)."));
      return;
    }

    const emailLower = trimmed.toLowerCase();
    if (chatRole === "residente") {
      if (chatStep === 4 && residentEmailPending) {
        const reenviar = /^reenvia(r)?\s*(pin)?$/i.test(trimmed.trim()) || trimmed.trim().toLowerCase() === "reenviar pin";
        if (reenviar) {
          fetch("/api/auth/request-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: residentEmailPending }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.success) pushBotMessage(`Te reenviamos un nuevo PIN a ${residentEmailPending}. Revisa tu bandeja e ingrésalo aquí.`);
              else pushBotMessage(data?.error || "No se pudo reenviar el PIN. Intenta más tarde.");
            })
            .catch(() => pushBotMessage("No se pudo reenviar el PIN. Intenta más tarde."));
          setChatInput("");
          return;
        }
        fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: residentEmailPending, code: trimmed }),
        })
          .then((res) => res.json().then((data) => ({ res, data })))
          .then(({ res, data }) => {
            if (res.ok && data?.user?.role === "RESIDENTE") {
              setResidentEmailValidated(true);
              setResidentEmailPending(null);
              setChatStep(8);
              try {
                localStorage.setItem("assembly_resident_email", residentEmailPending);
                localStorage.setItem("assembly_resident_validated", String(Date.now()));
                if (data.user.id) localStorage.setItem("assembly_user_id", data.user.id);
                if (data.user.organization_id) localStorage.setItem("assembly_organization_id", data.user.organization_id);
              } catch {}
              const prefix = residentEmailPending.split("@")[0] || "";
              const displayName = /^residente\d*$/i.test(prefix) ? `Residente ${prefix.replace(/^residente/i, "") || "1"}` : prefix || "residente";
              pushBotMessage(`Hola ${displayName}. Soy Lex, tu asistente para votaciones, asambleas y gestión de tu PH en Assembly 2.0.`);
            } else {
              pushBotMessage("PIN incorrecto o vencido. ¿Reenviar PIN? Escribe el nuevo código o «Reenviar PIN».");
            }
          })
          .catch(() => pushBotMessage("Error al verificar. Intenta de nuevo o escribe «Reenviar PIN»."));
        setChatInput("");
        return;
      }

      const proceedToOtp = () => {
        setResidentEmailPending(emailLower);
        setChatStep(4);
        setChatInput("");
        fetch("/api/auth/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailLower }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.success) {
              pushBotMessage(`Te enviamos un PIN a ${emailLower}. Revisa tu bandeja (y spam) e ingrésalo aquí.`);
              if (data?.otp) pushBotMessage(`Código de prueba (modo local): ${data.otp}`);
            } else {
              pushBotMessage(data?.error || "No se pudo enviar el PIN. Intenta más tarde.");
              setResidentEmailPending(null);
              setChatStep(3);
            }
          })
          .catch(() => {
            pushBotMessage("No se pudo enviar el PIN. Intenta más tarde.");
            setResidentEmailPending(null);
            setChatStep(3);
          });
      };

      let recognized = false;
      try {
        const existingUsers = JSON.parse(localStorage.getItem("assembly_users") || "[]") as Array<{ email: string }>;
        if (existingUsers.some((u) => u.email?.toLowerCase() === emailLower)) recognized = true;
      } catch {
        // ignore
      }
      if (recognized) {
        proceedToOtp();
        return;
      }
      if (DEMO_RESIDENT_EMAILS.includes(emailLower)) {
        proceedToOtp();
        return;
      }
      fetch(`/api/resident-profile?email=${encodeURIComponent(emailLower)}`)
        .then((res) => {
          if (res.ok) {
            proceedToOtp();
            return;
          }
          pushBotMessage("No encuentro ese correo. Contacta al administrador de tu PH para validar. Puedes escribir otro correo para reintentar.");
          setChatInput("");
        })
        .catch(() => {
          pushBotMessage("No encuentro ese correo. Contacta al administrador de tu PH para validar. Puedes escribir otro correo para reintentar.");
          setChatInput("");
        });
      return;
    }

    pushBotMessage("Listo. Te enviamos el acceso de demo.");
    setChatStep(8);
    setChatInput("");
  };

  return (
    <main
      className="auth-root"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.25), transparent 55%), rgba(2,6,23,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <style>{`
        .chat-ios .chat-header { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; padding-bottom: 12px; border-bottom: 1px solid rgba(148,163,184,0.12); }
        .chat-ios .chat-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .chat-ios .chat-header-title { font-weight: 600; font-size: 17px; letter-spacing: -0.02em; color: #f1f5f9; }
        .chat-ios .chat-header-subtitle { font-size: 12px; color: #94a3b8; margin-top: 2px; }
        .chat-ios .btn-logout { padding: 8px 14px; border-radius: 10px; font-size: 14px; font-weight: 500; background: rgba(255,255,255,0.08); border: 1px solid rgba(148,163,184,0.2); color: #e2e8f0; cursor: pointer; transition: background 0.2s, transform 0.15s; }
        .chat-ios .btn-logout:hover { background: rgba(255,255,255,0.12); transform: scale(1.02); }
        .chat-ios .btn-logout:active { transform: scale(0.98); }
        .chat-ios .chat-user-bar { margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: rgba(15,23,42,0.5); border: 1px solid rgba(148,163,184,0.1); font-size: 12px; color: #94a3b8; }
        .chat-ios .chat-pills-wrap { display: flex; gap: 8px; flex-wrap: wrap; }
        .chat-ios .chat-pill { padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 500; border: 1px solid rgba(148,163,184,0.25); background: rgba(255,255,255,0.06); color: #e2e8f0; cursor: pointer; transition: all 0.2s ease; }
        .chat-ios .chat-pill:hover:not(:disabled) { background: rgba(255,255,255,0.1); border-color: rgba(148,163,184,0.35); }
        .chat-ios .chat-pill:active:not(:disabled) { transform: scale(0.98); }
        .chat-ios .chat-pill-primary { background: linear-gradient(135deg, rgba(99,102,241,0.9), rgba(168,85,247,0.85)); border: none; color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.35); }
        .chat-ios .chat-pill-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
        .chat-ios .chat-pill:disabled { opacity: 0.6; cursor: not-allowed; }
        .chat-ios .chat-input-wrap { display: flex; gap: 10px; align-items: center; }
        .chat-ios .chat-input { flex: 1; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(148,163,184,0.25); background: rgba(30,41,59,0.6); color: #e2e8f0; font-size: 15px; transition: border-color 0.2s, box-shadow 0.2s; }
        .chat-ios .chat-input::placeholder { color: #64748b; }
        .chat-ios .chat-input:focus { outline: none; border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        .chat-ios .chat-send { padding: 12px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; background: linear-gradient(135deg, rgba(99,102,241,0.95), rgba(236,72,153,0.9)); border: none; color: #fff; cursor: pointer; box-shadow: 0 4px 14px rgba(99,102,241,0.4); transition: transform 0.15s, box-shadow 0.2s; }
        .chat-ios .chat-send:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(99,102,241,0.5); }
        .chat-ios .chat-send:active { transform: scale(0.98); }
        .chat-ios .btn-dialog { padding: 10px 18px; border-radius: 10px; font-size: 15px; font-weight: 500; transition: transform 0.15s; }
        .chat-ios .btn-dialog-ghost { background: rgba(255,255,255,0.08); border: 1px solid rgba(148,163,184,0.25); color: #e2e8f0; }
        .chat-ios .btn-dialog-primary { background: linear-gradient(135deg, rgba(99,102,241,0.95), rgba(168,85,247,0.9)); border: none; color: #fff; }
      `}</style>
      <div
        className="card glass chat-ios"
        style={{
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(148,163,184,0.22)",
          borderRadius: "20px",
          boxShadow: "0 30px 80px rgba(2,6,23,0.65)",
        }}
      >
        <div className="chat-header">
          <div className="chat-header-left">
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(148,163,184,0.2)", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
              <img src="/avatars/chatbot.png" alt="Lex" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span className="chat-header-title">Lex · Asistente</span>
                {residentEmailValidated && chatRole === "residente" && assemblyContext === "activa" && (
                  <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "8px", background: "rgba(34,197,94,0.2)", color: "#86efac", border: "1px solid rgba(34,197,94,0.35)", fontWeight: 500 }}>Asamblea activa</span>
                )}
              </div>
              <div className="chat-header-subtitle">Assembly 2.0</div>
            </div>
          </div>
          {residentEmailValidated && chatRole === "residente" ? (
            <button type="button" className="btn-logout" onClick={() => { setShowAbandonConfirm(true); setAbandonConfirmPhrase(""); }} aria-label="Cerrar sesión">
              Cerrar sesión
            </button>
          ) : (
            <Link className="btn-logout" href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Volver al inicio
            </Link>
          )}
        </div>
        {residentEmailValidated && chatRole === "residente" && (
          <div className="chat-user-bar">
            {residentProfile ? (
              <>
                <div style={{ color: "#64748b", marginBottom: "4px" }}>Nombre del PH</div>
                <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: "6px" }}>{residentProfile.organization_name}</div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {residentProfile.unit && <span>Unidad <strong style={{ color: "#cbd5e1" }}>{residentProfile.unit}</strong></span>}
                  <span>Usuario <strong style={{ color: "#cbd5e1" }}>{residentProfile.resident_name}</strong></span>
                  <span>Correo <strong style={{ color: "#cbd5e1" }}>{residentProfile.email}</strong></span>
                </div>
              </>
            ) : (
              <span>
                Usuario: {typeof window !== "undefined" ? localStorage.getItem("assembly_resident_email") || "—" : "—"}
                {typeof window !== "undefined" && localStorage.getItem("assembly_resident_email") && (
                  <> · <strong style={{ color: "#cbd5e1" }}>{localStorage.getItem("assembly_resident_email")}</strong></>
                )}
              </span>
            )}
          </div>
        )}

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
                      {!residentVoteParticiparClicked ? (
                        <>
                          <div style={{ fontWeight: 600, marginBottom: "8px" }}>Votación activa</div>
                          <p style={{ margin: "0 0 12px", fontSize: "13px" }}>Tienes una votación abierta. ¿Participar?</p>
                          <button
                            className="btn btn-primary btn-demo"
                            style={{ borderRadius: "999px", padding: "8px 16px" }}
                            onClick={() => setResidentVoteParticiparClicked(true)}
                          >
                            Ir a votar
                          </button>
                        </>
                      ) : (
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
                                    setResidentLastVote(op);
                                    pushUserMessage(`Voto: ${op}`);
                                    pushBotMessage(`Tu voto ya fue aplicado. Voto aplicado: ${op}.`);
                                    pushBotMessage('Para revertir tu voto escribe «modificar». Solo puedes modificar mientras la votación esté abierta. Máximo 2 correcciones permitidas.');
                                  }}
                                >
                                  {op}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p style={{ margin: "0 0 4px", fontSize: "13px" }}>Tu voto ya fue aplicado.</p>
                              <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 600 }}>Voto aplicado: {residentLastVote ?? "—"}.</p>
                              <p className="muted" style={{ fontSize: "12px", margin: 0 }}>
                                Escribe «modificar» para revertir tu voto (solo mientras la votación esté abierta). Máximo 2 correcciones.
                              </p>
                              <p style={{ fontSize: "12px", margin: "8px 0 0", color: "#f59e0b" }}>
                                Correcciones usadas: {residentVoteModifyCount} de {MAX_VOTE_MODIFICATIONS}.
                              </p>
                              {residentVoteModifyCount >= MAX_VOTE_MODIFICATIONS && (
                                <p style={{ fontSize: "12px", margin: "4px 0 0", color: "#ef4444", fontWeight: 600 }}>
                                  Ya no puedes modificar tu voto.
                                </p>
                              )}
                            </>
                          )}
                        </>
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
                          <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#94a3b8" }}>Datos de quien acepta el poder</p>
                          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{
                                borderRadius: "999px",
                                border: `1px solid ${poderApoderadoTipo === "residente_ph" ? "rgba(99,102,241,0.6)" : "rgba(148,163,184,0.3)"}`,
                                background: poderApoderadoTipo === "residente_ph" ? "rgba(99,102,241,0.2)" : "rgba(15,23,42,0.6)",
                              }}
                              onClick={() => setPoderApoderadoTipo("residente_ph")}
                            >
                              Residente del mismo PH
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{
                                borderRadius: "999px",
                                border: `1px solid ${poderApoderadoTipo === "titular_mayor_edad" ? "rgba(99,102,241,0.6)" : "rgba(148,163,184,0.3)"}`,
                                background: poderApoderadoTipo === "titular_mayor_edad" ? "rgba(99,102,241,0.2)" : "rgba(15,23,42,0.6)",
                              }}
                              onClick={() => setPoderApoderadoTipo("titular_mayor_edad")}
                            >
                              Titular mayor de edad
                            </button>
                          </div>
                          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#94a3b8" }}>Correo del apoderado *</label>
                          <input
                            type="email"
                            placeholder="apoderado@correo.com"
                            value={poderEmail}
                            onChange={(e) => setPoderEmail(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0", marginBottom: "10px" }}
                          />
                          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#94a3b8" }}>Nombre completo del apoderado *</label>
                          <input
                            type="text"
                            placeholder="Nombre y apellidos"
                            value={poderApoderadoNombre}
                            onChange={(e) => setPoderApoderadoNombre(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0", marginBottom: "10px" }}
                          />
                          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#94a3b8" }}>Cédula (opcional)</label>
                          <input
                            type="text"
                            placeholder="Cédula o documento"
                            value={poderApoderadoCedula}
                            onChange={(e) => setPoderApoderadoCedula(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0", marginBottom: "10px" }}
                          />
                          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#94a3b8" }}>Teléfono (opcional)</label>
                          <input
                            type="text"
                            placeholder="Teléfono"
                            value={poderApoderadoTelefono}
                            onChange={(e) => setPoderApoderadoTelefono(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0", marginBottom: "10px" }}
                          />
                          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#94a3b8" }}>Vigencia (opcional)</label>
                          <input
                            type="text"
                            placeholder="Ej. Solo próxima asamblea"
                            value={poderVigencia}
                            onChange={(e) => setPoderVigencia(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0", marginBottom: "10px" }}
                          />
                          <button
                            className="btn btn-primary btn-demo"
                            style={{ borderRadius: "999px" }}
                            onClick={() => {
                              const email = poderEmail.trim().toLowerCase();
                              const nombre = poderApoderadoNombre.trim();
                              if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                pushBotMessage("Indica un correo válido para el apoderado.");
                                return;
                              }
                              if (!nombre) {
                                pushBotMessage("Indica el nombre completo del apoderado.");
                                return;
                              }
                              const userId = typeof window !== "undefined" ? localStorage.getItem("assembly_user_id") : null;
                              const organizationId = residentProfile?.organization_id ?? (typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null);
                              if (!userId || !organizationId) {
                                pushBotMessage("No se pudo enviar. Vuelve a iniciar sesión como residente.");
                                return;
                              }
                              fetch("/api/power-requests", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  resident_user_id: userId,
                                  organization_id: organizationId,
                                  apoderado_tipo: poderApoderadoTipo,
                                  apoderado_email: email,
                                  apoderado_nombre: nombre,
                                  apoderado_cedula: poderApoderadoCedula.trim() || undefined,
                                  apoderado_telefono: poderApoderadoTelefono.trim() || undefined,
                                  vigencia: poderVigencia.trim() || undefined,
                                }),
                              })
                                .then((res) => res.json())
                                .then((data) => {
                                  if (data?.success) {
                                    setPoderSubmitted(true);
                                    setHasPendingPowerRequest(true);
                                    pushUserMessage(`Solicitud de poder para ${email}`);
                                    pushBotMessage("Solicitud enviada. Está pendiente por aprobar por el administrador de tu PH. Te confirmamos en minutos.");
                                  } else {
                                    pushBotMessage(data?.error || "No se pudo enviar la solicitud. Intenta de nuevo.");
                                  }
                                })
                                .catch(() => pushBotMessage("No se pudo enviar la solicitud. Intenta de nuevo."));
                            }}
                          >
                            Enviar solicitud de poder
                          </button>
                        </>
                      ) : (
                        <span className="muted" style={{ fontSize: "12px" }}>Solicitud enviada. Pendiente por aprobar. Te confirmamos en minutos.</span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} style={{ height: 1 }} aria-hidden />
        </div>

        {/* Pills: debajo del último mensaje, encima del input. §K: en /residentes/chat no mostrar 4 perfiles, solo flujo residente */}
        {!chatRole && !isResidentesChat ? (
          <div className="chat-pills-wrap" style={{ marginTop: "12px", flexShrink: 0 }}>
            {[
              { label: "Administrador PH", value: "admin" as const },
              { label: "Junta Directiva", value: "junta" as const },
              { label: "Residente", value: "residente" as const },
              { label: "Solo demo", value: "demo" as const },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className="chat-pill"
                onClick={() => {
                  setChatRole(option.value);
                  if (option.value === "residente") {
                    setResidentEmailValidated(false);
                    setResidentEmailPending(null);
                  }
                  pushUserMessage(option.label);
                  pushBotMessage(getRoleEmailPrompt(option.value));
                  setChatStep(3);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : isWaitingPin ? (
          <div style={{ marginTop: "12px", flexShrink: 0 }}>
            <button
              type="button"
              className="chat-pill"
              onClick={() => {
                if (!residentEmailPending) return;
                fetch("/api/auth/request-otp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: residentEmailPending }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data?.success) pushBotMessage(`Te reenviamos un nuevo PIN a ${residentEmailPending}. Revisa tu bandeja e ingrésalo aquí.`);
                    else pushBotMessage(data?.error || "No se pudo reenviar el PIN.");
                  })
                  .catch(() => pushBotMessage("No se pudo reenviar el PIN."));
              }}
            >
              Reenviar PIN
            </button>
          </div>
        ) : chatStep >= 8 && chatRole === "residente" && residentEmailValidated ? (
          <div style={{ marginTop: "12px", flexShrink: 0 }}>
            {assemblyContext === "sin_asambleas" && (
              <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#94a3b8" }}>
                No hay asambleas programadas para el año en curso. ¿Consultar con el administrador?
              </p>
            )}
            <div className="chat-pills-wrap">
              {[
                { label: "Votación", msg: "Tienes una votación abierta. ¿Participar?", card: "votacion" as ChatCard, primary: true, onlyWhenActive: true },
                { label: "Asambleas", msg: "Te muestro el listado de asambleas activas.", card: "asambleas" as ChatCard, primary: false, onlyWhenActive: false },
                { label: "Calendario", msg: "Aquí tienes el calendario de tu PH.", card: "calendario" as ChatCard, primary: false, onlyWhenActive: false },
                { label: "Tema del día", msg: "Tema activo: aprobación de presupuesto.", card: "tema" as ChatCard, primary: false, onlyWhenActive: true },
                {
                  label: hasPendingPowerRequest ? "Poder en proceso de validación y aprobación" : "Ceder poder",
                  msg: "Completa los datos de la persona que acepta el poder (puede ser un residente de tu PH o un titular mayor de edad).",
                  card: "poder" as ChatCard,
                  primary: false,
                  onlyWhenActive: false,
                  isPoder: true,
                },
              ].map(({ label, msg, card, primary, onlyWhenActive, isPoder }) => {
                const active = assemblyContext === "activa";
                const disabled = onlyWhenActive && !active;
                const poderDisabled = isPoder && hasPendingPowerRequest;
                const isDisabled = disabled || poderDisabled;
                return (
                  <button
                    key={card}
                    className={`chat-pill ${primary && !isDisabled ? "chat-pill-primary" : ""}`}
                    style={isDisabled ? { background: "rgba(71,85,105,0.35)", opacity: 0.8 } : undefined}
                    title={disabled ? "No hay votación activa" : poderDisabled ? "Pendiente por aprobar" : undefined}
                    disabled={isDisabled}
                    onClick={() => {
                      if (disabled) return;
                      if (isPoder && hasPendingPowerRequest) {
                        pushUserMessage("Ceder poder");
                        pushBotMessage("Ya tienes una solicitud de poder pendiente por aprobar. Te confirmamos cuando el administrador la revise.");
                        return;
                      }
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
          <div className="chat-pills-wrap" style={{ marginTop: "12px", flexShrink: 0 }}>
            <Link className="chat-pill chat-pill-primary" href="/login" style={{ textDecoration: "none" }}>
              Agendar demo
            </Link>
            <Link className="chat-pill" href="/administraciones" style={{ textDecoration: "none" }}>
              Ver planes
            </Link>
          </div>
        ) : null}

        {(chatStep < 8 || (chatRole === "residente" && residentEmailValidated)) ? (
          <div className="chat-input-wrap" style={{ marginTop: "14px", flexShrink: 0 }}>
            <input
              className="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={chatStep >= 8 ? "Escribe algo..." : "Escribe tu respuesta..."}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChatSubmit();
              }}
            />
            <button type="button" className="chat-send" onClick={handleChatSubmit}>
              Enviar
            </button>
          </div>
        ) : null}
      </div>

      {showAbandonConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="abandon-dialog-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px",
          }}
          onClick={(e) => e.target === e.currentTarget && setShowAbandonConfirm(false)}
        >
          <div
            className="chat-ios"
            style={{
              background: "linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "20px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)",
              maxWidth: "400px",
              width: "100%",
              padding: "28px 24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="abandon-dialog-title" style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 600, color: "#f1f5f9" }}>
              Cerrar sesión de asamblea
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#94a3b8", lineHeight: 1.5 }}>
              Estás abandonando la votación. Esto afecta el quórum.
            </p>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#cbd5e1" }}>
              Para confirmar, escribe: <strong style={{ color: "#e2e8f0" }}>{ABANDON_CONFIRM_PHRASE}</strong>
            </p>
            <input
              type="text"
              value={abandonConfirmPhrase}
              onChange={(e) => setAbandonConfirmPhrase(e.target.value)}
              placeholder={ABANDON_CONFIRM_PHRASE}
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(148,163,184,0.4)",
                background: "rgba(15,23,42,0.8)",
                color: "#e2e8f0",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            />
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-dialog btn-dialog-ghost"
                onClick={() => { setShowAbandonConfirm(false); setAbandonConfirmPhrase(""); }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-dialog btn-dialog-primary"
                disabled={abandonConfirmPhrase.trim().toLowerCase() !== ABANDON_CONFIRM_PHRASE.toLowerCase()}
                style={{ opacity: abandonConfirmPhrase.trim().toLowerCase() === ABANDON_CONFIRM_PHRASE.toLowerCase() ? 1 : 0.6, cursor: abandonConfirmPhrase.trim().toLowerCase() === ABANDON_CONFIRM_PHRASE.toLowerCase() ? "pointer" : "not-allowed" }}
                onClick={() => {
                  const userId = localStorage.getItem("assembly_user_id");
                  const email = localStorage.getItem("assembly_resident_email") || localStorage.getItem("assembly_email");
                  const organizationId = localStorage.getItem("assembly_organization_id");
                  const payload: Record<string, string | null | undefined> = {
                    assembly_id: null,
                    resident_name: residentProfile?.resident_name ?? null,
                    unit: residentProfile?.unit ?? null,
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
                  setShowAbandonConfirm(false);
                  setAbandonConfirmPhrase("");
                  window.location.href = "/residentes/chat";
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
