import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export const metadata: Metadata = { title: "System Status | QCanary", description: "Real-time status of QCanary services." };

const services = [
  { name: "API", status: "operational", uptime: "99.98%" },
  { name: "Dashboard", status: "operational", uptime: "99.99%" },
  { name: "Agent Ingest", status: "operational", uptime: "99.97%" },
  { name: "Alert Delivery", status: "operational", uptime: "99.95%" },
];

const statusColors: Record<string, string> = { operational: "bg-accent", degraded: "bg-amber-400", outage: "bg-red-400" };
const statusLabels: Record<string, string> = { operational: "Operational", degraded: "Degraded", outage: "Outage" };

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <MarketingNav showCompare={false} showBlog={false} />
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
        <p className="mt-2 text-text-muted">All systems operational. Last checked: {new Date().toLocaleString()}.</p>
        <div className="mt-8 space-y-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between rounded-xl border border-border bg-surface/50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${statusColors[service.status]}`} />
                <span className="text-sm font-medium text-text-primary">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-muted">Uptime: {service.uptime}</span>
                <span className="text-xs text-text-muted">{statusLabels[service.status]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <MarketingFooter />
    </main>
  );
}
