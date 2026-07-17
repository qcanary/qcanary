import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ComparisonSection() {
  return (
    <section className="border-y border-border bg-gradient-to-br from-bg via-surface/10 to-code-bg">
      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">Bull Board is great for local dev. This is for production.</h2>
          <p className="mt-3 text-base text-text-muted">
            Or build your own monitoring — and maintain it forever.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Bull Board */}
          <div className="rounded-xl border border-border bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
                <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <span className="text-sm font-semibold text-text-primary">Bull Board</span>
            </div>
            <ul className="space-y-2">
              {[
                "Needs SSH tunnel for remote access",
                "No alerts — you check manually",
                "No team permissions",
                "Live view only, no history",
                "Private network access only",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="text-text-muted">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] text-text-muted/50">Free · Open source</p>
          </div>

          {/* Custom monitoring */}
          <div className="rounded-xl border border-border bg-surface/30 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <span className="text-sm font-semibold text-text-primary">Custom monitoring</span>
            </div>
            <ul className="space-y-2">
              {[
                "Weeks of initial development",
                "You maintain dashboards + alerting",
                "No team features without more code",
                "You own the data (and the burden)",
                "Breaks when BullMQ updates",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="text-text-muted">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] text-text-muted/50">Your time · Your maintenance</p>
          </div>

          {/* QCanary */}
          <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-code-bg p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
                <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm font-semibold text-accent">QCanary</span>
            </div>
            <ul className="space-y-2">
              {[
                "Zero network exposure",
                "Slack, email, webhook alerts",
                "Team permissions built in",
                "30-day event history",
                "Dashboard accessible from anywhere",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-text-primary">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] text-accent">Free to start · $39/mo for teams</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/compare">
            <Button variant="secondary" size="sm" className="gap-2">
              Full comparison
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
