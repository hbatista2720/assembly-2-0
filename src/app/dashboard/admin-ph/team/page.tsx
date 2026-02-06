"use client";

import { useEffect, useState } from "react";

type TeamMember = {
  name: string;
  email: string;
  role: string;
  status: string;
};

const TEAM: TeamMember[] = [
  { name: "Juan Perez", email: "juan@email.com", role: "Admin Principal", status: "Activo" },
  { name: "Maria Lopez", email: "maria@email.com", role: "Admin Asistente", status: "Activo" },
  { name: "Carlos Ruiz", email: "carlos@email.com", role: "Operador Asamblea", status: "Activo" },
  { name: "Ana Torres", email: "ana@email.com", role: "Viewer", status: "Invitacion pendiente" },
];

export default function TeamPage() {
  const [canManageTeam, setCanManageTeam] = useState(false);

  useEffect(() => {
    const storedPermissions = localStorage.getItem("assembly_admin_ph_permissions");
    if (!storedPermissions) {
      setCanManageTeam(true);
      return;
    }
    try {
      const parsed = JSON.parse(storedPermissions) as Record<string, boolean>;
      setCanManageTeam(parsed.manage_team === true);
    } catch {
      setCanManageTeam(true);
    }
  }, []);

  if (!canManageTeam) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Equipo</h2>
        <p className="muted">No tienes permiso para gestionar el equipo.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Equipo de administracion</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Gestiona accesos y permisos del PH.
          </p>
        </div>
        <button className="btn btn-primary">Invitar usuario</button>
      </div>

      <div className="card-list" style={{ marginTop: "18px" }}>
        {TEAM.map((member) => (
          <div key={member.email} className="list-item" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong>{member.name}</strong>
              <div className="muted" style={{ fontSize: "12px" }}>
                {member.email} · {member.role}
              </div>
            </div>
            <span className="chip">{member.status}</span>
            <button className="btn btn-ghost">Permisos</button>
            <button className="btn btn-ghost">Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
