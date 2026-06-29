import { notFound } from "next/navigation";
import { ProjectOverviewClient } from "./_components/ProjectOverviewClient";

const EXCLUDED_PROJECT_IDS = new Set(["sign-up", "sign-in"]);

export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  if (EXCLUDED_PROJECT_IDS.has(params.projectId)) {
    notFound();
  }
  return <ProjectOverviewClient projectId={params.projectId} />;
}
