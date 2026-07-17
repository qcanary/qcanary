export function LogoStrip() {
  const logos = [
    { name: "Vercel", viewBox: "0 0 76 65", path: "M37.5274 0L75.0548 65H0L37.5274 0Z" },
    { name: "Supabase", viewBox: "0 0 109 113", path: "M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" },
    { name: "Render", viewBox: "0 0 24 24", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
    { name: "Upstash", viewBox: "0 0 24 24", path: "M13 3L4 14h7v7l9-11h-7V3z" },
  ];
  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-text-muted/50">
          Built on the same stack as
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {logos.map((logo) => (
            <span key={logo.name} className="flex items-center gap-2 text-text-muted/30 transition-colors hover:text-text-muted/50">
              <svg className="h-5 w-5 fill-current" viewBox={logo.viewBox}>
                <path d={logo.path} />
              </svg>
              <span className="text-sm font-medium">{logo.name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
