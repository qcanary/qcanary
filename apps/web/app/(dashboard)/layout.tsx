import { DashboardSidebar } from "./_components/DashboardSidebar";
import { DashboardTopbar } from "./_components/DashboardTopbar";
import { UsageNudge } from "./_components/UsageNudge";
import { TeamProjectProvider } from "./_providers/TeamProjectProvider";
import { UpgradeModalProvider } from "@/components/dashboard/UpgradeModalContext";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamProjectProvider>
      <UpgradeModalProvider>
        <div className="flex min-h-screen">
          <DashboardSidebar />
          <main id="main-content" className="flex-1 min-w-0">
            <DashboardTopbar />
            <UsageNudge />
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
              {/* Mobile padding to avoid hamburger overlap */}
              <div className="pt-14 md:pt-0">{children}</div>
            </div>
          </main>
        </div>
        <UpgradeModal />
      </UpgradeModalProvider>
    </TeamProjectProvider>
  );
}
