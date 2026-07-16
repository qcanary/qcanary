"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Building,
  ChevronLeft,
  ChevronRight,
  Folder,
  LayoutDashboard,
  MessageSquareHeart,
  Settings,
  Zap,
} from "lucide-react";

import { BrandLockup } from "@/components/Brand";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTeamProjects } from "../_providers/TeamProjectProvider";
import { useUpgradeModal } from "@/components/dashboard/UpgradeModalContext";

function NavLink({
  href,
  icon,
  label,
  active,
  disabled = false,
  disabledTooltip,
  collapsed,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  if (disabled) {
    return (
      <div
        title={collapsed ? label : disabledTooltip}
        aria-disabled="true"
        className={cn(
          "flex items-center gap-3 rounded-lg border border-transparent text-text-muted/40 cursor-not-allowed transition-all duration-150",
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
        )}
      >
        <span className="shrink-0 text-text-muted/40">{icon}</span>
        {!collapsed && <span className="truncate text-xs">{label}</span>}
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg text-sm transition-all duration-150",
        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
        active
          ? "border-l-[3px] border-l-accent bg-gradient-to-r from-accent/[0.06] to-transparent text-text-primary font-medium"
          : "border-l-[3px] border-l-transparent text-text-muted hover:bg-surface/70 hover:text-text-primary"
      )}
    >
      <span
        className={cn(
          "shrink-0 transition-all duration-200",
          active
            ? "text-accent"
            : "text-text-muted group-hover:text-text-primary group-hover:scale-110"
        )}
      >
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          {active && (
            <motion.span
              layoutId="sidebar-active-dot"
              className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
        </>
      )}
    </Link>
  );
}

function SidebarContent({ collapsed, onNavClick }: { collapsed?: boolean; onNavClick?: () => void }) {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : null;
  const { projects, loading, error } = useTeamProjects();
  const hasProjects = projects.length > 0;
  const { open: openUpgrade } = useUpgradeModal();
  const { isFreeUser } = useTeamProjects();

  return (
    <>
      <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {collapsed ? (
          <Link href="/onboarding" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </Link>
        ) : (
          <>
            <BrandLockup href="/onboarding" size="sm" labelClassName="text-text-primary" />
            <Link
              href="/settings"
              aria-label="Settings"
              title="Billing and settings"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface/70 transition-all duration-200"
              onClick={onNavClick}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>

      <Separator />

      <nav className="flex flex-col gap-1">
        <NavLink href="/onboarding" icon={<Folder className="h-4 w-4" />} label="Onboarding" active={pathname === "/onboarding"} collapsed={collapsed} onClick={onNavClick} />
        <NavLink
          href={projectId ? `/${projectId}` : "/onboarding"}
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Overview"
          active={projectId ? pathname === `/${projectId}` : false}
          disabled={!projectId || !hasProjects}
          disabledTooltip="Create a project to view overview."
          collapsed={collapsed}
          onClick={onNavClick}
        />
        <NavLink
          href={projectId ? `/${projectId}/alerts` : "/onboarding"}
          icon={<Bell className="h-4 w-4" />}
          label="Alerts"
          active={projectId ? pathname === `/${projectId}/alerts` : false}
          disabled={!projectId || !hasProjects}
          disabledTooltip="Create a project to manage alerts."
          collapsed={collapsed}
          onClick={onNavClick}
        />
        <NavLink
          href="/testimonials"
          icon={<MessageSquareHeart className="h-4 w-4" />}
          label="Testimonials"
          active={pathname === "/testimonials"}
          collapsed={collapsed}
          onClick={onNavClick}
        />
        <NavLink
          href="/enterprise-leads"
          icon={<Building className="h-4 w-4" />}
          label="Enterprise Leads"
          active={pathname === "/enterprise-leads"}
          collapsed={collapsed}
          onClick={onNavClick}
        />
      </nav>

      {/* Projects section */}
      {!collapsed && (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">
              Projects
            </div>
            {loading && <div className="text-sm text-text-muted animate-pulse">Loading...</div>}
            {!loading && error && <div className="text-sm text-danger">{error}</div>}
            {!loading && !error && projects.length === 0 && (
              <div className="text-sm text-text-muted">No projects yet</div>
            )}
            {!loading && projects.length > 0 && (
              <div className="flex flex-col gap-0.5">
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

          {/* Upgrade card */}
          {isFreeUser && (
            <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.04] to-transparent p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-text-primary">Free plan</span>
              </div>
              <p className="mt-1 text-xs text-text-muted">1 queue limit — Upgrade to Solo for $15/mo</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-text-muted/70">
                  <span>1 of 1 queue used</span>
                  <span>100%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-border overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-warning"
                    style={{ width: "100%" }}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <Button size="sm" className="mt-3 w-full gap-1.5 text-xs" onClick={openUpgrade}>
                <Zap className="h-3 w-3" />
                Upgrade to Solo
              </Button>
            </div>
          )}

          <div className="text-[10px] text-text-muted/50">
            <span className="font-mono">qcanary.dev</span>
          </div>
        </>
      )}
    </>
  );
}

export function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  // Close mobile sidebar on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-primary shadow-lg shadow-black/10 hover:bg-surface/80 transition-all duration-200 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={mobileOpen}
      >
        <motion.div animate={{ rotate: mobileOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          )}
        </motion.div>
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-overlay/60 backdrop-blur-sm md:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          // Mobile first (applied everywhere)
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-4 border-r border-border bg-surface p-5 shadow-2xl shadow-black/20",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop overrides (must come AFTER mobile to win specificity)
          "md:relative md:z-0 md:translate-x-0 md:flex-col md:gap-4 md:py-5 md:border-r md:border-border md:bg-surface md:p-5",
          "transition-all duration-300 ease-spring",
          collapsed ? "md:w-16 md:px-3" : "md:w-64 md:px-5"
        )}
      >
        {/* Collapse toggle — desktop only */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 z-20 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-muted hover:text-text-primary hover:border-accent/30 transition-all shadow-sm md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        <SidebarContent collapsed={collapsed} onNavClick={closeMobile} />
      </aside>
    </>
  );
}
