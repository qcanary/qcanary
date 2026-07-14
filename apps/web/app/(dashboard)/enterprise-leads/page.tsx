"use client";

import * as React from "react";
import { Eye, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type InquiryStatus = "new" | "contacted" | "qualified" | "closed-won" | "closed-lost";

interface EnterpriseInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  team_size: string;
  industry: string;
  current_setup: string;
  reason: string | null;
  deployment: string | null;
  timeline: string | null;
  status: InquiryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ListResponse {
  success: boolean;
  data: {
    inquiries: EnterpriseInquiry[];
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    "closed-won": number;
    "closed-lost": number;
  };
}

const STATUS_STYLES: Record<InquiryStatus, string> = {
  "new": "border-blue-500/30 text-blue-400 bg-blue-500/10",
  "contacted": "border-amber-500/30 text-amber-400 bg-amber-500/10",
  "qualified": "border-accent/30 text-accent bg-accent/10",
  "closed-won": "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  "closed-lost": "border-red-500/30 text-red-400 bg-red-500/10",
};

const STATUS_ORDER: InquiryStatus[] = ["new", "contacted", "qualified", "closed-won", "closed-lost"];

function statusBadge(status: InquiryStatus) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export default function EnterpriseDashboard() {
  const [inquiries, setInquiries] = React.useState<EnterpriseInquiry[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({ total: 0, new: 0, contacted: 0, qualified: 0, "closed-won": 0, "closed-lost": 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewInquiry, setViewInquiry] = React.useState<EnterpriseInquiry | null>(null);
  const [filter, setFilter] = React.useState<InquiryStatus | "all">("all");
  const [actionMsg, setActionMsg] = React.useState<string | null>(null);
  const [editNotes, setEditNotes] = React.useState("");
  const [savingNotes, setSavingNotes] = React.useState(false);

  async function loadInquiries() {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/v1/enterprise${params}`);
      const json = (await res.json()) as ListResponse;
      if (!json.success) throw new Error("Failed to load");
      setInquiries(json.data.inquiries);
      setCounts({
        total: json.data.total,
        new: json.data.new,
        contacted: json.data.contacted,
        qualified: json.data.qualified,
        "closed-won": json.data["closed-won"],
        "closed-lost": json.data["closed-lost"],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: InquiryStatus) {
    try {
      const res = await fetch(`/api/v1/enterprise/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to update");
      setActionMsg(`Status updated to "${status}".`);
      if (viewInquiry?.id === id) setViewInquiry((prev) => prev ? { ...prev, status } : null);
      await loadInquiries();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function saveNotes(id: string) {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/v1/enterprise/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to save");
      setActionMsg("Notes saved.");
      if (viewInquiry?.id === id) setViewInquiry((prev) => prev ? { ...prev, notes: editNotes } : null);
      await loadInquiries();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  }

  async function deleteInquiry(id: string) {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    try {
      const res = await fetch(`/api/v1/enterprise/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to delete");
      setActionMsg("Inquiry deleted.");
      setViewInquiry(null);
      await loadInquiries();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  function openView(inquiry: EnterpriseInquiry) {
    setViewInquiry(inquiry);
    setEditNotes(inquiry.notes || "");
  }

  React.useEffect(() => { void loadInquiries(); }, [filter]);

  // Clear action message after 3s
  React.useEffect(() => {
    if (!actionMsg) return;
    const timer = setTimeout(() => setActionMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [actionMsg]);

  const filteredList = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const statCards = [
    { label: "Total", key: "total", color: "text-text-primary" },
    { label: "New", key: "new", color: "text-blue-400" },
    { label: "Contacted", key: "contacted", color: "text-amber-400" },
    { label: "Qualified", key: "qualified", color: "text-accent" },
    { label: "Closed", key: "closed-won", color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Enterprise Leads</h1>
        <p className="mt-2 text-text-muted">Review, manage, and track enterprise inquiries.</p>
      </div>

      {/* Action toast */}
      {actionMsg && (
        <div className="animate-slide-in-right rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {actionMsg}
        </div>
      )}

      {error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-text-muted">{error}</CardContent>
        </Card>
      )}

      {/* Stats Bar */}
      <div className="grid gap-3 sm:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {loading ? <span className="animate-pulse">--</span> : (counts[stat.key] ?? 0)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface/50 p-1">
        {(["all", ...STATUS_ORDER] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              filter === f
                ? "bg-accent text-black shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-surface/70"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Inquiries Table */}
      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Team Size</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-text-muted">
                  Loading inquiries...
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-text-muted">
                  No inquiries found.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((inq) => (
                <TableRow key={inq.id}>
                  <TableCell className="font-medium">{inq.name}</TableCell>
                  <TableCell className="text-text-muted">{inq.company}</TableCell>
                  <TableCell className="text-text-muted">{inq.industry}</TableCell>
                  <TableCell className="text-text-muted">{inq.team_size}</TableCell>
                  <TableCell className="text-text-muted">{inq.timeline || "—"}</TableCell>
                  <TableCell>{statusBadge(inq.status)}</TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openView(inq)} title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <a href={`mailto:${inq.email}`}>
                        <Button variant="ghost" size="sm" className="text-text-muted hover:text-accent" title="Send email">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void deleteInquiry(inq.id)}
                        className="text-text-muted hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewInquiry} onOpenChange={(open) => { if (!open) setViewInquiry(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewInquiry?.name}</DialogTitle>
            <DialogDescription>
              {viewInquiry?.company}
              {viewInquiry?.industry && <> &middot; {viewInquiry.industry}</>}
            </DialogDescription>
          </DialogHeader>

          {viewInquiry && (
            <div className="space-y-4 py-2">
              {/* Contact info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface/30 p-3">
                  <span className="text-xs text-text-muted">Email</span>
                  <div className="mt-1 text-sm font-medium">
                    <a href={`mailto:${viewInquiry.email}`} className="text-accent hover:underline">
                      {viewInquiry.email}
                    </a>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-surface/30 p-3">
                  <span className="text-xs text-text-muted">Timeline</span>
                  <div className="mt-1 text-sm font-medium">{viewInquiry.timeline || "Just exploring"}</div>
                </div>
              </div>

              {/* Details */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface/30 p-3">
                  <span className="text-xs text-text-muted">Company</span>
                  <div className="mt-1 text-sm font-medium">{viewInquiry.company}</div>
                </div>
                <div className="rounded-lg border border-border bg-surface/30 p-3">
                  <span className="text-xs text-text-muted">Team Size</span>
                  <div className="mt-1 text-sm font-medium">{viewInquiry.team_size}</div>
                </div>
                <div className="rounded-lg border border-border bg-surface/30 p-3">
                  <span className="text-xs text-text-muted">Deployment</span>
                  <div className="mt-1 text-sm font-medium">{viewInquiry.deployment || "Not specified"}</div>
                </div>
                <div className="rounded-lg border border-border bg-surface/30 p-3">
                  <span className="text-xs text-text-muted">Industry</span>
                  <div className="mt-1 text-sm font-medium">{viewInquiry.industry}</div>
                </div>
              </div>

              {/* Current Setup */}
              <div className="rounded-lg border border-border bg-surface/30 p-3">
                <span className="text-xs text-text-muted">Current Queue Setup</span>
                <div className="mt-1 text-sm text-text-primary">{viewInquiry.current_setup}</div>
              </div>

              {viewInquiry.reason && (
                <div className="rounded-lg border border-border bg-surface/30 p-3">
                  <span className="text-xs text-text-muted">Why Self-Hosted?</span>
                  <div className="mt-1 text-sm text-text-primary">{viewInquiry.reason}</div>
                </div>
              )}

              {/* Status update */}
              <div>
                <Label className="text-xs text-text-muted">Status</Label>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void updateStatus(viewInquiry.id, s)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                        viewInquiry.status === s
                          ? `${STATUS_STYLES[s]} ring-1 ring-current`
                          : "text-text-muted hover:text-text-primary border border-border/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="ent-notes" className="text-xs text-text-muted">
                  Internal Notes
                </Label>
                <textarea
                  id="ent-notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="mt-1.5 flex w-full rounded-xl border border-border bg-[#0B0B0B] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 resize-y"
                  placeholder="Add internal notes about this lead..."
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  disabled={savingNotes}
                  onClick={() => void saveNotes(viewInquiry.id)}
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </div>

              <div className="text-xs text-text-muted">
                Submitted {new Date(viewInquiry.created_at).toLocaleString()}
                &nbsp;&middot;&nbsp;Updated {new Date(viewInquiry.updated_at).toLocaleString()}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <a href={`mailto:${viewInquiry?.email}`}>
              <Button variant="secondary">
                <Mail className="mr-1 h-4 w-4" /> Send Email
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
