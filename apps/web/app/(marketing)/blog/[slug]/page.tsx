import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BrandLockup } from "@/components/Brand";
import { getAllBlogPosts, getBlogPost } from "../posts";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);
  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <nav className="border-b border-border bg-bg/80">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <BrandLockup href="/" size="md" />
          <Link href="/blog" className="text-sm text-text-muted hover:text-text-primary">
            Blog
          </Link>
        </div>
      </nav>

      <article className="mx-auto w-full max-w-3xl px-6 py-14">
        <Link href="/blog" className="text-sm text-accent hover:underline">
          Back to blog
        </Link>
        <header className="mt-6 border-b border-border pb-8">
          <time className="text-xs text-text-muted" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{post.title}</h1>
          <p className="mt-4 text-lg text-text-muted">{post.description}</p>
        </header>

        <div
          className="prose prose-invert prose-green mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
