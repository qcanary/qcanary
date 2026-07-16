"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type MarketingNavProps = {
  showCompare?: boolean;
  showBlog?: boolean;
};

const navLinks = [
  { href: "/compare", label: "vs Bull-Board", key: "compare" as const },
  { href: "/feedback", label: "Free Pro for Feedback", key: "feedback" as const },
  { href: "/blog", label: "Blog", key: "blog" as const },
  { href: "/docs", label: "Docs", key: "docs" as const },
];

export default function MarketingNav({
  showCompare = true,
  showBlog = true,
}: MarketingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleLinks = navLinks.filter((link) => {
    if (link.key === "compare") return showCompare;
    if (link.key === "blog") return showBlog;
    return true;
  });

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <BrandLockup href="/" size="md" />

        {/* Desktop nav */}
        <div className="hidden items-center gap-3 md:flex">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm whitespace-nowrap transition-colors hover:text-text-primary",
                link.key === "docs"
                  ? "hidden md:inline text-text-muted"
                  : "text-text-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2">
            <ThemeToggle />
          </div>
          <Link
            href="/sign-in"
            className="text-sm text-text-muted whitespace-nowrap transition-colors hover:text-text-primary"
          >
            Sign In
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Start Free</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex items-center justify-center rounded-xl p-2 text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="absolute inset-0 z-40 h-screen bg-bg/80 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={cn(
          "absolute right-0 top-full z-50 flex w-64 flex-col gap-1 border-l border-border bg-surface p-4 shadow-lg transition-transform duration-200 md:hidden",
          menuOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface/80 hover:text-text-primary"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="mt-2 border-t border-border pt-3">
          <div className="mb-2">
            <ThemeToggle showLabel className="w-full justify-start" />
          </div>
          <Link
            href="/sign-in"
            className="block rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface/80 hover:text-text-primary"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
        </div>
        <Link href="/sign-up" className="mt-2" onClick={() => setMenuOpen(false)}>
          <Button size="sm" className="w-full">
            Start Free
          </Button>
        </Link>
      </div>
    </nav>
  );
}
