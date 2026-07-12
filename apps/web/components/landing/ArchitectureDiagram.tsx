function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ArrowDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ServerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function CloudIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-5.758-1.574A4.5 4.5 0 002.25 15z" />
    </svg>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function DatabaseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function ActivityIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  );
}

function BellIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function PulseDot() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
    </span>
  );
}

export function ArchitectureDiagram() {
  return (
    <div
      className="w-full"
      role="img"
      aria-label="QCanary architecture: agent runs in your worker process, listens via QueueEvents, streams metadata over HTTPS to QCanary Cloud"
    >
      {/* ── TOP: Flow visualization ── */}
      <div className="mb-6 grid grid-cols-1 gap-0 md:grid-cols-[1fr_auto_1fr] md:gap-0">
        {/* LEFT: Your Infrastructure */}
        <div className="relative rounded-t-2xl border-2 border-dashed border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-black/20 md:rounded-l-2xl">
          <div className="flex items-center gap-2 border-b border-dashed border-zinc-800 px-4 py-2.5">
            <ServerIcon className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-500">
              YOUR INFRASTRUCTURE
            </span>
          </div>
          <div className="p-4 md:p-5">
            {/* Worker Process card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                  <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.75" />
                  </svg>
                </div>
                <span className="font-mono text-xs font-semibold text-zinc-300">
                  Worker Process
                </span>
              </div>

              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                {/* BullMQ Queue */}
                <div className="flex-1 rounded-lg border border-zinc-700/70 bg-black/40 px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                      <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-mono text-xs font-semibold text-zinc-200">BullMQ Queue</div>
                      <div className="font-mono text-[10px] text-zinc-500">email, webhooks, reports</div>
                    </div>
                  </div>
                </div>

                {/* Arrow: Queue → QueueEvents */}
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-4 w-4 text-zinc-600" />
                    <span className="text-[10px] text-zinc-700 font-mono">Listen</span>
                  </div>
                </div>

                {/* QueueEvents */}
                <div className="flex-1 rounded-lg border border-zinc-700/70 bg-black/40 px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10">
                      <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-mono text-xs font-semibold text-zinc-200">QueueEvents</div>
                      <div className="font-mono text-[10px] text-zinc-500">Subscribes via Redis Streams</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent — full-width highlight */}
              <div className="mx-4 mb-4 rounded-lg border-2 border-accent/30 bg-gradient-to-r from-accent/5 via-accent/[0.03] to-black/40 p-3 md:mx-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
                    <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-accent">@qcanary/agent</span>
                      <PulseDot />
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      Subscribes to events · Buffers & flushes via HTTPS · No Redis credentials
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection line: Worker → Redis */}
            <div className="my-3 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-full border border-red-500/10 bg-red-500/[0.03] px-5 py-2.5">
                <LockIcon className="h-4 w-4 text-red-400/60" />
                <span className="text-xs font-mono text-zinc-500">
                  Redis stays behind your firewall
                </span>
                <div className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5">
                  <span className="text-[10px] font-mono text-red-400">Never shared</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: HTTPS Connector */}
        <div className="relative flex items-center justify-center py-10 md:py-0 md:px-2">
          {/* Horizontal bar on desktop */}
          <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-gradient-to-r from-zinc-800 via-accent/20 to-zinc-800 md:block" />
          
          <div className="relative z-10 flex flex-col items-center gap-2 rounded-xl border border-accent/20 bg-code-bg px-4 py-3 shadow-lg shadow-accent/5">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-accent" />
              <span className="font-mono text-xs font-bold text-accent">HTTPS</span>
            </div>
            <div className="text-[10px] text-center leading-tight text-zinc-500 font-mono">
              job metadata<br />
              <span className="text-zinc-600">no payloads</span>
            </div>
            {/* Animated pulse dots */}
            <div className="flex gap-1">
              <span className="h-1 w-1 animate-ping rounded-full bg-accent/60" style={{ animationDelay: "0s" }} />
              <span className="h-1 w-1 animate-ping rounded-full bg-accent/60" style={{ animationDelay: "0.3s" }} />
              <span className="h-1 w-1 animate-ping rounded-full bg-accent/60" style={{ animationDelay: "0.6s" }} />
            </div>
          </div>

          {/* Arrow indicators */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2 md:top-auto md:-left-6 md:top-1/2 md:-translate-y-1/2">
            <ArrowDown className="h-3 w-3 text-accent/40 md:hidden" />
          </div>
          <div className="absolute left-1/2 bottom-2 -translate-x-1/2 md:top-auto md:-right-6 md:top-1/2 md:-translate-y-1/2 md:hidden">
            <ArrowDown className="h-3 w-3 text-accent/40" />
          </div>
        </div>

        {/* RIGHT: QCanary Cloud */}
        <div className="relative rounded-b-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.03] to-black/30 md:rounded-r-2xl">
          <div className="flex items-center gap-2 border-b border-accent/20 px-4 py-2.5">
            <CloudIcon className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-xs font-semibold tracking-wider text-accent">
              QCANARY CLOUD
            </span>
          </div>
          <div className="p-4 md:p-5">
            {/* Top row: API → Dashboard */}
            <div className="mb-3 grid grid-cols-[1fr_auto_1fr] gap-2">
              <div className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                    <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">API</span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-zinc-500">Validates & stores events</div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
              </div>

              <div className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                    <ActivityIcon className="h-3 w-3 text-zinc-400" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">Dashboard</span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-zinc-500">Real-time health & trends</div>
              </div>
            </div>

            {/* Bottom row: Postgres → Alerts */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
              <div className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                    <DatabaseIcon className="h-3 w-3 text-zinc-400" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">Postgres</span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-zinc-500">Queue state & history</div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
              </div>

              <div className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                    <BellIcon className="h-3 w-3 text-zinc-400" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">Alerts</span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-zinc-500">Slack, Email, Webhook</div>
              </div>
            </div>

            {/* Vertical arrow: API → Postgres */}
            <div className="my-1 flex justify-center">
              <ArrowDown className="h-3 w-3 text-zinc-700" />
            </div>

            {/* Notification channels */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-center font-mono text-[11px] text-zinc-400">
                Slack / Email
              </div>
              <div className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-center font-mono text-[11px] text-zinc-400">
                Webhook / PagerDuty
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/5 px-3 py-1">
                <ShieldIcon className="h-3 w-3 text-accent/60" />
                <span className="font-mono text-[10px] text-zinc-500">
                  No Redis credentials ever leave your infrastructure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Step labels ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          {
            step: "01",
            label: "Install Agent",
            desc: "npm install @qcanary/agent in your worker",
            emoji: "📦",
          },
          {
            step: "02",
            label: "Agent Attaches",
            desc: "QueueEvents subscriber inside your process",
            emoji: "🔗",
          },
          {
            step: "03",
            label: "Monitor & Alert",
            desc: "Real-time dashboards + Slack/Email/Webhook alerts",
            emoji: "📊",
          },
        ].map((item) => (
          <div
            key={item.step}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/20 px-4 py-3 transition-colors hover:border-zinc-700/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60">
              <span className="font-mono text-[11px] font-bold text-zinc-500">{item.step}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-xs font-medium text-zinc-300 truncate">{item.label}</span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
