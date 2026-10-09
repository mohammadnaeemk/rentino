"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { api, ApiRequestError } from "@/lib/api";
import type { Category } from "@/types";

type CategoryResponse = {
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Category[];
};

type SingleCategoryResponse = {
  success: boolean;
  message: string;
  data: Category;
};

type CategoryForm = {
  name: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryForm>({
    defaultValues: {
      name: "",
    },
  });

  /**
   * GET /api/categories
   *
   * Backend response:
   *
   * {
   *   success: true,
   *   message: "...",
   *   data: [...]
   * }
   *
   * So we must use response.data.
   */
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get<CategoryResponse>("/categories", {
        auth: false,
      });

      console.log("CATEGORIES RESPONSE:", response);

      let list: Category[] = [];

      /*
       * Supports both:
       *
       * 1. response = { success, data: [...] }
       *
       * 2. response = [...]
       *
       * This makes the page safe regardless of api.ts implementation.
       */
      if (Array.isArray(response)) {
        list = response as unknown as Category[];
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray((response as CategoryResponse).data)
      ) {
        list = (response as CategoryResponse).data;
      }

      if (!Array.isArray(list)) {
        throw new Error("Invalid categories response from server.");
      }

      setCategories(list);
    } catch (error) {
      console.error("Failed to fetch categories:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not load categories.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Open create dialog
   */
  function openCreateDialog() {
    setEditingCategory(null);

    reset({
      name: "",
    });

    setOpen(true);
  }

  /**
   * Open edit dialog
   */
  function openEditDialog(category: Category) {
    setEditingCategory(category);

    setValue("name", category.name);

    setOpen(true);
  }

  /**
   * Create / Update category
   */
  async function onSubmit({ name }: CategoryForm) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setSaving(true);

      /*
       * EDIT
       *
       * PUT /api/categories/:id
       */
      if (editingCategory) {
        const response = await api.put<
          CategoryResponse | SingleCategoryResponse | Category
        >(`/categories/${editingCategory.id}`, {
          name: trimmedName,
        });

        console.log("UPDATE CATEGORY RESPONSE:", response);

        let updatedCategory: Category | null = null;

        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          response.data &&
          !Array.isArray(response.data)
        ) {
          updatedCategory = response.data as Category;
        } else if (
          response &&
          typeof response === "object" &&
          "id" in response
        ) {
          updatedCategory = response as Category;
        }

        /*
         * If backend returns the updated category,
         * use it. Otherwise update the name locally.
         */
        setCategories((current) =>
          current.map((category) =>
            category.id === editingCategory.id
              ? (updatedCategory ?? {
                  ...category,
                  name: trimmedName,
                })
              : category,
          ),
        );

        toast.success("Category updated.");
      } else {
        /*
         * CREATE
         *
         * POST /api/categories
         */
        const response = await api.post<
          CategoryResponse | SingleCategoryResponse | Category
        >("/categories", {
          name: trimmedName,
        });

        console.log("CREATE CATEGORY RESPONSE:", response);

        let newCategory: Category | null = null;

        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          response.data &&
          !Array.isArray(response.data)
        ) {
          newCategory = response.data as Category;
        } else if (
          response &&
          typeof response === "object" &&
          "id" in response
        ) {
          newCategory = response as Category;
        }

        if (newCategory) {
          setCategories((current) => [...current, newCategory!]);
        } else {
          /*
           * If api.ts returns an unexpected response shape,
           * simply reload categories from backend.
           */
          await fetchCategories();
        }

        toast.success("Category added.");
      }

      reset({
        name: "",
      });

      setEditingCategory(null);
      setOpen(false);
    } catch (error) {
      console.error("Category save error:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : editingCategory
              ? "Could not update category."
              : "Could not add category.",
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Delete category
   *
   * DELETE /api/categories/:id
   */
  async function remove(id: string) {
    const category = categories.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category?.name ?? "this category"}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await api.delete(`/categories/${id}`);

      setCategories((current) =>
        current.filter((category) => category.id !== id),
      );

      toast.success("Category removed.");
    } catch (error) {
      console.error("Category delete error:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not remove category.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleDialogChange(value: boolean) {
    setOpen(value);

    if (!value) {
      setEditingCategory(null);

      reset({
        name: "",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Gear categories
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage the categories customers can filter gear by.
          </p>
        </div>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add category
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit category" : "New category"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category name</Label>

                <Input
                  id="category-name"
                  placeholder="e.g. Cameras"
                  disabled={saving}
                  {...register("name", {
                    required: "Category name is required.",
                    minLength: {
                      value: 2,
                      message: "Category name must be at least 2 characters.",
                    },
                    maxLength: {
                      value: 60,
                      message: "Category name cannot exceed 60 characters.",
                    },
                  })}
                />

                {errors.name && (
                  <p className="text-sm text-danger">{errors.name.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => handleDialogChange(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingCategory ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? "Loading..." : `${categories.length} categories`}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-md bg-surface-muted"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="font-medium">No categories found.</p>

              <p className="mt-1 text-sm text-muted">
                Create your first gear category.
              </p>

              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add category
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {categories.map((category) => {
                    const isDeleting = deletingId === category.id;

                    return (
                      <TableRow key={category.id}>
                        {/* Name */}
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>

                        {/* Slug */}
                        <TableCell className="font-mono text-xs text-muted">
                          {category.slug}
                        </TableCell>

                        {/* Description */}
                        <TableCell className="max-w-[300px] truncate text-sm text-muted">
                          {category.description || "-"}
                        </TableCell>

                        {/* Created */}
                        <TableCell className="text-sm text-muted">
                          {category.createdAt
                            ? new Date(category.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {/* Edit */}
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDeleting}
                              onClick={() => openEditDialog(category)}
                              title="Edit category"
                            >
                              <Pencil className="h-4 w-4" />

                              <span className="sr-only">Edit category</span>
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDeleting}
                              onClick={() => remove(category.id)}
                              title="Delete category"
                            >
                              <Trash2 className="h-4 w-4 text-danger" />

                              <span className="sr-only">Delete category</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
