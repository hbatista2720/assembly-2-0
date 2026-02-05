"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS } from "../lib/types/pricing";

export default function HomePage() {
  const router = useRouter();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatStep, setChatStep] = useState(0);
  const [chatRole, setChatRole] = useState<"admin" | "junta" | "residente" | "demo" | "">("");
  const [chatMessages, setChatMessages] = useState<Array<{ from: "bot" | "user"; text: string }>>([]);
  const [webPrompt, setWebPrompt] = useState("Hola, soy Lex. Antes de continuar, ¿que perfil tienes?");
  const [leadData, setLeadData] = useState({
    email: "",
    role: "",
    demoEmail: "",
  });
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

  useEffect(() => {
    const timer = setTimeout(() => setChatbotOpen(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!chatbotOpen || chatMessages.length > 0) return;
    fetch("/api/chatbot/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const webConfig = Array.isArray(data) ? data.find((item) => item.bot_name === "web") : null;
        const prompt = webConfig?.prompts?.landing || webPrompt;
        setWebPrompt(prompt);
        setChatMessages([{ from: "bot", text: prompt }]);
      })
      .catch(() => {
        setChatMessages([{ from: "bot", text: webPrompt }]);
      });
  }, [chatbotOpen, chatMessages.length]);

  const pushBotMessage = (text: string) => {
    setChatMessages((prev) => [...prev, { from: "bot", text }]);
  };

  const pushUserMessage = (text: string) => {
    setChatMessages((prev) => [...prev, { from: "user", text }]);
  };

  const handleQuickAction = (label: string, response: string) => {
    pushUserMessage(label);
    pushBotMessage(response);
  };

  const handleQuickNav = (label: string, response: string, path: string) => {
    handleQuickAction(label, response);
    setTimeout(() => {
      router.push(path);
    }, 200);
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
        try {
          const existingUsers = JSON.parse(localStorage.getItem("assembly_users") || "[]") as Array<{
            email: string;
          }>;
          const match = existingUsers.find((user) => user.email?.toLowerCase() === emailLower);
          if (!match) {
            pushBotMessage("No encuentro ese correo. Contacta al administrador de tu PH para validar.");
            setChatStep(8);
            setChatInput("");
            return;
          }
        } catch {
          // ignore storage issues
        }
        pushBotMessage("Correo reconocido. Te conecto con tu administrador.");
        setChatStep(8);
        setChatInput("");
        return;
      }

      const emailPrefix = emailLower.split("@")[0] || "admin";
      const demoEmail =
        chatRole === "admin"
          ? `${emailPrefix.replace(/[^a-z0-9.]/g, "")}-adminph@demo.assembly.local`
          : "";
      const finalLead = { ...leadData, email: emailLower, role: chatRole, demoEmail };
      setLeadData(finalLead);
      pushBotMessage("Listo. Ya tengo tu correo y te envio el acceso de demo.");
      if (demoEmail) {
        pushBotMessage(`Te cree un correo demo para Admin PH: ${demoEmail}`);
      }
      try {
        localStorage.setItem("landingLead", JSON.stringify({ ...finalLead, createdAt: Date.now() }));
      } catch {
        // ignore storage issues
      }
      setChatStep(8);
      setChatInput("");
    }
  };

  return (
    <main className="container">
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
              className="btn btn-ghost btn-access"
              href="/login"
              title="Acceso seguro"
              aria-label="Acceso seguro"
              style={{ padding: 0, border: "none", background: "transparent" }}
            >
              <span
                className="icon-badge"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "18px",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.8), transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95))",
                  border: "1px solid rgba(236, 72, 153, 0.7)",
                  boxShadow: "0 14px 32px rgba(236, 72, 153, 0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img src="/icons/acceso-seguro.png" alt="Acceso seguro" style={{ width: "70%", height: "70%" }} />
              </span>
            </a>
            <button
              className="btn btn-primary btn-demo"
              onClick={() => setChatbotOpen(true)}
              title="Solicita un demo"
              aria-label="Solicita un demo"
              style={{ padding: 0, border: "none", background: "transparent" }}
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
                  boxShadow: "0 14px 32px rgba(99, 102, 241, 0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img src="/avatars/chatbot.png" alt="Solicita un demo" style={{ width: "70%", height: "70%" }} />
              </span>
            </button>
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
              {["Urban Tower", "Costa del Este", "Vista Azul", "Pacific View", "Torre 9", "PH Lago"].map(
                (name) => (
                  <div key={name} className="stat">
                    <strong>{name}</strong>
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>Quorum: 68%</span>
                  </div>
                ),
              )}
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
              <a className={`btn ${plan.ctaVariant === "primary" ? "btn-primary btn-demo" : "btn-ghost"}`} href="/login">
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
              <button className="btn btn-ghost" onClick={() => setChatbotOpen(false)}>
                Cerrar
              </button>
            </div>
            <div
              style={{
                marginTop: "18px",
                display: "grid",
                gap: "12px",
                maxHeight: "280px",
                overflowY: "auto",
                paddingRight: "6px",
              }}
            >
              {chatMessages.map((message, index) => (
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
              ))}
            </div>
            {!chatRole ? (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                {[
                  { label: "Administrador PH", value: "admin" },
                  { label: "Junta Directiva", value: "junta" },
                  { label: "Residente", value: "residente" },
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
            ) : null}
            {chatStep < 8 ? (
              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Escribe tu respuesta..."
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
            ) : (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
                {chatRole === "residente" ? (
                  <>
                    <button
                      className="btn btn-primary btn-demo"
                      onClick={() =>
                        handleQuickNav("Votación", "Abriendo votación activa del día.", "/residentes/votacion")
                      }
                    >
                      Votación
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() =>
                        handleQuickNav("Asambleas", "Te muestro el listado de asambleas activas.", "/residentes/asambleas")
                      }
                    >
                      Asambleas
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() =>
                        handleQuickNav("Calendario", "Aquí tienes el calendario de tu PH.", "/residentes/calendario")
                      }
                    >
                      Calendario
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() =>
                        handleQuickNav(
                          "Tema del día",
                          "Tema activo: aprobación de presupuesto.",
                          "/residentes/tema-del-dia",
                        )
                      }
                    >
                      Tema del día
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() =>
                        handleQuickNav("Ceder poder", "Cede el poder y lo validamos en minutos.", "/residentes/poder")
                      }
                    >
                      Ceder poder
                    </button>
                  </>
                ) : (
                  <>
                    <a className="btn btn-primary btn-demo" href="/login">
                      Agendar demo
                    </a>
                    <a className="btn btn-ghost" href="/administraciones">
                      Ver planes
                    </a>
                  </>
                )}
              </div>
            )}
            <p style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>
              Te contactamos en menos de 24 horas con el acceso de demo.
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
