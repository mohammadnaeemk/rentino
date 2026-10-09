/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";

import { api, ApiRequestError } from "@/lib/api";
import { useApiList } from "@/hooks/useApi";

import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TableRowSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyStates";
import { PaginationControls } from "@/components/ui/pagination-controls";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { BlogPost } from "@/types";

export default function AdminBlogPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");

  const query = `/admin/blog?page=${page}&limit=10${
    status !== "all" ? `&status=${status.toUpperCase()}` : ""
  }`;
  const { data, meta, loading, error, refetch } = useApiList<BlogPost>(query);

  // IMPORTANT:
  // useApiList may return undefined before the API response arrives.
  // Always keep posts as an array.
  const posts = data ?? [];
  console.log("FILTER:", status);
  console.log("QUERY:", query);
  console.log("POSTS:", posts);
  console.log("META:", meta);
  const togglePublish = async (post: BlogPost) => {
    try {
      await api.patch(
        `/admin/blog/${post.id}/${post.isPublished ? "unpublish" : "publish"}`,
      );

      toast.success(
        post.isPublished ? "Moved back to draft" : "Post published",
      );

      refetch();
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError ? err.message : "Could not update post",
      );
    }
  };

  const removePost = async (id: string) => {
    try {
      await api.delete(`/admin/blog/${id}`);

      toast.success("Post deleted");

      refetch();
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError ? err.message : "Could not delete post",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Blog posts</h1>

          <p className="mt-1 text-sm text-muted">
            Create, manage, and publish articles for the LensLoop journal.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <Tabs
          value={status}
          onValueChange={(value) => {
            if (value === "all" || value === "published" || value === "draft") {
              setStatus(value);
              setPage(1);
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>

            <TabsTrigger value="published">Published</TabsTrigger>

            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {!loading && posts.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="No posts yet"
              description="Write your first article for the GearUp journal."
              action={
                <Button asChild>
                  <Link href="/dashboard/admin/blog/new">New post</Link>
                </Button>
              }
              className="border-0"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRowSkeleton key={index} cols={5} />
                    ))
                  : posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="max-w-[260px] truncate font-medium">
                          {post.title}
                        </TableCell>

                        <TableCell className="text-sm text-stone-500">
                          {post.category}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={post.isPublished ? "success" : "secondary"}
                          >
                            {post.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm text-stone-500">
                          {formatDate(post.updatedAt)}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {/* Publish / Unpublish */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePublish(post)}
                            >
                              {post.isPublished ? "Unpublish" : "Publish"}
                            </Button>

                            {/* Edit */}
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                href={`/dashboard/admin/blog/${post.id}/edit`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>

                            {/* Delete */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-rust-500 hover:text-rust-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete "{post.title}"?
                                  </AlertDialogTitle>

                                  <AlertDialogDescription>
                                    This can't be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                                  <AlertDialogAction
                                    onClick={() => removePost(post.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <PaginationControls
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
