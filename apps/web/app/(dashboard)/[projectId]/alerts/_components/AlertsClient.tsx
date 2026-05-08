"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ApiError = { success: false; error: { code: string; message: string } };

type AlertRule = {
  id: string;
  projectId: string;
  queueName: string | null;
  name: string;
  conditionType: "failure_rate" | "no_activity" | "queue_depth" | "job_duration";
  thresholdValue: number;
  windowMinutes: number;
  channel: "slack" | "email";
  destination: string;
  isActive: boolean;
  lastTriggeredAt: string | null;
  cooldownMinutes: number;
  createdAt: string;
};

type AlertHistory = {
  id: number;
  ruleId: string;
  projectId: string;
  triggeredAt: string;
  resolvedAt: string | null;
  details: Record<string, unknown>;
};

type RulesOk = { success: true; data: { rules: AlertRule[] } };
type HistoryOk = { success: true; data: { history: AlertHistory[] } };
type RuleOk = { success: true; data: { rule: AlertRule } };

type RuleFormState = {
  id: string | null;
  name: string;
  queueName: string;
  conditionType: AlertRule["conditionType"];
  thresholdValue: string;
  windowMinutes: string;
  cooldownMinutes: string;
  channel: AlertRule["channel"];
  destination: string;
  isActive: boolean;
};

type FormErrors = {
  name?: string;
  destination?: string;
  thresholdValue?: string;
  windowMinutes?: string;
  cooldownMinutes?: string;
};

const defaultForm: RuleFormState = {
  id: null,
  name: "",
  queueName: "",
  conditionType: "failure_rate",
  thresholdValue: "50",
  windowMinutes: "5",
  cooldownMinutes: "15",
  channel: "slack",
  destination: "",
  isActive: true,
};

function formatRelativeOrIso(iso: string | null): string {
  if (!iso) return "—";
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return iso;
  const diffMs = Date.now() - ts;
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return new Date(ts).toLocaleString();
}

function detailsText(details: Record<string, unknown>): string {
  const conditionType = typeof details.condition_type === "string" ? details.condition_type : "unknown";
  const actual = typeof details.actual_value === "number" ? details.actual_value : "—";
  const threshold = typeof details.threshold_value === "number" ? details.threshold_value : "—";
  const queue = typeof details.queue_name === "string" ? details.queue_name : "all queues";
  return `${conditionType} on ${queue} (${actual} / ${threshold})`;
}

function formFromRule(rule: AlertRule): RuleFormState {
  return {
    id: rule.id,
    name: rule.name,
    queueName: rule.queueName ?? "",
    conditionType: rule.conditionType,
    thresholdValue: String(rule.thresholdValue),
    windowMinutes: String(rule.windowMinutes),
    cooldownMinutes: String(rule.cooldownMinutes),
    channel: rule.channel,
    destination: rule.destination,
    isActive: rule.isActive,
  };
}

function validateDestination(channel: AlertRule["channel"], destinationRaw: string): string | null {
  const destination = destinationRaw.trim();
  if (!destination) {
    return "Destination is required.";
  }

  if (channel === "slack") {
    if (!destination.startsWith("https://hooks.slack.com/")) {
      return "Slack destination must start with https://hooks.slack.com/.";
    }
    return null;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(destination)) {
    return "Enter a valid email address.";
  }
  return null;
}

function friendlyTestError(message: string): string {
  if (
    message.toLowerCase().includes("invalid url") ||
    message.toLowerCase().includes("url") ||
    message.toLowerCase().includes("parse")
  ) {
    return "Test alert failed. Please check the destination format for this rule and try again.";
  }
  return message;
}

