import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProjectOverviewClient } from "./_components/ProjectOverviewClient";
import { isExcludedProjectId } from "@/lib/auth-constants";

function apiBaseUrl(): string | null {
  const raw = process.env.API_BASE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

type Project = {
  id: string;
};

export default async function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { userId, getToken } = await auth();

  // Server-side auth check: if the Clerk session has no real user ID,
  // redirect to sign-in. This catches requests that bypassed the middleware's
  // auth.protect() — e.g., direct curl requests that lack any session cookie.
  if (!userId) {
    redirect("/sign-in");
  }

  if (isExcludedProjectId(params.projectId)) {
    redirect(`/${params.projectId}`);
  }

  // Server-side project ownership check.
  // Clerk's anonymous sessions populate a non-null userId but have no real
  // projects, so the !userId check above passes for anonymous visitors.
  // By calling the same /v1/projects endpoint that TeamProjectProvider uses
  // client-side, we verify the projectId actually belongs to this user before
  // any dashboard chrome (sidebar, topbar) reaches the browser.
  // On failure (API down, timeout) we fall through so real users aren't
  // blocked during transient backend issues.
  try {
    const token = await getToken();
    const base = apiBaseUrl();

    if (base && token) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(`${base}/v1/projects`, {
          headers: { authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });

        if (res.ok) {
          const json = (await res.json()) as {
            success: boolean;
            data?: { projects: Project[] };
          };
          const projects: Project[] = json?.data?.projects ?? [];
          if (!projects.some((p: Project) => p.id === params.projectId)) {
            redirect("/sign-in");
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }
  } catch {
    // API unreachable or timeout — fall through so real users can still
    // access their dashboard during backend issues.
  }

  return <ProjectOverviewClient projectId={params.projectId} />;
}
