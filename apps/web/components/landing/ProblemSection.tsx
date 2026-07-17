import { KeyRound, Globe, FileCheck, BarChart3 } from "lucide-react";

export function ProblemSection() {
  return (
    <section className="overflow-hidden border-b border-border bg-gradient-to-br from-surface/20 via-bg to-code-bg">
      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-20">

        <div className="mx-auto mb-14 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">Every monitoring tool wants your Redis URL</h2>
          <p className="mt-3 text-base text-text-muted">
            That&rsquo;s your entire database. One leak and it&rsquo;s over.
          </p>
        </div>

        {/* Problem/Solution — asymmetric layout */}
        <div className="mx-auto mb-12 grid max-w-5xl gap-8 md:grid-cols-5">
          {/* Left: the danger (3 cols) */}
          <div className="md:col-span-3">
            <div className="rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-500/5 to-code-bg p-5 shadow-lg shadow-red-500/5 md:p-8">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
                  <span className="text-xs font-bold text-red-400">!</span>
                </div>
                <span className="text-sm font-medium text-red-400">The danger of exposing Redis</span>
              </div>
              <p className="mb-5 text-sm text-text-muted">
                Redis has no built-in access control beyond a plaintext password. Leaking a URL means full database access.
              </p>
              <div className="space-y-3">
                {[
                  { icon: KeyRound, title: "Full access", desc: "Handing over your Redis URL grants full database access to a third party" },
                  { icon: Globe, title: "No firewall changes", desc: "Opening port 6379 to a vendor requires VPC peering or public exposure" },
                  { icon: FileCheck, title: "SOC 2 violation", desc: "Storing production Redis credentials in a third-party system violates SOC 2" },
                  { icon: BarChart3, title: "Everything exposed", desc: "Job payloads, worker metadata, and internals exposed to external monitoring" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border bg-surface/40 p-4">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-red-400/70" />
                    <div>
                      <div className="text-sm font-medium text-text-primary">{item.title}</div>
                      <div className="mt-0.5 text-xs text-text-muted">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: what QCanary sends (2 cols) */}
          <div className="md:col-span-2">
            <div className="flex h-full flex-col justify-center rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/5 to-code-bg p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20">
                  <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-xs font-medium text-accent">What QCanary sends instead</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["jobId", "queueName", "status", "durationMs", "errorMessage"].map((field) => (
                  <span key={field} className="rounded-md border border-border bg-code-bg px-2.5 py-1 font-mono text-xs text-text-primary">
                    {field}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-text-muted">
                Only metadata. No job payloads, no Redis keys, no credentials. Your Redis URL never leaves your network.
              </p>
            </div>
          </div>
        </div>

        {/* Lifecycle events — horizontal band */}
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-border bg-surface/50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-xs font-medium uppercase tracking-wider text-accent">Lifecycle events monitored</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["completed", "failed", "stalled", "active", "waiting", "delayed"].map((evt) => (
                <span key={evt} className="rounded-md border border-border bg-code-bg px-2.5 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent/30 hover:text-accent">
                  {evt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
