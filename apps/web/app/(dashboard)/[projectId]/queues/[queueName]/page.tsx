import { redirect } from "next/navigation";
import { QueueDetailClient } from "./_components/QueueDetailClient";
import { isExcludedProjectId } from "@/lib/auth-constants";

export const dynamic = "force-dynamic";

function decodeQueueName(rawQueueName: string): string {
  try {
    return decodeURIComponent(rawQueueName);
  } catch {
    return rawQueueName;
  }
}

export default function QueueDetailPage({ params }: { params: { projectId: string; queueName: string } }) {
  if (isExcludedProjectId(params.projectId)) {
    redirect(`/${params.projectId}`);
  }
  return <QueueDetailClient projectId={params.projectId} queueName={decodeQueueName(params.queueName)} />;
}
