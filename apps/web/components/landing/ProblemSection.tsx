import { Badge } from "@/components/ui/badge";

export function ProblemSection() {
  return (
    <section className="overflow-hidden border-b border-border bg-gradient-to-br from-surface/20 via-bg to-code-bg">
      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 md:py-28">

        <div className="mx-auto mb-14 max-w-2xl text-center animate-fade-in-up">
          <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400">The Problem</Badge>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Sharing Redis is a Security Risk</h2>
          <p className="mt-3 text-text-muted">
            Every queue monitoring dashboard that asks for your Redis URL creates an attack
            surface that your security team will flag.
          </p>
        </div>

        {/* Problem — full width with stats-style emphasis */}
        <div className="mx-auto mb-16 max-w-4xl animate-fade-in-up-delay-1">
          <div className="rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-500/5 to-code-bg p-5 shadow-lg shadow-red-500/5 md:p-10">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
                <span className="text-xs font-bold text-red-400">!</span>
              </div>
              <span className="text-sm font-medium text-red-400">The danger of exposing Redis</span>
            </div>
            <p className="mb-5 text-sm text-text-muted">
              Redis has no built-in access control beyond a plaintext password. Leaking a URL means full database access.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: "🔑", title: "Credential exposure", desc: "Handing over your Redis URL grants full database access to a third party" },
                { icon: "🌐", title: "Network blast radius", desc: "Opening port 6379 to a vendor requires VPC peering or public exposure" },
                { icon: "📋", title: "Compliance violation", desc: "Storing production Redis credentials in a third-party system violates SOC 2" },
                { icon: "📊", title: "Data leakage", desc: "Job payloads, worker metadata, and internals exposed to external monitoring" },
              ].map((item) => (
                <div key={item.title} className="card-hover group flex items-start gap-3 rounded-lg border border-border bg-surface/40 p-4">
                  <span className="mt-0.5 shrink-0 text-base">{item.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{item.title}</div>
                    <div className="mt-0.5 text-xs text-text-muted">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Solution — different layout, full width */}
        <div className="mx-auto max-w-4xl animate-fade-in-up-delay-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
              <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm font-medium text-accent">The Solution</span>
          </div>
          <p className="mb-2 text-xl font-medium text-text-primary">QueueEvents: monitor without access</p>
          <p className="mb-6 text-sm text-text-muted">
            BullMQ emits lifecycle events from inside your own process. No Redis URL ever needs to leave.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-hover group rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                  <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-accent">Event Types</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["completed", "failed", "stalled", "active", "waiting", "delayed"].map((evt) => (
                  <span key={evt} className="rounded-md border border-border bg-code-bg px-2.5 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent/30 hover:text-accent">
                    {evt}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-text-muted">
                BullMQ&apos;s QueueEvents dispatches these lifecycle events inside your Node.js process.
              </p>
            </div>
            <div className="card-hover group rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                  <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-blue-400">Data Sent</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["jobId", "queueName", "status", "durationMs", "errorMessage"].map((evt) => (
                  <span key={evt} className="rounded-md border border-border bg-code-bg px-2.5 py-1 font-mono text-xs text-text-primary transition-colors hover:border-blue-400/30 hover:text-blue-400">
                    {evt}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-text-muted">
                Only metadata — no job payloads, no Redis keys, no credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
