import { notFound } from "next/navigation";
import { QueueDetailClient } from "./_components/QueueDetailClient";

export const dynamic = "force-dynamic";

const EXCLUDED_PROJECT_IDS = new Set(["sign-up", "sign-in"]);

function decodeQueueName(rawQueueName: string): string {
  try {
    return decodeURIComponent(rawQueueName);
  } catch {
    return rawQueueName;
  }
}

export default function QueueDetailPage({ params }: { params: { projectId: string; queueName: string } }) {
  if (EXCLUDED_PROJECT_IDS.has(params.projectId)) {
    notFound();
  }
  return <QueueDetailClient projectId={params.projectId} queueName={decodeQueueName(params.queueName)} />;
}
