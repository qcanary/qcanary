"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Eye, Copy, Trash2 } from "lucide-react";
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

type TestimonialStatus = "pending" | "approved" | "rejected";

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedin_url: string | null;
  testimonial: string;
  recommendation: string;
  can_display: boolean;
  can_use_logo: boolean;
  status: TestimonialStatus;
  rejection_reason: string | null;
  edited_quote: string | null;
  created_at: string;
}

interface ListResponse {
  success: boolean;
  data: {
    testimonials: Testimonial[];
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

function statusBadge(status: TestimonialStatus) {
  const styles: Record<TestimonialStatus, string> = {
    pending: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    approved: "border-accent/30 text-accent bg-accent/10",
    rejected: "border-red-500/30 text-red-400 bg-red-500/10",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function recommendationLabel(value: string): string {
  const labels: Record<string, string> = {
    definitely: "Definitely",
    probably: "Probably",
    maybe: "Maybe",
    no: "No",
  };
  return labels[value] ?? value;
}

export default function TestimonialsDashboard() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [counts, setCounts] = React.useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewTestimonial, setViewTestimonial] = React.useState<Testimonial | null>(null);
  const [filter, setFilter] = React.useState<TestimonialStatus | "all">("all");
  const [actionMsg, setActionMsg] = React.useState<string | null>(null);

  async function loadTestimonials() {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/v1/testimonials${params}`);
      const json = (await res.json()) as ListResponse;
      if (!json.success) throw new Error("Failed to load");
      setTestimonials(json.data.testimonials);
      setCounts({ total: json.data.total, pending: json.data.pending, approved: json.data.approved, rejected: json.data.rejected });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: TestimonialStatus) {
    try {
      const res = await fetch(`/api/v1/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to update");
      setActionMsg(`Testimonial ${status}.`);
      setViewTestimonial(null);
      await loadTestimonials();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function deleteTestimonial(id: string) {
    if (!window.confirm("Delete this testimonial permanently?")) return;
    try {
      const res = await fetch(`/api/v1/testimonials/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to delete");
      setActionMsg("Testimonial deleted.");
      setViewTestimonial(null);
      await loadTestimonials();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  function copyAsHtml(t: Testimonial) {
    const quote = t.edited_quote || t.testimonial;
    const html = `<div className="testimonial">\n  <p>"${quote}"</p>\n  <p class="author">— ${t.name}, ${t.title} at ${t.company}</p>\n</div>`;
    navigator.clipboard.writeText(html).then(() => setActionMsg("HTML copied!")).catch(() => setActionMsg("Failed to copy"));
  }

  React.useEffect(() => { void loadTestimonials(); }, [filter]);

  // Clear action message after 3s
  React.useEffect(() => {
    if (!actionMsg) return;
    const timer = setTimeout(() => setActionMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [actionMsg]);

  const filteredList = filter === "all" ? testimonials : testimonials.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Testimonials</h1>
        <p className="mt-2 text-text-muted">Review, approve, and manage user testimonials.</p>
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
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: counts.total, color: "text-text-primary" },
          { label: "Pending", value: counts.pending, color: "text-amber-400" },
          { label: "Approved", value: counts.approved, color: "text-accent" },
          { label: "Rejected", value: counts.rejected, color: "text-red-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {loading ? <span className="animate-pulse">--</span> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface/50 p-1">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              filter === f
                ? "bg-accent text-black shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-surface/70"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Testimonial Table */}
      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="max-w-xs">Quote Preview</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-text-muted py-8">
                  Loading testimonials...
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-text-muted py-8">
                  No testimonials found.
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-text-muted">{t.company}</TableCell>
                  <TableCell className="max-w-xs truncate text-text-muted">
                    &ldquo;{t.testimonial.slice(0, 80)}&hellip;&rdquo;
                  </TableCell>
                  <TableCell>{recommendationLabel(t.recommendation)}</TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewTestimonial(t)}
                        title="View full"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {t.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void updateStatus(t.id, "approved")}
                            className="text-accent hover:text-accent"
                            title="Approve"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void updateStatus(t.id, "rejected")}
                            className="text-red-400 hover:text-red-300"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {t.status === "approved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAsHtml(t)}
                          className="text-text-muted hover:text-accent"
                          title="Copy HTML"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void deleteTestimonial(t.id)}
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
      <Dialog open={!!viewTestimonial} onOpenChange={(open) => { if (!open) setViewTestimonial(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewTestimonial?.name}</DialogTitle>
            <DialogDescription>
              {viewTestimonial?.title} at {viewTestimonial?.company}
              {viewTestimonial?.linkedin_url && (
                <> &middot; <a href={viewTestimonial.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">LinkedIn</a></>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="rounded-lg border border-border bg-surface/30 p-4 text-sm leading-relaxed italic text-text-primary">
              &ldquo;{viewTestimonial?.testimonial}&rdquo;
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">Recommendation:</span>
              <span className="font-medium">{viewTestimonial ? recommendationLabel(viewTestimonial.recommendation) : ""}</span>
            </div>
            {viewTestimonial?.edited_quote && (
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-text-muted">
                <span className="font-medium text-accent">Edited version:</span> {viewTestimonial.edited_quote}
              </div>
            )}
            {viewTestimonial?.rejection_reason && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-text-muted">
                <span className="font-medium text-red-400">Rejection reason:</span> {viewTestimonial.rejection_reason}
              </div>
            )}
            <div className="text-xs text-text-muted">
              Submitted {viewTestimonial ? new Date(viewTestimonial.created_at).toLocaleString() : ""}
              &nbsp;&middot;&nbsp;{statusBadge(viewTestimonial?.status ?? "pending")}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {viewTestimonial?.status === "pending" && (
              <>
                <Button variant="secondary" onClick={() => { if (viewTestimonial) void updateStatus(viewTestimonial.id, "rejected"); setViewTestimonial(null); }}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button onClick={() => { if (viewTestimonial) void updateStatus(viewTestimonial.id, "approved"); setViewTestimonial(null); }}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                </Button>
              </>
            )}
            {viewTestimonial?.status === "approved" && (
              <Button variant="secondary" onClick={() => { if (viewTestimonial) copyAsHtml(viewTestimonial); }}>
                <Copy className="h-4 w-4 mr-1" /> Copy HTML
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
