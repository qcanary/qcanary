import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Share Your Experience | QCanary",
  description:
    "Tell us how QCanary helped your team. Real stories from real engineers.",
  alternates: {
    canonical: `${siteUrl}/testimonial`,
  },
  openGraph: {
    title: "Share Your Experience | QCanary",
    description:
      "Tell us how QCanary helped your team. Real stories from real engineers.",
    url: `${siteUrl}/testimonial`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Your Experience | QCanary",
    description:
      "Tell us how QCanary helped your team. Real stories from real engineers.",
  },
};

export default function TestimonialLayout({ children }: { children: ReactNode }) {
  return children;
}
