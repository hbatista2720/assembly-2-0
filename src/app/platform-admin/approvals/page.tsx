"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PendingOrder = {
  id: string;
  customer_email: string;
  contact_phone?: string | null;
  organization_name?: string | null;
  notes?: string | null;
  plan_name: string;
  amount: number;
  payment_method: string;
  status: "PENDING";
  created_at: string;
  has_proof?: boolean;
  proof_base64?: string | null;
  proof_filename?: string | null;
};

/** Órdenes ACH/Yappy tienen prioridad (comprobante obligatorio) */
function isManualWithProof(m: string) {
  const u = (m || "").toUpperCase();
  return u.includes("ACH") || u.includes("YAPPY") || u.includes("TRANSFER");
}

/** 2 órdenes ejemplo simuladas para visualizar la tabla cuando no hay pendientes */
const EJEMPLOS_SIMULADOS: PendingOrder[] = [
  {
    id: "ejemplo-1",
    customer_email: "cliente@ejemplo.com",
    contact_phone: "+507 6000-0001",
    organization_name: "P.H. Costa Verde",
    plan_name: "Evento Único",
    amount: 225,
    payment_method: "ACH - Banco General",
    status: "PENDING",
    created_at: new Date().toISOString(),
    has_proof: true,
    proof_base64: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect fill='%23334155' width='200' height='120'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-size='12' text-anchor='middle' dy='.3em'%3EComprobante ejemplo%3C/text%3E%3C/svg%3E",
  },
  {
    id: "ejemplo-2",
    customer_email: "demo@assembly2.com",
    contact_phone: null,
    organization_name: "Demo - P.H. Urban Tower",
    plan_name: "Standard",
    amount: 189,
    payment_method: "Yappy",
    status: "PENDING",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    has_proof: true,
    proof_base64: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect fill='%231e3a5f' width='200' height='120'/%3E%3Ctext x='50%25' y='50%25' fill='%236366f1' font-size='11' text-anchor='middle' dy='.3em'%3EYappy · Comprobante%3C/text%3E%3C/svg%3E",
  },
];

