import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

// Dynamic blog post slugs — add new posts here or fetch from a source
const blogPostSlugs = [
  "monitor-bullmq-without-exposing-redis",
  "bull-board-vs-hosted-monitoring",
  "how-to-monitor-bullmq-without-exposing-redis",
  "how-to-monitor-bullmq-in-production",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/docs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPostSlugs.map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7 as const,
    })),
    {
      url: `${siteUrl}/sign-in`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/sign-up`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  return entries;
}
