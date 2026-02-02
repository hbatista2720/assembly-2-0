"use client";

export default function ResidenteAsambleasPage() {
  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Asambleas</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Listado de asambleas activas y próximas.
        </p>
        <a className="btn btn-ghost" href="/">
          Volver a la landing
        </a>
      </div>

      <div className="card-list">
        {[
          { title: "Asamblea ordinaria", date: "10 Feb 2026", status: "Activa" },
          { title: "Asamblea extraordinaria", date: "24 Feb 2026", status: "Programada" },
        ].map((item) => (
          <div key={item.title} className="list-item">
            <div>
              <strong>{item.title}</strong>
              <div className="muted" style={{ fontSize: "12px" }}>
                {item.date}
              </div>
            </div>
            <span className="pill">{item.status}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
