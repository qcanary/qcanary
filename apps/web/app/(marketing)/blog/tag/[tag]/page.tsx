import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import MarketingNav from "@/components/MarketingNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBlogPosts } from "../../posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qcanary.dev";

type TagPageProps = {
  params: {
    tag: string;
  };
};

export async function generateStaticParams(): Promise<Array<{ tag: string }>> {
  const posts = await getAllBlogPosts();
  const tags = new Set(posts.flatMap((p) => p.tags));
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  return {
    title: `${params.tag.charAt(0).toUpperCase() + params.tag.slice(1)} posts | QCanary Blog`,
    description: `Posts about ${params.tag} on the QCanary blog — production tips, security insights, and BullMQ best practices.`,
    alternates: {
      canonical: `${siteUrl}/blog/tag/${params.tag}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = params.tag.toLowerCase();
  const allPosts = await getAllBlogPosts();
  const posts = allPosts.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(tag));

  if (posts.length === 0) {
    notFound();
  }

  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav showCompare={false} />

      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="mb-2">
          <Link href="/blog" className="text-sm text-accent hover:underline">
            &larr; Back to all posts
          </Link>
        </div>
        <div className="mb-8 max-w-2xl mt-4">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl capitalize">{tag}</h1>
          <p className="mt-3 text-text-muted">
            {posts.length} {posts.length === 1 ? "post" : "posts"} tagged with &ldquo;{tag}&rdquo;
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-text-muted">No posts found with this tag.</p>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="transition-colors hover:border-accent/50">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-3">
                      <time className="text-xs text-text-muted" dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                      <span className="text-xs text-text-muted">&middot;</span>
                      <span className="text-xs text-text-muted">{post.readingTime} min read</span>
                      <span className="text-xs text-text-muted">&middot;</span>
                      <span className="text-xs text-text-muted">{post.author}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
