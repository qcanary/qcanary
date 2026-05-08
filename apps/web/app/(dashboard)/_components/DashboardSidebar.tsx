"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import * as React from "react";
import { Bell, Folder, LayoutDashboard, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useTeamProjects } from "../_providers/TeamProjectProvider";

function NavLink({
  href,
  icon,
  label,
  active,
  disabled = false,
  disabledTooltip,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
}) {
  if (disabled) {
    return (
      <div
        title={disabledTooltip}
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm text-text-muted/50"
      >
        <span className="text-text-muted/50">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
    );
  }

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
  const { projects, loading } = useTeamProjects();
  const hasProjects = projects.length > 0;

  return (
    <aside className="w-64 border-r border-border bg-surface p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold tracking-tight">
          <span className="text-accent">Qcanary</span>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          title="Billing and settings"
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
          disabled={!projectId || !hasProjects}
          disabledTooltip="Create a project to view overview."
        />
        <NavLink
          href={projectId ? `/${projectId}/alerts` : "/onboarding"}
          icon={<Bell className="h-4 w-4" />}
          label="Alerts"
          active={projectId ? pathname === `/${projectId}/alerts` : false}
          disabled={!projectId || !hasProjects}
          disabledTooltip="Create a project to manage alerts."
        />
      </nav>

      <Separator />

      <div className="flex-1">
        <div className="text-xs uppercase tracking-wider text-text-muted mb-2">Projects</div>
        {loading && <div className="text-sm text-text-muted">Loading...</div>}
        {!loading && projects.length === 0 && (
          <div className="text-sm text-text-muted">No projects yet</div>
        )}
        {!loading && projects.length > 0 && (
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

