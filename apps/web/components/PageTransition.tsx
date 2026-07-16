'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade-slide' | 'fade';
}

const variants = {
  'fade-slide': {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

export function PageTransition({ children, variant = 'fade-slide' }: PageTransitionProps) {
  const pathname = usePathname();
  const v = variants[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
