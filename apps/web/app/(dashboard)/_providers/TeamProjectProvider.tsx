"use client";

import * as React from "react";

type Project = {
  id: string;
  name: string;
  environment: string;
  createdAt?: string;
};

type TeamProjectContextValue = {
  projects: Project[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const TeamProjectContext = React.createContext<TeamProjectContextValue | null>(null);

export function useTeamProjects(): TeamProjectContextValue {
  const ctx = React.useContext(TeamProjectContext);
  if (!ctx) {
    throw new Error("useTeamProjects must be used within TeamProjectProvider");
  }
  return ctx;
}

export function TeamProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/projects", { cache: "no-store" });
      const json = (await res.json()) as
        | { success: true; data: { projects: Project[] } }
        | { success: false; error: { code: string; message: string } };

      if (!json.success) {
        setProjects([]);
        return;
      }
      setProjects(json.data.projects ?? []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <TeamProjectContext.Provider value={{ projects, loading, refresh }}>
      {children}
    </TeamProjectContext.Provider>
  );
}

