"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationVariant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-in" | "none";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Animation direction. Default: "fade-up" */
  variant?: AnimationVariant;
  /** Delay before animation starts (seconds). Default: 0 */
  delay?: number;
  /** Duration of animation (seconds). Default: 0.5 */
  duration?: number;
  /** How far from the viewport to trigger (px). Default: 40 */
  offset?: number;
  /** Only animate once. Default: true */
  once?: boolean;
  /** Stagger children animations */
  stagger?: boolean;
  /** Stagger delay between children (seconds). Default: 0.1 */
  staggerDelay?: number;
};

const variantMap: Record<AnimationVariant, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
  },
  "scale-in": {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  none: {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
  },
};

/**
 * ScrollReveal — animates children when they scroll into view.
 *
 * Usage:
 * ```tsx
 * <ScrollReveal variant="fade-up" delay={0.2}>
 *   <h2>Visible on scroll</h2>
 * </ScrollReveal>
 *
 * // Stagger children
 * <ScrollReveal stagger>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  duration = 0.5,
  offset = 40,
  once = true,
  stagger = false,
  staggerDelay = 0.1,
}: ScrollRevealProps) {
  const variants = variantMap[variant];

  const staggerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: variants.hidden,
    visible: {
      ...variants.visible,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1], // spring-like easing
      },
    },
  };

  // If staggering, wrap in a container with staggered children
  if (stagger) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: `-${offset}px` }}
        variants={staggerVariants}
      >
        {React.Children.map(children, (child) =>
          child ? <motion.div variants={childVariants}>{child}</motion.div> : null
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: `-${offset}px` }}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedNumber — counts up from 0 to a target number when in view.
 */
export function AnimatedNumber({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(0);
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const hasAnimated = React.useRef(false);
  const rafRef = React.useRef<number>();

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(step);
            }
          };
          rafRef.current = requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span ref={wrapperRef} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
