import { Badge } from "@/components/ui/badge";
import { ArchitectureDiagram } from "@/components/landing/ArchitectureDiagram";

export function SolutionSection() {
  return (
    <section className="border-y border-border bg-gradient-to-b from-surface/30 via-bg to-surface/30">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 md:py-20">

        <div className="mb-10 max-w-2xl text-center animate-fade-in-up">
          <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Architecture</Badge>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">How It Works</h2>
          <p className="mt-3 text-text-muted">
            A lightweight agent inside your worker process streams job metadata to QCanary over HTTPS.
            Redis never leaves your network.
          </p>
        </div>

        <div className="mb-12 w-full max-w-5xl animate-fade-in-up-delay-1">
          <ArchitectureDiagram />
        </div>

        {/* Architecture Flow — Timeline with connecting dots */}
        <div className="relative flex w-full flex-col gap-0 md:flex-row md:items-start">
          {/* Desktop connecting line */}
          <div className="absolute left-[20px] top-0 hidden h-full w-px bg-gradient-to-b from-accent/30 via-accent/15 to-transparent md:left-1/2 md:top-auto md:h-px md:w-3/4 md:-translate-x-1/2 md:bg-gradient-to-r md:from-accent/30 md:via-accent/15 md:to-transparent" />

          {/* Mobile connecting line */}
          <div className="absolute left-[20px] top-0 h-full w-px bg-gradient-to-b from-accent/30 via-accent/15 to-transparent md:hidden" />

          {[
            {
              step: "01",
              title: "Install @qcanary/agent",
              desc: "Add the package to your worker process. Initialize with your API key and BullMQ queues. Monitoring in 3 lines.",
              code: "npm install @qcanary/agent",
              icon: "📦",
            },
            {
              step: "02",
              title: "Agent attaches via QueueEvents",
              desc: "Subscribes to BullMQ's built-in lifecycle events as a local subscriber inside your process. Zero network changes.",
              code: "new QueueMonitor({ apiKey, queues })",
              icon: "🔗",
            },
            {
              step: "03",
              title: "Dashboards & Alerts live",
              desc: "Track failures, trends, and alerts in real time. Catch issues before they reach production.",
              code: "✓ Agent connected · streaming events",
              icon: "📊",
            },
          ].map((item, i) => (
            <div key={item.step} className={`relative flex-1 pb-8 md:pb-0 md:px-3 ${
              i === 0 ? 'animate-fade-in-up' : i === 1 ? 'animate-fade-in-up-delay-1' : 'animate-fade-in-up-delay-2'
            }`}>
              {/* Timeline dot + line container */}
              <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                {/* Dot */}
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-accent/30 bg-gradient-to-br from-bg to-surface shadow-lg shadow-accent/5 transition-all group-hover:border-accent/60">
                  <span className="text-sm">{item.icon}</span>
                </div>
                {/* Content */}
                <div className="min-w-0 flex-1 md:mt-4">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.desc}</p>
                  {/* Code snippet */}
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-gradient-to-r from-code-bg to-surface/30 px-3 py-1.5 font-mono text-xs text-accent ring-1 ring-accent/10">
                    <span className="text-text-muted">$</span>
                    {item.code}
                  </div>
                </div>
              </div>
              {/* Arrow between steps on desktop */}
              {i < 2 && (
                <div className="absolute right-0 top-5 hidden md:block">
                  <svg className="h-4 w-4 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
