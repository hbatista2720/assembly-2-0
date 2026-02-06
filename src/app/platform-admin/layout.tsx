import PlatformAdminShell from "./PlatformAdminShell";

export default function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container">
      <PlatformAdminShell>{children}</PlatformAdminShell>
    </main>
  );
}
