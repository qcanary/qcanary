"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Temporary "Coming Soon" modal for paid pricing tiers.
 *
 * TODO: Remove this component and all its usages once Dodo Payments has been
 * updated with the new Solo ($15), Team ($39), and Business ($149) products.
 * After the migration, re-link all paid tier CTAs directly to the billing flow.
 */

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">🚧</span>
            New pricing launching soon
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-text-muted leading-relaxed">
            We&apos;re updating our billing system to support the new Solo ($15), Team ($39),
            and Business ($149) tiers. In the meantime, you can:
          </p>

          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">1</span>
              <div>
                <span className="font-medium text-text-primary">Try the Free tier</span>
                <p className="text-xs text-text-muted">No credit card, no time limit. Start monitoring in 3 lines.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">2</span>
              <div>
                <span className="font-medium text-text-primary">Apply for our Free Pro feedback program</span>
                <p className="text-xs text-text-muted">3 months free in exchange for feedback.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">3</span>
              <div>
                <span className="font-medium text-text-primary">Contact us for early access</span>
                <p className="text-xs text-text-muted">Get early access to paid tiers before general availability.</p>
              </div>
            </li>
          </ul>

          <div className="mt-6 flex flex-col gap-2">
            <Link href="/sign-up" onClick={onClose}>
              <Button className="w-full gap-2">
                Try Free →
              </Button>
            </Link>
            <Link href="/feedback" onClick={onClose}>
              <Button variant="secondary" className="w-full gap-2">
                Get Free Pro Access →
              </Button>
            </Link>
            <a href="mailto:founder@qcanary.dev" onClick={onClose}>
              <Button variant="ghost" className="w-full gap-2 text-text-muted hover:text-text-primary">
                Contact Us →
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
