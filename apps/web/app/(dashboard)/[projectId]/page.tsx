/**
 * Project overview page
 * Full implementation: Session 13
 */
import { ProjectOverviewClient } from "./_components/ProjectOverviewClient";

export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <ProjectOverviewClient projectId={params.projectId} />;
}
