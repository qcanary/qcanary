/**
 * Onboarding page — new user flow
 * Full implementation: Session 12
 */
"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTeamProjects } from "../_providers/TeamProjectProvider";

type ApiError = { success: false; error: { code: string; message: string } };
type CreateProjectOk = {
  success: true;
  data: { project: { id: string; name: string; environment: string } };
};
type CreateKeyOk = {
  success: true;
  data: { apiKey: string; key: { id: string; keyPrefix: string } };
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-auto rounded-md border border-border bg-code-bg p-4 text-xs text-text-primary font-mono">
      {children}
    </pre>
  );
}

export default function OnboardingPage() {
  const { projects, loading: projectsLoading, refresh } = useTeamProjects();
  const [projectName, setProjectName] = React.useState("production");
  const [environment, setEnvironment] = React.useState("production");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [createdProjectId, setCreatedProjectId] = React.useState<string | null>(null);
  const [createdProjectName, setCreatedProjectName] = React.useState<string | null>(null);
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = React.useState<string | null>(null);

  async function createProjectAndKey(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const name = projectName.trim();
    if (!name) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);

      const createProjectRes = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          environment: environment.trim() || "production",
        }),
      });

      const createProjectJson = (await createProjectRes.json()) as CreateProjectOk | ApiError;
      if (!createProjectJson.success) {
        setError(createProjectJson.error.message);
        return;
      }

      const projectId = createProjectJson.data.project.id;
      setCreatedProjectId(projectId);
      setCreatedProjectName(createProjectJson.data.project.name);

      const createKeyRes = await fetch(`/api/v1/projects/${projectId}/keys`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: "Default key" }),
      });

      const createKeyJson = (await createKeyRes.json()) as CreateKeyOk | ApiError;
      if (!createKeyJson.success) {
        setError(createKeyJson.error.message);
        return;
      }

      setApiKey(createKeyJson.data.apiKey);
      await refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(projectId: string) {
    setError(null);
    setDeletingProjectId(projectId);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
      const json = (await res.json()) as { success: true } | ApiError;
      if (!json.success) {
        setError(json.error.message);
        return;
      }
      if (createdProjectId === projectId) {
        setCreatedProjectId(null);
        setCreatedProjectName(null);
        setApiKey(null);
      }
      await refresh();
    } catch {
      setError("Failed to delete project.");
    } finally {
      setDeletingProjectId(null);
    }
  }

  const snippet = `import { QueueMonitor } from '@qcanary/agent'

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,
  queues: [emailQueue, reportQueue],
  includePayload: false,
  flushInterval: 5000,
  environment: '${environment.trim() || "production"}'
})
`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to Qcanary</h1>
        <p className="mt-2 text-text-muted">
          Create your first project and start monitoring your BullMQ queues. Your Redis credentials never leave your infrastructure.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create your first project</CardTitle>
          <CardDescription>This project becomes the container for queues, events, and alert rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={createProjectAndKey}>
            <div className="grid gap-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. qcanary-prod"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="environment">Environment</Label>
              <Input
                id="environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="production"
                autoComplete="off"
              />
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create project + API key"}
              </Button>
              {createdProjectId && (
                <Link
                  href={`/${createdProjectId}`}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface/80"
                >
                  Go to dashboard
                </Link>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-text-muted">
          You’ll only see the plaintext API key once. Store it as an environment variable.
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing projects</CardTitle>
          <CardDescription>Delete unused projects and associated API keys, events, and alert rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {projectsLoading ? (
            <div className="text-sm text-text-muted">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-text-muted">No projects yet.</div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-text-primary">{project.name}</div>
                  <div className="text-xs text-text-muted font-mono">{project.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${project.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-xs text-text-primary hover:bg-surface/80"
                  >
                    Open
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingProjectId === project.id}
                    onClick={() => void deleteProject(project.id)}
                  >
                    {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {createdProjectId && apiKey && (
        <Card>
          <CardHeader>
            <CardTitle>Install the agent (3 lines)</CardTitle>
            <CardDescription>
              Project: <span className="text-text-primary">{createdProjectName ?? createdProjectId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-text-muted">1) Set your API key</div>
            <CodeBlock>{`QCANARY_API_KEY=${apiKey}`}</CodeBlock>

            <Separator className="my-6" />

            <div className="text-sm text-text-muted">2) Add the monitor to your BullMQ app</div>
            <CodeBlock>{snippet}</CodeBlock>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
