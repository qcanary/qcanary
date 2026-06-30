import { redirect } from "next/navigation";
import { AlertsClient } from "./_components/AlertsClient";
import { isExcludedProjectId } from "@/lib/auth-constants";

export default function AlertsPage({ params }: { params: { projectId: string } }) {
  if (isExcludedProjectId(params.projectId)) {
    redirect(`/${params.projectId}`);
  }
  return <AlertsClient projectId={params.projectId} />;
}
