"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Settings,
  LayoutDashboard,
  Bell,
  MessageSquareHeart,
  Building,
  FolderOpen,
  Command,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTeamProjects } from "@/app/(dashboard)/_providers/TeamProjectProvider";

type CommandItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  keywords: string[];
  group: string;
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { projects } = useTeamProjects();

  // Build command items from projects and global pages
  const items = React.useMemo<CommandItem[]>(() => {
    const commands: CommandItem[] = [];

    // Global pages
    commands.push(
      {
        id: "settings",
        label: "Settings",
        icon: <Settings className="h-4 w-4" />,
        href: "/settings",
        keywords: ["settings", "billing", "account", "profile"],
        group: "Pages",
      },
      {
        id: "onboarding",
        label: "Onboarding",
        icon: <FolderOpen className="h-4 w-4" />,
        href: "/onboarding",
        keywords: ["onboarding", "new project", "create"],
        group: "Pages",
      },
      {
        id: "testimonials",
        label: "Testimonials",
        icon: <MessageSquareHeart className="h-4 w-4" />,
        href: "/testimonials",
        keywords: ["testimonials", "feedback", "reviews"],
        group: "Pages",
      },
      {
        id: "enterprise-leads",
        label: "Enterprise Leads",
        icon: <Building className="h-4 w-4" />,
        href: "/enterprise-leads",
        keywords: ["enterprise", "leads", "sales"],
        group: "Pages",
      }
    );

    // Projects with Overview and Alerts sub-pages
    projects.forEach((project) => {
      commands.push(
        {
          id: `project-${project.id}-overview`,
          label: `${project.name} — Overview`,
          icon: <LayoutDashboard className="h-4 w-4" />,
          href: `/${project.id}`,
          keywords: [project.name, "overview", "dashboard", project.environment],
          group: "Projects",
        },
        {
          id: `project-${project.id}-alerts`,
          label: `${project.name} — Alerts`,
          icon: <Bell className="h-4 w-4" />,
          href: `/${project.id}/alerts`,
          keywords: [project.name, "alerts", "notifications", project.environment],
          group: "Projects",
        }
      );
    });

    return commands;
  }, [projects]);

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
    );
  }, [items, query]);

  // Group filtered items
  const groupedItems = React.useMemo(() => {
    const groups: { group: string; items: CommandItem[] }[] = [];
    let currentGroup = "";

    filteredItems.forEach((item) => {
      if (item.group !== currentGroup) {
        currentGroup = item.group;
        groups.push({ group: currentGroup, items: [] });
      }
      groups[groups.length - 1].items.push(item);
    });

    return groups;
  }, [filteredItems]);

  // Reset active index when filtered items change
  React.useEffect(() => {
    setActiveIndex(0);
  }, [filteredItems.length, query]);

  // Scroll active item into view
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const activeEl = list.querySelector("[data-active='true']");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Open with Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle keyboard navigation when open
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[activeIndex]) {
            router.push(filteredItems[activeIndex].href);
            setOpen(false);
            setQuery("");
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setQuery("");
          break;
      }
    },
    [open, filteredItems, activeIndex, router]
  );

  // Focus input when opening
  React.useEffect(() => {
    if (open) {
      // Small delay to ensure animation has started
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-50 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2",
          "shadow-lg shadow-black/10 hover:bg-surface/80 transition-all duration-200",
          "bottom-4 right-4 md:bottom-auto md:top-4 md:right-4"
        )}
        aria-label="Open command palette"
      >
        <Command className="h-4 w-4 text-text-muted" />
        <span className="hidden sm:inline text-sm text-text-muted">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command palette overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-overlay/60 backdrop-blur-sm"
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              aria-hidden="true"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed inset-x-4 top-[15vh] z-50 mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20 sm:inset-x-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-5 w-5 shrink-0 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages and projects..."
                  className="h-12 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none"
                  aria-label="Search command palette"
                />
                <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-[40vh] overflow-y-auto overscroll-contain p-2"
                role="listbox"
                aria-label="Command results"
              >
                {filteredItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-8 w-8 text-text-muted/30" />
                    <p className="mt-2 text-sm text-text-muted">
                      No results found for &ldquo;{query}&rdquo;
                    </p>
                  </div>
                )}

                {groupedItems.map((group) => (
                  <div key={group.group} className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const globalIndex = filteredItems.indexOf(item);
                      const isActive = globalIndex === activeIndex;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-active={isActive}
                          onClick={() => handleSelect(item.href)}
                          onMouseEnter={() => setActiveIndex(globalIndex)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100",
                            isActive
                              ? "bg-accent/10 text-text-primary"
                              : "text-text-muted hover:bg-surface/80 hover:text-text-primary"
                          )}
                          role="option"
                          aria-selected={isActive}
                        >
                          <span
                            className={cn(
                              "shrink-0",
                              isActive ? "text-accent" : "text-text-muted"
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="flex-1 truncate text-sm">
                            {item.label}
                          </span>
                          {isActive && (
                            <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-accent/60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer with keyboard hints */}
              <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[10px] text-text-muted/60">
                <span className="flex items-center gap-1.5">
                  <ArrowUp className="h-3 w-3" />
                  <ArrowDown className="h-3 w-3" />
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CornerDownLeft className="h-3 w-3" />
                  <span>Select</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border bg-bg px-1 py-0.5 font-mono">ESC</kbd>
                  <span>Close</span>
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
