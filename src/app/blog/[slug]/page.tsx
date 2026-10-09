import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  coverImage?: string;
  author?: {
    name?: string;
  };
  createdAt?: string;
  publishedAt?: string;
}

interface BlogResponse {
  success: boolean;
  data: BlogPost;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/blog/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      console.error(`Blog API request failed: /blog/${slug}`, response.status);

      return null;
    }

    const payload = (await response.json()) as BlogResponse;

    return payload.data ?? null;
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const date = post.publishedAt ?? post.createdAt;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <article className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* Back to Blog */}
          <Link
            href="/blog"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <span className="text-base">←</span>
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mx-auto max-w-3xl text-center">
            {/* Category */}
            {post.category && (
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {post.category}
              </span>
            )}

            {/* Title */}
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
              {post.author?.name && (
                <>
                  <span>
                    By{" "}
                    <span className="font-medium text-foreground">
                      {post.author.name}
                    </span>
                  </span>

                  {date && (
                    <span className="h-1 w-1 rounded-full bg-muted/50" />
                  )}
                </>
              )}

              {date && (
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              )}
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:mt-14">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-auto max-h-[560px] w-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="mx-auto mt-12 max-w-3xl sm:mt-16">
            {post.content ? (
              <div
                className="
                  whitespace-pre-wrap
                  text-[15px]
                  leading-8
                  text-foreground/90
                  sm:text-base
                  sm:leading-8
                "
              >
                {post.content}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-sm text-muted">
                  This article does not have any content yet.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Divider */}
          <div className="mx-auto mt-16 max-w-3xl border-t border-border pt-8 sm:mt-20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              <span>←</span>
              Back to all articles
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
