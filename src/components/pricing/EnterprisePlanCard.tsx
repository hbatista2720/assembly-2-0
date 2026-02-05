"use client";

export default function EnterprisePlanCard() {
  return (
    <div
      className="pricing-card"
      style={{
        border: "2px solid rgba(234,179,8,0.8)",
        background: "linear-gradient(135deg, rgba(253,230,138,0.2), rgba(30,41,59,0.9))",
        boxShadow: "0 20px 60px rgba(234,179,8,0.25)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-12px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg, rgba(234,179,8,0.95), rgba(251,191,36,0.95))",
          color: "#111827",
          padding: "4px 12px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        ✨ PREMIUM
      </div>
      <h3 style={{ marginTop: "8px" }}>Enterprise</h3>
      <p style={{ color: "#fde68a" }}>CRM con IA de sentimiento + soporte dedicado</p>
      <p style={{ fontSize: "28px", margin: "12px 0", color: "#facc15", fontWeight: 700 }}>
        $2,499<span style={{ fontSize: "12px", color: "#fcd34d" }}>/mes</span>
      </p>
      <div className="card-list">
        {[
          "♾️ Asambleas ILIMITADAS",
          "♾️ Residentes ILIMITADOS",
          "♾️ Edificios ILIMITADOS",
          "🤖 CRM con IA de Sentimiento",
          "Consultoria legal incluida",
        ].map((feature) => (
          <div key={feature} className="list-item">
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <a className="btn btn-primary" style={{ marginTop: "16px" }} href="/login">
        Contactar Ventas
      </a>
    </div>
  );
}
