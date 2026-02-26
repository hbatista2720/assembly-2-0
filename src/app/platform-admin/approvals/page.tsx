"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PendingOrder = {
  id: string;
  customer_email: string;
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

export default function ApprovalsPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedProof, setExpandedProof] = useState<string | null>(null);

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
          Órdenes pendientes de pago (ACH, Yappy, transferencias). Prioridad para las que incluyen comprobante/foto.
        </p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : orders.length === 0 ? (
          <div
            style={{
              padding: "48px 32px",
              textAlign: "center",
              background: "rgba(30,41,59,0.3)",
              borderRadius: "12px",
              border: "1px dashed rgba(148,163,184,0.2)",
            }}
          >
            <p className="muted" style={{ margin: 0, fontSize: "16px" }}>
              No hay órdenes pendientes.
            </p>
            <p className="muted" style={{ marginTop: "12px", fontSize: "14px" }}>
              Las órdenes con comprobante de pago (ACH/Yappy) aparecerán aquí.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {orders.map((order) => {
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
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignSelf: "flex-start" }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={processing === order.id}
                        onClick={() => handleApproveReject(order.id, "APPROVE")}
                      >
                        {processing === order.id ? "..." : "Aprobar"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={processing === order.id}
                        onClick={() => handleApproveReject(order.id, "REJECT")}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
