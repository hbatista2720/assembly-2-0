"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Face ID opcional (Arquitecto/FACE_ID_OPCIONAL_ADMIN_RESIDENTE.md): cuando se implemente WebAuthn,
// consultar GET /api/resident-profile?email=... y usar face_id_enabled: si false solo OTP; si true
// ofrecer Face ID con fallback visible "Usar código OTP". OTP siempre disponible.

const DEMO_EMAIL = "demo@assembly2.com";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (params.get("demo") === "1") setEmail(DEMO_EMAIL);
  }, [params]);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState("");
  const emailRef = useRef<HTMLInputElement | null>(null);

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Ingresa tu correo.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "No se pudo enviar el código.");
        setLoading(false);
        return;
      }
      if (data?.otp) {
        setDebugOtp(data.otp);
      }
      setStep("otp");
      setLoading(false);
    } catch (err) {
      setError("No se pudo enviar el código.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();
    if (!trimmedEmail || !trimmedOtp) {
      setError("Ingresa el correo y el código.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, code: trimmedOtp }),
      });
      const data = await response.json();
      if (!response.ok || !data?.user) {
        setError(data?.error || "Código inválido o expirado.");
        setLoading(false);
        return;
      }
      const user = data.user;
      const redirectTo = params.get("redirect");

      if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        try {
          localStorage.setItem("assembly_email", trimmedEmail);
          if (data.user.id) localStorage.setItem("assembly_user_id", data.user.id);
          if (data.user.organization_id) localStorage.setItem("assembly_organization_id", data.user.organization_id);
        } catch {}
        router.push(redirectTo);
        return;
      }

      if (user.role === "RESIDENTE") {
        try {
          localStorage.setItem("assembly_role", "residente");
          localStorage.setItem("assembly_resident_email", trimmedEmail);
          localStorage.setItem("assembly_resident_validated", String(Date.now()));
          if (user.id) localStorage.setItem("assembly_user_id", user.id);
          if (user.organization_id) localStorage.setItem("assembly_organization_id", user.organization_id);
        } catch {}
        router.push("/residentes/chat");
        return;
      }

      const roleLabel = user.is_platform_owner || user.role === "ADMIN_PLATAFORMA" ? "admin-inteligente" : "admin-ph";
      try {
        localStorage.setItem("assembly_role", roleLabel);
        localStorage.setItem("assembly_email", trimmedEmail);
        if (data.user.id) localStorage.setItem("assembly_user_id", data.user.id);
        document.cookie = `assembly_role=${roleLabel}; path=/; max-age=604800`;
        if (data.user.organization_id) localStorage.setItem("assembly_organization_id", data.user.organization_id);
        if (data.user.subscription_id) localStorage.setItem("assembly_subscription_id", data.user.subscription_id);
      } catch {
        // ignore storage errors
      }

      if (user.is_platform_owner || user.role === "ADMIN_PLATAFORMA") {
        router.push("/dashboard/platform-admin");
        return;
      }
      if (user.is_demo) {
        router.push("/dashboard/admin-ph?mode=demo");
        return;
      }
      router.push("/dashboard/admin-ph");
    } catch (err) {
      setError("No se pudo verificar el código.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetEmail = () => {
    setStep("email");
    setOtp("");
    setDebugOtp("");
    setError("");
    setTimeout(() => emailRef.current?.focus(), 0);
  };

  return (
    <main className="container login-ios">
      <style>{`
        .login-ios .login-card { max-width: 860px; margin: 0 auto; border-radius: 20px; overflow: hidden; }
        .login-ios .login-feature-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(148,163,184,0.15);
          font-size: 14px; font-weight: 500; color: #e2e8f0;
          transition: background 0.2s, border-color 0.2s;
        }
        .login-ios .login-feature-item:hover { background: rgba(255,255,255,0.08); border-color: rgba(148,163,184,0.25); }
        .login-ios .login-input {
          padding: 12px 16px; border-radius: 12px; font-size: 15px;
          border: 1px solid rgba(148,163,184,0.25); background: rgba(30,41,59,0.5);
          color: #e2e8f0; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-ios .login-input:focus { outline: none; border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        .login-ios .login-input::placeholder { color: #64748b; }
        .login-ios .login-submit {
          padding: 14px 24px; border-radius: 12px; font-size: 16px; font-weight: 600;
          background: linear-gradient(135deg, rgba(99,102,241,0.95), rgba(168,85,247,0.9));
          border: none; color: #fff; cursor: pointer;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .login-ios .login-submit:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
        .login-ios .login-submit:active:not(:disabled) { transform: scale(0.98); }
        .login-ios .login-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-ios .login-ghost {
          padding: 10px 18px; border-radius: 10px; font-size: 15px; font-weight: 500;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(148,163,184,0.25);
          color: #e2e8f0; cursor: pointer; transition: background 0.2s, transform 0.15s;
        }
        .login-ios .login-ghost:hover { background: rgba(255,255,255,0.1); transform: scale(1.02); }
      `}</style>
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <a className="btn btn-home" href="/" aria-label="Volver al inicio" title="Inicio">
          <span
            className="icon-badge"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background:
                "radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.9), transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95))",
              border: "1px solid rgba(99, 102, 241, 0.85)",
              boxShadow: "0 14px 32px rgba(99, 102, 241, 0.4)",
              overflow: "hidden",
            }}
          >
            <img src="/icons/home.png" alt="Inicio" style={{ width: "78%", height: "78%" }} />
          </span>
        </a>
        <button
          type="button"
          className="btn-icon"
          title="Acceso seguro"
          aria-label="Acceso seguro"
          onClick={() => emailRef.current?.focus()}
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
        </button>
      </div>

      <div className="card glass login-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <span className="logo-mark" style={{ boxShadow: "0 0 24px rgba(99, 102, 241, 0.4)" }}>
            <img src="/brand/logo.v5.png" alt="Assembly 2.0" />
          </span>
          <div>
            <strong style={{ fontSize: "17px", fontWeight: 600 }}>Assembly 2.0</strong>
            <div className="muted" style={{ fontSize: "12px", marginTop: "2px" }}>
              Acceso seguro
            </div>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "28px" }}>
          <div>
            <h1 style={{ marginTop: 0, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>Acceso estratégico</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.5, marginTop: "8px" }}>
              Ingresa con tu correo y un código OTP para acceder al dashboard seguro de Assembly 2.0.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
              {[
                {
                  label: "Acceso seguro",
                  icon: "🔐",
                  accent: "rgba(99, 102, 241, 0.9)",
                  glow: "rgba(99, 102, 241, 0.4)",
                  border: "rgba(99, 102, 241, 0.6)",
                },
                {
                  label: "Roles separados",
                  icon: "🧭",
                  accent: "rgba(56, 189, 248, 0.9)",
                  glow: "rgba(56, 189, 248, 0.4)",
                  border: "rgba(56, 189, 248, 0.6)",
                },
                {
                  label: "Trazabilidad legal",
                  icon: "✅",
                  accent: "rgba(16, 185, 129, 0.9)",
                  glow: "rgba(16, 185, 129, 0.4)",
                  border: "rgba(16, 185, 129, 0.6)",
                },
              ].map((item) => (
                <div key={item.label} className="login-feature-item">
                  <span
                    className="icon-badge"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95))`,
                      border: `1px solid ${item.border}`,
                      boxShadow: `0 8px 20px ${item.glow}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#94a3b8" }}>
              Correo corporativo
              <input
                ref={emailRef}
                className="login-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@tuempresa.com"
                required
                disabled={step === "otp"}
                style={{ opacity: step === "otp" ? 0.7 : 1 }}
              />
            </label>

            {step === "otp" ? (
              <label style={{ display: "grid", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#94a3b8" }}>
                Código de 6 dígitos
                <input
                  className="login-input"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Ej: 123456"
                  inputMode="numeric"
                  required
                />
                {debugOtp ? (
                  <span className="muted" style={{ fontSize: "12px" }}>
                    Código enviado (modo local): <strong>{debugOtp}</strong>
                  </span>
                ) : null}
              </label>
            ) : (
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                Te enviaremos un código OTP de 6 dígitos a tu correo.
              </p>
            )}

            {error ? <p style={{ margin: 0, color: "#fca5a5", fontSize: "13px" }}>{error}</p> : null}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Procesando…" : step === "email" ? "Enviar código" : "Verificar código"}
            </button>
            {step === "otp" ? (
              <button type="button" className="login-ghost" onClick={handleResetEmail}>
                Usar otro correo
              </button>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="container">
        <div className="card glass" style={{ maxWidth: "860px", margin: "0 auto" }}>
          <p className="muted">Cargando…</p>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
