"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Skeleton } from "@/components/ui/skeleton";

import { api, ApiRequestError } from "@/lib/api";
import { toGearItem, type ApiGear } from "@/lib/gear";
import type { GearAvailability, GearItem } from "@/types";

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

const availabilityVariant: Record<
  GearAvailability,
  "success" | "destructive" | "warning"
> = {
  AVAILABLE: "success",
  RENTED: "destructive",
  MAINTENANCE: "warning",
};

/* ---------------------------------------------
   Inventory Loading Skeleton
--------------------------------------------- */

function InventorySkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gear</TableHead>
          <TableHead>Price/day</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Availability</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index}>
            {/* Gear */}
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-14 shrink-0 rounded" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </TableCell>

            {/* Price */}
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>

            {/* Stock */}
            <TableCell>
              <Skeleton className="h-4 w-8" />
            </TableCell>

            {/* Availability */}
            <TableCell>
              <Skeleton className="h-6 w-24 rounded-full" />
            </TableCell>

            {/* Actions */}
            <TableCell>
              <div className="flex justify-end gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ProviderInventoryPage() {
  const [items, setItems] = useState<GearItem[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadInventory() {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<GearListResponse>(
          "/provider/gear?limit=100",
        );

        console.log("Provider gear response:", response);

        if (!mounted) return;

        const gearData = Array.isArray(response.data) ? response.data : [];

        setItems(gearData.map(toGearItem));
      } catch (requestError) {
        console.error("Failed to load provider inventory:", requestError);

        if (!mounted) return;

        setError(
          requestError instanceof ApiRequestError
            ? requestError.message
            : "Could not load inventory.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      mounted = false;
    };
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;

    try {
      await api.delete(`/provider/gear/${pendingDelete}`);

      setItems((prev) => prev.filter((gear) => gear.id !== pendingDelete));

      toast.success("Gear removed from inventory");

      setPendingDelete(null);
    } catch (requestError) {
      console.error("========== INVENTORY ERROR ==========");
      console.error(requestError);
      console.error("=====================================");

      if (requestError instanceof ApiRequestError) {
        toast.error(`Error ${requestError.status}: ${requestError.message}`);
      } else {
        toast.error("Could not remove gear.");
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Inventory</h1>

          <p className="mt-1 text-sm text-muted">
            {loading
              ? "Loading your gear..."
              : `${items.length} gear items listed.`}
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/provider/gear/new">
            <Plus className="h-4 w-4" />
            Add gear
          </Link>
        </Button>
      </div>

      {/* Inventory table */}
      <Card>
        <CardHeader>
          <CardTitle>All listings</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-danger/20 bg-danger/5 px-4 py-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {loading ? (
            <InventorySkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gear</TableHead>
                  <TableHead>Price/day</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((gear) => (
                  <TableRow key={gear.id}>
                    {/* Gear */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-surface-muted">
                          {gear.images?.[0] ? (
                            <Image
                              src={gear.images[0]}
                              alt={gear.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium">{gear.title}</p>

                          <p className="text-xs text-muted">
                            {gear.brand || "Unknown brand"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>${gear.pricePerDay}</TableCell>

                    {/* Stock */}
                    <TableCell>{gear.stock}</TableCell>

                    {/* Availability */}
                    <TableCell>
                      <Badge variant={availabilityVariant[gear.availability]}>
                        {gear.availability}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/dashboard/provider/gear/${gear.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingDelete(gear.id)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {items.length === 0 && !error && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <p className="text-sm text-muted">No gear listed yet.</p>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        <Link href="/dashboard/provider/gear/new">
                          Add your first gear
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this gear?</DialogTitle>

            <DialogDescription>
              This will unlist the item immediately. Existing confirmed rentals
              are not affected.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>

            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
