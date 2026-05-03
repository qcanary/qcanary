/**
 * Project overview page
 * Full implementation: Session 13
 */
export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Project Overview</h1>
      <p className="mt-2 text-text-muted">
        Project: {params.projectId}
      </p>
    </div>
  );
}
