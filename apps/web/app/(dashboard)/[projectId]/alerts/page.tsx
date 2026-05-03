/**
 * Alerts page
 * Full implementation: Session 15
 */
export default function AlertsPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Alerts</h1>
      <p className="mt-2 text-text-muted">
        Project: {params.projectId}
      </p>
    </div>
  );
}
