import { DashboardSidebar } from "./_components/DashboardSidebar";
import { DashboardTopbar } from "./_components/DashboardTopbar";
import { TeamProjectProvider } from "./_providers/TeamProjectProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      {/* Main content */}
      <main className="flex-1">
        <DashboardTopbar />
        <TeamProjectProvider>
          <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
        </TeamProjectProvider>
      </main>
    </div>
  );
}