export function AlertsClient({ projectId }: { projectId: string }) {
  const [rules, setRules] = React.useState<AlertRule[] | null>(null);
  const [history, setHistory] = React.useState<AlertHistory[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<RuleFormState>(defaultForm);
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rulesRes, historyRes] = await Promise.all([
        fetch(`/api/v1/projects/${projectId}/alerts`, { cache: "no-store" }),
        fetch(`/api/v1/projects/${projectId}/alerts/history?limit=20`, { cache: "no-store" }),
      ]);
      const [rulesJson, historyJson] = (await Promise.all([rulesRes.json(), historyRes.json()])) as [
        RulesOk | ApiError,
        HistoryOk | ApiError
      ];
      if (!rulesJson.success) throw new Error(rulesJson.error.message);
      if (!historyJson.success) throw new Error(historyJson.error.message);
      setRules(rulesJson.data.rules);
      setHistory(historyJson.data.history);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function submitForm() {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    const destinationError = validateDestination(form.channel, form.destination);
    if (destinationError) {
      nextErrors.destination = destinationError;
    }

    const thresholdValue = Number(form.thresholdValue);
    const windowMinutes = Number(form.windowMinutes);
    const cooldownMinutes = Number(form.cooldownMinutes);

    if (!Number.isFinite(thresholdValue)) {
      nextErrors.thresholdValue = "Threshold must be a valid number.";
    }
    if (!Number.isInteger(windowMinutes) || windowMinutes < 1) {
      nextErrors.windowMinutes = "Window must be a positive integer.";
    }
    if (!Number.isInteger(cooldownMinutes) || cooldownMinutes < 0) {
      nextErrors.cooldownMinutes = "Cooldown must be zero or a positive integer.";
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        name: form.name.trim(),
        queueName: form.queueName.trim() || null,
        conditionType: form.conditionType,
        thresholdValue,
        windowMinutes,
        cooldownMinutes,
        channel: form.channel,
        destination: form.destination.trim(),
        isActive: form.isActive,
      };

      const isEdit = Boolean(form.id);
      const path = isEdit
        ? `/api/v1/projects/${projectId}/alerts/${form.id}`
        : `/api/v1/projects/${projectId}/alerts`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(path, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as RuleOk | ApiError;
      if (!json.success) throw new Error(json.error.message);

      setDialogOpen(false);
      setForm(defaultForm);
      setFormErrors({});
      setMessage(isEdit ? "Rule updated." : "Rule created.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save rule.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleRule(rule: AlertRule, isActive: boolean) {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/alerts/${rule.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const json = (await res.json()) as RuleOk | ApiError;
      if (!json.success) throw new Error(json.error.message);
      setRules((prev) =>
        (prev ?? []).map((r) => {
          if (r.id !== rule.id) return r;
          return { ...r, isActive };
        })
      );
      setMessage(`Rule ${isActive ? "enabled" : "disabled"}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update rule.");
    }
  }

  async function sendTest(ruleId: string) {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/alerts/test`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ruleId }),
      });
      const json = (await res.json()) as { success: true } | ApiError;
      if (!json.success) throw new Error(json.error.message);
      setMessage("Test alert sent.");
      await load();
    } catch (e) {
      const message = e instanceof Error ? friendlyTestError(e.message) : "Failed to send test alert.";
      setError(message);
    }
  }

  async function deleteRule(ruleId: string) {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/alerts/${ruleId}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { success: true; data: { deleted: true; id: string } } | ApiError;
      if (!json.success) throw new Error(json.error.message);
      setRules((prev) => (prev ?? []).filter((rule) => rule.id !== ruleId));
      setMessage("Rule deleted.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete rule.");
    }
  }

  function openCreateDialog() {
    setForm(defaultForm);
    setFormErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(rule: AlertRule) {
    setForm(formFromRule(rule));
    setFormErrors({});
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Alerts</h1>
          <p className="mt-2 text-text-muted">
            Configure rules for Slack and email notifications for <span className="font-mono text-text-primary">{projectId}</span>.
          </p>
        </div>
        <Button onClick={openCreateDialog}>Create rule</Button>
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Request failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {message && (
        <Card>
          <CardContent className="pt-6 text-sm text-text-primary">{message}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alert rules</CardTitle>
          <CardDescription>Toggle active state, edit settings, and send a test alert.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !rules ? (
            <div className="text-sm text-text-muted">Loading rules…</div>
          ) : !rules || rules.length === 0 ? (
            <div className="text-sm text-text-muted">No alert rules yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Last triggered</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="font-medium">{rule.name}</div>
                      <div className="mt-1 text-xs text-text-muted">
                        {rule.queueName ? `queue: ${rule.queueName}` : "all queues"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{rule.conditionType}</div>
                      <div className="mt-1 text-xs text-text-muted">
                        threshold {rule.thresholdValue} · window {rule.windowMinutes}m · cooldown {rule.cooldownMinutes}m
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.channel === "slack" ? "success" : "outline"}>{rule.channel}</Badge>
                      <div className="mt-1 max-w-[320px] truncate text-xs text-text-muted">{rule.destination}</div>
                    </TableCell>
                    <TableCell className="text-xs text-text-muted">{formatRelativeOrIso(rule.lastTriggeredAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Switch checked={rule.isActive} onCheckedChange={(checked) => void toggleRule(rule, checked)} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditDialog(rule)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => void sendTest(rule.id)}>
                          Send test
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => void deleteRule(rule.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert history</CardTitle>
          <CardDescription>Last 20 triggers across this project.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !history ? (
            <div className="text-sm text-text-muted">Loading history…</div>
          ) : !history || history.length === 0 ? (
            <div className="text-sm text-text-muted">No alert triggers yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => {
                  const deliverySuccess = entry.details.delivery_success === true;
                  const deliveryError =
                    typeof entry.details.delivery_error === "string" ? entry.details.delivery_error : null;
                  const ruleName = typeof entry.details.rule_name === "string" ? entry.details.rule_name : entry.ruleId;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs text-text-muted">{formatRelativeOrIso(entry.triggeredAt)}</TableCell>
                      <TableCell className="font-medium">{ruleName}</TableCell>
                      <TableCell className="text-xs text-text-muted">{detailsText(entry.details)}</TableCell>
                      <TableCell>
                        <Badge variant={deliverySuccess ? "success" : "danger"}>
                          {deliverySuccess ? "delivered" : "failed"}
                        </Badge>
                        {deliveryError && <div className="mt-1 text-xs text-text-muted">{deliveryError}</div>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit alert rule" : "Create alert rule"}</DialogTitle>
            <DialogDescription>Use Slack webhook URL or destination email for delivery.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rule-name">Name</Label>
              <Input
                id="rule-name"
                value={form.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({ ...prev, name: value }));
                  setFormErrors((prev) => ({ ...prev, name: value.trim() ? undefined : "Name is required." }));
                }}
                placeholder="High failure rate"
                aria-invalid={Boolean(formErrors.name)}
              />
              {formErrors.name && <p className="text-xs text-red-400">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rule-queue">Queue name (optional)</Label>
                <Input
                  id="rule-queue"
                  value={form.queueName}
                  onChange={(e) => setForm((prev) => ({ ...prev, queueName: e.target.value }))}
                  placeholder="emailQueue"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rule-condition">Condition type</Label>
                <select
                  id="rule-condition"
                  className="flex h-10 w-full rounded-md border border-border bg-[#0B0B0B] px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  value={form.conditionType}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, conditionType: e.target.value as AlertRule["conditionType"] }))
                  }
                >
                  <option value="failure_rate">failure_rate</option>
                  <option value="no_activity">no_activity</option>
                  <option value="queue_depth">queue_depth</option>
                  <option value="job_duration">job_duration</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="rule-threshold">Threshold</Label>
                <Input
                  id="rule-threshold"
                  type="number"
                  value={form.thresholdValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = Number(value);
                    setForm((prev) => ({ ...prev, thresholdValue: value }));
                    setFormErrors((prev) => ({
                      ...prev,
                      thresholdValue: Number.isFinite(num) ? undefined : "Threshold must be a valid number.",
                    }));
                  }}
                  aria-invalid={Boolean(formErrors.thresholdValue)}
                />
                {formErrors.thresholdValue && <p className="text-xs text-red-400">{formErrors.thresholdValue}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rule-window">Window (minutes)</Label>
                <Input
                  id="rule-window"
                  type="number"
                  value={form.windowMinutes}
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = Number(value);
                    setForm((prev) => ({ ...prev, windowMinutes: value }));
                    setFormErrors((prev) => ({
                      ...prev,
                      windowMinutes:
                        Number.isInteger(num) && num >= 1 ? undefined : "Window must be a positive integer.",
                    }));
                  }}
                  aria-invalid={Boolean(formErrors.windowMinutes)}
                />
                {formErrors.windowMinutes && <p className="text-xs text-red-400">{formErrors.windowMinutes}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rule-cooldown">Cooldown (minutes)</Label>
                <Input
                  id="rule-cooldown"
                  type="number"
                  value={form.cooldownMinutes}
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = Number(value);
                    setForm((prev) => ({ ...prev, cooldownMinutes: value }));
                    setFormErrors((prev) => ({
                      ...prev,
                      cooldownMinutes:
                        Number.isInteger(num) && num >= 0 ? undefined : "Cooldown must be zero or a positive integer.",
                    }));
                  }}
                  aria-invalid={Boolean(formErrors.cooldownMinutes)}
                />
                {formErrors.cooldownMinutes && <p className="text-xs text-red-400">{formErrors.cooldownMinutes}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rule-channel">Channel</Label>
                <select
                  id="rule-channel"
                  className="flex h-10 w-full rounded-md border border-border bg-[#0B0B0B] px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  value={form.channel}
                  onChange={(e) =>
                    setForm((prev) => {
                      const channel = e.target.value as AlertRule["channel"];
                      const destinationError = validateDestination(channel, prev.destination);
                      setFormErrors((currentErrors) => ({ ...currentErrors, destination: destinationError ?? undefined }));
                      return { ...prev, channel };
                    })
                  }
                >
                  <option value="slack">slack</option>
                  <option value="email">email</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rule-active">Active</Label>
                <div className="flex h-10 items-center rounded-md border border-border bg-[#0B0B0B] px-3">
                  <Switch
                    id="rule-active"
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <span className="ml-3 text-sm text-text-muted">{form.isActive ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rule-destination">Destination</Label>
              <Input
                id="rule-destination"
                value={form.destination}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({ ...prev, destination: value }));
                  const destinationError = validateDestination(form.channel, value);
                  setFormErrors((prev) => ({ ...prev, destination: destinationError ?? undefined }));
                }}
                placeholder={form.channel === "slack" ? "https://hooks.slack.com/..." : "alerts@example.com"}
                aria-invalid={Boolean(formErrors.destination)}
              />
              {formErrors.destination && <p className="text-xs text-red-400">{formErrors.destination}</p>}
            </div>
          </div>

          <DialogFooter className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-0">
            <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={() => void submitForm()} disabled={submitting}>
              {submitting ? "Saving…" : form.id ? "Save changes" : "Create rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
