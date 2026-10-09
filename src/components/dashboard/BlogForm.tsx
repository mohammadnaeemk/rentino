"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { api, ApiRequestError } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { blogFormSchema, BlogFormValues } from "@/lib/validations";

import { BlogPost } from "@/types";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function BlogForm({ existing }: { existing?: BlogPost }) {
  const router = useRouter();

  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),

    defaultValues: {
      title: existing?.title || "",
      excerpt: existing?.excerpt || "",
      content: existing?.content || "",
      coverImage: existing?.coverImage || "",
      category: existing?.category || "",
    },
  });

  // -----------------------------------------
  // Fetch categories from backend
  // -----------------------------------------

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get<Category[]>("/categories", {
          auth: false,
        });

        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);

        toast.error("Could not load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // -----------------------------------------
  // Create / Update blog post
  // -----------------------------------------

  const persist = async (values: BlogFormValues) => {
    const payload = {
      ...values,
      coverImage: values.coverImage || undefined,
    };

    // Update existing post
    if (existing) {
      await api.put(`/admin/blog/${existing.id}`, payload);

      return existing.id;
    }

    // Create new post
    const created = await api.post<{ id: string }>("/admin/blog", payload);

    return created.id;
  };

  // -----------------------------------------
  // Save as draft
  // -----------------------------------------

  const onSaveDraft = form.handleSubmit(async (values) => {
    setSavingDraft(true);

    try {
      await persist(values);

      toast.success("Draft saved");

      router.push("/dashboard/admin/blog");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError ? err.message : "Could not save draft",
      );
    } finally {
      setSavingDraft(false);
    }
  });

  // -----------------------------------------
  // Publish
  // -----------------------------------------

  const onPublish = form.handleSubmit(
    async (values) => {
      console.log("✅ PUBLISH VALIDATION PASSED");
      console.log("VALUES:", values);

      setPublishing(true);

      try {
        const id = await persist(values);

        console.log("✅ BLOG SAVED:", id);

        await api.patch(`/admin/blog/${id}/publish`);

        console.log("✅ BLOG PUBLISHED");

        toast.success("Post published");

        router.push("/dashboard/admin/blog");
      } catch (err) {
        console.error("❌ PUBLISH ERROR:", err);

        toast.error(
          err instanceof ApiRequestError
            ? err.message
            : "Could not publish post",
        );
      } finally {
        setPublishing(false);
      }
    },
    (errors) => {
      console.error("❌ PUBLISH VALIDATION FAILED:", errors);

      toast.error("Please fix the form errors");

      console.log("FORM ERRORS:", errors);
    },
  );

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{existing ? "Edit post" : "New blog post"}</CardTitle>

          {existing && (
            <Badge variant={existing.isPublished ? "success" : "secondary"}>
              {existing.isPublished ? "Published" : "Draft"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={(event) => event.preventDefault()}
          >
            {/* -------------------------------- */}
            {/* Title */}
            {/* -------------------------------- */}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="A first-timer's guide to renting a tent"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------------------------------- */}
            {/* Category + Cover Image */}
            {/* -------------------------------- */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Category */}

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingCategories
                                ? "Loading categories..."
                                : "Select a category"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-2 text-sm text-muted-foreground">
                            No categories found
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cover Image */}

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover image URL (optional)</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="https://images.example.com/cover.jpg"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* -------------------------------- */}
            {/* Excerpt */}
            {/* -------------------------------- */}

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="One or two sentences shown on the blog listing card…"
                      className="min-h-[70px]"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------------------------------- */}
            {/* Content */}
            {/* -------------------------------- */}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Write the full article here…"
                      className="min-h-[280px]"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------------------------------- */}
            {/* Actions */}
            {/* -------------------------------- */}

            <div className="flex gap-3">
              {/* Save Draft */}

              <Button
                type="button"
                variant="outline"
                loading={savingDraft}
                disabled={savingDraft || publishing}
                onClick={onSaveDraft}
              >
                Save as draft
              </Button>

              {/* Publish */}

              <Button
                type="button"
                loading={publishing}
                disabled={savingDraft || publishing}
                onClick={() => {
                  console.log("PUBLISH BUTTON CLICKED");
                  onPublish();
                }}
              >
                {existing?.isPublished ? "Save & keep published" : "Publish"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
