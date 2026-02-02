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
import type { CSSProperties } from "react";

const TEAM = [
  { name: "Juan Perez", email: "juan@urban.com", role: "Admin Principal", status: "Activo" },
  { name: "Maria Lopez", email: "maria@urban.com", role: "Admin Asistente", status: "Activo" },
  { name: "Carlos Ruiz", email: "carlos@urban.com", role: "Operador Asamblea", status: "Activo" },
  { name: "Ana Torres", email: "ana@urban.com", role: "Viewer", status: "Pendiente" },
];

export default function TeamPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Equipo</span>
            <h1 style={{ margin: "12px 0 6px" }}>Gestion de administradores</h1>
            <p className="muted" style={{ margin: 0 }}>
              Invita usuarios y asigna permisos por rol.
            </p>
          </div>
          <button className="btn btn-primary">Invitar usuario</button>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Invitar al equipo</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <input className="input" placeholder="Email" />
            <input className="input" placeholder="Nombre" />
            <select className="input">
              <option>Admin Asistente</option>
              <option>Operador Asamblea</option>
              <option>Viewer</option>
            </select>
            <div className="card-list">
              {[
                "Gestionar propietarios",
                "Crear asambleas",
                "Ejecutar asambleas en vivo",
                "Voto manual",
                "Ver reportes",
              ].map((permission) => (
                <div key={permission} className="list-item">
                  <span>✅</span>
                  <span>{permission}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary">Enviar invitacion</button>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Permisos por rol</h3>
          <div className="card-list">
            <div className="list-item">
              <span>👑</span>
              <span>Admin Principal: acceso total</span>
            </div>
            <div className="list-item">
              <span>📋</span>
              <span>Admin Asistente: operativo completo</span>
            </div>
            <div className="list-item">
              <span>🎙️</span>
              <span>Operador Asamblea: solo en vivo</span>
            </div>
            <div className="list-item">
              <span>👁️</span>
              <span>Viewer: solo lectura</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table" style={{ "--table-columns": "1.6fr 1fr 1fr 1.6fr" } as CSSProperties}>
          <div className="table-row table-header">
            <span>Usuario</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {TEAM.map((member) => (
            <div key={member.email} className="table-row">
              <span>
                <strong>{member.name}</strong>
                <div className="muted" style={{ fontSize: "12px" }}>
                  {member.email}
                </div>
              </span>
              <span>{member.role}</span>
              <span className={`badge ${member.status === "Activo" ? "badge-success" : "badge-warning"}`}>
                {member.status}
              </span>
              <span style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-ghost">Permisos</button>
                <button className="btn btn-ghost">Editar</button>
                <button className="btn btn-ghost">Remover</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
