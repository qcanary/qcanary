import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Free Pro Access — Feedback Program | QCanary",
  description:
    "Get free QCanary Pro for 3 months. All we ask is 15 minutes of your honest feedback. Built for BullMQ teams who care about security.",
  alternates: {
    canonical: `${siteUrl}/feedback`,
  },
  openGraph: {
    title: "Free Pro Access — Feedback Program | QCanary",
    description:
      "Get free QCanary Pro for 3 months. All we ask is 15 minutes of your honest feedback.",
    url: `${siteUrl}/feedback`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Pro Access — Feedback Program | QCanary",
    description:
      "Get free QCanary Pro for 3 months. All we ask is 15 minutes of your honest feedback.",
  },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
