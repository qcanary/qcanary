export function LogoStrip() {
  const logos = ["Vercel", "Supabase", "Railway", "Render", "Upstash"];
  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-text-muted/50">
          Built on the same stack as
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {logos.map((name) => (
            <span key={name} className="text-sm font-medium text-text-muted/40 transition-colors hover:text-text-muted/60">{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
