import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

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
  data: BlogPost[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      console.error("Blog API request failed:", response.status);
      return [];
    }

    const payload = (await response.json()) as BlogResponse;

    if (!payload.success || !Array.isArray(payload.data)) {
      return [];
    }

    return payload.data;
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold">Blog</h1>

        <p className="mt-2 text-muted">
          Guides and notes for renters and providers on LensLoop.
        </p>

        <div className="mt-10 space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => {
              const date = post.publishedAt ?? post.createdAt;

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block"
                >
                  <Card className="transition-colors hover:border-primary">
                    <CardContent className="p-6">
                      {date && (
                        <p className="text-xs uppercase tracking-wide text-muted">
                          {new Date(date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}

                      {post.category && (
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-primary">
                          {post.category}
                        </p>
                      )}

                      <h2 className="mt-2 font-display text-xl font-semibold">
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="mt-2 text-sm text-muted">
                          {post.excerpt}
                        </p>
                      )}

                      {post.author?.name && (
                        <p className="mt-4 text-xs text-muted">
                          By {post.author.name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <div className="rounded-xl border border-border p-8 text-center">
              <p className="text-muted">No blog posts available yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
