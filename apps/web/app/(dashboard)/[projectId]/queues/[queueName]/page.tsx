import { QueueDetailClient } from "./_components/QueueDetailClient";

export default function QueueDetailPage({ params }: { params: { projectId: string; queueName: string } }) {
  return <QueueDetailClient projectId={params.projectId} queueName={decodeURIComponent(params.queueName)} />;
}
