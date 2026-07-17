/**
 * Onboarding page â€” new user flow
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
import { HelpCircle } from "lucide-react";
import { useTeamProjects } from "../_providers/TeamProjectProvider";
import { trackEvent } from "@/components/PostHogProvider";

type ApiError = { success: false; error: { code: string; message: string } };
type CreateProjectOk = {
  success: true;
  data: { project: { id: string; name: string; environment: string } };
};
type CreateKeyOk = {
  success: true;
  data: { apiKey: string; key: { id: string; keyPrefix: string } };
};

function CodeBlock({ children, apiKey }: { children: string; apiKey?: string }) {
  const [copied, setCopied] = React.useState(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(apiKey ?? children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not supported
    }
  }

  // Auto-select API key text on mount
  React.useEffect(() => {
    if (apiKey && preRef.current) {
      const range = document.createRange();
      range.selectNodeContents(preRef.current);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [apiKey]);

  return (
    <div className="relative mt-3">
      <pre
        ref={preRef}
        className="overflow-auto rounded-md border border-border bg-code-bg p-4 text-xs text-text-primary font-mono select-all cursor-text"
      >
        {children}
      </pre>
      {apiKey && (
        <button
          onClick={() => void handleCopy()}
          className="absolute right-2 top-2 rounded-md bg-accent px-2 py-1 text-xs font-medium text-black transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label={copied ? "Copied" : "Copy API key to clipboard"}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
    </div>
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
  const [sendingTestEvent, setSendingTestEvent] = React.useState(false);
  const [testEventSent, setTestEventSent] = React.useState(false);
  const [testEventError, setTestEventError] = React.useState<string | null>(null);

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
      trackEvent("project_created", { projectId, environment: environment.trim() || "production" });
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

  async function sendTestEvent() {
    setTestEventError(null);
    setSendingTestEvent(true);
    try {
      const now = new Date().toISOString();
      const testEvents = {
        events: [
          {
            queueName: "email-notifications",
            jobId: crypto.randomUUID(),
            jobName: "send-welcome-email",
            eventType: "completed",
            status: "completed",
            durationMs: 234,
            environment: environment.trim() || "production",
            timestamp: now,
          },
          {
            queueName: "email-notifications",
            jobId: crypto.randomUUID(),
            jobName: "send-welcome-email",
            eventType: "completed",
            status: "completed",
            durationMs: 189,
            environment: environment.trim() || "production",
            timestamp: now,
          },
          {
            queueName: "process-payments",
            jobId: crypto.randomUUID(),
            jobName: "charge-customer",
            eventType: "completed",
            status: "completed",
            durationMs: 1245,
            environment: environment.trim() || "production",
            timestamp: now,
          },
          {
            queueName: "email-notifications",
            jobId: crypto.randomUUID(),
            jobName: "send-verification-email",
            eventType: "failed",
            status: "failed",
            errorMessage: "Connection refused: SMTP server at smtp.example.com:587",
            durationMs: 5432,
            attempts: 3,
            environment: environment.trim() || "production",
            timestamp: now,
          },
        ],
      };

      const res = await fetch("/api/v1/ingest", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey!,
        },
        body: JSON.stringify(testEvents),
      });

      const json = (await res.json()) as { success: true } | ApiError;
      if (!json.success) throw new Error(json.error.message);

      setTestEventSent(true);
      trackEvent("test_event_sent", { projectId: createdProjectId! });
    } catch (e) {
      setTestEventError(e instanceof Error ? e.message : "Failed to send test event. Check that your agent is connected.");
    } finally {
      setSendingTestEvent(false);
    }
  }

  const escapedEnv = (environment.trim() || "production").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$").replace(/\{/g, "\\{");
  const snippet = `import { QueueMonitor } from '@qcanary/agent'

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,
  queues: [emailQueue, reportQueue],
  includePayload: false,
  flushInterval: 5000,
  environment: '${escapedEnv}'
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
              <div className="flex items-center gap-1.5">
                <Label htmlFor="projectName">Project name</Label>
                <span
                  className="inline-flex items-center justify-center rounded-full text-text-muted cursor-help"
                  title="A descriptive name to identify this project in your dashboard. Example: qcanary-prod"
                  aria-label="Help: Project name"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
              </div>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. qcanary-prod"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="environment">Environment</Label>
                <span
                  className="inline-flex items-center justify-center rounded-full text-text-muted cursor-help"
                  title="The deployment stage â€” typically production, staging, or development. Events are tagged for filtering."
                  aria-label="Help: Environment"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
              </div>
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
                {loading ? "Creatingâ€¦" : "Create project + API key"}
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
          You&rsquo;ll only see the plaintext API key once. Store it as an environment variable.
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
                    onClick={() => {
                      const escapedName = project.name.replace(/['"\\<>]/g, '');
                      if (window.confirm(`Delete "${escapedName}"? This will permanently remove the project, all API keys, events, and alert rules. This cannot be undone.`)) {
                        void deleteProject(project.id);
                      }
                    }}
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
            <CodeBlock apiKey={apiKey}>{`QCANARY_API_KEY=${apiKey}`}</CodeBlock>

            <Separator className="my-6" />

            <div className="text-sm text-text-muted">2) Add the monitor to your BullMQ app</div>
            <CodeBlock>{snippet}</CodeBlock>
          </CardContent>
        </Card>
      )}

      {createdProjectId && apiKey && !testEventSent && (
        <Card>
          <CardHeader>
            <CardTitle>Try it instantly</CardTitle>
            <CardDescription>
              Send sample queue events to see your dashboard come to life right now â€” no agent installation needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {testEventError && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {testEventError}
              </div>
            )}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => void sendTestEvent()}
                disabled={sendingTestEvent}
              >
                {sendingTestEvent ? "Sendingâ€¦" : "Send test events"}
              </Button>
              {sendingTestEvent && (
                <span className="text-sm text-text-muted">Generating sample queue activityâ€¦</span>
              )}
            </div>
            <div className="text-xs text-text-muted">
              Sends 4 sample events across 2 queues (email-notifications, process-payments) including a simulated failure.
            </div>
          </CardContent>
        </Card>
      )}

      {createdProjectId && apiKey && testEventSent && (
        <Card>
          <CardHeader>
            <CardTitle>Events sent successfully! ðŸŽ‰</CardTitle>
            <CardDescription>
              4 sample events have been ingested. Head to your dashboard to see queues, stats, and failures in action.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={`/${createdProjectId}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-6 py-2 text-sm font-medium text-black hover:bg-accent/90"
            >
              Go to dashboard
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}