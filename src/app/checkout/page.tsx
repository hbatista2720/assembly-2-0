"use client";

/**
 * FASE 09 (alcance Arquitecto): Solo PayPal, Tilopay, Yappy, ACH. Stripe fuera de alcance.
 * Soporta flujo desde carrito (from=cart): plan + unidades + cupón.
 */

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import { PLANS, PlanTier } from "../../lib/types/pricing";
import { useCartOptional } from "../../context/CartContext";
import { getEnabledPaymentMethodIds, isManualAction, getGatewayConfig, type PaymentMethodId } from "../../lib/paymentConfig";

const ALL_PAYMENT_METHODS = [
  { id: "PAYPAL", label: "PayPal", desc: "Tarjeta o balance PayPal (retiros en Panamá)" },
  { id: "TILOPAY", label: "Tilopay", desc: "Tarjetas locales / Centroamérica" },
  { id: "MANUAL_YAPPY", label: "Yappy", desc: "Wallet móvil (Panamá)" },
  { id: "MANUAL_ACH", label: "ACH", desc: "Transferencia bancaria directa" },
  { id: "MANUAL_TRANSFER", label: "Transferencia", desc: "Transferencia manual" },
] as const;

function getDisplayConfig() {
  const g = getGatewayConfig();
  const bank = g.ach?.bankName || "Banco General";
  const type = g.ach?.accountType || "Cuenta Corriente";
  return {
    companyName: g.ach?.accountHolder || g.yappy?.accountName || "Assembly 2.0",
    achBankLine: type ? `${bank} - ${type}` : bank,
    achAccount: g.ach?.accountNumber || "03-01-01-146847-7",
    yappyName: g.yappy?.accountName || g.ach?.accountHolder || "Assembly 2.0",
  };
}

function AchDisplayConfig() {
  const { achBankLine, achAccount, companyName } = getDisplayConfig();
  return (
    <div style={{ padding: "14px", background: "rgba(15,23,42,0.6)", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.15)" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>Transferencia ACH</div>
      <div style={{ fontSize: "14px", marginBottom: "4px" }}>{achBankLine}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <code style={{ fontSize: "13px" }}>{achAccount}</code>
        <button type="button" className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => navigator.clipboard?.writeText(achAccount)}>
          Copiar
        </button>
      </div>
      <div className="muted" style={{ fontSize: "12px", marginTop: "6px" }}>A nombre de {companyName}</div>
    </div>
  );
}

function YappyDisplayConfig() {
  const { yappyName } = getDisplayConfig();
  return (
    <div style={{ padding: "14px", background: "rgba(15,23,42,0.6)", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.15)" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>Yappy</div>
      <div style={{ fontSize: "13px", marginBottom: "4px" }}>Buscar en directorio</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <strong>{yappyName}</strong>
        <button type="button" className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => navigator.clipboard?.writeText(yappyName)}>
          Copiar
        </button>
      </div>
    </div>
  );
}

