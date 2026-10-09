"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import { api } from "@/lib/api";
import {
  formatJalali,
  formatJalaliDateTime,
  formatNumber,
  formatToman,
} from "@/lib/format";
import { paymentStatusLabel, rentalStatusLabel } from "@/lib/labels";
import { rentalOrders as demoRentalOrders } from "@/lib/content";

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

import type { PaymentStatus, RentalStatus } from "@/types";

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

function getGearNames(items: RentalItem[]) {
  if (!items?.length) {
    return "بدون کالا";
  }

  return items
    .map((item) => {
      const name = item.gearItem?.name ?? "کالای ناشناس";

      return item.quantity > 1 ? `${name} × ${formatNumber(item.quantity)}` : name;
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
          <TableHead>سفارش</TableHead>
          <TableHead>کالا</TableHead>
          <TableHead>مشتری</TableHead>
          <TableHead>تاریخ‌ها</TableHead>
          <TableHead>جمع کل</TableHead>
          <TableHead>پرداخت</TableHead>
          <TableHead>وضعیت</TableHead>
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

      // Mock fallback: the backend is unavailable during local development.
      setRentalOrders(
        demoRentalOrders.map((order) => ({
          id: order.id,
          customerId: "",
          status: order.status,
          startDate: order.startDate,
          endDate: order.endDate,
          totalAmount: String(order.totalAmount),
          notes: null,
          createdAt: order.startDate,
          updatedAt: order.startDate,
          customer: { id: "", name: order.customerName, email: "" },
          items: [
            {
              id: `${order.id}-item`,
              rentalOrderId: order.id,
              gearItemId: `${order.id}-gear`,
              quantity: 1,
              pricePerDay: "0",
              subtotal: String(order.totalAmount),
              gearItem: {
                id: `${order.id}-gear`,
                name: order.gearTitle,
                images: [],
                pricePerDay: "0",
                stock: 1,
                availableStock: 1,
                isActive: true,
              },
            },
          ],
          payment: null,
        })),
      );

      setMeta((current) => ({
        ...current,
        total: demoRentalOrders.length,
        totalPages: 1,
      }));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // ====================================================
  // EFFECT
  // ====================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          <h1 className="font-display text-2xl font-semibold">همه اجاره‌ها</h1>

          <p className="mt-1 text-sm text-muted">
            همه سفارش‌های اجاره ثبت‌شده در پلتفرم.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="mb-4 h-10 w-10 text-muted" />

            <h2 className="text-lg font-semibold">بارگذاری اجاره‌ها ممکن نشد</h2>

            <p className="mt-2 max-w-md text-center text-sm text-muted">
              {error}
            </p>

            <Button className="mt-5" onClick={fetchRentals}>
              <RefreshCw className="me-2 h-4 w-4" />
              تلاش دوباره
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
          <h1 className="font-display text-2xl font-semibold">همه اجاره‌ها</h1>

          <p className="mt-1 text-sm text-muted">
            همه سفارش‌های اجاره ثبت‌شده در پلتفرم.
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
              <SelectValue placeholder="فیلتر وضعیت" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>

              {RENTAL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {rentalStatusLabel[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* TOTAL */}

          <Badge variant="outline">{formatNumber(meta.total)} سفارش</Badge>

          {/* REFRESH */}

          <Button variant="outline" onClick={fetchRentals} disabled={loading}>
            <RefreshCw
              className={`me-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            بارگذاری مجدد
          </Button>
        </div>
      </div>

      {/* =================================================
          TABLE CARD
      ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>سفارش‌های اجاره</CardTitle>
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

              <h2 className="text-lg font-semibold">سفارش اجاره‌ای وجود ندارد</h2>

              <p className="mt-1 text-sm text-muted">
                سفارشی با این فیلتر یافت نشد.
              </p>
            </div>
          ) : (
            /* DATA */

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>سفارش</TableHead>
                    <TableHead>کالا</TableHead>
                    <TableHead>مشتری</TableHead>
                    <TableHead>تاریخ‌ها</TableHead>
                    <TableHead>جمع کل</TableHead>
                    <TableHead>پرداخت</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rentalOrders.map((order) => (
                    <TableRow key={order.id}>
                      {/* ORDER */}

                      <TableCell>
                        <p dir="ltr" className="text-start font-mono text-xs font-medium">
                          #{order.id.slice(0, 8)}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {formatJalaliDateTime(order.createdAt)}
                        </p>
                      </TableCell>

                      {/* GEAR */}

                      <TableCell>
                        <div className="max-w-[280px]">
                          <p className="font-medium">
                            {getGearNames(order.items)}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            {formatNumber(order.items.length)} کالا
                          </p>
                        </div>
                      </TableCell>

                      {/* CUSTOMER */}

                      <TableCell>
                        <p className="font-medium">
                          {order.customer?.name ?? "ناشناس"}
                        </p>

                        <p dir="ltr" className="text-start text-xs text-muted">
                          {order.customer?.email ?? "-"}
                        </p>
                      </TableCell>

                      {/* DATES */}

                      <TableCell>
                        <div className="whitespace-nowrap">
                          <p className="font-medium">
                            {formatJalali(order.startDate)}
                          </p>

                          <p className="text-xs text-muted">
                            تا {formatJalali(order.endDate)}
                          </p>
                        </div>
                      </TableCell>

                      {/* TOTAL */}

                      <TableCell>
                        <span className="font-semibold">
                          {formatToman(Number(order.totalAmount))}
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
                            {paymentStatusLabel[
                              order.payment.status as PaymentStatus
                            ] ?? order.payment.status}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted">پرداخت نشده</span>
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
            صفحه {formatNumber(meta.page)} از {formatNumber(meta.totalPages)}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" />
              قبلی
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(meta.totalPages, current + 1))
              }
            >
              بعدی
              <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
