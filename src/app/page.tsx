"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PLANS } from "../lib/types/pricing";
import { getDemoResidents } from "../lib/demoResidentsStore";
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [hoverResidentChat, setHoverResidentChat] = useState(false);
  const [hoverAdminAccess, setHoverAdminAccess] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatStep, setChatStep] = useState(0);
  const [chatRole, setChatRole] = useState<"admin" | "junta" | "residente" | "demo" | "">("");
  const [residentEmailValidated, setResidentEmailValidated] = useState(false);
  type ChatCard = "votacion" | "asambleas" | "calendario" | "tema" | "poder";
  const [chatMessages, setChatMessages] = useState<Array<{ from: "bot" | "user"; text: string; card?: ChatCard; link?: string }>>([]);
  const MAX_VOTE_MODIFICATIONS = 2;
  const [residentVoteSent, setResidentVoteSent] = useState(false);
  const [residentLastVote, setResidentLastVote] = useState<"Sí" | "No" | "Abstengo" | null>(null);
  const [residentVoteModifyCount, setResidentVoteModifyCount] = useState(0);
  const [poderSubmitted, setPoderSubmitted] = useState(false);
  const [hasPendingPowerRequest, setHasPendingPowerRequest] = useState(false);
  const [poderEmail, setPoderEmail] = useState("");
  const [poderApoderadoNombre, setPoderApoderadoNombre] = useState("");
  type AssemblyContext = "activa" | "programada" | "sin_asambleas";
  const [assemblyContext, setAssemblyContext] = useState<AssemblyContext>("activa");
  const [powersEnabled, setPowersEnabled] = useState(false);
  const [webPrompt, setWebPrompt] = useState("Hola, soy Lex. Antes de continuar, ¿que perfil tienes?");
  /** Saludo visible al abrir el chatbot en landing. El prompt real (config) se usa en backend; no se muestra al usuario. */
  const LANDING_CHAT_GREETING =
    "Hola, soy Lex, asistente de Assembly 2.0. ¿Qué perfil te describe mejor: Administrador PH, Junta Directiva o solo demo? Escribe o elige una opción abajo.";
  const [leadData, setLeadData] = useState({
    email: "",
    role: "",
    demoEmail: "",
  });
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [abandonConfirmPhrase, setAbandonConfirmPhrase] = useState("");
  const [residentEmailPending, setResidentEmailPending] = useState<string | null>(null);
  const ABANDON_CONFIRM_PHRASE = "Si abandonar";
  // Emails residentes org demo + PH B Torres (lista fija; ref INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md)
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
  const [assembliesPerYear, setAssembliesPerYear] = useState(2);
  const [unitsCount, setUnitsCount] = useState(311);
  const [showMonthly, setShowMonthly] = useState(true);
  const planSuggestion = useMemo(() => {
    const baseUnits = 250;
    const extraBlocks = Math.max(0, Math.ceil((unitsCount - baseUnits) / 100));
    const monthlyStandard = 189 + extraBlocks * 50;
    const duoPackCost = 389 + extraBlocks * 50;

    if (assembliesPerYear <= 1) {
      return {
        label: "Evento Único",
        planType: "one_time",
        annualCost: 225,
        monthlyCost: 225 / 12,
        note: "Pago único por asamblea",
      };
    }
    if (assembliesPerYear === 2) {
      return {
        label: "Dúo Pack",
        planType: "one_time",
        annualCost: duoPackCost,
        monthlyCost: duoPackCost / 12,
        note: "2 asambleas/año con ahorro",
      };
    }
    if (assembliesPerYear === 3) {
      return {
        label: "Dúo Pack + 1 Evento Único",
        planType: "one_time",
        annualCost: duoPackCost + 225,
        monthlyCost: (duoPackCost + 225) / 12,
        note: "Mejor opción para 3 asambleas",
      };
    }
    return {
      label: "Standard",
      planType: "subscription",
      annualCost: monthlyStandard * 12,
      monthlyCost: monthlyStandard,
      note: `Base 250 unidades + ${extraBlocks} bloque(s) extra`,
    };
  }, [assembliesPerYear, unitsCount]);

  const roiCalculations = useMemo(() => {
    const manualCost = assembliesPerYear * 1500;
    const legalRisk = assembliesPerYear * 3300;
    const timeWasted = assembliesPerYear * 40 * 30;
    const planAnnualCost = planSuggestion.annualCost;
    const totalSavings = manualCost + legalRisk + timeWasted - planAnnualCost;
    const roi = Math.round((totalSavings / planAnnualCost) * 100);
    const costPerUnitMonthly =
      planSuggestion.planType === "subscription"
        ? planSuggestion.monthlyCost / Math.max(1, unitsCount)
        : planAnnualCost / Math.max(1, unitsCount) / Math.max(1, assembliesPerYear);
    return {
      manualCost,
      legalRisk,
      timeWasted,
      planAnnualCost,
      totalSavings,
      roi,
      costPerUnitMonthly,
    };
  }, [assembliesPerYear, planSuggestion, unitsCount]);

  useEffect(() => {
    if (planSuggestion.planType === "one_time" && showMonthly) {
      setShowMonthly(false);
    }
  }, [planSuggestion.planType, showMonthly]);

  const planDisplayCost =
    planSuggestion.planType === "one_time"
      ? planSuggestion.annualCost
      : showMonthly
        ? planSuggestion.monthlyCost
        : planSuggestion.annualCost;
  const planDisplayLabel =
    planSuggestion.planType === "one_time"
      ? "Pago único por eventos"
      : showMonthly
        ? "Costo mensual de suscripción"
        : "Costo anual de suscripción";
  const periodLabel = showMonthly ? "mes" : "año";
  const periodDivisor = showMonthly ? 12 : 1;
  const traditionalDisplay =
    (roiCalculations.manualCost + roiCalculations.legalRisk + roiCalculations.timeWasted) / periodDivisor;
  const savingsDisplay = roiCalculations.totalSavings / periodDivisor;

  const RESIDENT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const openParam = searchParams.get("openChat") || searchParams.get("chat");
    if (openParam === "1" || openParam === "true" || openParam === "open") {
      setChatbotOpen(true);
      try {
        const validatedAt = localStorage.getItem("assembly_resident_validated");
        const email = localStorage.getItem("assembly_resident_email");
        if (email && validatedAt) {
          const ts = Number(validatedAt);
          if (!Number.isNaN(ts) && Date.now() - ts < RESIDENT_SESSION_TTL_MS) {
            setChatRole("residente");
            setResidentEmailValidated(true);
            setChatStep(8);
          }
        }
      } catch {
        // ignore
      }
      return;
    }
    const timer = setTimeout(() => setChatbotOpen(true), 20000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    if (!chatbotOpen || chatMessages.length > 0) return;
    fetch("/api/chatbot/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const webConfig = Array.isArray(data) ? data.find((item) => item.bot_name === "web") : null;
        const prompt = webConfig?.prompts?.landing || webPrompt;
        setWebPrompt(prompt);
        setChatMessages([{ from: "bot", text: LANDING_CHAT_GREETING }]);
      })
      .catch(() => {
        setChatMessages([{ from: "bot", text: LANDING_CHAT_GREETING }]);
      });
  }, [chatbotOpen, chatMessages.length]);

  useEffect(() => {
    if (chatRole !== "residente" || !residentEmailValidated) return;
    const profile = searchParams.get("profile")?.trim() || "";
    const organizationId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
    let q = "";
    if (profile) q = `?profile=${encodeURIComponent(profile)}`;
    else if (organizationId) q = `?organization_id=${encodeURIComponent(organizationId)}`;
    fetch(`/api/assembly-context${q}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.context) setAssemblyContext(data.context);
        setPowersEnabled(data?.powers_enabled === true);
      })
      .catch(() => {});
  }, [chatRole, residentEmailValidated, searchParams]);

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

  const pushBotMessage = (text: string, opts?: { link?: string }) => {
    setChatMessages((prev) => [...prev, { from: "bot", text, link: opts?.link }]);
  };

  const pushUserMessage = (text: string) => {
    setChatMessages((prev) => [...prev, { from: "user", text }]);
  };

  const handleQuickAction = (label: string, response: string) => {
    pushUserMessage(label);
    pushBotMessage(response);
  };

  /** Responde dentro del chat con mensaje + card (sin navegar a otra página). */
  const handleQuickActionInChat = (label: string, response: string, card: ChatCard) => {
    pushUserMessage(label);
    pushBotMessage(response);
    setChatMessages((prev) => [...prev, { from: "bot", text: "", card }]);
  };

  const getRoleEmailPrompt = (role: typeof chatRole) => {
    if (role === "admin") return "¿Cual es tu correo de trabajo para temas de PH?";
    if (role === "residente") return "¿Cual es el correo que tienes registrado en tu PH?";
    if (role === "junta") return "¿Con que correo quieres probar el sistema?";
    return "¿Con que correo quieres probar el sistema?";
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
      pushBotMessage("Selecciona un perfil para continuar.");
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
          context: { email, assemblyContext },
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

    if (chatRole === "residente" && chatStep === 4 && residentEmailPending) {
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
            else pushBotMessage(data?.error || "No se pudo reenviar el PIN.");
          })
          .catch(() => pushBotMessage("No se pudo reenviar el PIN."));
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
            const profileParam = searchParams.get("profile")?.trim();
            const chatQuery = profileParam ? `?profile=${encodeURIComponent(profileParam)}` : "";
            fetch(`/api/resident-profile?email=${encodeURIComponent(residentEmailPending)}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((profileData) => {
                try {
                  if (profileData?.user_id) localStorage.setItem("assembly_user_id", profileData.user_id);
                  if (profileData?.organization_id) localStorage.setItem("assembly_organization_id", profileData.organization_id);
                } catch {}
                router.push(`/residentes/chat${chatQuery}`);
              })
              .catch(() => router.push(`/residentes/chat${chatQuery}`));
          } else {
            pushBotMessage("PIN incorrecto o vencido. ¿Reenviar PIN? Escribe el nuevo código o «Reenviar PIN».");
          }
        })
        .catch(() => pushBotMessage("Error al verificar. Intenta de nuevo o escribe «Reenviar PIN»."));
      setChatInput("");
      return;
    }

    if (chatStep === 3) {
      const isValidEmail = /\S+@\S+\.\S+/.test(trimmed);
      if (!isValidEmail) {
        pushBotMessage("¿Puedes compartir un correo valido?");
        setChatInput("");
        return;
      }
      const emailLower = trimmed.toLowerCase();
      setLeadData((prev) => ({ ...prev, email: emailLower, role: chatRole }));

      if (chatRole === "residente") {
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
          const existingUsers = JSON.parse(localStorage.getItem("assembly_users") || "[]") as Array<{
            email: string;
          }>;
          if (existingUsers.some((user) => user.email?.toLowerCase() === emailLower)) {
            recognized = true;
          }
        } catch {
          // ignore storage issues
        }
        if (recognized) {
          proceedToOtp();
          return;
        }
        if (DEMO_RESIDENT_EMAILS.includes(emailLower)) {
          proceedToOtp();
          return;
        }
        try {
          const demoResidents = getDemoResidents();
          if (Array.isArray(demoResidents) && demoResidents.some((r) => (r.email || "").toLowerCase() === emailLower)) {
            proceedToOtp();
            return;
          }
        } catch {
          // ignore
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

      const finalLead = { ...leadData, email: emailLower, role: chatRole, demoEmail: "" };
      setLeadData(finalLead);
      try {
        localStorage.setItem("landingLead", JSON.stringify({ ...finalLead, createdAt: Date.now() }));
      } catch {
        // ignore
      }

      if (chatRole === "admin" || chatRole === "demo") {
        fetch("/api/demo/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailLower }),
        })
          .then((res) => res.json().then((data) => ({ status: res.status, data })))
          .then(({ status, data }) => {
            if (status === 429) {
              pushBotMessage("Demasiadas solicitudes. Intenta de nuevo en unos minutos o escribe a soporte.");
              setChatStep(8);
              setChatInput("");
              return;
            }
            if (data?.success) {
              if (data.already_exists) {
                pushBotMessage("Ya tienes un demo activo. Entra con tu correo aquí:");
              } else {
                pushBotMessage("Tu demo está listo. Entra con este correo en el enlace:");
              }
              pushBotMessage("Entrar al demo →", { link: "/login" });
            } else {
              pushBotMessage(data?.error || "No pudimos preparar tu demo ahora. Intenta más tarde o escribe a soporte.");
            }
            setChatStep(8);
            setChatInput("");
          })
          .catch(() => {
            pushBotMessage("No pudimos preparar tu demo ahora. Intenta más tarde o escribe a soporte.");
            setChatStep(8);
            setChatInput("");
          });
        return;
      }

      pushBotMessage("Listo. Ya tengo tu correo y te envio el acceso de demo.");
      setChatStep(8);
      setChatInput("");
    }
  };

  return (
    <main className="container landing-root">
      <header className="navbar glass">
        <div className="nav-primary">
          <div className="logo">
            <span className="logo-mark">
              <img src="/brand/logo.v5.png" alt="Assembly 2.0" />
            </span>
            <div>
              <div>Assembly 2.0</div>
              <span className="muted" style={{ fontSize: "12px" }}>
                PH Optimize
              </span>
            </div>
          </div>
          <nav className="nav-links">
            <a href="#beneficios">Beneficios</a>
            <a href="#features">Plataforma</a>
            <a href="#precios">Precios</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a
              className="btn btn-ghost btn-access nav-icon-link"
              href="/login"
              aria-label="Administrador (acceso seguro)"
              style={{
                padding: 0,
                border: "none",
                background: "transparent",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                textDecoration: "none",
                position: "relative",
              }}
              onMouseEnter={() => setHoverAdminAccess(true)}
              onMouseLeave={() => setHoverAdminAccess(false)}
            >
              <span
                className="icon-badge"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "18px",
                  background: hoverAdminAccess
                    ? "radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.45), transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.95))"
                    : "radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.35), transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95))",
                  border: `1px solid ${hoverAdminAccess ? "rgba(236, 72, 153, 0.55)" : "rgba(236, 72, 153, 0.5)"}`,
                  boxShadow: hoverAdminAccess ? "0 8px 20px rgba(236, 72, 153, 0.28), 0 0 0 1px rgba(236, 72, 153, 0.15)" : "0 8px 18px rgba(236, 72, 153, 0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                }}
              >
                <img src="/icons/acceso-seguro.png" alt="Administrador" style={{ width: "70%", height: "70%" }} />
              </span>
              {hoverAdminAccess && (
                <span className="nav-icon-label" style={{ fontSize: "11px", fontWeight: 600, color: "#f0abdc", whiteSpace: "nowrap", letterSpacing: "0.02em", position: "relative", zIndex: 2 }}>
                  Administrador
                </span>
              )}
            </a>
            <Link
              href="/residentes/chat"
              aria-label="Acceso de residentes (chatbot)"
              className="nav-icon-link"
              style={{
                padding: 0,
                border: "none",
                background: "transparent",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                textDecoration: "none",
                position: "relative",
              }}
              onMouseEnter={() => setHoverResidentChat(true)}
              onMouseLeave={() => setHoverResidentChat(false)}
            >
              <span
                className="icon-badge"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "18px",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.85), transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95))",
                  border: "1px solid rgba(99, 102, 241, 0.7)",
                  boxShadow: hoverResidentChat ? "0 14px 32px rgba(99, 102, 241, 0.5)" : "0 14px 32px rgba(99, 102, 241, 0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s ease",
                }}
              >
                <img src="/avatars/chatbot.png" alt="Acceso de residentes" style={{ width: "70%", height: "70%" }} />
              </span>
              {hoverResidentChat && (
                <span className="nav-icon-label" style={{ fontSize: "11px", fontWeight: 600, color: "#a5b4fc", whiteSpace: "nowrap", letterSpacing: "0.02em", position: "relative", zIndex: 2 }}>
                  Acceso de residentes
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="nav-secondary">
          <a className="menu-pill" href="#beneficios">
            Compliance legal
          </a>
          <a className="menu-pill" href="#casos">
            Simulaciones de impacto
          </a>
          <a className="menu-pill" href="#precios-completos">
            Planes oficiales
          </a>
          <a className="menu-pill" href="#demo">
            Demo guiada
          </a>
        </div>
      </header>

      <section className="card glass hero" style={{ padding: "52px" }}>
        <div className="hero-grid">
          <div>
            <span className="pill hero-eyebrow">PH Optimize · Ley 284</span>
            <h1 className="hero-title">Plataforma inteligente para asambleas digitales de PH</h1>
            <p className="hero-subtitle">
              Asamblea virtual con quorum en tiempo real, votacion ponderada y actas certificadas. Reduce 80%
              del trabajo operativo con trazabilidad legal completa.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
              <span className="pill" style={{ background: "rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.4)" }}>
                PROGRAMA EARLY ADOPTER · CUPOS LIMITADOS 2026
              </span>
              <span className="pill" style={{ background: "rgba(99,102,241,0.2)", borderColor: "rgba(99,102,241,0.5)" }}>
                3 de 5 cupos disponibles
              </span>
            </div>
            <div className="hero-cta">
              <button className="btn btn-primary btn-demo" onClick={() => setChatbotOpen(true)}>
                Agendar demo con Lex
              </button>
              <a className="btn btn-ghost" href="/pricing">
                Ver precios
              </a>
              <a className="btn btn-ghost" href="/login?role=admin-inteligente">
                Ver acceso seguro
              </a>
            </div>
            <div className="logo-row">
              <span>Diseñado para administradoras pro en Panama</span>
              {[
                { accent: "rgba(99, 102, 241, 0.9)", glow: "rgba(99, 102, 241, 0.35)" },
                { accent: "rgba(56, 189, 248, 0.9)", glow: "rgba(56, 189, 248, 0.35)" },
                { accent: "rgba(34, 197, 94, 0.9)", glow: "rgba(34, 197, 94, 0.35)" },
                { accent: "rgba(236, 72, 153, 0.9)", glow: "rgba(236, 72, 153, 0.35)" },
              ].map((item, index) => (
                <span
                  key={`hero-avatar-${index}`}
                  className="icon-badge"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "999px",
                    background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95))`,
                    border: `1px solid ${item.accent}`,
                    boxShadow: `0 10px 24px ${item.glow}`,
                  }}
                >
                  <span style={{ fontSize: "14px" }}>👤</span>
                </span>
              ))}
            </div>
            <div className="tag-row">
              {["Compliance legal", "Biometria nativa", "Actas certificadas", "CRM inteligente", "Presentacion live"].map(
                (tag) => (
                  <span key={tag} className="pill">
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="mockup">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong>Panel ejecutivo</strong>
              <span className="pill">Live</span>
            </div>
            <div className="grid grid-3" style={{ marginTop: "16px" }}>
              {[
                { title: "Quórum en tiempo real", sub: "Actualización live" },
                { title: "Votación ponderada", sub: "Por coeficiente PH" },
                { title: "Poderes digitales", sub: "OCR + validación" },
                { title: "Monitor por unidad", sub: "Vista tablero" },
                { title: "Chatbot residente", sub: "Lex integrado" },
                { title: "Actas automáticas", sub: "En minutos" },
              ].map((item) => (
                <div key={item.title} className="stat">
                  <strong>{item.title}</strong>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{item.sub}</span>
                </div>
              ))}
            </div>
            <div className="card-list" style={{ marginTop: "16px" }}>
              {[
                {
                  label: "Votacion en curso · 6 temas",
                  accent: "rgba(34, 197, 94, 0.9)",
                  glow: "rgba(34, 197, 94, 0.35)",
                },
                {
                  label: "Alertas legales activas",
                  accent: "rgba(99, 102, 241, 0.9)",
                  glow: "rgba(99, 102, 241, 0.35)",
                },
                {
                  label: "Acta lista en 3 min",
                  accent: "rgba(236, 72, 153, 0.9)",
                  glow: "rgba(236, 72, 153, 0.35)",
                },
              ].map((item) => (
                <div key={item.label} className="list-item">
                  <span
                    className="icon-badge"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "10px",
                      background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.95))`,
                      border: `1px solid ${item.accent}`,
                      boxShadow: `0 10px 24px ${item.glow}`,
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>✔</span>
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="section">
        <h2 className="section-title">Blindaje legal total (Ley 284)</h2>
        <p className="section-subtitle">
          Cumple articulo por articulo con trazabilidad legal, actas certificadas y control de poderes.
        </p>
        <div className="two-col">
          {[
            { title: "Actas certificadas en minutos", desc: "PDF legal con firmas y auditoria instantanea." },
            { title: "Quorum automatico y sin errores", desc: "Cumplimiento estricto de Ley 284 con trazabilidad total." },
            { title: "Validacion legal de poderes", desc: "OCR + evidencias para evitar impugnaciones." },
          ].map((item) => (
            <div key={item.title} className="list-item">
              <div>
                <h3 style={{ margin: "0 0 6px" }}>{item.title}</h3>
                <p style={{ margin: 0, color: "#cbd5f5" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="casos" className="section">
        <h2 className="section-title">Simulaciones de impacto</h2>
        <p className="section-subtitle">
          Disenado para resolver los problemas criticos de administradoras en Panama, basado en el analisis de
          mas de 20 asambleas tradicionales de alta densidad.
        </p>
        <div className="two-col">
          {[
            {
              title: "El costo del silencio",
              desc: "Hasta $15k anuales en tiempo perdido, riesgo legal y costos manuales.",
            },
            {
              title: "Antes vs. despues",
              desc: "Quorum y votacion en tiempo real con trazabilidad total.",
            },
            {
              title: "Sandbox en vivo",
              desc: "Explora una asamblea demo con datos simulados y KPIs reales.",
            },
          ].map((item) => (
            <div key={item.title} className="list-item">
              <div>
                <h3 style={{ margin: "0 0 6px" }}>{item.title}</h3>
                <p style={{ margin: 0, color: "#cbd5f5" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <a className="btn btn-ghost" href="#ahorro">
            Ver calculadora de ahorro
          </a>
          <span className="muted" style={{ fontSize: "13px" }}>
            Demo activa con datos simulados para validar el impacto.
          </span>
        </div>
      </section>

      <section id="features" className="section">
        <h2 className="section-title">Plataforma modular con IA y compliance legal</h2>
        <p className="section-subtitle">Flujos SaaS modernos enfocados en PH.</p>
        <div className="grid grid-3">
          {[
            { title: "Identidad biometrica", desc: "Face ID + OTP para validacion segura.", icon: "🔒", accent: "rgba(124, 58, 237, 0.9)", glow: "rgba(124, 58, 237, 0.35)" },
            { title: "Votacion ponderada", desc: "Coeficientes por unidad y trazabilidad legal.", icon: "⚖️", accent: "rgba(56, 189, 248, 0.9)", glow: "rgba(56, 189, 248, 0.35)" },
            { title: "Actas certificadas", desc: "PDF legal con firma y auditoria.", icon: "🧾", accent: "rgba(236, 72, 153, 0.9)", glow: "rgba(236, 72, 153, 0.35)" },
            { title: "CRM inteligente", desc: "Leads, tickets y campañas integradas.", icon: "🧠", accent: "rgba(34, 197, 94, 0.9)", glow: "rgba(34, 197, 94, 0.35)" },
            { title: "Poderes digitales", desc: "OCR y validacion de poderes en minutos.", icon: "📄", accent: "rgba(245, 158, 11, 0.9)", glow: "rgba(245, 158, 11, 0.35)" },
            { title: "Dashboard ejecutivo", desc: "KPIs y reportes listos para junta.", icon: "📊", accent: "rgba(99, 102, 241, 0.9)", glow: "rgba(99, 102, 241, 0.35)" },
          ].map((item) => (
            <div key={item.title} className="card">
              <div
                className="icon-badge"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "12px",
                  background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.95))`,
                  border: `1px solid ${item.accent}`,
                  boxShadow: `0 10px 24px ${item.glow}`,
                }}
              >
                <span style={{ fontSize: "14px" }}>{item.icon}</span>
              </div>
              <h3 style={{ marginTop: "16px" }}>{item.title}</h3>
              <p style={{ color: "#cbd5f5" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ahorro" className="section">
        <h2 className="section-title">Calculadora de ahorro</h2>
        <p className="section-subtitle">
          Compara el costo tradicional vs Assembly 2.0 segun tus asambleas anuales.
        </p>
        <div className="card" style={{ display: "grid", gap: "18px" }}>
          <div className="two-col" style={{ gap: "16px" }}>
            <label style={{ display: "grid", gap: "10px" }}>
              ¿Cuántas asambleas haces al año? <strong>{assembliesPerYear}</strong>
              <input
                type="range"
                min={1}
                max={12}
                value={assembliesPerYear}
                onChange={(event) => setAssembliesPerYear(Number(event.target.value))}
              />
            </label>
            <label style={{ display: "grid", gap: "10px" }}>
              ¿Cuántas unidades/casas tiene tu PH? <strong>{unitsCount}</strong>
              <input
                type="range"
                min={50}
                max={1200}
                step={10}
                value={unitsCount}
                onChange={(event) => setUnitsCount(Number(event.target.value))}
              />
            </label>
          </div>
          <div
            className="card"
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(15,23,42,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="icon-badge" style={{ width: "32px", height: "32px", borderRadius: "10px" }}>
                <span style={{ fontSize: "14px" }}>💡</span>
              </span>
              <div>
                <strong>Vista de costo</strong>
                <div className="muted" style={{ fontSize: "12px" }}>
                  Cambia entre mensual y anual
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => setShowMonthly((prev) => !prev)}
              disabled={planSuggestion.planType === "one_time"}
              style={{
                borderRadius: "999px",
                padding: "8px 14px",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                background: showMonthly
                  ? "linear-gradient(135deg, rgba(56,189,248,0.4), rgba(99,102,241,0.35))"
                  : "rgba(15,23,42,0.6)",
                opacity: planSuggestion.planType === "one_time" ? 0.6 : 1,
              }}
            >
              {showMonthly ? "Mensual" : "Anual"}
            </button>
          </div>
          <div className="chart-grid">
            <div className="chart-card">
              <h3 style={{ marginTop: 0 }}>Costo tradicional/{periodLabel}</h3>
              <p style={{ fontSize: "26px", margin: "10px 0" }}>
                ${traditionalDisplay.toLocaleString()}
              </p>
              <p className="muted" style={{ margin: 0 }}>
                Tiempo + riesgo legal + costo manual
              </p>
            </div>
            <div className="chart-card">
              <h3 style={{ marginTop: 0 }}>Plan sugerido</h3>
              <p style={{ fontSize: "26px", margin: "10px 0" }}>
                {planSuggestion.label} · ${planDisplayCost.toLocaleString()}
              </p>
              <p className="muted" style={{ margin: 0 }}>
                {planDisplayLabel} · {planSuggestion.note}
              </p>
              <p className="muted" style={{ margin: "8px 0 0" }}>
                Costo por unidad{" "}
                {planSuggestion.planType === "subscription" ? "/mes" : "/asamblea"}:{" "}
                <span style={{ color: "#34d399", fontWeight: 600 }}>
                  ${roiCalculations.costPerUnitMonthly.toFixed(2)}
                </span>
              </p>
              {planSuggestion.planType === "one_time" && (
                <p className="muted" style={{ margin: "8px 0 0" }}>
                  Este plan no requiere suscripción mensual.
                </p>
              )}
            </div>
          </div>
          <div className="chart-grid">
            <div className="chart-card">
              <h3 style={{ marginTop: 0 }}>Ahorro total/{periodLabel}</h3>
              <p style={{ fontSize: "26px", margin: "10px 0" }}>
                ${savingsDisplay.toLocaleString()}
              </p>
              <p className="muted" style={{ margin: 0 }}>
                ROI estimado {roiCalculations.roi}%
              </p>
            </div>
          </div>
          <div className="two-col">
            <div className="card-list">
              <h4 style={{ margin: "0 0 8px" }}>Consecuencias del modelo tradicional</h4>
              {[
                {
                  label: `Tiempo perdido/${periodLabel}: $${(roiCalculations.timeWasted / periodDivisor).toLocaleString()}`,
                  icon: "⏱️",
                  accent: "rgba(56, 189, 248, 0.9)",
                  glow: "rgba(56, 189, 248, 0.35)",
                },
                {
                  label: `Riesgo legal/${periodLabel}: $${(roiCalculations.legalRisk / periodDivisor).toLocaleString()}`,
                  icon: "⚖️",
                  accent: "rgba(99, 102, 241, 0.9)",
                  glow: "rgba(99, 102, 241, 0.35)",
                },
                {
                  label: `Costo manual/${periodLabel}: $${(roiCalculations.manualCost / periodDivisor).toLocaleString()}`,
                  icon: "💼",
                  accent: "rgba(236, 72, 153, 0.9)",
                  glow: "rgba(236, 72, 153, 0.35)",
                },
              ].map((item) => (
                <div key={item.label} className="list-item">
                  <span
                    className="icon-badge"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "10px",
                      background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.95))`,
                      border: `1px solid ${item.accent}`,
                      boxShadow: `0 10px 24px ${item.glow}`,
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>{item.icon}</span>
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
              <p className="muted" style={{ margin: "8px 0 0", fontSize: "12px" }}>
                <span
                  className="icon-badge"
                  style={{ width: "20px", height: "20px", borderRadius: "8px", marginRight: "8px" }}
                  title="Cálculo basado en 15% de impugnación y $5,000 promedio en abogados + repetición de asamblea."
                >
                  <span style={{ fontSize: "10px" }}>i</span>
                </span>
                Riesgo legal calculado con probabilidad histórica.
              </p>
            </div>
            <div className="card-list">
              <h4 style={{ margin: "0 0 8px" }}>Ahorro con Assembly 2.0</h4>
              {[
                {
                  label: `Inversión Assembly/${periodLabel}: -$${(roiCalculations.planAnnualCost / periodDivisor).toLocaleString()}`,
                  icon: "📌",
                  accent: "rgba(34, 197, 94, 0.9)",
                  glow: "rgba(34, 197, 94, 0.35)",
                },
                {
                  label: `Ahorro neto/${periodLabel}: $${savingsDisplay.toLocaleString()}`,
                  icon: "✅",
                  accent: "rgba(16, 185, 129, 0.9)",
                  glow: "rgba(16, 185, 129, 0.35)",
                },
                {
                  label: `ROI estimado: ${roiCalculations.roi}%`,
                  icon: "📈",
                  accent: "rgba(99, 102, 241, 0.9)",
                  glow: "rgba(99, 102, 241, 0.35)",
                },
              ].map((item) => (
                <div key={item.label} className="list-item">
                  <span
                    className="icon-badge"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "10px",
                      background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.95))`,
                      border: `1px solid ${item.accent}`,
                      boxShadow: `0 10px 24px ${item.glow}`,
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>{item.icon}</span>
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="precios" className="section">
        <h2 className="section-title">Planes clave</h2>
        <p className="section-subtitle">Estructura por perfil: administraciones y promotoras.</p>
        <div className="pricing-grid">
          {[
            { title: "Demo 14 días", desc: "Prueba gratis con 1 PH y flujo completo.", cta: "Probar demo", link: "/demo", accent: "rgba(56, 189, 248, 0.9)", glow: "rgba(56, 189, 248, 0.35)" },
            { title: "Multi-PH Pro", desc: "Hasta 50 edificios y asambleas ilimitadas.", cta: "Ver administraciones", link: "/administraciones", accent: "rgba(99, 102, 241, 0.9)", glow: "rgba(99, 102, 241, 0.35)" },
            { title: "Enterprise + CRM", desc: "Promotoras grandes con CRM y tickets ilimitados.", cta: "Ver promotoras", link: "/promotoras", accent: "rgba(236, 72, 153, 0.9)", glow: "rgba(236, 72, 153, 0.35)" },
          ].map((plan, index) => (
            <div
              key={plan.title}
              className={`pricing-card ${index === 1 ? "highlight" : ""}`}
              style={{
                border: `1px solid ${plan.accent}`,
                boxShadow: `0 20px 60px ${plan.glow}`,
                background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))",
              }}
            >
              <div
                className="icon-badge"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "12px",
                  background: `radial-gradient(circle at 30% 30%, ${plan.accent}, transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.95))`,
                  border: `1px solid ${plan.accent}`,
                  boxShadow: `0 10px 24px ${plan.glow}`,
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "14px" }}>✦</span>
              </div>
              <h3 style={{ marginTop: 0 }}>{plan.title}</h3>
              <p style={{ color: "#cbd5f5" }}>{plan.desc}</p>
              <a className="btn btn-ghost" href={plan.link}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Testimonios reales</h2>
        <p className="section-subtitle">Administradoras y promotoras que ya operan con Assembly 2.0.</p>
        <div className="grid grid-3">
          {[
            { name: "Juan Perez", company: "Administradora Panama S.A.", quote: "Pasamos de 3 dias a 4 horas en todo el ciclo de asamblea.", accent: "rgba(99, 102, 241, 0.9)", glow: "rgba(99, 102, 241, 0.35)" },
            { name: "Maria Gonzalez", company: "Pacific Developments", quote: "El CRM integrado nos ayudo a vender 40 unidades mas rapido.", accent: "rgba(236, 72, 153, 0.9)", glow: "rgba(236, 72, 153, 0.35)" },
            { name: "Junta PH Costa del Este", company: "Junta Directiva", quote: "Resultados transparentes y actas legales en minutos.", accent: "rgba(56, 189, 248, 0.9)", glow: "rgba(56, 189, 248, 0.35)" },
          ].map((item) => (
            <div
              key={item.name}
              className="card"
              style={{
                border: `1px solid rgba(148,163,184,0.18)`,
                boxShadow: `0 18px 50px ${item.glow}`,
                background: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.85))",
              }}
            >
              <div
                className="icon-badge"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "12px",
                  background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.95))`,
                  border: `1px solid ${item.accent}`,
                  boxShadow: `0 10px 24px ${item.glow}`,
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "14px" }}>✦</span>
              </div>
              <p style={{ color: "#cbd5f5", fontSize: "15px", lineHeight: 1.6 }}>"{item.quote}"</p>
              <strong>{item.name}</strong>
              <div style={{ color: "#94a3b8", fontSize: "14px" }}>{item.company}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="section">
        <h2 className="section-title">FAQ</h2>
        <p className="section-subtitle">Respuestas rapidas para administraciones y promotoras.</p>
        <div className="two-col">
          {[
            { q: "¿Puedo gestionar edificios de diferentes tamaños?", a: "Si, desde 20 hasta 500 unidades por edificio.", accent: "rgba(99, 102, 241, 0.9)", glow: "rgba(99, 102, 241, 0.35)" },
            { q: "¿El CRM se integra con mi ERP?", a: "Si, tenemos API REST para integraciones empresariales.", accent: "rgba(56, 189, 248, 0.9)", glow: "rgba(56, 189, 248, 0.35)" },
            { q: "¿Que pasa con inquilinos?", a: "El sistema separa propietarios e inquilinos automaticamente.", accent: "rgba(34, 197, 94, 0.9)", glow: "rgba(34, 197, 94, 0.35)" },
            { q: "¿Cuanto tarda la implementacion?", a: "Setup guiado en 1 hora con importacion masiva.", accent: "rgba(236, 72, 153, 0.9)", glow: "rgba(236, 72, 153, 0.35)" },
          ].map((item) => (
            <div
              key={item.q}
              className="card"
              style={{
                border: `1px solid rgba(148,163,184,0.18)`,
                boxShadow: `0 18px 50px ${item.glow}`,
                background: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.85))",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  className="icon-badge"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "12px",
                    background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.95))`,
                    border: `1px solid ${item.accent}`,
                    boxShadow: `0 10px 24px ${item.glow}`,
                  }}
                >
                  <span style={{ fontSize: "14px" }}>?</span>
                </span>
                <h3 style={{ margin: 0 }}>{item.q}</h3>
              </div>
              <p style={{ color: "#cbd5f5", marginTop: "10px" }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="precios-completos" className="section">
        <h2 className="section-title">Precios completos</h2>
        <p className="section-subtitle">Paquetes y limites oficiales de Assembly 2.0.</p>
        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.badge ? "highlight" : ""}`}
              style={{
                border: plan.badge ? "1px solid rgba(99, 102, 241, 0.7)" : "1px solid rgba(148,163,184,0.2)",
                boxShadow: plan.badge ? "0 22px 60px rgba(99, 102, 241, 0.35)" : "none",
                background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ marginTop: 0 }}>{plan.displayName}</h3>
                {plan.badge ? <span className="pill">{plan.badge}</span> : null}
              </div>
              <p style={{ color: "#cbd5f5" }}>{plan.tagline}</p>
              <p style={{ fontSize: "26px", margin: "12px 0" }}>
                ${plan.price}
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {plan.billing === "monthly" ? "/mes" : " pago unico"}
                </span>
              </p>
              <div className="card-list">
                {plan.features.slice(0, 5).map((feature) => (
                  <div key={feature} className="list-item">
                    <span>•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {plan.restrictions?.length ? (
                <div className="card-list" style={{ marginTop: "12px" }}>
                  {plan.restrictions.map((restriction) => (
                    <div key={restriction} className="list-item">
                      <span>⚠️</span>
                      <span>{restriction}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <a
                className={`btn ${plan.ctaVariant === "primary" || plan.ctaVariant === "accent" ? "btn-primary btn-demo" : "btn-ghost"}`}
                href={plan.id === "ENTERPRISE" ? "/login" : `/checkout?plan=${plan.id}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="section">
        <div
          className="cta-banner"
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            boxShadow: "0 26px 70px rgba(99, 102, 241, 0.35)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Activa un demo guiado con Lex</h2>
          <p style={{ color: "#cbd5f5", maxWidth: "720px" }}>
            El chatbot califica tu perfil y agenda una demo con acceso inmediato.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-demo" onClick={() => setChatbotOpen(true)}>
              Solicitar demo
            </button>
            <a className="btn btn-ghost" href="/login?role=admin-ph">
              Acceso Admin PH
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container" style={{ padding: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              padding: "16px 0",
              borderTop: "1px solid rgba(148,163,184,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="logo-mark">
                <img src="/brand/logo.v5.png" alt="Assembly 2.0" />
              </span>
              <div>
                <strong>Assembly 2.0</strong>
                <p style={{ margin: "6px 0 0" }}>PH Optimize · Governanza digital para PH.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <span>Privacidad</span>
              <span>Terminos</span>
              <span>Soporte</span>
            </div>
          </div>
        </div>
      </footer>

      {chatbotOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.25), transparent 55%), rgba(2,6,23,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            className="card glass"
            style={{
              maxWidth: "520px",
              width: "92%",
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
                  <img src="/avatars/chatbot.png" alt="Lex" style={{ width: "100%", height: "100%" }} />
                </div>
                <div>
                  <strong style={{ letterSpacing: "0.01em" }}>Lex · Asistente de Demo</strong>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Ventas B2B · Assembly 2.0</div>
                </div>
              </div>
              {residentEmailValidated && chatRole === "residente" ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setShowAbandonConfirm(true); setAbandonConfirmPhrase(""); }}
                >
                  Cerrar sesión
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={() => setChatbotOpen(false)}>
                  Cerrar
                </button>
              )}
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
                      {message.from === "bot" && message.link ? (
                        <Link
                          href={message.link}
                          className="btn btn-primary btn-demo"
                          style={{
                            display: "inline-block",
                            marginTop: "8px",
                            borderRadius: "999px",
                            padding: "10px 18px",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          {message.text || "Entrar al demo →"}
                        </Link>
                      ) : (
                        message.text
                      )}
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
                              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#94a3b8" }}>Correo del apoderado *</label>
                              <input
                                type="email"
                                placeholder="apoderado@correo.com"
                                value={poderEmail}
                                onChange={(e) => setPoderEmail(e.target.value)}
                                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0", marginBottom: "10px" }}
                              />
                              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#94a3b8" }}>Nombre completo del apoderado *</label>
                              <input
                                type="text"
                                placeholder="Nombre y apellidos"
                                value={poderApoderadoNombre}
                                onChange={(e) => setPoderApoderadoNombre(e.target.value)}
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
                                  const organizationId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
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
                                      apoderado_tipo: "residente_ph",
                                      apoderado_email: email,
                                      apoderado_nombre: nombre,
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
            </div>
            {/* Pills: debajo del último mensaje, encima del input */}
            {!chatRole ? (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                {[
                  { label: "Administrador PH", value: "admin" },
                  { label: "Junta Directiva", value: "junta" },
                  { label: "Solo demo", value: "demo" },
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
                      setChatRole(option.value as typeof chatRole);
                      pushUserMessage(option.label);
                      pushBotMessage(getRoleEmailPrompt(option.value as typeof chatRole));
                      setChatStep(3);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : chatRole === "residente" && chatStep === 4 && residentEmailPending ? (
              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ borderRadius: "999px", border: "1px solid rgba(148,163,184,0.3)" }}
                  onClick={() => {
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
              // Marketing §2: botones solo cuando correo validado (residentEmailValidated); si no, no mostrar
              <div style={{ marginTop: "12px" }}>
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
                    ...(powersEnabled
                      ? [{
                          label: hasPendingPowerRequest ? "Poder en proceso de validación y aprobación" : "Ceder poder",
                          msg: "Completa los datos de la persona que acepta el poder.",
                          card: "poder" as ChatCard,
                          primary: false,
                          onlyWhenActive: false,
                          isPoder: true,
                        }]
                      : []),
                  ].map(({ label, msg, card, primary, onlyWhenActive, isPoder }) => {
                    const active = assemblyContext === "activa";
                    const disabled = onlyWhenActive && !active;
                    const poderDisabled = isPoder && hasPendingPowerRequest;
                    return (
                      <button
                        key={card}
                        className={primary && !disabled && !poderDisabled ? "btn btn-primary btn-demo" : "btn btn-ghost"}
                        style={{
                          borderRadius: "999px",
                          border: primary && !disabled && !poderDisabled ? undefined : "1px solid rgba(148,163,184,0.3)",
                          background: disabled || poderDisabled ? "rgba(71,85,105,0.4)" : primary ? undefined : "rgba(15,23,42,0.7)",
                          opacity: disabled || poderDisabled ? 0.8 : 1,
                          cursor: disabled || poderDisabled ? "not-allowed" : "pointer",
                        }}
                        title={disabled ? "No hay votación activa" : poderDisabled ? "Pendiente por aprobar" : undefined}
                        disabled={disabled || poderDisabled}
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
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <a className="btn btn-primary btn-demo" href="/login" style={{ borderRadius: "999px" }}>
                  Agendar demo
                </a>
                <a className="btn btn-ghost" href="/administraciones" style={{ borderRadius: "999px", border: "1px solid rgba(148,163,184,0.3)" }}>
                  Ver planes
                </a>
              </div>
            ) : null}
            {(chatStep < 8 || (chatRole === "residente" && residentEmailValidated)) ? (
              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder={chatStep >= 8 ? "Escribe algo..." : "Escribe tu respuesta..."}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(99,102,241,0.35)",
                    background: "rgba(15,23,42,0.7)",
                    color: "#e2e8f0",
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleChatSubmit();
                  }}
                />
                <button className="btn btn-primary btn-demo" onClick={handleChatSubmit}>
                  Enviar
                </button>
              </div>
            ) : null}
            {chatStep >= 8 && !(chatRole === "residente" && residentEmailValidated) && (
              <p style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>
                Te contactamos en menos de 24 horas con el acceso de demo.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {showAbandonConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="abandon-dialog-title-landing"
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
            <h3 id="abandon-dialog-title-landing" style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 600, color: "#f1f5f9" }}>
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
                className="btn btn-ghost"
                onClick={() => { setShowAbandonConfirm(false); setAbandonConfirmPhrase(""); }}
                style={{ borderRadius: "12px" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary btn-demo"
                disabled={abandonConfirmPhrase.trim().toLowerCase() !== ABANDON_CONFIRM_PHRASE.toLowerCase()}
                style={{ borderRadius: "12px", opacity: abandonConfirmPhrase.trim().toLowerCase() === ABANDON_CONFIRM_PHRASE.toLowerCase() ? 1 : 0.6 }}
                onClick={() => {
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
                  setShowAbandonConfirm(false);
                  setChatbotOpen(false);
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

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="container">
        <div className="navbar glass" style={{ minHeight: "60px" }} />
        <p className="muted" style={{ textAlign: "center", padding: "48px" }}>Cargando…</p>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