function ClientDetailModal({ order, onClose }: { order: PendingOrder; onClose: () => void }) {
  const isSimulado = order.id.startsWith("ejemplo-");
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-detail-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: "420px", margin: 16, width: "100%", maxHeight: "90vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 id="client-detail-title" style={{ margin: 0, fontSize: "18px" }}>Vista detalle del cliente</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <DetailRow label="PH / Comunidad" value={order.organization_name || "—"} />
          <DetailRow label="Email" value={order.customer_email} />
          <DetailRow label="Teléfono" value={order.contact_phone || "—"} />
          <DetailRow label="Plan" value={order.plan_name} />
          <DetailRow label="Monto" value={`$${order.amount.toFixed(2)}`} />
          <DetailRow label="Método de pago" value={order.payment_method} />
          <DetailRow label="Fecha orden" value={new Date(order.created_at).toLocaleString("es-PA", { dateStyle: "medium", timeStyle: "short" })} />
          {order.notes && <DetailRow label="Notas" value={order.notes} />}
          {isSimulado && (
            <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>Orden de ejemplo (solo visualización)</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span className="muted" style={{ fontSize: "12px" }}>{label}</span>
      <span style={{ fontSize: "14px" }}>{value}</span>
    </div>
  );
}

export default function ApprovalsPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedProof, setExpandedProof] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<PendingOrder | null>(null);

  const loadOrders = () => {
    setLoading(true);
    fetch("/api/platform-admin/pending-orders")
      .then((res) => res.json())
      .then((data) => {
        const list: PendingOrder[] = data.orders || [];
        // Prioridad: ACH/Yappy primero (con comprobante)
        list.sort((a, b) => {
          const aManual = isManualWithProof(a.payment_method) && a.has_proof ? 1 : 0;
          const bManual = isManualWithProof(b.payment_method) && b.has_proof ? 1 : 0;
          if (aManual !== bManual) return bManual - aManual;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setOrders(list);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadOrders(), []);

  const handleApproveReject = async (orderId: string, action: "APPROVE" | "REJECT") => {
    if (orderId.startsWith("ejemplo-")) return; // órdenes simuladas no se procesan
    setProcessing(orderId);
    try {
      const res = await fetch(`/api/platform-admin/pending-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setExpandedProof(null);
    } catch (e) {
      console.error(e);
      alert("No se pudo procesar. Intenta de nuevo.");
    } finally {
      setProcessing(null);
    }
  };

  const renderProof = (order: PendingOrder) => {
    if (!order.proof_base64 || order.proof_base64.length < 50) return null;
    const isImage = order.proof_base64.startsWith("data:image");
    const isPdf = order.proof_base64.startsWith("data:application/pdf");
    const isExpanded = expandedProof === order.id;

    return (
      <div style={{ marginTop: "12px" }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setExpandedProof(isExpanded ? null : order.id)}
          style={{ marginBottom: isExpanded ? "8px" : 0 }}
        >
          {isExpanded ? "Ocultar comprobante" : "Ver foto/comprobante del pago"}
        </button>
        {isExpanded && (
          <div
            style={{
              background: "#0f172a",
              borderRadius: "10px",
              padding: "16px",
              overflow: "auto",
              maxHeight: "400px",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            {isImage ? (
              <img
                src={order.proof_base64}
                alt="Comprobante de pago ACH/Yappy"
                style={{ maxWidth: "100%", height: "auto", display: "block", borderRadius: "8px" }}
              />
            ) : isPdf ? (
              <iframe
                src={order.proof_base64}
                title="Comprobante PDF"
                style={{ width: "100%", minHeight: "350px", border: "none", borderRadius: "8px" }}
              />
            ) : (
              <a
                href={
                  order.proof_base64.startsWith("data:")
                    ? order.proof_base64
                    : `data:application/octet-stream;base64,${order.proof_base64}`
                }
                download={order.proof_filename || "comprobante"}
                className="btn btn-primary"
              >
                Descargar comprobante
              </a>
            )}
          </div>
        )}
      </div>
    );
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
        <h1 style={{ margin: "12px 0 8px" }}>Bandeja de aprobaciones</h1>
        <p className="muted" style={{ margin: 0 }}>
          Órdenes pendientes de pago (ACH, Yappy, transferencias). Prioridad para las que incluyen comprobante. Vinculado al flujo: cliente demo usa la app → Suscripciones → Comprar crédito → Checkout ACH/Yappy.
        </p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              {orders.length === 0 && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    background: "rgba(148,163,184,0.15)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                  }}
                >
                  Vista de ejemplo — 2 órdenes simuladas para visualizar la tabla
                </span>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => loadOrders()}
                disabled={loading}
              >
                Refrescar
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {(orders.length > 0 ? orders : EJEMPLOS_SIMULADOS).map((order) => {
              const isSimulado = order.id.startsWith("ejemplo-");
              const isAchYappy = isManualWithProof(order.payment_method);
              return (
                <div
                  key={order.id}
                  style={{
                    padding: "20px",
                    background: isAchYappy && order.has_proof ? "rgba(99,102,241,0.12)" : "rgba(30,41,59,0.4)",
                    borderRadius: "12px",
                    border: isAchYappy && order.has_proof
                      ? "1px solid rgba(99,102,241,0.35)"
                      : "1px solid rgba(148,163,184,0.15)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isSimulado && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "10px",
                            fontWeight: 600,
                            background: "rgba(148,163,184,0.25)",
                            color: "#64748b",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            marginBottom: "8px",
                            textTransform: "uppercase",
                          }}
                        >
                          Ejemplo
                        </span>
                      )}
                      {isAchYappy && order.has_proof && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "rgba(99,102,241,0.3)",
                            color: "#a5b4fc",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            marginBottom: "8px",
                          }}
                        >
                          ACH/Yappy · Con comprobante
                        </span>
                      )}
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{order.customer_email}</div>
                      <div className="muted" style={{ fontSize: "14px" }}>
                        {order.plan_name} · ${order.amount.toFixed(2)} · {order.payment_method}
                      </div>
                      <div className="muted" style={{ fontSize: "12px", marginTop: "4px" }}>
                        {new Date(order.created_at).toLocaleString("es-PA", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                      {renderProof(order)}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignSelf: "flex-start", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDetailOrder(order)}
                      >
                        Ver detalle
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={processing === order.id || isSimulado}
                        onClick={() => handleApproveReject(order.id, "APPROVE")}
                        title={isSimulado ? "Orden de ejemplo (solo visualización)" : undefined}
                      >
                        {processing === order.id ? "..." : "Aprobar"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={processing === order.id || isSimulado}
                        onClick={() => handleApproveReject(order.id, "REJECT")}
                        title={isSimulado ? "Orden de ejemplo (solo visualización)" : undefined}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}
      </div>
      {detailOrder && (
        <ClientDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
    </>
  );
}
