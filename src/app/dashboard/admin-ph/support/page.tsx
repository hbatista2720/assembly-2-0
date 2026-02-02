const TICKETS = [
  { id: "PH-101", subject: "Face ID sin activar", status: "Abierto", sla: "24h" },
  { id: "PH-099", subject: "Actualizacion de plan", status: "En seguimiento", sla: "48h" },
];

export default function SupportPage() {
  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Soporte</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Solicitudes, tickets y base de conocimiento.
          </p>
        </div>
        <button className="btn btn-primary">Nuevo ticket</button>
      </div>

      <div className="card-list" style={{ marginTop: "18px" }}>
        {TICKETS.map((ticket) => (
          <div key={ticket.id} className="list-item" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong>{ticket.subject}</strong>
              <div className="muted" style={{ fontSize: "12px" }}>
                {ticket.id} · Estado {ticket.status} · SLA {ticket.sla}
              </div>
            </div>
            <button className="btn btn-ghost">Ver ticket</button>
          </div>
        ))}
      </div>
    </div>
  );
}
const TICKETS = [
  { id: "SUP-021", subject: "Quorum no alcanza", status: "Urgente", sla: "1h" },
  { id: "SUP-018", subject: "Actualizar plan a Pro", status: "Alta", sla: "4h" },
  { id: "SUP-013", subject: "Problema Face ID", status: "Media", sla: "8h" },
];

export default function SupportPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Soporte</span>
            <h1 style={{ margin: "12px 0 6px" }}>Centro de ayuda</h1>
            <p className="muted" style={{ margin: 0 }}>
              Tickets, respuestas rapidas y contacto con el equipo Assembly 2.0.
            </p>
          </div>
          <button className="btn btn-primary">Crear ticket</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Tickets recientes</h3>
        <div className="card-list">
          {TICKETS.map((ticket) => (
            <div key={ticket.id} className="list-item" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <strong>{ticket.subject}</strong>
                <div className="muted" style={{ fontSize: "12px" }}>
                  {ticket.id} · SLA {ticket.sla}
                </div>
              </div>
              <span className="badge badge-warning">{ticket.status}</span>
              <button className="btn btn-ghost">Ver</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Atajos de soporte</h3>
        <div className="card-list">
          <div className="list-item">
            <span>📘</span>
            <span>Guia rapida para administradores</span>
          </div>
          <div className="list-item">
            <span>💬</span>
            <span>Chat directo con soporte</span>
          </div>
          <div className="list-item">
            <span>📞</span>
            <span>Linea prioritaria 24/7 (Enterprise)</span>
          </div>
        </div>
      </div>
    </>
  );
}
