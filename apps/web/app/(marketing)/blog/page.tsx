import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";

import MarketingNav from "@/components/MarketingNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBlogPosts } from "./posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qcanary.dev";

export const metadata: Metadata = {
  title: "QCanary Blog",
  description: "Technical writing about BullMQ monitoring, Redis queue observability, and production background jobs.",
  openGraph: {
    title: "QCanary Blog — BullMQ Monitoring & Queue Observability",
    description:
      "Technical writing about BullMQ monitoring, Redis queue observability, and production background jobs.",
  },
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <MarketingNav showCompare={false} />

      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">QCanary Blog</h1>
          <p className="mt-3 text-text-muted">
            Practical notes on BullMQ monitoring, Redis-safe observability, and production queue operations.
          </p>
        </div>

        <div className="grid gap-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="transition-colors hover:border-accent/50">
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>{post.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <time className="text-xs text-text-muted" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
            ],
          }),
        }}
      />
    </main>
  );
}
