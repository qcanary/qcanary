import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = "https://qcanary.dev";
const siteName = "Qcanary — BullMQ Monitoring Dashboard";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s — Qcanary`,
  },
  description:
    "Monitor your BullMQ job queues in real-time. Get Slack alerts on failures, track queue health, and debug issues — without exposing your Redis credentials.",
  keywords: [
    "bullmq",
    "queue monitoring",
    "job queue",
    "node.js monitoring",
    "redis monitoring",
    "bullmq alerts",
    "background jobs",
    "queue observability",
  ],
  authors: [{ name: "Qcanary" }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: siteName,
    description:
      "Know when your BullMQ jobs fail. Before your users do. Slack alerts, job history, and queue health — no Redis credentials required.",
    url: siteUrl,
    siteName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description:
      "BullMQ monitoring with Slack alerts and job history. Install in 3 lines.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0A0A0A] text-[#FAFAFA]`}>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#22C55E",
              colorBackground: "#111111",
              colorText: "#FAFAFA",
              colorTextSecondary: "#71717A",
              colorInputBackground: "#0F0F0F",
              colorInputText: "#FAFAFA",
              colorDanger: "#F87171",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-inter)",
            },
            elements: {
              card: "bg-surface border border-border",
              headerTitle: "text-text-primary",
              headerSubtitle: "text-text-muted",
              formButtonPrimary: "bg-accent text-black hover:bg-accent/90",
              formFieldLabel: "text-text-primary",
              formFieldInput: "bg-code-bg text-text-primary border border-border",
              footerActionText: "text-text-muted",
              footerActionLink: "text-accent hover:opacity-90",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
