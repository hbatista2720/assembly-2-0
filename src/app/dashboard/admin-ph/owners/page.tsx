const OWNERS = [
  { unit: "10-A", name: "Juan Perez", status: "Al dia", faceId: "Configurado", email: "juan@email.com" },
  { unit: "10-B", name: "Maria Garcia", status: "En mora", faceId: "Pendiente", email: "maria@email.com" },
  { unit: "10-C", name: "Carlos Lopez", status: "Al dia", faceId: "Configurado", email: "carlos@email.com" },
];

export default function OwnersPage() {
  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Propietarios</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Gestion de propietarios, estados de pago y Face ID.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn">Importar Excel</button>
          <button className="btn btn-primary">Agregar propietario</button>
        </div>
      </div>

      <div className="card-list" style={{ marginTop: "18px" }}>
        {OWNERS.map((owner) => (
          <div key={owner.unit} className="list-item" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong>
                {owner.unit} · {owner.name}
              </strong>
              <div className="muted" style={{ fontSize: "12px" }}>
                {owner.email}
              </div>
            </div>
            <span className="chip">{owner.status}</span>
            <span className="chip">{owner.faceId}</span>
            <button className="btn btn-ghost">Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
