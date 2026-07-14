import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Enterprise & Self-Hosted | QCanary",
  description:
    "Deploy QCanary on-premise or in your VPC. SOC 2 Type II, SAML SSO, dedicated support, and full data control.",
  openGraph: {
    title: "Enterprise & Self-Hosted | QCanary",
    description:
      "Deploy QCanary on-premise or in your VPC. SOC 2 Type II, SAML SSO, dedicated support, and full data control.",
    url: `${siteUrl}/enterprise`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise & Self-Hosted | QCanary",
    description:
      "Deploy QCanary on-premise or in your VPC. Keep every byte of data under your control.",
  },
};

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
