"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import { api, ApiRequestError } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { OrderStatusBadge } from "@/components/order-status-badge";

import type { RentalStatus } from "@/types";

// ======================================================
// TYPES
// ======================================================

interface GearItem {
  id: string;
  name: string;
  brand?: string | null;
  images: string[];
  pricePerDay: string;
  stock: number;
  availableStock: number;
  isActive: boolean;
}

interface RentalItem {
  id: string;
  rentalOrderId: string;
  gearItemId: string;
  quantity: number;
  pricePerDay: string;
  subtotal: string;
  gearItem: GearItem;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Payment {
  id: string;
  rentalOrderId: string;
  userId: string;
  transactionId: string;
  amount: string;
  method: string;
  status: string;
  paidAt: string | null;
}

interface AdminRental {
  id: string;
  customerId: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  customer: Customer | null;
  items: RentalItem[];
  payment: Payment | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AdminRentalsResponse {
  success: boolean;
  message: string;
  meta: PaginationMeta;
  data: AdminRental[];
}

// ======================================================
// CONSTANTS
// ======================================================

const RENTAL_STATUSES: RentalStatus[] = [
  "PLACED",
  "CONFIRMED",
  "CANCELLED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
];

const DEFAULT_LIMIT = 12;

// ======================================================
// HELPERS
// ======================================================

function formatDate(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getGearNames(items: RentalItem[]) {
  if (!items?.length) {
    return "No gear";
  }

  return items
    .map((item) => {
      const name = item.gearItem?.name ?? "Unknown gear";

      return item.quantity > 1 ? `${name} × ${item.quantity}` : name;
    })
    .join(", ");
}

// ======================================================
// TABLE SKELETON
// ======================================================

function RentalsTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Gear</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 8 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-28 animate-pulse rounded bg-surface-muted" />
              </div>
            </TableCell>

            <TableCell>
              <div className="space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-surface-muted" />
              </div>
            </TableCell>

            <TableCell>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-surface-muted" />
              </div>
            </TableCell>

            <TableCell>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
              </div>
            </TableCell>

            <TableCell>
              <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
            </TableCell>

            <TableCell>
              <div className="h-6 w-20 animate-pulse rounded-full bg-surface-muted" />
            </TableCell>

            <TableCell>
              <div className="h-6 w-20 animate-pulse rounded-full bg-surface-muted" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function AdminRentalsPage() {
  const [rentalOrders, setRentalOrders] = useState<AdminRental[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [page, setPage] = useState(1);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });

  // ====================================================
  // FETCH
  // ====================================================

  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(DEFAULT_LIMIT));

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await api.get<AdminRentalsResponse>(
        `/admin/rentals?${params.toString()}`,
      );

      console.log("ADMIN RENTALS RESPONSE:", response);

      if (!response || !Array.isArray(response.data)) {
        throw new Error("Invalid rentals response from server.");
      }

      setRentalOrders(response.data);

      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      console.error("Failed to fetch rentals:", err);

      setError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load rental orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // ====================================================
  // EFFECT
  // ====================================================

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  // ====================================================
  // FILTER
  // ====================================================

  function handleStatusChange(value: string) {
    setPage(1);
    setStatusFilter(value);
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error && !loading && rentalOrders.length === 0) {
    return (
      <div className="space-y-8">
        {/* HEADER ALWAYS VISIBLE */}

        <div>
          <h1 className="font-display text-2xl font-semibold">All rentals</h1>

          <p className="mt-1 text-sm text-muted">
            Every rental order placed across the platform.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="mb-4 h-10 w-10 text-muted" />

            <h2 className="text-lg font-semibold">Failed to load rentals</h2>

            <p className="mt-2 max-w-md text-center text-sm text-muted">
              {error}
            </p>

            <Button className="mt-5" onClick={fetchRentals}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ====================================================
  // MAIN
  // ====================================================

  return (
    <div className="space-y-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">All rentals</h1>

          <p className="mt-1 text-sm text-muted">
            Every rental order placed across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* STATUS FILTER */}

          <Select
            value={statusFilter}
            onValueChange={handleStatusChange}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>

              {RENTAL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* TOTAL */}

          <Badge variant="outline">{meta.total} orders</Badge>

          {/* REFRESH */}

          <Button variant="outline" onClick={fetchRentals} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* =================================================
          TABLE CARD
      ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>Rental orders</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* ONLY DATA AREA LOADING */}

          {loading ? (
            <div className="overflow-x-auto">
              <RentalsTableSkeleton />
            </div>
          ) : rentalOrders.length === 0 ? (
            /* EMPTY */

            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="mb-4 h-10 w-10 text-muted" />

              <h2 className="text-lg font-semibold">No rental orders</h2>

              <p className="mt-1 text-sm text-muted">
                No orders found for this filter.
              </p>
            </div>
          ) : (
            /* DATA */

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Gear</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rentalOrders.map((order) => (
                    <TableRow key={order.id}>
                      {/* ORDER */}

                      <TableCell>
                        <p className="font-mono text-xs font-medium">
                          #{order.id.slice(0, 8)}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </TableCell>

                      {/* GEAR */}

                      <TableCell>
                        <div className="max-w-[280px]">
                          <p className="font-medium">
                            {getGearNames(order.items)}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </TableCell>

                      {/* CUSTOMER */}

                      <TableCell>
                        <p className="font-medium">
                          {order.customer?.name ?? "Unknown"}
                        </p>

                        <p className="text-xs text-muted">
                          {order.customer?.email ?? "-"}
                        </p>
                      </TableCell>

                      {/* DATES */}

                      <TableCell>
                        <div className="whitespace-nowrap">
                          <p className="font-medium">
                            {formatDate(order.startDate)}
                          </p>

                          <p className="text-xs text-muted">
                            → {formatDate(order.endDate)}
                          </p>
                        </div>
                      </TableCell>

                      {/* TOTAL */}

                      <TableCell>
                        <span className="font-semibold">
                          ${Number(order.totalAmount).toFixed(2)}
                        </span>
                      </TableCell>

                      {/* PAYMENT */}

                      <TableCell>
                        {order.payment ? (
                          <Badge
                            variant={
                              order.payment.status === "COMPLETED"
                                ? "success"
                                : "outline"
                            }
                          >
                            {order.payment.status}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted">Unpaid</span>
                        )}
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Page {meta.page} of {meta.totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(meta.totalPages, current + 1))
              }
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
