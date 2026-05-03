/**
 * Dashboard layout with sidebar navigation
 * Full implementation: Session 12
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — Session 12 */}
      <aside className="w-64 border-r border-border bg-surface p-4">
        <div className="text-lg font-bold text-accent">Qcanary</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
