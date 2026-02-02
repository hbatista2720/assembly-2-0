"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PresenterData = {
  quorum: {
    percentage: number;
    achieved: boolean;
    present: number;
    total: number;
  };
  votation: {
    topic: string;
    votesCount: number;
    attendeesCount: number;
    results: {
      si: number;
      no: number;
      abst: number;
    };
  };
  history: string[];
};

export default function PresenterView() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "demo-token";
  const [now, setNow] = useState(new Date());
  const [data, setData] = useState<PresenterData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const res = await fetch(`/api/presenter/view?token=${token}`);
      if (!res.ok) return;
      const payload = (await res.json()) as PresenterData;
      if (active) setData(payload);
    };
    load();
    const interval = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [token]);

  return (
    <div className="presenter-root">
      <header className="presenter-header">
        <div>
          <div className="presenter-title">Urban Tower · Asamblea Ordinaria 2026</div>
          <div className="presenter-subtitle">Modo Presentación · Solo lectura</div>
        </div>
        <div className="presenter-clock">{now.toLocaleTimeString()}</div>
      </header>

      <section className="presenter-grid">
        <div className="panel quorum">
          <div className="panel-title">Quórum Actual</div>
          <div className="quorum-value">{data ? `${data.quorum.percentage}%` : "--"}</div>
          <div className={`quorum-status ${data?.quorum.achieved ? "achieved" : "pending"}`}>
            {data?.quorum.achieved ? "✅ ALCANZADO" : "⚠️ PENDIENTE"}
          </div>
          <div className="quorum-detail">
            {data ? `${data.quorum.present} / ${data.quorum.total} propietarios presentes` : "Cargando..."}
          </div>
          <div className="quorum-detail">Actualización automática</div>
        </div>

        <div className="panel voting">
          <div className="panel-title">Votación Activa</div>
          <div className="panel-subtitle">{data?.votation.topic || "Sin votación activa"}</div>
          <div className="vote-bars">
            {[
              { label: "SI", value: data?.votation.results.si ?? 0, color: "#10b981" },
              { label: "NO", value: data?.votation.results.no ?? 0, color: "#ef4444" },
              { label: "ABST", value: data?.votation.results.abst ?? 0, color: "#94a3b8" },
            ].map((bar) => (
              <div key={bar.label} className="vote-bar">
                <div className="vote-bar-label">
                  {bar.label}: {bar.value}%
                </div>
                <div className="vote-bar-track">
                  <span style={{ width: `${bar.value}%`, backgroundColor: bar.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="panel-foot">
            Votos emitidos: {data?.votation.votesCount ?? 0} / {data?.votation.attendeesCount ?? 0} presentes
          </div>
        </div>

        <div className="panel history">
          <div className="panel-title">Histórico de Votaciones</div>
          {(data?.history || ["Cargando histórico..."]).map((item) => (
            <div key={item} className="history-item">
              {item}
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .presenter-root {
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.15), transparent 45%),
            radial-gradient(circle at 80% 0%, rgba(124, 58, 237, 0.2), transparent 50%),
            #0b1020;
          color: #e2e8f0;
          padding: 32px;
        }
        .presenter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(148, 163, 184, 0.2);
          margin-bottom: 24px;
        }
        .presenter-title {
          font-size: 24px;
          font-weight: 700;
        }
        .presenter-subtitle {
          color: #cbd5f5;
          font-size: 14px;
        }
        .presenter-clock {
          font-size: 20px;
          font-weight: 600;
        }
        .presenter-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        .panel {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
          padding: 24px;
        }
        .panel-title {
          font-size: 16px;
          color: #cbd5f5;
          margin-bottom: 12px;
        }
        .panel-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .quorum-value {
          font-size: 64px;
          font-weight: 800;
          color: #38bdf8;
        }
        .quorum-status {
          display: inline-flex;
          margin-top: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          background: rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .quorum-status.pending {
          background: rgba(234, 179, 8, 0.2);
          color: #fde68a;
          border-color: rgba(234, 179, 8, 0.4);
        }
        .quorum-detail {
          color: #cbd5f5;
          font-size: 14px;
          margin-top: 6px;
        }
        .vote-bars {
          display: grid;
          gap: 12px;
        }
        .vote-bar-label {
          font-size: 12px;
          color: #cbd5f5;
          margin-bottom: 6px;
        }
        .vote-bar-track {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 999px;
          height: 10px;
          overflow: hidden;
        }
        .vote-bar-track span {
          display: block;
          height: 100%;
          border-radius: 999px;
        }
        .panel-foot {
          margin-top: 14px;
          color: #cbd5f5;
          font-size: 13px;
        }
        .history-item {
          padding: 8px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }
      `}</style>
    </div>
  );
}
