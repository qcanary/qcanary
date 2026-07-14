import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";

import MarketingNav from "@/components/MarketingNav";
import { Badge } from "@/components/ui/badge";
import { getAllBlogPosts, type BlogPostMeta } from "./posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qcanary.dev";

export const metadata: Metadata = {
  title: "QCanary Blog",
  description: "Technical writing about BullMQ monitoring, Redis queue observability, and production background jobs.",
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: "QCanary Blog — BullMQ Monitoring & Queue Observability",
    description:
      "Technical writing about BullMQ monitoring, Redis queue observability, and production background jobs.",
    url: `${siteUrl}/blog`,
  },
};

function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="card-hover rounded-xl border border-border bg-surface/40 p-6 transition-all">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 text-[10px] font-medium text-accent"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-[10px] text-text-muted">+{post.tags.length - 3}</span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-2">
          {post.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readingTime} min read</span>
          <span aria-hidden="true">&middot;</span>
          <span>{post.author}</span>
        </div>
      </article>
    </Link>
  );
}

export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav showCompare={false} />

      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">QCanary Blog</h1>
              <p className="mt-3 text-text-muted">
                Production tips, security insights, and BullMQ best practices.
              </p>
            </div>
            <a
              href="/blog/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs text-text-muted hover:text-accent hover:border-accent/30 transition-all sm:inline-flex"
              title="Subscribe via RSS"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.199 24C19.199 13.467 10.533 4.801 0 4.801V0c13.256 0 24 10.744 24 24h-4.801zM12.449 24c0-6.9-5.55-12.449-12.449-12.449v-4.47c9.374 0 16.92 7.546 16.92 16.92h-4.471zM4.801 19.199c-2.577 0-4.801 2.224-4.801 4.801s2.224 4.801 4.801 4.801 4.801-2.224 4.801-4.801-2.224-4.801-4.801-4.801z" />
              </svg>
              RSS
            </a>
          </div>

          {/* Tag filter buttons */}
          {allTags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${tag}`}>
                  <Badge
                    variant="outline"
                    className="border-border text-text-muted hover:border-accent/30 hover:text-accent cursor-pointer transition-colors"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {posts.length === 0 ? (
            <p className="text-text-muted col-span-full">No posts yet. Check back soon!</p>
          ) : (
            posts.map((post) => <PostCard key={post.slug} post={post} />)
          )}
        </div>

        {/* Mobile RSS link */}
        <div className="mt-8 text-center sm:hidden">
          <a
            href="/blog/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.199 24C19.199 13.467 10.533 4.801 0 4.801V0c13.256 0 24 10.744 24 24h-4.801zM12.449 24c0-6.9-5.55-12.449-12.449-12.449v-4.47c9.374 0 16.92 7.546 16.92 16.92h-4.471zM4.801 19.199c-2.577 0-4.801 2.224-4.801 4.801s2.224 4.801 4.801 4.801 4.801-2.224 4.801-4.801-2.224-4.801-4.801-4.801z" />
            </svg>
            Subscribe via RSS
          </a>
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
