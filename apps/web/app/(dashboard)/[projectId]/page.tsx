import { redirect } from "next/navigation";
import { ProjectOverviewClient } from "./_components/ProjectOverviewClient";
import { isExcludedProjectId } from "@/lib/auth-constants";

export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  if (isExcludedProjectId(params.projectId)) {
    redirect(`/${params.projectId}`);
  }
  return <ProjectOverviewClient projectId={params.projectId} />;
}
