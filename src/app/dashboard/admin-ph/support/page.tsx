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
