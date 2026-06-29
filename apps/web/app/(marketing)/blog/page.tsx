import Link from "next/link";
import type { Metadata } from "next";

import { BrandLockup } from "@/components/Brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBlogPosts } from "./posts";

export const metadata: Metadata = {
  title: "QCanary Blog",
  description: "Technical writing about BullMQ monitoring, Redis queue observability, and production background jobs.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <nav className="border-b border-border bg-bg/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <BrandLockup href="/" size="md" />
          <Link href="/docs" className="text-sm text-text-muted hover:text-text-primary">
            Docs
          </Link>
        </div>
      </nav>

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
    </main>
  );
}
