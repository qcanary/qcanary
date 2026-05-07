import { AlertsClient } from "./_components/AlertsClient";

export default function AlertsPage({ params }: { params: { projectId: string } }) {
  return <AlertsClient projectId={params.projectId} />;
}
