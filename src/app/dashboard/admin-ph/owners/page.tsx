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
import type { CSSProperties } from "react";

const OWNERS = [
  { unit: "10-A", name: "Juan Perez", status: "Al dia", faceId: "Configurado", coef: "0.50%" },
  { unit: "10-B", name: "Maria Garcia", status: "En mora", faceId: "Pendiente", coef: "0.50%" },
  { unit: "10-C", name: "Carlos Lopez", status: "Al dia", faceId: "Configurado", coef: "0.50%" },
];

export default function OwnersPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Propietarios</span>
            <h1 style={{ margin: "12px 0 6px" }}>Gestion de propietarios</h1>
            <p className="muted" style={{ margin: 0 }}>
              Importa, edita y controla estatus de pago y Face ID.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn">Agregar propietario</button>
            <button className="btn btn-primary">Importar Excel</button>
            <button className="btn btn-ghost">Exportar</button>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Busqueda rapida</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <input className="input" placeholder="Buscar por nombre, unidad o email" />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span className="pill">Estado: Todos</span>
              <span className="pill">Face ID: Todos</span>
              <span className="pill">Asistencia: Todos</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Importacion rapida</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Descarga la plantilla oficial y sube hasta 1,000 registros por archivo.
          </p>
          <div className="card-list">
            <div className="list-item">
              <span>📥</span>
              <span>Descargar plantilla Excel</span>
            </div>
            <div className="list-item">
              <span>✅</span>
              <span>Validacion de duplicados y coeficientes</span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: "16px" }}>
            Seleccionar archivo
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table" style={{ "--table-columns": "1fr 1.6fr 1fr 1fr 1fr 1.6fr" } as CSSProperties}>
          <div className="table-row table-header">
            <span>Unidad</span>
            <span>Propietario</span>
            <span>Estado</span>
            <span>Face ID</span>
            <span>Coeficiente</span>
            <span>Acciones</span>
          </div>
          {OWNERS.map((owner) => (
            <div key={owner.unit} className="table-row">
              <span>{owner.unit}</span>
              <span>{owner.name}</span>
              <span className={`badge ${owner.status === "Al dia" ? "badge-success" : "badge-warning"}`}>
                {owner.status}
              </span>
              <span className={`badge ${owner.faceId === "Configurado" ? "badge-success" : "badge-muted"}`}>
                {owner.faceId}
              </span>
              <span>{owner.coef}</span>
              <span style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-ghost">Editar</button>
                <button className="btn btn-ghost">Historial</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
