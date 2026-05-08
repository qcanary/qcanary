import { DashboardSidebar } from "./_components/DashboardSidebar";
import { DashboardTopbar } from "./_components/DashboardTopbar";
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
        <main className="flex-1">
          <DashboardTopbar />
          <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>
    </TeamProjectProvider>
  );
}
