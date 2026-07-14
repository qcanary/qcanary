"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import * as React from "react";
import { Bell, Folder, LayoutDashboard, Menu, MessageSquareHeart, Settings, X } from "lucide-react";

import { BrandLockup } from "@/components/Brand";
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
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
  onClick?: () => void;
}) {
  if (disabled) {
    return (
      <div
        title={disabledTooltip}
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm text-text-muted/40"
      >
        <span className="text-text-muted/40">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition-all duration-150",
        active
          ? "border-l-2 border-l-accent bg-gradient-to-r from-accent/[0.04] to-transparent border-border/80 text-text-primary"
          : "border-transparent text-text-muted hover:bg-surface/70 hover:text-text-primary hover:border-border/50"
      )}
    >
      <span className={cn(
        "transition-colors duration-150",
        active ? "text-accent" : "text-text-muted group-hover:text-text-primary"
      )}>{icon}</span>
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
      )}
    </Link>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : null;
  const { projects, loading, error } = useTeamProjects();
  const hasProjects = projects.length > 0;

  return (
    <>
      <div className="flex items-center justify-between">
        <BrandLockup href="/onboarding" size="sm" labelClassName="text-text-primary" />
        <Link
          href="/settings"
          aria-label="Settings"
          title="Billing and settings"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface/70"
          onClick={onNavClick}
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      <Separator />

      <nav className="flex flex-col gap-1">
        <NavLink href="/onboarding" icon={<Folder className="h-4 w-4" />} label="Onboarding" active={pathname === "/onboarding"} onClick={onNavClick} />
        <NavLink
          href={projectId ? `/${projectId}` : "/onboarding"}
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Overview"
          active={projectId ? pathname === `/${projectId}` : false}
          disabled={!projectId || !hasProjects}
          disabledTooltip="Create a project to view overview."
          onClick={onNavClick}
        />
        <NavLink
          href={projectId ? `/${projectId}/alerts` : "/onboarding"}
          icon={<Bell className="h-4 w-4" />}
          label="Alerts"
          active={projectId ? pathname === `/${projectId}/alerts` : false}
          disabled={!projectId || !hasProjects}
          disabledTooltip="Create a project to manage alerts."
          onClick={onNavClick}
        />
        <NavLink
          href="/testimonials"
          icon={<MessageSquareHeart className="h-4 w-4" />}
          label="Testimonials"
          active={pathname === "/testimonials"}
          onClick={onNavClick}
        />
      </nav>

      <Separator />

      <div className="flex-1 overflow-y-auto">
        <div className="text-xs uppercase tracking-wider text-text-muted mb-3">Projects</div>
        {loading && <div className="text-sm text-text-muted">Loading...</div>}
        {!loading && error && (
          <div className="text-sm text-red-400">{error}</div>
        )}
        {!loading && !error && projects.length === 0 && (
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
                onClick={onNavClick}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-text-muted">
        <span className="font-mono">qcanary.dev</span>
      </div>
    </>
  );
}

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = React.useState(false);

  const closeSidebar = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close sidebar on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Mobile hamburger button — hidden on desktop */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-primary shadow-lg hover:bg-surface/80 transition-colors md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar
       * Mobile: fixed overlay panel that slides in/out from the left
       * Desktop: static document flow within the flex container (pushes main content right)
       */}
      <aside
        className={cn(
          // Desktop — normal document flow (overrides mobile fixed positioning)
          "hidden md:flex md:w-64 md:flex-col md:gap-5 md:p-5 " +
          "md:border-r md:border-border md:bg-surface " +
          "md:relative md:inset-auto md:z-0 md:shadow-none " +
          "md:transition-none md:translate-x-0",

          // Mobile — fixed overlay panel with slide animation
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-5 " +
          "border-r border-border bg-surface p-5 shadow-2xl " +
          "transition-transform duration-300 ease-in-out",

          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onNavClick={closeSidebar} />
      </aside>
    </>
  );
}
