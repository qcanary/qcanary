/**
 * Queue detail page
 * Full implementation: Session 14
 */
export default function QueueDetailPage({
  params,
}: {
  params: { projectId: string; queueName: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Queue: {params.queueName}</h1>
      <p className="mt-2 text-text-muted">
        Project: {params.projectId}
      </p>
    </div>
  );
}
