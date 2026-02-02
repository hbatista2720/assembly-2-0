import type { ReactNode } from "react";
import AdminPhShell from "./AdminPhShell";

export default function AdminPhLayout({ children }: { children: ReactNode }) {
  return <AdminPhShell>{children}</AdminPhShell>;
}
