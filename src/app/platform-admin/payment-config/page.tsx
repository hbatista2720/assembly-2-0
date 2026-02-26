"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PAYMENT_METHOD_IDS,
  PAYMENT_METHOD_LABELS,
  PRESET_FASE_1,
  getGatewayConfig,
  setGatewayConfig,
  type PaymentMethodId,
  type PaymentMethodConfig,
  type PaymentAction,
  type PaymentMode,
  type GatewayConfig,
  getPaymentMethods,
  setPaymentMethods,
  applyPaymentModePreset,
} from "../../../lib/paymentConfig";

const PAYMENT_METHOD_DESCRIPTIONS: Record<PaymentMethodId, string> = {
  MANUAL_ACH: "Transferencia bancaria directa",
  MANUAL_YAPPY: "Wallet móvil (Panamá)",
  PAYPAL: "Tarjeta o balance PayPal",
  TILOPAY: "Tarjetas locales / Centroamérica",
  MANUAL_TRANSFER: "Transferencia manual",
};

export default function PaymentConfigPage() {
  const [configs, setConfigsState] = useState<Record<PaymentMethodId, PaymentMethodConfig>>({} as Record<PaymentMethodId, PaymentMethodConfig>);
  const [gatewayConfig, setGatewayConfigState] = useState<GatewayConfig>({
    ach: { accountType: "", bankName: "", accountHolder: "", accountNumber: "" },
    yappy: { accountName: "", cellPhone: "" },
    paypal: { clientId: "", mode: "sandbox" },
    tilopay: { merchantId: "", mode: "sandbox" },
  });
  const [presetOpen, setPresetOpen] = useState(false);
  const [gatewayModalMethod, setGatewayModalMethod] = useState<PaymentMethodId | null>(null);
  const [summaryModalMethod, setSummaryModalMethod] = useState<PaymentMethodId | null>(null);

  const refreshState = () => {
    setConfigsState(getPaymentMethods());
    setGatewayConfigState(getGatewayConfig());
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleActionChange = (id: PaymentMethodId, action: PaymentAction) => {
    const next = { ...configs, [id]: { ...configs[id], action } };
    setConfigsState(next);
    setPaymentMethods(next);
  };

  const handleEnabledChange = (id: PaymentMethodId, enabled: boolean) => {
    const next = { ...configs, [id]: { ...configs[id], enabled } };
    setConfigsState(next);
    setPaymentMethods(next);
  };

  const handleLevelChange = (id: PaymentMethodId, level: number) => {
    const n = Math.max(1, Math.min(5, level));
    const next = { ...configs, [id]: { ...configs[id], level: n } };
    setConfigsState(next);
    setPaymentMethods(next);
  };

  const handleApplyPreset = (mode: PaymentMode) => {
    applyPaymentModePreset(mode);
    refreshState();
    setPresetOpen(false);
  };

  return (
    <>
      <div className="card" style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/admin" className="page-back-link" style={{ marginBottom: "16px", display: "inline-flex" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard
        </Link>
        <h1 style={{ margin: "12px 0 8px" }}>Configuración de pagos</h1>
        <p className="muted" style={{ margin: 0 }}>
          Configura cada método de pago: Manual/Automática, Activo/Inactivo y Nivel. Los métodos inactivos no se muestran en el checkout.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "24px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Pasarela de pago</h2>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPresetOpen((o) => !o)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              aria-expanded={presetOpen}
              aria-haspopup="true"
            >
              Pasarela de pago
              <span style={{ fontSize: "10px" }}>{presetOpen ? "▲" : "▼"}</span>
            </button>
            {presetOpen && (
              <>
                <div
                  role="presentation"
                  style={{ position: "fixed", inset: 0, zIndex: 10 }}
                  onClick={() => setPresetOpen(false)}
                />
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: "6px",
                    minWidth: "200px",
                    background: "rgba(30,41,59,0.98)",
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                    zIndex: 20,
                    padding: "8px 0",
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="btn btn-ghost"
                    style={{ width: "100%", justifyContent: "flex-start", padding: "10px 16px", fontSize: "14px" }}
                    onClick={() => handleApplyPreset("FASE_1")}
                  >
                    Fase 1 — Solo ACH y Yappy
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="btn btn-ghost"
                    style={{ width: "100%", justifyContent: "flex-start", padding: "10px 16px", fontSize: "14px" }}
                    onClick={() => handleApplyPreset("FASE_2")}
                  >
                    Fase 2 — Todos los métodos
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="muted" style={{ marginBottom: "20px", fontSize: "14px" }}>
          Aplica un preset (Fase 1 o Fase 2) o configura cada método individualmente en la tabla.
        </p>
        <div style={{ padding: "12px 16px", background: "rgba(99,102,241,0.1)", borderRadius: "10px", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Link href="/platform-admin/approvals" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            Ir a Bandeja de aprobaciones
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "24px", padding: "24px", overflowX: "auto" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Métodos de pago</h2>
        <p className="muted" style={{ marginBottom: "20px", fontSize: "14px" }}>
          Cada método tiene: Manual/Automática (requiere comprobante o no), Activo/Inactivo, Nivel (orden de aparición).
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "left" }}>
              <th style={{ padding: "12px 14px", fontWeight: 600, color: "#94a3b8" }}>Método</th>
              <th style={{ padding: "12px 14px", fontWeight: 600, color: "#94a3b8" }}>Manual / Automática</th>
              <th style={{ padding: "12px 14px", fontWeight: 600, color: "#94a3b8" }}>Activo</th>
              <th style={{ padding: "12px 14px", fontWeight: 600, color: "#94a3b8" }}>Nivel</th>
              <th style={{ padding: "12px 14px", fontWeight: 600, color: "#94a3b8" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENT_METHOD_IDS.map((id) => {
              const c = configs[id] ?? { action: "MANUAL" as PaymentAction, enabled: false, level: 1 };
              return (
                <tr key={id} style={{ borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                  <td style={{ padding: "14px 14px" }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setSummaryModalMethod(id)}
                      style={{
                        display: "block",
                        textAlign: "left",
                        padding: 0,
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "inherit",
                      }}
                      title="Ver resumen de configuración"
                    >
                      <div style={{ fontWeight: 600, marginBottom: "2px" }}>{PAYMENT_METHOD_LABELS[id]}</div>
                      <div className="muted" style={{ fontSize: "12px" }}>{PAYMENT_METHOD_DESCRIPTIONS[id]}</div>
                    </button>
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${c.action === "MANUAL" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => handleActionChange(id, "MANUAL")}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${c.action === "AUTOMATIC" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => handleActionChange(id, "AUTOMATIC")}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Automática
                      </button>
                    </div>
                    <span className="muted" style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>
                      {c.action === "MANUAL" ? "Requiere comprobante" : "Pago automático"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: "13px", color: c.enabled ? "#4ade80" : "#94a3b8" }}>
                        {c.enabled ? "Activo" : "Inactivo"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={c.enabled}
                        onClick={() => handleEnabledChange(id, !c.enabled)}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          border: "none",
                          background: c.enabled ? "#6366f1" : "rgba(71,85,105,0.8)",
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            left: c.enabled ? 22 : 2,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "#fff",
                            transition: "left 0.2s ease",
                          }}
                        />
                      </button>
                    </label>
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <select
                      value={c.level}
                      onChange={(e) => handleLevelChange(id, Number(e.target.value))}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(148,163,184,0.3)",
                        background: "rgba(30,41,59,0.8)",
                        color: "#e2e8f0",
                        fontSize: "14px",
                        minWidth: "56px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => setGatewayModalMethod(id)}
                        title="Configurar datos de la pasarela (cuenta, Yappy, PayPal, etc.)"
                      >
                        Configurar pasarela
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                        onClick={() => {
                          const def = PRESET_FASE_1[id];
                          if (def) {
                            const next = { ...configs, [id]: { ...def } };
                            setConfigsState(next);
                            setPaymentMethods(next);
                          }
                        }}
                        title="Restaurar Manual/Activo/Nivel por defecto"
                      >
                        Restaurar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {summaryModalMethod && (
        <SummaryModal
          methodId={summaryModalMethod}
          configs={configs}
          gatewayConfig={gatewayConfig}
          onClose={() => setSummaryModalMethod(null)}
        />
      )}

      {gatewayModalMethod && (
        <GatewayConfigModal
          methodId={gatewayModalMethod}
          config={gatewayConfig}
          onSave={(next) => {
            setGatewayConfigState(next);
            setGatewayConfig(next);
            setGatewayModalMethod(null);
          }}
          onClose={() => setGatewayModalMethod(null)}
        />
      )}
    </>
  );
}

function SummaryModal({
  methodId,
  configs,
  gatewayConfig,
  onClose,
}: {
  methodId: PaymentMethodId;
  configs: Record<PaymentMethodId, PaymentMethodConfig>;
  gatewayConfig: GatewayConfig;
  onClose: () => void;
}) {
  const c = configs[methodId] ?? { action: "MANUAL", enabled: false, level: 1 };
  const rowStyle = { padding: "8px 0", borderBottom: "1px solid rgba(148,163,184,0.1)" } as const;
  const labelStyle = { color: "#94a3b8", marginRight: "8px", minWidth: "140px" } as const;

  const showAch = methodId === "MANUAL_ACH" || methodId === "MANUAL_TRANSFER";
  const showYappy = methodId === "MANUAL_YAPPY";
  const showPaypal = methodId === "PAYPAL";
  const showTilopay = methodId === "TILOPAY";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <div role="presentation" style={{ position: "absolute", inset: 0 }} onClick={onClose} />
      <div
        style={{
          position: "relative",
          background: "rgba(30,41,59,0.98)",
          border: "1px solid rgba(148,163,184,0.3)",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "420px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 id="summary-modal-title" style={{ margin: "0 0 20px", fontSize: "1.1rem" }}>
          Resumen — {PAYMENT_METHOD_LABELS[methodId]}
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontWeight: 600, marginBottom: "10px", color: "#e2e8f0" }}>Estado del método</div>
          <div style={rowStyle}>
            <span style={labelStyle}>Activo</span>
            <span style={{ color: c.enabled ? "#4ade80" : "#94a3b8" }}>{c.enabled ? "Sí" : "No"}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Modo</span>
            {c.action === "MANUAL" ? "Manual (requiere comprobante)" : "Automática"}
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Nivel</span>
            {c.level}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 600, marginBottom: "10px", color: "#e2e8f0" }}>Datos de pasarela</div>
          {showAch && gatewayConfig.ach && (
            <>
              <div style={rowStyle}>
                <span style={labelStyle}>Tipo de cuenta</span>
                {gatewayConfig.ach.accountType || "—"}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Banco</span>
                {gatewayConfig.ach.bankName || "—"}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Nombre</span>
                {gatewayConfig.ach.accountHolder || "—"}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Número cuenta</span>
                <code style={{ fontSize: "13px" }}>{gatewayConfig.ach.accountNumber || "—"}</code>
              </div>
            </>
          )}
          {showYappy && gatewayConfig.yappy && (
            <>
              <div style={rowStyle}>
                <span style={labelStyle}>Nombre directorio</span>
                {gatewayConfig.yappy.accountName || "—"}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Celular</span>
                {gatewayConfig.yappy.cellPhone || "—"}
              </div>
            </>
          )}
          {showPaypal && (
            <>
              <div style={rowStyle}>
                <span style={labelStyle}>Client ID</span>
                {gatewayConfig.paypal?.clientId ? "Configurado (" + gatewayConfig.paypal.mode + ")" : "No configurado"}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Modo</span>
                {gatewayConfig.paypal?.mode ?? "—"}
              </div>
            </>
          )}
          {showTilopay && (
            <>
              <div style={rowStyle}>
                <span style={labelStyle}>Merchant ID</span>
                {gatewayConfig.tilopay?.merchantId ? "Configurado (" + gatewayConfig.tilopay.mode + ")" : "No configurado"}
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Modo</span>
                {gatewayConfig.tilopay?.mode ?? "—"}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function GatewayConfigModal({
  methodId,
  config,
  onSave,
  onClose,
}: {
  methodId: PaymentMethodId;
  config: GatewayConfig;
  onSave: (next: GatewayConfig) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState(() => ({ ...config }));
  useEffect(() => setLocal({ ...config }), [config, methodId]);

  const handleSave = () => {
    onSave(local);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.3)",
    background: "rgba(15,23,42,0.8)",
    color: "#e2e8f0",
    fontSize: "14px",
  } as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gateway-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <div
        role="presentation"
        style={{ position: "absolute", inset: 0 }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          background: "rgba(30,41,59,0.98)",
          border: "1px solid rgba(148,163,184,0.3)",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "440px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 id="gateway-modal-title" style={{ margin: "0 0 20px", fontSize: "1.1rem" }}>
          Configurar pasarela — {PAYMENT_METHOD_LABELS[methodId]}
        </h2>

        {methodId === "MANUAL_ACH" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Tipo de cuenta</span>
              <input
                type="text"
                value={local.ach?.accountType ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, ach: { accountType: e.target.value, bankName: p.ach?.bankName ?? "", accountHolder: p.ach?.accountHolder ?? "", accountNumber: p.ach?.accountNumber ?? "" } }))}
                placeholder="Ej. Cuenta Corriente, Cuenta de Ahorros"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Banco</span>
              <input
                type="text"
                value={local.ach?.bankName ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, ach: { accountType: p.ach?.accountType ?? "", bankName: e.target.value, accountHolder: p.ach?.accountHolder ?? "", accountNumber: p.ach?.accountNumber ?? "" } }))}
                placeholder="Ej. Banco General, Grupo HD Corp"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Nombre de la cuenta</span>
              <input
                type="text"
                value={local.ach?.accountHolder ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, ach: { accountType: p.ach?.accountType ?? "", bankName: p.ach?.bankName ?? "", accountHolder: e.target.value, accountNumber: p.ach?.accountNumber ?? "" } }))}
                placeholder="Ej. Assembly 2.0"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Número de cuenta</span>
              <input
                type="text"
                value={local.ach?.accountNumber ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, ach: { accountType: p.ach?.accountType ?? "", bankName: p.ach?.bankName ?? "", accountHolder: p.ach?.accountHolder ?? "", accountNumber: e.target.value } }))}
                placeholder="Ej. 03-01-01-146847-7"
                style={inputStyle}
              />
            </label>
          </div>
        )}

        {methodId === "MANUAL_YAPPY" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Nombre para buscar en directorio Yappy</span>
              <input
                type="text"
                value={local.yappy?.accountName ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, yappy: { accountName: e.target.value, cellPhone: p.yappy?.cellPhone ?? "" } }))}
                placeholder="Ej. Assembly 2.0"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Número celular (opcional)</span>
              <input
                type="text"
                value={local.yappy?.cellPhone ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, yappy: { accountName: p.yappy?.accountName ?? "", cellPhone: e.target.value } }))}
                placeholder="Ej. 6XXX-XXXX"
                style={inputStyle}
              />
            </label>
          </div>
        )}

        {methodId === "MANUAL_TRANSFER" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p className="muted" style={{ fontSize: "13px", marginBottom: "8px" }}>
              Transferencia usa los mismos datos que ACH (tipo de cuenta, banco, nombre, número).
            </p>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Tipo de cuenta</span>
              <input
                type="text"
                value={local.ach?.accountType ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, ach: { accountType: e.target.value, bankName: p.ach?.bankName ?? "", accountHolder: p.ach?.accountHolder ?? "", accountNumber: p.ach?.accountNumber ?? "" } }))}
                placeholder="Ej. Cuenta Corriente, Cuenta de Ahorros"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Banco</span>
              <input
                type="text"
                value={local.ach?.bankName ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, ach: { accountType: p.ach?.accountType ?? "", bankName: e.target.value, accountHolder: p.ach?.accountHolder ?? "", accountNumber: p.ach?.accountNumber ?? "" } }))}
                placeholder="Ej. Banco General, Grupo HD Corp"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Nombre de la cuenta</span>
              <input
                type="text"
                value={local.ach?.accountHolder ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, ach: { accountType: p.ach?.accountType ?? "", bankName: p.ach?.bankName ?? "", accountHolder: e.target.value, accountNumber: p.ach?.accountNumber ?? "" } }))}
                placeholder="Ej. Assembly 2.0"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Número de cuenta</span>
              <input
                type="text"
                value={local.ach?.accountNumber ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, ach: { accountType: p.ach?.accountType ?? "", bankName: p.ach?.bankName ?? "", accountHolder: p.ach?.accountHolder ?? "", accountNumber: e.target.value } }))}
                placeholder="Ej. 03-01-01-146847-7"
                style={inputStyle}
              />
            </label>
          </div>
        )}

        {methodId === "PAYPAL" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Client ID (developer.paypal.com)</span>
              <input
                type="text"
                value={local.paypal?.clientId ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, paypal: { clientId: e.target.value, mode: p.paypal?.mode ?? "sandbox" } }))}
                placeholder="Client ID de tu app PayPal"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Modo</span>
              <select
                value={local.paypal?.mode ?? "sandbox"}
                onChange={(e) => setLocal((p) => ({ ...p, paypal: { clientId: p.paypal?.clientId ?? "", mode: e.target.value as "sandbox" | "live" } }))}
                style={inputStyle}
              >
                <option value="sandbox">Sandbox (pruebas)</option>
                <option value="live">Producción</option>
              </select>
            </label>
            <p className="muted" style={{ fontSize: "12px" }}>
              Client Secret se configura en variables de entorno (.env) por seguridad.
            </p>
          </div>
        )}

        {methodId === "TILOPAY" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Merchant ID (tilopay.com)</span>
              <input
                type="text"
                value={local.tilopay?.merchantId ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, tilopay: { merchantId: e.target.value, mode: p.tilopay?.mode ?? "sandbox" } }))}
                placeholder="Merchant ID de Tilopay"
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#94a3b8" }}>Modo</span>
              <select
                value={local.tilopay?.mode ?? "sandbox"}
                onChange={(e) => setLocal((p) => ({ ...p, tilopay: { merchantId: p.tilopay?.merchantId ?? "", mode: e.target.value as "sandbox" | "live" } }))}
                style={inputStyle}
              >
                <option value="sandbox">Sandbox (pruebas)</option>
                <option value="live">Producción</option>
              </select>
            </label>
            <p className="muted" style={{ fontSize: "12px" }}>
              API Key y Secret se configuran en variables de entorno (.env) por seguridad.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
