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
};

export type BlogPost = BlogPostMeta & {
  contentHtml: string;
};

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

  return {
    meta: parsed.data,
    content: parsed.content,
  };
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const filenames = await fs.readdir(postsDirectory);
  const markdownFiles = filenames.filter((filename) => filename.endsWith(".md"));
  const posts = await Promise.all(markdownFiles.map((filename) => readPostFile(filename)));

  return posts
    .map((post) => post.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts();
  const meta = posts.find((post) => post.slug === slug);
  if (!meta) {
    return null;
  }

  const filenames = await fs.readdir(postsDirectory);
  for (const filename of filenames.filter((item) => item.endsWith(".md"))) {
    const post = await readPostFile(filename);
    if (post.meta.slug !== slug) {
      continue;
    }

    const processedContent = await remark()
      .use(html, { sanitize: true })
      .process(post.content);

    return {
      ...post.meta,
      contentHtml: processedContent.toString(),
    };
  }

  return null;
}
