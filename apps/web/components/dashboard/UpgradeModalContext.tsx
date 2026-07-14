"use client";

import * as React from "react";

type UpgradeModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const UpgradeModalContext = React.createContext<UpgradeModalContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function UpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return (
    <UpgradeModalContext.Provider value={value}>
      {children}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  return React.useContext(UpgradeModalContext);
}
