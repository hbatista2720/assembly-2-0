"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEMO_EMAIL = "demo@assembly2.com";

export default function LoginPage() {
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
      const roleLabel = user.is_platform_owner || user.role === "ADMIN_PLATAFORMA" ? "admin-inteligente" : "admin-ph";
      try {
        localStorage.setItem("assembly_role", roleLabel);
        localStorage.setItem("assembly_email", trimmedEmail);
        document.cookie = `assembly_role=${roleLabel}; path=/; max-age=604800`;
        if (data.user.organization_id) {
          localStorage.setItem("assembly_organization_id", data.user.organization_id);
        }
        if (data.user.subscription_id) {
          localStorage.setItem("assembly_subscription_id", data.user.subscription_id);
        }
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
    <main className="container">
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

      <div className="card glass" style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
          <span className="logo-mark" style={{ boxShadow: "0 0 24px rgba(99, 102, 241, 0.5)" }}>
            <img src="/brand/logo.v5.png" alt="Assembly 2.0" />
          </span>
          <div>
            <strong>Assembly 2.0</strong>
            <div className="muted" style={{ fontSize: "12px" }}>
              Acceso seguro
            </div>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div>
            <h1 style={{ marginTop: 0 }}>Acceso estratégico</h1>
            <p style={{ color: "#cbd5f5" }}>
              Ingresa con tu correo y un código OTP para acceder al dashboard seguro de Assembly 2.0.
            </p>
            <div className="card-list" style={{ marginTop: "16px" }}>
              {[
                { label: "Acceso seguro", icon: "🔐", accent: "rgba(99, 102, 241, 0.9)", glow: "rgba(99, 102, 241, 0.35)" },
                { label: "Roles separados", icon: "🧭", accent: "rgba(56, 189, 248, 0.9)", glow: "rgba(56, 189, 248, 0.35)" },
                { label: "Trazabilidad legal", icon: "✅", accent: "rgba(16, 185, 129, 0.9)", glow: "rgba(16, 185, 129, 0.35)" },
              ].map((item) => (
                <div key={item.label} className="list-item">
                  <span
                    className="icon-badge"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "10px",
                      background: `radial-gradient(circle at 30% 30%, ${item.accent}, transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9))`,
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

          <form onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp} style={{ display: "grid", gap: "16px" }}>
            <label style={{ display: "grid", gap: "8px" }}>
              Correo corporativo
              <input
                ref={emailRef}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@tuempresa.com"
                required
                disabled={step === "otp"}
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#e2e8f0",
                  opacity: step === "otp" ? 0.7 : 1,
                }}
              />
            </label>

            {step === "otp" ? (
              <label style={{ display: "grid", gap: "8px" }}>
                Código de 6 dígitos
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Ej: 123456"
                  inputMode="numeric"
                  required
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(15, 23, 42, 0.6)",
                    color: "#e2e8f0",
                  }}
                />
                {debugOtp ? (
                  <span className="muted" style={{ fontSize: "12px" }}>
                    Código enviado (modo local): <strong>{debugOtp}</strong>
                  </span>
                ) : null}
              </label>
            ) : (
              <p style={{ margin: 0, color: "#cbd5f5" }}>
                Te enviaremos un codigo OTP de 6 digitos a tu correo.
              </p>
            )}

            {error ? <p style={{ margin: 0, color: "#fca5a5" }}>{error}</p> : null}

            <button type="submit" className="btn btn-primary btn-demo" disabled={loading}>
              {loading ? "Procesando..." : step === "email" ? "Enviar codigo" : "Verificar codigo"}
            </button>
            {step === "otp" ? (
              <button type="button" className="btn btn-ghost" onClick={handleResetEmail}>
                Usar otro correo
              </button>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}