const UNITS_ADDON_OPTIONS = [
  { units: 0, label: "250 residentes (incluido)", price: 0 },
  { units: 100, label: "+100 residentes (350 total)", price: 50 },
  { units: 200, label: "+200 residentes (450 total)", price: 100 },
  { units: 300, label: "+300 residentes (500 máx)", price: 150 },
];

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const fromCart = params.get("from") === "cart";
  const cartApi = useCartOptional();
  const planId = (params.get("plan") || "STANDARD") as PlanTier;
  const fromDashboardPh = params.get("from") === "dashboard-admin-ph" || params.get("from_dashboard") === "1";
  const planFromUrl = useMemo(() => PLANS.find((p) => p.id === planId) ?? PLANS[2], [planId]);
  const [paymentMethod, setPaymentMethod] = useState<string>("MANUAL_YAPPY");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("assembly_email") || localStorage.getItem("assembly_resident_email") || "";
    setUserEmail(stored);
    if (!email && stored) setEmail(stored);
  }, []);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [addonUnits, setAddonUnits] = useState(0);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState("");
  const [paymentMethodsFiltered, setPaymentMethodsFiltered] = useState<typeof ALL_PAYMENT_METHODS>(ALL_PAYMENT_METHODS);

  const isManualMethod = isManualAction(paymentMethod as PaymentMethodId);

  useEffect(() => {
    const ids = getEnabledPaymentMethodIds();
    const filtered = ALL_PAYMENT_METHODS.filter((pm) => ids.includes(pm.id as any));
    setPaymentMethodsFiltered(filtered);
    setPaymentMethod((prev) => (filtered.some((pm) => pm.id === prev) ? prev : filtered[0]?.id ?? prev));
  }, []);

  const cart = cartApi?.cart;
  const cartPlan = fromCart && cart?.plan ? PLANS.find((p) => p.id === cart.plan!.planId) : null;
  const plan = fromCart && cartPlan ? cartPlan : planFromUrl;
  const unitsAddonTotalDollars = fromCart && cart
    ? cart.unitAddons.reduce((s, a) => s + a.price, 0)
    : plan.billing === "one-time" && (planId === "EVENTO_UNICO" || planId === "DUO_PACK")
      ? (UNITS_ADDON_OPTIONS.find((o) => o.units === addonUnits)?.price ?? 0)
      : 0;
  const couponCode = fromCart && cart?.coupon ? cart.coupon.code : null;
  const subtotalFromCart = fromCart && cart ? (cart.plan?.price ?? 0) + cart.unitAddons.reduce((s, a) => s + a.price, 0) : plan.price + unitsAddonTotalDollars;
  const discountFromCart = fromCart && cart?.coupon ? Math.round(subtotalFromCart * (cart.coupon.discountPercent / 100) * 100) / 100 : 0;
  const totalPrice = fromCart ? Math.max(0, subtotalFromCart - discountFromCart) : plan.price + unitsAddonTotalDollars;

  const cartHref = fromDashboardPh ? "/dashboard/admin-ph/subscription/cart" : "/cart";

  useEffect(() => {
    if (fromCart && cartApi && (!cartApi.cart.plan || cartApi.itemCount === 0)) {
      router.replace(cartHref);
    }
  }, [fromCart, cartApi, router, cartHref]);

  const showUnitsAddon = !fromCart && plan.billing === "one-time" && (planId === "EVENTO_UNICO" || planId === "DUO_PACK");

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.includes(",") ? result.split(",")[1]! : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleCheckout() {
    setLoading(true);
    setMessage(null);
    setProofError("");
    try {
      let proofBase64: string | null = null;
      let proofFileName = "comprobante";
      if (isManualMethod) {
        if (!proofFile) {
          setProofError("Debes adjuntar el comprobante de pago (PDF, JPG o PNG) para enviar la orden.");
          setLoading(false);
          return;
        }
        const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(proofFile.type)) {
          setProofError("Formato no válido. Usa PDF, JPG o PNG.");
          setLoading(false);
          return;
        }
        proofBase64 = await fileToBase64(proofFile);
        proofFileName = proofFile.name || "comprobante";
      }

      const res = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_tier: plan.id,
          payment_method: paymentMethod,
          subscription_id: typeof window !== "undefined" ? localStorage.getItem("assembly_subscription_id") : null,
          organization_id: typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null,
          customer_email: email || undefined,
          units_addon_total: fromCart ? cart?.unitAddons.reduce((s, a) => s + a.price, 0) ?? 0 : unitsAddonTotalDollars,
          coupon_code: couponCode || undefined,
          proof_base64: proofBase64,
          proof_file_name: proofFileName,
          success_url: `${window.location.origin}/pricing?success=1`,
          cancel_url: fromCart ? `${window.location.origin}${fromDashboardPh ? "/dashboard/admin-ph/subscription/cart" : "/cart"}` : `${window.location.origin}/checkout?plan=${plan.id}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al crear checkout" });
        if (data.fallback_manual) setPaymentMethod("MANUAL_YAPPY");
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      if (data.pending) {
        setMessage({
          type: data.checkout_available === false ? "error" : "ok",
          text: data.message || "Orden enviada. Revisaremos tu comprobante y te contactaremos pronto.",
        });
        if (data.fallback_manual) setPaymentMethod("MANUAL_YAPPY");
        setProofFile(null);
        if (fromDashboardPh) {
          setTimeout(() => router.push("/dashboard/admin-ph/subscription"), 2500);
        }
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Error de conexión" });
    } finally {
      setLoading(false);
    }
  }

  if (fromCart && cartApi && (!cartApi.cart.plan || cartApi.itemCount === 0)) {
    return (
      <main className="container">
        <div className="card" style={{ maxWidth: "560px", margin: "24px auto", padding: "28px" }}>
          <p className="muted">Redirigiendo al carrito…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ marginBottom: "16px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        {fromCart && (
          <a className="btn btn-primary" href={cartHref} style={{ padding: "10px 18px", borderRadius: "10px", fontWeight: 600 }}>
            ← Volver al carrito
          </a>
        )}
        {fromDashboardPh && (
          <a className="btn btn-ghost" href="/dashboard/admin-ph" style={{ padding: "10px 18px", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            ← DASHBOARD PRINCIPAL
          </a>
        )}
      </div>
      <div className="card" style={{ maxWidth: "560px", margin: "24px auto", padding: "28px" }}>
        <h1 style={{ marginTop: 0 }}>Completar pago</h1>
        {fromCart && cart ? (
          <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(30,41,59,0.5)", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)" }}>
            <p style={{ margin: "0 0 8px" }}><strong>Resumen del carrito</strong></p>
            {userEmail && (
              <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#94a3b8" }}>
                Comprador: <strong style={{ color: "var(--color-text, #f1f5f9)" }}>{userEmail}</strong>
              </p>
            )}
            <p style={{ margin: 0 }}>Plan: <strong>{cart.plan?.displayName}</strong> — ${cart.plan?.price ?? 0}{cart.plan?.billing === "monthly" ? "/mes" : ""}</p>
            {cart.unitAddons.length > 0 && <p style={{ margin: "4px 0 0" }}>Unidades: {cart.unitAddons.map((a) => a.label).join(", ")} — ${cart.unitAddons.reduce((s, a) => s + a.price, 0)}</p>}
            {cart.coupon && <p style={{ margin: "4px 0 0", color: "#4ade80" }}>Cupón {cart.coupon.code}: -{cart.coupon.discountPercent}%</p>}
            <p style={{ marginTop: "12px", marginBottom: 0, fontWeight: 700 }}>Total: ${totalPrice.toFixed(2)}</p>
          </div>
        ) : (
          <p className="muted" style={{ marginBottom: "20px" }}>
            Plan: <strong>{plan.displayName}</strong> — ${plan.price}
            {plan.billing === "monthly" ? "/mes" : " pago único"}
          </p>
        )}

        {showUnitsAddon && (
          <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(99,102,241,0.1)", borderRadius: "12px", border: "1px solid rgba(99,102,241,0.3)" }}>
            <label style={{ display: "block", marginBottom: "10px", color: "#cbd5f5" }}>Agregar límite de residentes</label>
            <p className="muted" style={{ margin: "0 0 12px", fontSize: "14px" }}>Base 250 incluidos. Puedes sumar más hasta 500 (pago único).</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {UNITS_ADDON_OPTIONS.map((opt) => (
                <label
                  key={opt.units}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "12px",
                    border: addonUnits === opt.units ? "1px solid #6366f1" : "1px solid rgba(148,163,184,0.3)",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="addon"
                    checked={addonUnits === opt.units}
                    onChange={() => setAddonUnits(opt.units)}
                  />
                  <span>{opt.label}</span>
                  <span>{opt.price === 0 ? "Incluido" : `+$${opt.price}`}</span>
                </label>
              ))}
            </div>
            <p style={{ marginTop: "12px", marginBottom: 0, fontWeight: 700 }}>
              Total: ${totalPrice} pago único
            </p>
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8" }}>Email (facturación)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={userEmail || "tu@email.com"}
            className="btn"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <span style={{ display: "block", marginBottom: "10px", color: "#94a3b8" }}>Método de pago</span>
          {paymentMethodsFiltered.length === 0 ? (
            <p className="muted" style={{ padding: "16px", background: "rgba(239,68,68,0.1)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)" }}>
              No hay métodos de pago habilitados. Henry debe activar al menos uno en Configuración de pagos.
            </p>
          ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {paymentMethodsFiltered.map((pm) => (
              <label
                key={pm.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  border: paymentMethod === pm.id ? "1px solid #6366f1" : "1px solid rgba(148,163,184,0.3)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === pm.id}
                  onChange={() => setPaymentMethod(pm.id)}
                />
                <div>
                  <div>{pm.label}</div>
                  <div className="muted" style={{ fontSize: "12px" }}>{pm.desc}</div>
                </div>
              </label>
            ))}
          </div>
          )}
        </div>

        {isManualMethod && (
          <div
            style={{
              marginBottom: "24px",
              padding: "20px",
              background: "rgba(30,41,59,0.5)",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Realiza tu pago</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              {(paymentMethod === "MANUAL_ACH" || paymentMethod === "MANUAL_TRANSFER") && (
                <AchDisplayConfig />
              )}
              {(paymentMethod === "MANUAL_YAPPY" || paymentMethod === "MANUAL_TRANSFER") && (
                <YappyDisplayConfig />
              )}
            </div>
            <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: "1.1rem" }}>
              Monto a pagar: ${totalPrice.toFixed(2)}
            </p>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                Comprobante de pago <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  border: "2px dashed rgba(148,163,184,0.4)",
                  borderRadius: "10px",
                  background: proofFile ? "rgba(34,197,94,0.1)" : "rgba(15,23,42,0.5)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setProofFile(f || null);
                    setProofError("");
                  }}
                  style={{ display: "none" }}
                />
                {proofFile ? (
                  <span style={{ color: "#4ade80" }}>✓ {proofFile.name}</span>
                ) : (
                  <>
                    <span style={{ fontSize: "24px", marginBottom: "8px", opacity: 0.7 }}>↑</span>
                    <span className="muted">Click para subir archivo</span>
                    <span className="muted" style={{ fontSize: "12px", marginTop: "4px" }}>PDF, JPG o PNG</span>
                  </>
                )}
              </label>
              {proofError && <p style={{ margin: "8px 0 0", color: "#f87171", fontSize: "13px" }}>{proofError}</p>}
            </div>
          </div>
        )}

        {message ? (
          <p
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: message.type === "ok" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
              color: message.type === "ok" ? "#86efac" : "#fca5a5",
            }}
          >
            {message.text}
          </p>
        ) : null}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={handleCheckout}
            disabled={loading || paymentMethodsFiltered.length === 0 || (isManualMethod && !proofFile)}
          >
            {loading
              ? "Procesando…"
              : isManualMethod
                ? "Enviar Orden de Compra"
                : fromCart
                  ? `Pagar $${totalPrice.toFixed(2)}`
                  : showUnitsAddon
                    ? `Comprar $${totalPrice}`
                    : "Pagar con método elegido"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="container">
        <div className="card" style={{ maxWidth: "560px", margin: "24px auto", padding: "28px" }}>
          <p className="muted">Cargando…</p>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
