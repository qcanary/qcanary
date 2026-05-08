import { QueueDetailClient } from "./_components/QueueDetailClient";

export const dynamic = "force-dynamic";

function decodeQueueName(rawQueueName: string): string {
  try {
    return decodeURIComponent(rawQueueName);
  } catch {
    return rawQueueName;
  }
}

export default function QueueDetailPage({ params }: { params: { projectId: string; queueName: string } }) {
  return <QueueDetailClient projectId={params.projectId} queueName={decodeQueueName(params.queueName)} />;
}
