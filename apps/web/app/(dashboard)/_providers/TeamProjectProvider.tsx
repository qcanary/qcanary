"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

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
  const { orgId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const previousOrgIdRef = React.useRef<string | null | undefined>(orgId);

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

  React.useEffect(() => {
    const previousOrgId = previousOrgIdRef.current;
    if (previousOrgId !== orgId) {
      previousOrgIdRef.current = orgId;
      setProjects([]);
      setLoading(true);
      router.push("/onboarding");
      void refresh();
    }
  }, [orgId, refresh, router]);

  React.useEffect(() => {
    if (loading) {
      return;
    }
    const match = pathname.match(/^\/([^/]+)/);
    const projectIdInPath = match?.[1];
    if (!projectIdInPath || projectIdInPath === "onboarding" || projectIdInPath === "settings") {
      return;
    }
    const exists = projects.some((project) => project.id === projectIdInPath);
    if (!exists) {
      router.replace("/onboarding");
    }
  }, [loading, pathname, projects, router]);

  return (
    <TeamProjectContext.Provider value={{ projects, loading, refresh }}>
      {children}
    </TeamProjectContext.Provider>
  );
}

