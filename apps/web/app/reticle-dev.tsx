'use client';

import { useEffect } from 'react';

/**
 * Reticle dev-only instrumentation.
 * Mounted only in development mode — tree-shaken from production builds.
 * Provides runtime verification for AI agents during development.
 */
export function ReticleDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    void import('@reticlehq/core').then((mod) => {
      // Install Reticle — enables React component-to-source mapping
      if (typeof mod.install === 'function') {
        mod.install();
      }
    });
  }, []);

  return null;
}
