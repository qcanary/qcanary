import { notFound } from "next/navigation";
import { AlertsClient } from "./_components/AlertsClient";

const EXCLUDED_PROJECT_IDS = new Set(["sign-up", "sign-in"]);

export default function AlertsPage({ params }: { params: { projectId: string } }) {
  if (EXCLUDED_PROJECT_IDS.has(params.projectId)) {
    notFound();
  }
  return <AlertsClient projectId={params.projectId} />;
}
