"use client";

import * as React from "react";
import { Heart, Shield } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestimonialPage() {
  const [formState, setFormState] = React.useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const [testimonialText, setTestimonialText] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: "submitting", message: "" });

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      company: (form.elements.namedItem("company") as HTMLInputElement).value,
      linkedinUrl: (form.elements.namedItem("linkedinUrl") as HTMLInputElement).value,
      testimonial: testimonialText,
      recommendation: (form.elements.namedItem("recommendation") as HTMLInputElement)?.value || "",
      canDisplay: (form.elements.namedItem("canDisplay") as HTMLInputElement).checked,
      canUseLogo: (form.elements.namedItem("canUseLogo") as HTMLInputElement).checked,
    };

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.qcanary.dev";
      const res = await fetch(`${apiBase}/v1/testimonials/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result?.error?.message || "Something went wrong. Please try again.";
        setFormState({ status: "error", message: errorMsg });
        return;
      }

      setFormState({ status: "success", message: result?.message || "Thank you!" });
      form.reset();
      setTestimonialText("");
    } catch {
      setFormState({ status: "error", message: "Network error. Please check your connection and try again." });
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav showCompare={false} showBlog={false} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">

        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <Badge variant="outline" className="mb-6 border-accent/40 text-accent animate-fade-in-up">
            Share Your Experience
          </Badge>
          <h1 className="animate-fade-in-up-delay-1 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            How has QCanary worked <span className="text-highlight">for you?</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-4 max-w-xl text-base text-text-muted md:text-lg">
            Your feedback helps us improve and helps other teams decide if QCanary is right for them.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-2xl px-6 py-16 md:py-20">
          {formState.status === "success" ? (
            <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-surface/20 p-8 text-center">
              <Heart className="mx-auto mb-4 h-10 w-10 text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">Thank you!</h3>
              <p className="mt-2 text-sm text-text-muted">
                We&rsquo;ll review your testimonial and reach out if we have questions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" name="name" required placeholder="Jane Smith" />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Your Title</Label>
                <Input id="title" name="title" required placeholder="Senior Backend Engineer" />
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <Label htmlFor="company">Your Company</Label>
                <Input id="company" name="company" required placeholder="Acme Corp" />
              </div>

              {/* LinkedIn (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="linkedinUrl">
                  LinkedIn Profile URL <span className="text-text-muted">(optional — for verification)</span>
                </Label>
                <Input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/janesmith" />
              </div>

              {/* Testimonial */}
              <div className="space-y-1.5">
                <Label htmlFor="testimonial">Your Testimonial</Label>
                <textarea
                  id="testimonial"
                  name="testimonial"
                  required
                  rows={5}
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  minLength={100}
                  maxLength={1000}
                  placeholder="What problem did QCanary solve for you? How long did setup take? What would you tell a colleague?"
                  className="flex w-full rounded-xl border border-border bg-[#0B0B0B] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                />
                <div className={`text-right text-xs ${testimonialText.length < 100 && testimonialText.length > 0 ? "text-red-400" : "text-text-muted"}`}>
                  {testimonialText.length} / 1000
                  {testimonialText.length > 0 && testimonialText.length < 100 && (
                    <span className="ml-2">(minimum 100 characters)</span>
                  )}
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-2">
                <Label>Would you recommend QCanary?</Label>
                <div className="flex flex-wrap gap-3">
                  {["definitely", "probably", "maybe", "no"].map((value) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recommendation"
                        value={value}
                        required
                        className="h-4 w-4 text-accent focus:ring-accent/70 border-border bg-[#0B0B0B]"
                      />
                      <span className="text-sm capitalize text-text-primary">{value}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Display checkbox */}
              <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
                <input
                  id="canDisplay"
                  name="canDisplay"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 shrink-0 rounded border-border bg-[#0B0B0B] text-accent focus:ring-accent/70"
                />
                <Label htmlFor="canDisplay" className="text-sm text-text-primary">
                  Yes, you can use this testimonial on qcanary.dev
                </Label>
              </div>

              {/* Logo checkbox (optional) */}
              <div className="flex items-start gap-3 rounded-lg border border-border bg-surface/30 px-4 py-3">
                <input
                  id="canUseLogo"
                  name="canUseLogo"
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-border bg-[#0B0B0B] text-accent focus:ring-accent/70"
                />
                <Label htmlFor="canUseLogo" className="text-sm text-text-primary">
                  Yes, you can include my company logo <span className="text-text-muted">(optional)</span>
                </Label>
              </div>

              {/* Error */}
              {formState.status === "error" && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {formState.message}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={formState.status === "submitting" || testimonialText.length < 100}
              >
                {formState.status === "submitting" ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Testimonial"
                )}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Honesty Block */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-20">
          <Shield className="mx-auto mb-4 h-8 w-8 text-accent/60" />
          <p className="text-sm leading-relaxed text-text-muted md:text-base">
            We manually review every testimonial before publishing. We won&rsquo;t edit your words
            &mdash; what you write is what goes live. We may reach out to verify your identity
            before publishing.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
