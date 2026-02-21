/**
 * Notificación por correo al residente por estatus de solicitud de poder.
 * Punto de extensión: cuando se integre un proveedor (Resend, SendGrid, etc.),
 * implementar el envío real aquí.
 *
 * - Al crear solicitud: status = PENDING ("Solicitud recibida, pendiente de aprobación").
 * - Al aprobar/rechazar (admin): status = APPROVED | REJECTED.
 */
export type PowerNotifyStatus = "PENDING" | "APPROVED" | "REJECTED";

export async function notifyPowerStatus(
  residentEmail: string,
  status: PowerNotifyStatus
): Promise<void> {
  if (!residentEmail?.trim()) return;
  // TODO: integrar proveedor de email (Resend, SendGrid, etc.) y enviar:
  // - PENDING: "Tu solicitud de poder fue recibida y está pendiente de aprobación."
  // - APPROVED: "Tu solicitud de poder fue aprobada."
  // - REJECTED: "Tu solicitud de poder fue rechazada. Puedes enviar una nueva si lo deseas."
  console.log("[notifyPowerEmail] Would send email to", residentEmail, "status:", status);
}
