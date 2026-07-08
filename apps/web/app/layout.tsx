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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";
const siteDescription =
  "Monitor BullMQ queues without sharing Redis credentials. QCanary streams job metadata through a lightweight agent for real-time dashboards, alerts, and history.";
const ogImage = "/opengraph-image";
const siteName = "Qcanary — BullMQ Monitoring Dashboard";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s — Qcanary`,
  },
  description: siteDescription,
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
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "QCanary - Monitor BullMQ queues without sharing Redis credentials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
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
        {/* Preconnect hints */}
        <link rel="preconnect" href="https://clerk.accounts.dev" />
        <link rel="preconnect" href="https://app.posthog.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "QCanary",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Linux, macOS, Windows",
              description:
                "Monitor BullMQ queues without sharing Redis credentials. An agent-based monitoring tool that attaches to QueueEvents inside your worker process.",
              url: siteUrl,
              sameAs: [
                "https://github.com/qcanary/qcanary",
                "https://x.com/qcanary",
              ],
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free tier available. Starter $9/mo, Pro $24/mo.",
              },
              author: {
                "@type": "Organization",
                name: "QCanary",
                url: siteUrl,
              },
            }),
          }}
        />

{/* Google Analytics — only loaded when NEXT_PUBLIC_GA_ID is set */}
{process.env.NEXT_PUBLIC_GA_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      strategy="afterInteractive"
    />
    <Script
      id="google-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `,
      }}
    />
  </>
)}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0A0A0A] text-[#FAFAFA]`}>
        {/* Skip-to-content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:shadow-lg"
        >
          Skip to content
        </a>
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
