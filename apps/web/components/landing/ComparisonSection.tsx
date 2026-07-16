import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ComparisonSection() {
  return (
    <section className="border-y border-border bg-gradient-to-br from-bg via-surface/10 to-code-bg">
      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">Bull Board is great for local dev. This is for production.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 animate-fade-in-up-delay-1">
          <div className="rounded-xl border border-red-500/15 bg-gradient-to-br from-red-500/5 to-code-bg p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20">
                <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <span className="text-sm font-semibold text-red-400">Bull Board</span>
            </div>
            <ul className="space-y-2.5">
              {[
                "Needs SSH tunnel",
                "No alerts",
                "No team access",
                "Live-only, no history",
                "Dashboard accessible only from private network",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="text-text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-code-bg p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
                <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm font-semibold text-accent">QCanary</span>
            </div>
            <ul className="space-y-2.5">
              {[
                "Zero network exposure",
                "Slack, email, webhooks",
                "Team permissions",
                "30-day history",
                "Accessible from anywhere — secure dashboard with HTTPS",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-text-primary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 text-center animate-fade-in-up-delay-2">
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
