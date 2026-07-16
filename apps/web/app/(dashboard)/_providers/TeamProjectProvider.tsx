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
  error: string | null;
  refresh: () => Promise<void>;
  isFreeUser: boolean;
  userPlan: string;
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
  const [error, setError] = React.useState<string | null>(null);
  const [userPlan, setUserPlan] = React.useState<string>("free");
  const previousOrgIdRef = React.useRef<string | null | undefined>(orgId);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/projects", { cache: "no-store" });
      const json = (await res.json()) as
        | { success: true; data: { projects: Project[] } }
        | { success: false; error: { code: string; message: string } };

      if (!json.success) {
        setError(json.error.message);
        setProjects([]);
        return;
      }
      setError(null);
      setProjects(json.data.projects ?? []);
    } catch {
      setError("Failed to load projects. Check your connection and try again.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user plan info
  const fetchPlan = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/billing/plan", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json() as { plan?: string };
        setUserPlan(json.plan ?? "free");
      }
    } catch {
      // API not available yet — default to free
      setUserPlan("free");
    }
  }, []);

  React.useEffect(() => {
    void refresh();
    void fetchPlan();
  }, [refresh, fetchPlan]);

  React.useEffect(() => {
    const previousOrgId = previousOrgIdRef.current;
    if (previousOrgId !== orgId) {
      previousOrgIdRef.current = orgId;
      setError(null);
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
    if (!projectIdInPath || projectIdInPath === "onboarding" || projectIdInPath === "settings" || projectIdInPath === "sign-up" || projectIdInPath === "sign-in" || projectIdInPath === "testimonials" || projectIdInPath === "enterprise-leads") {
      return;
    }
    const exists = projects.some((project) => project.id === projectIdInPath);
    if (!exists) {
      router.replace("/onboarding");
    }
  }, [loading, pathname, projects, router]);

  const isFreeUser = userPlan === "free" || userPlan === "";

  return (
    <TeamProjectContext.Provider value={{ projects, loading, error, refresh, isFreeUser, userPlan }}>
      {children}
    </TeamProjectContext.Provider>
  );
}

