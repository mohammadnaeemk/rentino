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
        // `/categories` returns the standard envelope; the list is on `.data`.
        const response = await api.get<{ data: Category[] }>("/categories", {
          auth: false,
        });

        setCategories(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load categories:", error);

        toast.error("بارگذاری دسته‌بندی‌ها ممکن نشد");
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

      toast.success("پیش‌نویس ذخیره شد");

      router.push("/dashboard/admin/blog");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError ? err.message : "ذخیره پیش‌نویس ممکن نشد",
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
      setPublishing(true);

      try {
        const id = await persist(values);

        await api.patch(`/admin/blog/${id}/publish`);

        toast.success("نوشته منتشر شد");

        router.push("/dashboard/admin/blog");
      } catch (err) {
        console.error("Publish error:", err);

        toast.error(
          err instanceof ApiRequestError
            ? err.message
            : "انتشار نوشته ممکن نشد",
        );
      } finally {
        setPublishing(false);
      }
    },
    () => {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
    },
  );

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{existing ? "ویرایش نوشته" : "نوشته جدید"}</CardTitle>

          {existing && (
            <Badge variant={existing.isPublished ? "success" : "secondary"}>
              {existing.isPublished ? "منتشر شده" : "پیش‌نویس"}
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
                  <FormLabel>عنوان</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="مثلاً: راهنمای اجاره خودرو برای سفر"
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
                    <FormLabel>دسته‌بندی</FormLabel>

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
                                ? "در حال بارگذاری دسته‌بندی‌ها..."
                                : "یک دسته‌بندی انتخاب کنید"
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
                          <div className="px-2 py-2 text-sm text-muted">
                            دسته‌بندی‌ای یافت نشد
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
                    <FormLabel>آدرس تصویر جلد (اختیاری)</FormLabel>

                    <FormControl>
                      <Input
                        dir="ltr"
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
                  <FormLabel>خلاصه</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="یک یا دو جمله که در کارت فهرست وبلاگ نمایش داده می‌شود..."
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
                  <FormLabel>محتوا</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="متن کامل نوشته را اینجا بنویسید..."
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
                ذخیره به‌عنوان پیش‌نویس
              </Button>

              {/* Publish */}

              <Button
                type="button"
                loading={publishing}
                disabled={savingDraft || publishing}
                onClick={() => onPublish()}
              >
                {existing?.isPublished ? "ذخیره و نگه‌داشتن انتشار" : "انتشار"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
