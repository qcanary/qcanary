import {
  AlertTriangle,
  BarChart3,
  Bell,
  Layers,
  Shield,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FeaturesSection() {
  return (
    <section className="overflow-hidden border-y border-border bg-surface/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-12 max-w-2xl animate-fade-in-up">
          <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Features</Badge>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Everything you need to monitor queues</h2>
          <p className="mt-3 text-text-muted">
            Built for developers who already run BullMQ and need reliable operations visibility.
          </p>
        </div>

        {/* Feature 1 & 2 — side-by-side code-style cards */}
        <div className="mb-6 grid gap-5 md:grid-cols-2">
          <div className="card-hover group animate-fade-in-up rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Real-time Dashboards</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">Monitor queue status, throughput, failures, job history, and trends as events arrive.</p>
            {/* Preview tags */}
            <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
              <span className="rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-accent ring-1 ring-accent/20 transition-all group-hover:ring-accent/40">completed</span>
              <span className="rounded-md bg-red-500/10 px-2.5 py-0.5 font-mono text-red-400 ring-1 ring-red-500/20">failed</span>
              <span className="text-text-muted">+3 more</span>
            </div>
            {/* Hover detail — revealed on card hover */}
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span>Throughput charts</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span>Failure trends</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span>Job history</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span>Queue health</span>
              </div>
            </div>
          </div>
          <div className="card-hover group animate-fade-in-up-delay-1 rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Alert Rules</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">Trigger Slack, email, or webhook notifications for failure rate, inactivity, queue depth, and job duration.</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
              <span className="rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-accent ring-1 ring-accent/20 transition-all group-hover:ring-accent/40">Slack</span>
              <span className="rounded-md bg-blue-500/10 px-2.5 py-0.5 font-mono text-blue-400 ring-1 ring-blue-500/20">Email</span>
              <span className="rounded-md bg-purple-500/10 px-2.5 py-0.5 font-mono text-purple-400 ring-1 ring-purple-500/20">Webhook</span>
            </div>
            {/* Hover detail — revealed on card hover */}
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span>Failure rate</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span>Queue stall</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span>Job duration</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span>Auto-resolve</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 — full-width highlight card */}
        <div className="card-hover group animate-fade-in-up-delay-2 mb-6 rounded-xl border border-accent/20 bg-gradient-to-r from-accent/5 via-surface/30 to-code-bg p-6 md:p-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-text-primary">Secure by Design</h3>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">QCanary uses QueueEvents inside your worker process — no external database access, no firewall rules. Deploy with confidence on day one.</p>
            </div>
            <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent ring-1 ring-accent/20">Core feature</span>
          </div>
        </div>

        {/* Feature 4, 5, 6 — compact grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card-hover group animate-fade-in-up rounded-xl border border-border bg-surface/30 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Multi-tenancy</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-text-muted">Keep organizations, projects, environments, queues, and API keys cleanly separated.</p>
          </div>
          <div className="card-hover group animate-fade-in-up-delay-1 rounded-xl border border-border bg-surface/30 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Auto-Resolution</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-text-muted">Resolve incidents automatically when the alert condition recovers — no manual cleanup.</p>
          </div>
          <div className="card-hover group animate-fade-in-up-delay-2 rounded-xl border border-border bg-surface/30 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Usage Limits</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-text-muted">Track project and daily event usage against your plan before limits surprise your team.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
