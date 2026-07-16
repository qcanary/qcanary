"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonModalProps {
  isOpen: boolean;
  tierName: string;
  onClose: () => void;
}

export function ComingSoonModal({ isOpen, tierName, onClose }: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`${tierName} plan - Coming Soon`}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-surface/80 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Glow accent */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative px-8 pb-8 pt-10 text-center">
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.42 15.17l-1.415-1.414m0 0l-1.414-1.415m2.83 0l1.414 1.415m-1.414-1.414L9.59 13.76m0 0l1.414 1.414m0 0l1.415 1.415m-1.415-1.415l-1.414-1.415M12 20.25a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-text-primary">
                {tierName} is coming soon
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                We&apos;re hard at work building the {tierName} plan. In the meantime, you can
                start with the Free tier — no credit card required — and upgrade when
                {tierName} launches.
              </p>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col gap-3">
                <Link href="/sign-up" onClick={onClose}>
                  <Button className="w-full gap-2">
                    <Zap className="h-4 w-4" />
                    Try Free — No CC Required
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-8 py-3">
              <p className="text-center text-[11px] text-text-muted/60">
                Want early access?{" "}
                <Link href="/feedback" className="text-accent hover:underline" onClick={onClose}>
                  Let us know
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
