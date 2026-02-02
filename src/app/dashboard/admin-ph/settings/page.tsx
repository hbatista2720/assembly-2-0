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
export default function SettingsPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Configuracion</span>
            <h1 style={{ margin: "12px 0 6px" }}>Ajustes del PH</h1>
            <p className="muted" style={{ margin: 0 }}>
              Datos generales, notificaciones y parametros legales.
            </p>
          </div>
          <button className="btn btn-primary">Guardar cambios</button>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Informacion general</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <input className="input" defaultValue="Urban Tower" />
            <input className="input" defaultValue="URBA" />
            <input className="input" defaultValue="Calle 50, Ciudad de Panama" />
            <input className="input" defaultValue="200 unidades" />
            <input className="input" defaultValue="100% coeficiente total" />
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Notificaciones</h3>
          <div className="card-list">
            {[
              "Enviar email 7 dias antes",
              "Enviar recordatorio 1 dia antes",
              "Enviar acta al finalizar",
              "Alertar si propietario sin Face ID",
              "Alertar si quorum baja del 51%",
            ].map((item) => (
              <div key={item} className="list-item">
                <span>✅</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
