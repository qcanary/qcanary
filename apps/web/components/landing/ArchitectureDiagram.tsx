export function ArchitectureDiagram() {
  return (
    <div
      className="w-full overflow-x-auto py-2"
      role="img"
      aria-label="QCanary architecture: agent runs in your worker process, listens via QueueEvents, streams metadata over HTTPS to QCanary Cloud"
    >
      {/* Mobile hint */}
      <div className="mb-3 flex items-center gap-2 text-xs text-text-muted md:hidden">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Scroll horizontally to see the full architecture</span>
      </div>
      <div className="flex min-w-[860px] items-stretch gap-0">
        {/* ─── SIDE 1: YOUR INFRASTRUCTURE ─── */}
        <div className="flex flex-1 flex-col rounded-xl border-2 border-dashed border-zinc-800 bg-gradient-to-br from-zinc-900/40 to-black/10">
          {/* Header */}
          <div className="flex items-center gap-2 rounded-t-xl bg-zinc-900/60 px-4 py-2.5">
            <div className="h-2 w-2 rounded-full bg-zinc-500" />
            <span className="font-mono text-xs font-semibold tracking-wide text-zinc-400">
              YOUR INFRASTRUCTURE
            </span>
          </div>

          <div className="flex flex-col gap-5 p-5">
            {/* Worker Process card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
              <div className="border-b border-zinc-800 px-4 py-2.5">
                <span className="font-mono text-xs font-semibold text-zinc-200">
                  Worker Process
                </span>
              </div>

              {/* Inner grid: Queue/Events (left) + Agent (right) */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 p-4">
                {/* Left column: Queue + QueueEvents stacked */}
                <div className="flex flex-col gap-2">
                  {/* BullMQ Queue */}
                  <div className="rounded-lg border border-zinc-700/80 bg-black/40 px-4 py-3">
                    <div className="font-mono text-xs font-semibold text-zinc-200">
                      BullMQ Queue
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-zinc-500">
                      email, webhooks, reports
                    </div>
                  </div>

                  {/* Down arrow */}
                  <div className="flex justify-center">
                    <svg className="h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* QueueEvents */}
                  <div className="rounded-lg border border-zinc-700/80 bg-black/40 px-4 py-3">
                    <div className="font-mono text-xs font-semibold text-zinc-400">
                      QueueEvents
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-zinc-600">
                      listens via Redis Streams
                    </div>
                  </div>
                </div>

                {/* Arrow: QueueEvents → Agent */}
                <div className="flex items-center">
                  <svg className="h-5 w-5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* @qcanary/agent — right column, full height */}
                <div className="flex flex-col justify-center rounded-xl border-2 border-accent/50 bg-accent/5 px-4 py-3.5">
                  <div className="font-mono text-sm font-semibold text-accent">
                    @qcanary/agent
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className="font-mono text-xs text-zinc-400">
                      subscribes to events
                    </div>
                    <div className="font-mono text-xs text-zinc-400">
                      buffers &amp; flushes via HTTPS
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                      no Redis credentials
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection: QueueEvents → Redis (dashed line with label) */}
            <div className="relative flex items-center justify-center">
              {/* Vertical dashed line going from Worker down to Redis */}
              <div className="flex flex-col items-center gap-1">
                <svg className="h-3 w-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M19 14l-7 7m0 0l-7-7" />
                </svg>
                <div className="h-5 w-px bg-gradient-to-b from-zinc-700 to-zinc-800" />
                <span className="font-mono text-[10px] text-zinc-600">Redis Streams</span>
                <div className="h-5 w-px bg-gradient-to-b from-zinc-800 to-red-500/20" />
                <svg className="h-3 w-3 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M19 14l-7 7m0 0l-7-7" />
                </svg>
              </div>
            </div>

            {/* Redis pill */}
            <div className="flex items-center gap-4 rounded-full border border-red-500/20 bg-red-500/5 px-6 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10">
                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-mono text-sm font-semibold text-red-400">Redis</div>
                <div className="font-mono text-xs text-zinc-500">stays behind your firewall</div>
              </div>
              {/* Lock icon */}
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10">
                <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ─── HTTPS CONNECTOR ─── */}
        <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 px-3">
          {/* Up arrow from agent */}
          <svg className="h-4 w-4 text-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>

          <div className="h-4 w-px bg-gradient-to-b from-zinc-700 to-zinc-800" />

          {/* HTTPS badge */}
          <div className="rounded-md border border-accent/20 bg-accent/10 px-3 py-1">
            <span className="font-mono text-xs font-bold text-accent">HTTPS</span>
          </div>

          <div className="h-4 w-px bg-gradient-to-b from-zinc-800 to-zinc-700" />

          {/* Down arrow to cloud */}
          <svg className="h-4 w-4 text-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>

          {/* Metadata labels */}
          <div className="mt-1 text-center font-mono text-[11px] leading-tight text-zinc-500">
            job metadata
          </div>
          <div className="text-center font-mono text-[11px] leading-tight text-zinc-600">
            no payloads
          </div>
        </div>

        {/* ─── SIDE 2: QCANARY CLOUD ─── */}
        <div className="flex flex-1 flex-col rounded-xl border border-accent/15 bg-gradient-to-br from-accent/[0.04] to-black">
          {/* Header */}
          <div className="flex items-center gap-2 rounded-t-xl bg-accent/5 px-4 py-2.5">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-xs font-semibold tracking-wide text-accent">
              QCANARY CLOUD
            </span>
          </div>

          <div className="flex flex-col gap-4 p-5">
            {/* 3-column grid: API → Dashboard (top), Postgres → Alerts (bottom), with vertical API→Postgres arrow */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-1">
              {/* Row 1: API → Dashboard */}
              <div className="rounded-xl border border-zinc-800 bg-black/30">
                <div className="flex items-center gap-2 border-b border-zinc-800 px-3.5 py-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                    <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">API</span>
                </div>
                <div className="px-3.5 py-2.5 font-mono text-xs text-zinc-500">
                  validates &amp; stores events
                </div>
              </div>

              {/* Arrow: API → Dashboard */}
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {/* Dashboard card */}
              <div className="rounded-xl border border-zinc-800 bg-black/30">
                <div className="flex items-center gap-2 border-b border-zinc-800 px-3.5 py-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                    <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">Dashboard</span>
                </div>
                <div className="px-3.5 py-2.5 font-mono text-xs text-zinc-500">
                  real-time health &amp; trends
                </div>
              </div>

              {/* Row 2: ↓ (API → Postgres) spacer */}
              <div className="flex justify-center py-0.5">
                <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div />
              <div />

              {/* Row 3: Postgres → Alerts */}
              <div className="rounded-xl border border-zinc-800 bg-black/30">
                <div className="flex items-center gap-2 border-b border-zinc-800 px-3.5 py-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                    <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path strokeLinecap="round" d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
                      <path strokeLinecap="round" d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                    </svg>
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">Postgres</span>
                </div>
                <div className="px-3.5 py-2.5 font-mono text-xs text-zinc-500">
                  queue state &amp; history
                </div>
              </div>

              {/* Arrow: Postgres → Alerts */}
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {/* Alerts card */}
              <div className="rounded-xl border border-zinc-800 bg-black/30">
                <div className="flex items-center gap-2 border-b border-zinc-800 px-3.5 py-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                    <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">Alerts</span>
                </div>
                <div className="px-3.5 py-2.5 font-mono text-xs text-zinc-500">
                  Slack, email, webhook
                </div>
              </div>
            </div>

            {/* Down arrows → notification channels */}
            <div className="flex items-center justify-center gap-16">
              {/* Arrow: API/Postgres → Slack/Email */}
              <div className="flex flex-col items-center gap-1">
                <svg className="h-3 w-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
                </svg>
                <div className="h-3 w-px bg-zinc-800" />
              </div>
              {/* Arrow: Dashboard/Alerts → Webhook */}
              <div className="flex flex-col items-center gap-1">
                <svg className="h-3 w-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
                </svg>
                <div className="h-3 w-px bg-zinc-800" />
              </div>
            </div>

            {/* Notification channels */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-zinc-800 bg-black/20 px-4 py-2.5 text-center font-mono text-xs text-zinc-300">
                Slack / Email
              </div>
              <div className="rounded-lg border border-zinc-800 bg-black/20 px-4 py-2.5 text-center font-mono text-xs text-zinc-300">
                Webhook / PagerDuty
              </div>
            </div>

            {/* Footer */}
            <div className="mt-1 text-center font-mono text-xs text-zinc-600">
              No Redis credentials ever leave your infrastructure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
