"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import * as React from "react";
import { Bell, Folder, LayoutDashboard, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type Project = {
  id: string;
  name: string;
  environment: string;
};

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm border border-transparent",
        active ? "bg-[#0B0B0B] border-border text-text-primary" : "text-text-muted hover:text-text-primary hover:bg-surface/70"
      )}
    >
      <span className={cn(active ? "text-text-primary" : "text-text-muted")}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : null;

  const [projects, setProjects] = React.useState<Project[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/projects", { cache: "no-store" });
        const json = (await res.json()) as
          | { success: true; data: { projects: Array<{ id: string; name: string; environment: string }> } }
          | { success: false; error: { code: string; message: string } };

        if (cancelled) return;
        if (!json.success) {
          setProjects([]);
          return;
        }
        setProjects(json.data.projects);
      } catch {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="w-64 border-r border-border bg-surface p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold tracking-tight">
          <span className="text-accent">Qcanary</span>
        </div>
        <Link
          href={projectId ? `/${projectId}/alerts` : "/onboarding"}
          aria-label="Settings"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface/70"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      <Separator />

      <nav className="flex flex-col gap-1">
        <NavLink href="/onboarding" icon={<Folder className="h-4 w-4" />} label="Onboarding" active={pathname === "/onboarding"} />
        <NavLink
          href={projectId ? `/${projectId}` : "/onboarding"}
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Overview"
          active={projectId ? pathname === `/${projectId}` : false}
        />
        <NavLink
          href={projectId ? `/${projectId}/alerts` : "/onboarding"}
          icon={<Bell className="h-4 w-4" />}
          label="Alerts"
          active={projectId ? pathname === `/${projectId}/alerts` : false}
        />
      </nav>

      <Separator />

      <div className="flex-1">
        <div className="text-xs uppercase tracking-wider text-text-muted mb-2">Projects</div>
        {loading && <div className="text-sm text-text-muted">Loading…</div>}
        {!loading && projects && projects.length === 0 && (
          <div className="text-sm text-text-muted">No projects yet</div>
        )}
        {!loading && projects && projects.length > 0 && (
          <div className="flex flex-col gap-1">
            {projects.map((p) => (
              <NavLink
                key={p.id}
                href={`/${p.id}`}
                icon={<Folder className="h-4 w-4" />}
                label={p.name}
                active={pathname.startsWith(`/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-text-muted">
        <span className="font-mono">qcanary.dev</span>
      </div>
    </aside>
  );
}

