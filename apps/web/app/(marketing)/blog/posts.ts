import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type BlogPostMeta = {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  author: string;
  readingTime: number;
};

export type BlogPost = BlogPostMeta & {
  contentHtml: string;
};

/**
 * Estimate reading time from word count.
 */
function estimateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

const postsDirectory = path.join(process.cwd(), "marketing");

function isBlogPostMeta(data: Record<string, unknown>): data is BlogPostMeta {
  return (
    typeof data.title === "string" &&
    typeof data.description === "string" &&
    typeof data.date === "string" &&
    typeof data.slug === "string"
  );
}

async function readPostFile(filename: string): Promise<{ meta: BlogPostMeta; content: string }> {
  const fullPath = path.join(postsDirectory, filename);
  const fileContents = await fs.readFile(fullPath, "utf8");
  const parsed = matter(fileContents);

  if (!isBlogPostMeta(parsed.data)) {
    throw new Error(`Invalid blog frontmatter in ${filename}`);
  }

  const meta: BlogPostMeta = {
    title: parsed.data.title,
    description: parsed.data.description,
    date: parsed.data.date,
    slug: parsed.data.slug,
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    author: typeof parsed.data.author === "string" ? parsed.data.author : "QCanary Engineering",
    readingTime: typeof parsed.data.readingTime === "number" ? parsed.data.readingTime : estimateReadingTime(parsed.content),
  };

  return {
    meta,
    content: parsed.content,
  };
}

async function readMarkdownFilenames(): Promise<string[]> {
  try {
    const filenames = await fs.readdir(postsDirectory);
    return filenames.filter((filename) => filename.endsWith(".md"));
  } catch {
    // Directory doesn't exist yet — no posts
    return [];
  }
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const markdownFiles = await readMarkdownFilenames();
  const posts = await Promise.all(markdownFiles.map((filename) => readPostFile(filename)));

  return posts
    .map((post) => post.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const markdownFiles = await readMarkdownFilenames();

  for (const filename of markdownFiles) {
    const post = await readPostFile(filename);
    if (post.meta.slug !== slug) {
      continue;
    }

    const processedContent = await remark()
      .use(html, { sanitize: false })
      .process(post.content);

    return {
      ...post.meta,
      contentHtml: processedContent.toString(),
    };
  }

  return null;
}
