"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to subscribe");
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  if (submitted) {
    return (
      <section className="border-y border-border bg-surface/30">
        <div className="mx-auto w-full max-w-2xl px-6 py-12 text-center">
          <p className="text-sm text-accent">Thanks! Check your inbox for the BullMQ monitoring guide.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-border bg-surface/30">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 text-center">
        <h3 className="text-lg font-semibold text-text-primary">Get the BullMQ Production Checklist</h3>
        <p className="mt-1 text-sm text-text-muted">7 things to check before your queue hits production. Free, no spam.</p>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1" />
          <Button type="submit" size="sm">Get the checklist</Button>
        </form>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
    </section>
  );
}