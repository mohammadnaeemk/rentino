"use client";

import { useParams } from "next/navigation";

import { BlogForm } from "@/components/dashboard/BlogForm";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPost } from "@/types";
import { useApi } from "@/hooks/useApi";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: post, loading, error } = useApi<BlogPost>(`/admin/blog/${id}`);

  if (loading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (error || !post)
    return <ErrorBanner message={error || "Post not found"} />;

  return <BlogForm existing={post} />;
}
