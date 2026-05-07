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

export const metadata: Metadata = {
  title: "Qcanary — BullMQ Monitoring Dashboard",
  description:
    "Monitor your BullMQ job queues in real-time. Get alerts on failures, track queue health, and debug issues — without exposing your Redis credentials.",
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
