import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

const docSections = [
  { title: "Getting Started", items: [
    { label: "Quick Start", href: "/docs" },
    { label: "Installation", href: "/docs/quick-start" },
    { label: "Configuration", href: "/docs/configuration" },
  ]},
  { title: "Features", items: [
    { label: "Alert Rules", href: "/docs/alert-rules" },
    { label: "Dashboards", href: "/docs#dashboard" },
    { label: "Team Management", href: "/docs#teams" },
  ]},
  { title: "Reference", items: [
    { label: "API Reference", href: "/docs/api-reference" },
    { label: "Agent Options", href: "/docs/configuration#agent-options" },
    { label: "Event Types", href: "/docs/configuration#event-types" },
  ]},
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <MarketingNav showCompare={false} />
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-6 py-10">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 space-y-6">
            {docSections.map((section) => (
              <div key={section.title}>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}
                      className="block rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface/60 hover:text-text-primary">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <MarketingFooter />
    </main>
  );
}
