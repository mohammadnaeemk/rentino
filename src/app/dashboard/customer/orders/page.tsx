"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, Star, Package } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { OrderStatusBadge } from "@/components/order-status-badge";
import { api, ApiRequestError } from "@/lib/api";
import type { RentalStatus } from "@/types";

/* =========================================================
   Types
========================================================= */

type GearItem = {
  id: string;
  name: string;
  title?: string;
  image?: string | null;
  images?: string[];
};

type CustomerOrderItem = {
  gearItemId: string;
  quantity?: number;
  gearItem: GearItem;
};

type CustomerOrder = {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: number | string;
  status: RentalStatus;
  items: CustomerOrderItem[];
};

type RentalsResponse =
  | CustomerOrder[]
  | {
      success?: boolean;
      message?: string;
      data?: CustomerOrder[];
      orders?: CustomerOrder[];
      rentals?: CustomerOrder[];
    };

/* =========================================================
   Helpers
========================================================= */

function getOrders(response: RentalsResponse): CustomerOrder[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? response.orders ?? response.rentals ?? [];
}

function getGearName(gear: GearItem) {
  return gear.name || gear.title || "Gear item";
}

function getGearImage(gear: GearItem) {
  return gear.image || gear.images?.[0] || null;
}

function formatDate(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================================================
   Loading Skeleton
========================================================= */

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-md border border-border p-4"
        >
          {/* Order ID */}
          <div className="hidden md:block">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
          </div>

          {/* Gear */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="h-12 w-16 shrink-0 animate-pulse rounded-md bg-surface-muted" />

            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
            </div>
          </div>

          {/* Dates */}
          <div className="hidden space-y-2 lg:block">
            <div className="h-3 w-28 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
          </div>

          {/* Total */}
          <div className="hidden sm:block">
            <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
          </div>

          {/* Status */}
          <div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-muted" />
          </div>

          {/* Action */}
          <div>
            <div className="h-9 w-20 animate-pulse rounded-md bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   Page
========================================================= */

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewOrder, setReviewOrder] = useState<CustomerOrder | null>(null);

  const [gearItemId, setGearItemId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submittingReview, setSubmittingReview] = useState(false);

  const [reviewedItems, setReviewedItems] = useState<Set<string>>(
    () => new Set(),
  );

  /* =========================================================
     Load orders
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        setLoading(true);

        const response = await api.get<
          | {
              success?: boolean;
              message?: string;
              data?: CustomerOrder[];
              orders?: CustomerOrder[];
              rentals?: CustomerOrder[];
            }
          | CustomerOrder[]
        >("/rentals");

        if (!mounted) return;

        setOrders(getOrders(response));
      } catch (error) {
        if (!mounted) return;

        toast.error(
          error instanceof ApiRequestError
            ? error.message
            : "Could not load rental orders.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     Review
  ========================================================= */

  function openReview(order: CustomerOrder) {
    const firstUnreviewed =
      order.items.find(
        (item) => !reviewedItems.has(`${order.id}:${item.gearItemId}`),
      ) ?? order.items[0];

    setReviewOrder(order);
    setGearItemId(firstUnreviewed?.gearItemId ?? "");
    setRating(5);
    setComment("");
  }

  async function submitReview() {
    if (!reviewOrder || !gearItemId) return;

    if (comment.trim().length < 5) {
      toast.error("Please write at least a short comment.");
      return;
    }

    try {
      setSubmittingReview(true);

      await api.post("/reviews", {
        rentalOrderId: reviewOrder.id,
        gearItemId,
        rating,
        comment: comment.trim(),
      });

      setReviewedItems((current) => {
        const next = new Set(current);
        next.add(`${reviewOrder.id}:${gearItemId}`);
        return next;
      });

      setReviewOrder(null);

      toast.success("Your review has been submitted.");
    } catch (error) {
      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : "Could not submit your review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          Header
      ===================================================== */}

      <div>
        <h1 className="font-display text-2xl font-semibold">My rentals</h1>

        <p className="mt-1 text-sm text-muted">
          Every rental you&apos;ve booked, past and present.
        </p>
      </div>

      {/* =====================================================
          Orders
      ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            {loading
              ? "Loading orders…"
              : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <OrdersSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Gear</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => {
                  const canReview =
                    order.status === "RETURNED" &&
                    order.items.some(
                      (item) =>
                        !reviewedItems.has(`${order.id}:${item.gearItemId}`),
                    );

                  return (
                    <TableRow key={order.id}>
                      {/* Order */}
                      <TableCell className="font-mono text-xs">
                        <span className="max-w-24 truncate block">
                          {order.id}
                        </span>
                      </TableCell>

                      {/* Gear */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                            {order.items[0] &&
                            getGearImage(order.items[0].gearItem) ? (
                              <Image
                                src={getGearImage(order.items[0].gearItem)!}
                                alt={getGearName(order.items[0].gearItem)}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-5 w-5 text-muted" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-48 truncate font-medium">
                              {order.items
                                .map((item) => getGearName(item.gearItem))
                                .join(", ") || "Gear item"}
                            </p>

                            {order.items.length > 1 && (
                              <p className="text-xs text-muted">
                                {order.items.length} items
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Dates */}
                      <TableCell className="text-muted">
                        <div className="whitespace-nowrap">
                          {formatDate(order.startDate)}
                        </div>

                        <div className="text-xs">
                          → {formatDate(order.endDate)}
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        ${Number(order.totalAmount).toFixed(2)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        {order.status === "CONFIRMED" && (
                          <Button size="sm" asChild>
                            <Link
                              href={`/dashboard/customer/orders/${order.id}/pay`}
                            >
                              Pay now
                            </Link>
                          </Button>
                        )}

                        {order.status === "RETURNED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReview(order)}
                            disabled={!canReview}
                          >
                            {canReview ? "Leave review" : "Review submitted"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!loading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="mb-3 h-8 w-8 text-muted" />

                        <p className="text-sm font-medium">
                          No rental orders yet.
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          Start renting gear to see your orders here.
                        </p>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="mt-4"
                        >
                          <Link href="/gear">Browse gear</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          Review Dialog
      ===================================================== */}

      <Dialog
        open={Boolean(reviewOrder)}
        onOpenChange={(open) => {
          if (!open && !submittingReview) {
            setReviewOrder(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a review</DialogTitle>

            <DialogDescription>
              Share your experience after returning the gear.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Gear selector */}

            {reviewOrder && reviewOrder.items.length > 1 && (
              <label className="block space-y-2 text-sm font-medium">
                Gear item
                <select
                  value={gearItemId}
                  onChange={(event) => setGearItemId(event.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  {reviewOrder.items
                    .filter(
                      (item) =>
                        !reviewedItems.has(
                          `${reviewOrder.id}:${item.gearItemId}`,
                        ),
                    )
                    .map((item) => (
                      <option key={item.gearItemId} value={item.gearItemId}>
                        {getGearName(item.gearItem)}
                      </option>
                    ))}
                </select>
              </label>
            )}

            {/* Rating */}

            <div className="space-y-2">
              <p className="text-sm font-medium">Your rating</p>

              <div
                className="flex gap-1"
                aria-label={`${rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }, (_, index) => index + 1).map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          value <= rating
                            ? "fill-primary text-primary"
                            : "text-border"
                        }`}
                      />
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Comment */}

            <label className="block space-y-2 text-sm font-medium">
              Your review
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="How was the gear and rental experience?"
                minLength={5}
                maxLength={1000}
              />
              <span className="text-xs text-muted">{comment.length}/1000</span>
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewOrder(null)}
              disabled={submittingReview}
            >
              Cancel
            </Button>

            <Button
              onClick={submitReview}
              disabled={
                submittingReview || !gearItemId || comment.trim().length < 5
              }
            >
              {submittingReview && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
