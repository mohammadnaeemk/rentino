import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { blogPosts as mockBlogPosts } from "@/lib/content";
import { formatJalali } from "@/lib/format";

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

  const livePost = await getBlogPost(slug);

  // Backend not available — fall back to bundled demo post.
  const mock = mockBlogPosts.find((p) => p.slug === slug);

  const post: BlogPost | null =
    livePost ??
    (mock
      ? {
          id: mock.slug,
          title: mock.title,
          slug: mock.slug,
          excerpt: mock.excerpt,
          content: mock.content,
          category: mock.category,
          createdAt: mock.date,
          publishedAt: mock.date,
        }
      : null);

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
            <span className="text-base">→</span>
            بازگشت به وبلاگ
          </Link>

          {/* Header */}
          <header className="mx-auto max-w-3xl text-center">
            {/* Category */}
            {post.category && (
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {post.category}
              </span>
            )}

            {/* Title */}
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.3] text-foreground sm:text-5xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
              {post.author?.name && (
                <>
                  <span>
                    نویسنده:{" "}
                    <span className="font-medium text-foreground">
                      {post.author.name}
                    </span>
                  </span>

                  {date && (
                    <span className="h-1 w-1 rounded-full bg-muted/50" />
                  )}
                </>
              )}

              {date && <time dateTime={date}>{formatJalali(date)}</time>}
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
              <div className="whitespace-pre-wrap text-[15px] leading-8 text-foreground/90 sm:text-base">
                {post.content}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-sm text-muted">
                  این نوشته هنوز محتوایی ندارد.
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
              <span>→</span>
              بازگشت به همه نوشته‌ها
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
