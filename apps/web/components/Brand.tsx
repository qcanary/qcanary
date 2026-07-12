import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  imageClassName?: string;
};

const markSizes = {
  sm: {
    frame: "h-10 w-10 rounded-xl",
    icon: 28,
  },
  md: {
    frame: "h-11 w-11 rounded-[14px]",
    icon: 30,
  },
  lg: {
    frame: "h-12 w-12 rounded-2xl",
    icon: 34,
  },
} satisfies Record<NonNullable<BrandMarkProps["size"]>, { frame: string; icon: number }>;

export function BrandMark({
  size = "md",
  className,
  imageClassName,
}: BrandMarkProps) {
  const config = markSizes[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),_rgba(13,20,16,0.94)_72%)] shadow-[0_12px_28px_rgba(0,0,0,0.28)]",
        config.frame,
        className,
      )}
    >
      <Image
        src="/brand-mark.png"
        alt="Qcanary"
        width={config.icon}
        height={config.icon}
        priority
        className={cn("h-auto w-auto", imageClassName)}
      />
    </span>
  );
}

type BrandLockupProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  labelClassName?: string;
};

const labelSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
} satisfies Record<NonNullable<BrandLockupProps["size"]>, string>;

export function BrandLockup({
  href,
  size = "md",
  className,
  labelClassName,
}: BrandLockupProps) {
  const content = (
    <>
      <BrandMark size={size} />
      <span
        className={cn(
          "font-semibold tracking-tight text-text-primary",
          labelSizes[size],
          labelClassName,
        )}
        translate="no"
      >
        Qcanary
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center gap-3", className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-3", className)}>{content}</div>;
}
