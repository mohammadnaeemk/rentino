"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { GearForm } from "@/components/gear/gear-form";
import { api, ApiRequestError } from "@/lib/api";
import { toGearItem, type ApiGear } from "@/lib/gear";
import type { GearItem } from "@/types";

interface GearListResponse {
  success: boolean;
  message: string;
  data: ApiGear[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function EditGearSkeleton() {
  return (
    <div className="max-w-3xl space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-32 rounded-md bg-surface-muted" />
        <div className="mt-2 h-4 w-72 rounded-md bg-surface-muted" />
      </div>

      {/* Basic information */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-surface-muted" />
              <div className="h-10 w-full rounded-md bg-surface-muted" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-surface-muted" />
              <div className="h-10 w-full rounded-md bg-surface-muted" />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-surface-muted" />
            <div className="h-10 w-full rounded-md bg-surface-muted" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-surface-muted" />
            <div className="h-24 w-full rounded-md bg-surface-muted" />
          </div>

          {/* Price + stock */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-surface-muted" />
              <div className="h-10 w-full rounded-md bg-surface-muted" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-surface-muted" />
              <div className="h-10 w-full rounded-md bg-surface-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-surface-muted" />
            <div className="h-9 w-28 rounded-md bg-surface-muted" />
          </div>

          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-md bg-surface-muted" />
            <div className="h-10 w-10 rounded-md bg-surface-muted" />
          </div>

          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-md bg-surface-muted" />
            <div className="h-10 w-10 rounded-md bg-surface-muted" />
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-surface-muted" />
            <div className="h-9 w-24 rounded-md bg-surface-muted" />
          </div>

          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-md bg-surface-muted" />
            <div className="h-10 flex-1 rounded-md bg-surface-muted" />
            <div className="h-10 w-10 rounded-md bg-surface-muted" />
          </div>

          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-md bg-surface-muted" />
            <div className="h-10 flex-1 rounded-md bg-surface-muted" />
            <div className="h-10 w-10 rounded-md bg-surface-muted" />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <div className="h-10 w-20 rounded-md bg-surface-muted" />
        <div className="h-10 w-32 rounded-md bg-surface-muted" />
      </div>
    </div>
  );
}

export default function EditGearPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [gear, setGear] = useState<GearItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadGear() {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<GearListResponse>("/provider/gear");

        const items = Array.isArray(response.data) ? response.data : [];

        const found = items.map(toGearItem).find((item) => item.id === id);

        if (!found) {
          setError("Gear item not found.");
          return;
        }

        setGear(found);
      } catch (requestError) {
        setError(
          requestError instanceof ApiRequestError
            ? requestError.message
            : "Could not load gear.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGear();
  }, [id]);

  if (loading) {
    return <EditGearSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      </div>
    );
  }

  if (!gear) {
    return (
      <div className="max-w-3xl">
        <p className="text-sm text-muted">Gear item not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Edit gear</h1>

        <p className="mt-1 text-sm text-muted">
          Update your listing details and availability.
        </p>
      </div>

      <GearForm initialGear={gear} />
    </div>
  );
}
