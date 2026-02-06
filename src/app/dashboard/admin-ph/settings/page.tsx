export default function SettingsPage() {
  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Configuracion</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Datos del PH y preferencias de notificaciones.
          </p>
        </div>
        <button className="btn btn-primary">Guardar cambios</button>
      </div>

      <div className="two-col" style={{ marginTop: "18px" }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>General</h3>
          <div className="card-list">
            <div className="list-item">
              <span>🏢</span>
              <span>Urban Tower PH</span>
            </div>
            <div className="list-item">
              <span>📍</span>
              <span>Calle 50, Ciudad de Panama</span>
            </div>
            <div className="list-item">
              <span>🔢</span>
              <span>200 unidades · 100% coeficiente</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Notificaciones</h3>
          <div className="card-list">
            <div className="list-item">
              <span>✅</span>
              <span>Enviar email 7 dias antes</span>
            </div>
            <div className="list-item">
              <span>✅</span>
              <span>Recordatorio 1 dia antes</span>
            </div>
            <div className="list-item">
              <span>✅</span>
              <span>Acta al finalizar asamblea</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
