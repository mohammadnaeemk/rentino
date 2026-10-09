"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { gearFormSchema, type GearFormInput } from "@/lib/validations";
import { api, ApiRequestError } from "@/lib/api";

import type { GearItem, Category } from "@/types";

interface GearFormProps {
  initialGear?: GearItem;
}

function GearFormSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
            <div className="h-24 w-full animate-pulse rounded-md bg-surface-muted" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-surface-muted" />
          </div>

          <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-surface-muted" />
          </div>

          <div className="grid grid-cols-[1fr_1fr_40px] gap-2">
            <div className="h-10 animate-pulse rounded-md bg-surface-muted" />
            <div className="h-10 animate-pulse rounded-md bg-surface-muted" />
            <div className="h-10 animate-pulse rounded-md bg-surface-muted" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <div className="h-10 w-20 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-surface-muted" />
      </div>
    </div>
  );
}

export function GearForm({ initialGear }: GearFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GearFormInput>({
    resolver: zodResolver(gearFormSchema),

    defaultValues: initialGear
      ? {
          title: initialGear.title,
          brand: initialGear.brand,
          categoryId: initialGear.categoryId,
          description: initialGear.description,
          pricePerDay: initialGear.pricePerDay,
          stock: initialGear.stock,
          images: initialGear.images?.length > 0 ? initialGear.images : [""],

          specs:
            initialGear.specs && Object.keys(initialGear.specs).length > 0
              ? Object.entries(initialGear.specs).map(([key, value]) => ({
                  key,
                  value: String(value),
                }))
              : [
                  {
                    key: "",
                    value: "",
                  },
                ],
        }
      : {
          title: "",
          brand: "",
          categoryId: "",
          description: "",
          pricePerDay: 0,
          stock: 1,
          images: [""],
          specs: [
            {
              key: "",
              value: "",
            },
          ],
        },
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "specs",
  });

  const images = watch("images") ?? [];
  const selectedCategory = watch("categoryId");

  // ---------------------------------------------
  // Load categories
  // ---------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setCategoryLoading(true);
        setCategoryError(null);

        const response = await api.get<Category[]>("/categories", {
          auth: false,
        });

        if (!mounted) return;

        const categoryData = Array.isArray(response) ? response : [];

        setCategories(categoryData);
      } catch (error) {
        if (!mounted) return;

        setCategories([]);

        setCategoryError(
          error instanceof ApiRequestError
            ? error.message
            : "Categories could not be loaded.",
        );
      } finally {
        if (mounted) {
          setCategoryLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------
  // Submit
  // ---------------------------------------------

  async function onSubmit(data: GearFormInput) {
    const specifications = Object.fromEntries(
      data.specs
        .filter(({ key, value }) => key.trim() !== "" || value.trim() !== "")
        .map(({ key, value }) => [key.trim(), value.trim()]),
    );

    const payload = {
      name: data.title.trim(),
      brand: data.brand.trim(),
      categoryId: data.categoryId,
      description: data.description.trim(),

      images: data.images.filter((image) => image.trim() !== ""),

      pricePerDay: Number(data.pricePerDay),
      stock: Number(data.stock),

      specifications,
    };

    try {
      if (initialGear) {
        await api.put(`/provider/gear/${initialGear.id}`, payload);

        toast.success("Gear updated successfully");
      } else {
        await api.post("/provider/gear", payload);

        toast.success("Gear added to your inventory");
      }

      router.push("/dashboard/provider/gear");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : initialGear
            ? "Could not update gear. Try again."
            : "Could not add gear. Try again.",
      );
    }
  }

  // ---------------------------------------------
  // Image helpers
  // ---------------------------------------------

  function updateImage(index: number, value: string) {
    const next = [...images];

    next[index] = value;

    setValue("images", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function addImage() {
    setValue("images", [...images, ""], {
      shouldDirty: true,
    });
  }

  function removeImage(index: number) {
    const next = images.filter((_, idx) => idx !== index);

    setValue("images", next.length > 0 ? next : [""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  // ---------------------------------------------
  // Loading state
  // ---------------------------------------------

  if (categoryLoading) {
    return <GearFormSkeleton />;
  }

  // ---------------------------------------------
  // Form
  // ---------------------------------------------

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Basic information */}

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Title */}

            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>

              <Input
                id="title"
                placeholder="Sony A7S III Mirrorless Body"
                {...register("title")}
              />

              {errors.title && (
                <p className="text-xs text-danger">{errors.title.message}</p>
              )}
            </div>

            {/* Brand */}

            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>

              <Input id="brand" placeholder="Sony" {...register("brand")} />

              {errors.brand && (
                <p className="text-xs text-danger">{errors.brand.message}</p>
              )}
            </div>
          </div>

          {/* Category */}

          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Category</Label>

            <Select
              value={selectedCategory || ""}
              onValueChange={(value) =>
                setValue("categoryId", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>

              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {categoryError && (
              <p className="text-xs text-danger">{categoryError}</p>
            )}

            {errors.categoryId && (
              <p className="text-xs text-danger">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Description */}

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>

            <Textarea
              id="description"
              rows={4}
              placeholder="Describe condition, what's included, and ideal use case..."
              {...register("description")}
            />

            {errors.description && (
              <p className="text-xs text-danger">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price + Stock */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pricePerDay">Price per day ($)</Label>

              <Input
                id="pricePerDay"
                type="number"
                step="0.01"
                min="0"
                {...register("pricePerDay", {
                  valueAsNumber: true,
                })}
              />

              {errors.pricePerDay && (
                <p className="text-xs text-danger">
                  {errors.pricePerDay.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock / units available</Label>

              <Input
                id="stock"
                type="number"
                min="1"
                step="1"
                {...register("stock", {
                  valueAsNumber: true,
                })}
              />

              {errors.stock && (
                <p className="text-xs text-danger">{errors.stock.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Label>Image URLs</Label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImage}
            >
              <Plus className="h-3.5 w-3.5" />
              Add image
            </Button>
          </div>

          {images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(event) => updateImage(index, event.target.value)}
              />

              {images.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              )}
            </div>
          ))}

          {errors.images && (
            <p className="text-xs text-danger">
              {String(errors.images.message)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Specifications */}

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Label>Specifications</Label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendSpec({
                  key: "",
                  value: "",
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add spec
            </Button>
          </div>

          {specFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder="Spec name (e.g. aperture)"
                {...register(`specs.${index}.key`)}
              />

              <Input
                placeholder="Value (e.g. f/2.8)"
                {...register(`specs.${index}.value`)}
              />

              {specFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSpec(index)}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>

        <Button type="submit" loading={isSubmitting}>
          {initialGear ? "Save changes" : "Add gear"}
        </Button>
      </div>
    </form>
  );
}
