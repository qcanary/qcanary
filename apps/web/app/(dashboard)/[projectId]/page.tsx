import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProjectOverviewClient } from "./_components/ProjectOverviewClient";
import { isExcludedProjectId } from "@/lib/auth-constants";

export default async function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { userId } = await auth();

  // Server-side auth check: if the Clerk session has no real user ID,
  // redirect to sign-in. This catches requests that bypassed the middleware's
  // auth.protect() — e.g., anonymous Clerk sessions or direct curl requests
  // that lack a proper session cookie.
  if (!userId) {
    redirect("/sign-in");
  }

  if (isExcludedProjectId(params.projectId)) {
    redirect(`/${params.projectId}`);
  }

  return <ProjectOverviewClient projectId={params.projectId} />;
}
