import { DashboardSidebar } from "./_components/DashboardSidebar";
import { DashboardTopbar } from "./_components/DashboardTopbar";
import { UsageNudge } from "./_components/UsageNudge";
import { TeamProjectProvider } from "./_providers/TeamProjectProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamProjectProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main id="main-content" className="flex-1">
          <DashboardTopbar />
          <UsageNudge />
          <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
        </main>
      </div>
    </TeamProjectProvider>
  );
}
