"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Package, RefreshCw } from "lucide-react";

import { api, ApiRequestError } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";

// =====================================================
// Types
// =====================================================

interface ApiGear {
  id: string;
  providerId: string;
  categoryId: string;

  name: string;
  slug: string;
  description: string;

  brand: string | null;

  images: string[];

  pricePerDay: string;

  stock: number;
  availableStock: number;

  specifications: Record<string, unknown> | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;

  provider: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface GearMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GearApiResponse {
  success: boolean;
  message: string;
  meta: GearMeta;
  data: ApiGear[];
}

// =====================================================
// Constants
// =====================================================

const DEFAULT_LIMIT = 10;

// =====================================================
// Loading Skeleton
// =====================================================

function GearTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[320px]">Gear</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price / day</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={index}>
              {/* Gear */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </TableCell>

              {/* Provider */}
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </TableCell>

              {/* Category */}
              <TableCell>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>

              {/* Price */}
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>

              {/* Stock */}
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>

              {/* Status */}
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>

              {/* Action */}
              <TableCell>
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// =====================================================
// Page
// =====================================================

export default function AdminGearPage() {
  const [gear, setGear] = useState<ApiGear[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [meta, setMeta] = useState<GearMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });

  // ===================================================
  // Fetch Gear
  // ===================================================

  const fetchGear = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<GearApiResponse>(
        `/admin/gear?page=${meta.page}&limit=${meta.limit}`,
      );

      console.log("ADMIN GEAR RESPONSE:", response);

      setGear(response.data ?? []);

      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      console.error("Failed to fetch gear:", err);

      setError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load gear listings.",
      );
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit]);

  // ===================================================
  // Fetch on mount / page change
  // ===================================================

  useEffect(() => {
    fetchGear();
  }, [fetchGear]);

  // ===================================================
  // Toggle Gear Status
  // ===================================================

  const toggleGearStatus = async (item: ApiGear) => {
    try {
      setActionLoading(item.id);

      const newStatus = !item.isActive;

      await api.patch(`/admin/gear/${item.id}`, {
        isActive: newStatus,
      });

      setGear((current) =>
        current.map((gearItem) =>
          gearItem.id === item.id
            ? {
                ...gearItem,
                isActive: newStatus,
              }
            : gearItem,
        ),
      );
    } catch (err) {
      console.error("Failed to update gear status:", err);

      setError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update gear status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ===================================================
  // Pagination
  // ===================================================

  const previousPage = () => {
    if (meta.page <= 1 || loading) return;

    setMeta((current) => ({
      ...current,
      page: current.page - 1,
    }));
  };

  const nextPage = () => {
    if (meta.page >= meta.totalPages || loading) return;

    setMeta((current) => ({
      ...current,
      page: current.page + 1,
    }));
  };

  // ===================================================
  // Main
  // ===================================================

  return (
    <div className="space-y-8">
      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Gear listings</h1>

          <p className="mt-1 text-sm text-muted">
            Manage gear listed by providers across the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!loading && <Badge variant="outline">{meta.total} listings</Badge>}

          {loading && <Skeleton className="h-6 w-20 rounded-full" />}

          <Button variant="outline" onClick={fetchGear} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* =================================================
          Error
      ================================================= */}

      {error && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="mb-4 h-10 w-10 text-muted" />

            <h2 className="text-lg font-semibold">Failed to load gear</h2>

            <p className="mt-2 max-w-md text-center text-sm text-muted">
              {error}
            </p>

            <Button className="mt-5" onClick={fetchGear}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* =================================================
          Gear Table
      ================================================= */}

      {!error && (
        <Card>
          <CardHeader>
            <CardTitle>
              All gear
              {!loading && (
                <span className="ml-2 text-sm font-normal text-muted">
                  ({gear.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {/* -------------------------------------------
                ONLY DATA AREA LOADING
            ------------------------------------------- */}

            {loading ? (
              <GearTableSkeleton />
            ) : gear.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="mb-4 h-10 w-10 text-muted" />

                <h2 className="text-lg font-semibold">No gear listings</h2>

                <p className="mt-1 text-sm text-muted">
                  There are no gear listings available yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[320px]">Gear</TableHead>

                      <TableHead>Provider</TableHead>

                      <TableHead>Category</TableHead>

                      <TableHead>Price / day</TableHead>

                      <TableHead>Stock</TableHead>

                      <TableHead>Status</TableHead>

                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {gear.map((item) => {
                      const image = item.images?.[0] || "/placeholder-gear.jpg";

                      const processing = actionLoading === item.id;

                      return (
                        <TableRow key={item.id}>
                          {/* Gear */}

                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                <img
                                  src={image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-xs text-muted">
                                  {item.brand || "No brand"}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Provider */}

                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {item.provider?.name || "Unknown"}
                              </p>

                              <p className="text-xs text-muted">
                                {item.provider?.email || "-"}
                              </p>
                            </div>
                          </TableCell>

                          {/* Category */}

                          <TableCell>
                            <Badge variant="outline">
                              {item.category?.name || "Uncategorized"}
                            </Badge>
                          </TableCell>

                          {/* Price */}

                          <TableCell>
                            <span className="font-medium">
                              ${Number(item.pricePerDay).toFixed(2)}
                            </span>

                            <span className="text-xs text-muted"> / day</span>
                          </TableCell>

                          {/* Stock */}

                          <TableCell>
                            <span className="font-medium">
                              {item.availableStock}
                            </span>

                            <span className="text-muted"> / {item.stock}</span>
                          </TableCell>

                          {/* Status */}

                          <TableCell>
                            <Badge
                              variant={
                                item.isActive ? "success" : "destructive"
                              }
                            >
                              {item.isActive ? "Visible" : "Hidden"}
                            </Badge>
                          </TableCell>

                          {/* Action */}

                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={processing}
                              onClick={() => toggleGearStatus(item)}
                            >
                              {processing ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              ) : item.isActive ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Show
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* =================================================
              Pagination
          ================================================= */}

          {!loading && meta.totalPages > 1 && (
            <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(meta.page - 1) * meta.limit + 1}
                </span>
                {" – "}
                <span className="font-medium text-foreground">
                  {Math.min(meta.page * meta.limit, meta.total)}
                </span>
                {" of "}
                <span className="font-medium text-foreground">
                  {meta.total}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1 || loading}
                  onClick={previousPage}
                >
                  Previous
                </Button>

                <div className="flex h-9 min-w-20 items-center justify-center rounded-md border px-3 text-sm font-medium">
                  Page {meta.page} / {meta.totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages || loading}
                  onClick={nextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
