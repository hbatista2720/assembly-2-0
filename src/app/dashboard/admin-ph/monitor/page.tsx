"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAssemblies } from "../../../../lib/assembliesStore";

export default function MonitorListPage() {
  const [assemblies, setAssemblies] = useState<{ id: string; title: string; date: string; status: string }[]>([]);
  const [showPresenterModal, setShowPresenterModal] = useState(false);

  useEffect(() => {
    setAssemblies(getAssemblies());
  }, []);

  const openPresenter = (assemblyId: string) => {
    window.open(`/presenter/demo-token?assemblyId=${encodeURIComponent(assemblyId)}`, "_blank", "noopener,noreferrer");
    setShowPresenterModal(false);
  };

  const sortedAssemblies = [...assemblies].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="card monitor-page-card">
      <div className="monitor-page-header">
        <h1 style={{ marginTop: 0, marginBottom: "8px" }}>Monitor Back Office</h1>
        <p className="muted" style={{ margin: 0, fontSize: "14px" }}>
          Primero valide el quórum (asistencia); luego abra el monitor de votación por temas.
        </p>
      </div>
      <div className="monitor-widgets-grid">
        <Link href="/dashboard/admin-ph/monitor/quorum" className="monitor-widget-card monitor-widget-card--primary" scroll={true}>
          <div className="monitor-widget-icon">📋</div>
          <h3 className="monitor-widget-title">Monitor de Quórum</h3>
          <p className="monitor-widget-desc">Vista de unidades: presente / no presente. Valide la asistencia antes de votar.</p>
          <span className="monitor-widget-cta">Abrir →</span>
        </Link>
        <Link href="/dashboard/admin-ph/monitor/votacion" className="monitor-widget-card" scroll={true}>
          <div className="monitor-widget-icon">🗳️</div>
          <h3 className="monitor-widget-title">Monitor de Votación</h3>
          <p className="monitor-widget-desc">Resumen, tablero por unidades y filtro por tema.</p>
          <span className="monitor-widget-cta">Abrir →</span>
        </Link>
        <button
          type="button"
          className="monitor-widget-card monitor-widget-card--presenter"
          onClick={() => setShowPresenterModal(true)}
        >
          <div className="monitor-widget-icon">🖥️</div>
          <h3 className="monitor-widget-title">Vista presentación</h3>
          <p className="monitor-widget-desc">Proyección sincronizada con Monitor Back Office. Seleccione la asamblea a proyectar.</p>
          <span className="monitor-widget-cta">Abrir →</span>
        </button>
      </div>

      {showPresenterModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="presenter-modal-title"
          className="monitor-presenter-modal-overlay"
          onClick={() => setShowPresenterModal(false)}
        >
          <div className="monitor-presenter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="monitor-presenter-modal-header">
              <h3 id="presenter-modal-title">Vista presentación – Seleccionar asamblea</h3>
              <button type="button" onClick={() => setShowPresenterModal(false)} aria-label="Cerrar" className="monitor-presenter-modal-close">×</button>
            </div>
            <p className="muted" style={{ margin: "0 0 16px", fontSize: "14px" }}>
              Elija la asamblea cuya vista de proyección desea abrir. Sincronizada con el Monitor Back Office.
            </p>
            <div className="monitor-presenter-list">
              {sortedAssemblies.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>No hay asambleas. Cree una en el módulo Asambleas.</p>
              ) : (
                sortedAssemblies.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="monitor-presenter-item"
                    onClick={() => openPresenter(a.id)}
                  >
                    <span className="monitor-presenter-item-title">{a.title}</span>
                    <span className="monitor-presenter-item-meta">{a.date.replace("T", " ").slice(0, 16)} · {a.status}</span>
                    <span className="monitor-presenter-item-cta">Proyectar →</span>
                  </button>
                ))
              )}
            </div>
            <div style={{ marginTop: "16px" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowPresenterModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .monitor-page-card { overflow: visible; }
        .monitor-page-header {
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }
        .monitor-widgets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .monitor-widget-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 24px;
          border-radius: 16px;
          background: linear-gradient(160deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8));
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .monitor-widget-card:hover {
          border-color: rgba(99, 102, 241, 0.45);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
          transform: translateY(-2px);
        }
        .monitor-widget-card--primary {
          background: linear-gradient(160deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.08));
          border-color: rgba(99, 102, 241, 0.4);
        }
        .monitor-widget-card--primary:hover {
          border-color: rgba(99, 102, 241, 0.6);
          box-shadow: 0 8px 28px rgba(99, 102, 241, 0.25);
        }
        .monitor-widget-icon {
          font-size: 32px;
          margin-bottom: 14px;
        }
        .monitor-widget-title {
          margin: 0 0 8px;
          font-size: 1.15rem;
          font-weight: 700;
          color: #f1f5f9;
        }
        .monitor-widget-desc {
          margin: 0 0 16px;
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
          flex: 1;
        }
        .monitor-widget-cta {
          font-size: 14px;
          font-weight: 600;
          color: #818cf8;
          transition: color 0.2s;
        }
        .monitor-widget-card:hover .monitor-widget-cta {
          color: #a5b4fc;
        }
        .monitor-widget-card--presenter {
          cursor: pointer;
          border: none;
          text-align: left;
          font: inherit;
        }
        .monitor-presenter-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.6);
          padding: 16px;
        }
        .monitor-presenter-modal {
          background: linear-gradient(160deg, #1e293b, #0f172a);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 16px;
          max-width: 420px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          padding: 20px 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .monitor-presenter-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .monitor-presenter-modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        .monitor-presenter-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: inherit;
          line-height: 1;
          padding: 0 4px;
          opacity: 0.8;
        }
        .monitor-presenter-modal-close:hover {
          opacity: 1;
        }
        .monitor-presenter-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .monitor-presenter-item {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 14px 16px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          font: inherit;
          color: inherit;
          transition: border-color 0.2s, background 0.2s;
        }
        .monitor-presenter-item:hover {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(99, 102, 241, 0.1);
        }
        .monitor-presenter-item-title {
          flex: 1;
          font-weight: 600;
        }
        .monitor-presenter-item-meta {
          font-size: 12px;
          color: #94a3b8;
        }
        .monitor-presenter-item-cta {
          font-size: 13px;
          font-weight: 600;
          color: #818cf8;
        }
      `}</style>
    </div>
  );
}
