import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "./(marketing)/blog/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getAllBlogPosts();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: blogPosts.length > 0 ? new Date(blogPosts[0].date) : new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/docs`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7 as const,
    })),
    {
      url: `${siteUrl}/sign-in`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/sign-up`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  return entries;
}
