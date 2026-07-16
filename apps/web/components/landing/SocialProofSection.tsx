export function SocialProofSection() {
  return (
    <section className="border-y border-border bg-gradient-to-t from-surface/30 to-bg">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-12 max-w-2xl animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">Built in the open</h2>
          <p className="mt-3 text-base text-text-muted">
            The agent package is MIT-licensed and available on GitHub and npm.
            Built in the open with contributions from the BullMQ ecosystem.
          </p>
        </div>

        {/* Key metrics with Shields.io-style badges */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* GitHub Stars */}
          <div className="group rounded-xl border border-border bg-surface/40 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Open Source</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-muted">MIT-licensed</span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    on GitHub
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Available on npm */}
          <div className="group rounded-xl border border-border bg-surface/40 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v4.001H12V15H9.999v-.002h-1.33v-.001h-1v.001h-1v.001h-.002v-1.334h1.335v-2.667H9.333V14h1.333v-.002h.002v-4h1.334v4.002zm6.667 0v1.336H16v-5.335h-2.667v-1.33h8v1.33h-2.666v5.335h-1.334v-5.335h-1.333v5.335h-1.334v-6.666H20l.001 5.335h-1.332v1.33h-1v.001h-1.334v-1.334H20V10.668h-2.667z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Available on npm</div>
                <div className="text-xs text-text-muted">@qcanary/agent package</div>
              </div>
            </div>
          </div>

          {/* MIT Licensed */}
          <div className="group rounded-xl border border-border bg-surface/40 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">MIT Licensed</div>
                <div className="text-xs text-text-muted">Free to use and modify</div>
              </div>
            </div>
          </div>

          {/* BullMQ Native */}
          <div className="group rounded-xl border border-border bg-surface/40 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">BullMQ Native</div>
                <div className="text-xs text-text-muted">Built on QueueEvents API</div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof badges */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/qcanary/qcanary"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs text-text-muted hover:border-accent/30 hover:text-accent transition-all"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.405 1.02.006 2.047.139 3.006.405 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
            <span className="font-mono text-[10px] opacity-60">@qcanary/qcanary</span>
          </a>
          <a
            href="https://www.npmjs.com/package/@qcanary/agent"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs text-text-muted hover:border-accent/30 hover:text-accent transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v4.001H12V15H9.999v-.002h-1.33v-.001h-1v.001h-1v.001h-.002v-1.334h1.335v-2.667H9.333V14h1.333v-.002h.002v-4h1.334v4.002zm6.667 0v1.336H16v-5.335h-2.667v-1.33h8v1.33h-2.666v5.335h-1.334v-5.335h-1.333v5.335h-1.334v-6.666H20l.001 5.335h-1.332v1.33h-1v.001h-1.334v-1.334H20V10.668h-2.667z" />
            </svg>
            npm
            <span className="font-mono text-[10px] opacity-60">@qcanary/agent</span>
          </a>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs text-text-muted">
            <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            MIT License
          </span>
        </div>

        {/* Quality signals row — no live counters */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 px-5 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <svg aria-hidden="true" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-text-primary">TypeScript</div>
              <div className="text-xs text-text-muted">Full type safety across agent + API</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 px-5 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
              <svg aria-hidden="true" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-text-primary">3-line</div>
              <div className="text-xs text-text-muted">Setup · 10 minutes to first event</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 px-5 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <svg aria-hidden="true" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-text-primary">SOC 2 in Progress</div>
              <div className="text-xs text-text-muted">Zero-trust architecture — Type II audit in progress</div>
            </div>
          </div>
        </div>

        {/* Technology stack / integrations */}
        <div className="animate-fade-in-up-delay-1">
          <div className="mb-4 text-xs font-medium uppercase tracking-wider text-text-muted">Built for the BullMQ ecosystem</div>
          <div className="flex flex-wrap gap-2">
            {["BullMQ", "Node.js", "Redis", "TypeScript", "Docker", "Express", "npm", "pnpm", "Supabase", "Vercel"].map((tech) => (
              <span key={tech} className="rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-accent/30 hover:text-accent">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
