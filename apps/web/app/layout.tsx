import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = process.env.RAILWAY_STATIC_URL
  ? `https://${process.env.RAILWAY_STATIC_URL}`
  : "https://qcanary.dev";
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
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K86LMK6NE6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-K86LMK6NE6');
          `}
        </Script>
      </head>
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
          <PostHogProvider>{children}</PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
