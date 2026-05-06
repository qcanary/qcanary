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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0A0A0A] text-[#FAFAFA]`}>
        {publishableKey ? (
          <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
