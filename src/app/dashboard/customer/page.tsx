"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Package, Wallet, Star, Clock } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { api, type ApiResponse } from "@/lib/api";

import { formatJalali, formatNumber, formatToman } from "@/lib/format";
import { paymentStatusLabel, rentalStatusLabel } from "@/lib/labels";
import { paymentHistory, rentalOrders } from "@/lib/content";

import type { RentalStatus } from "@/types";

/* =========================================================
   TYPES
========================================================= */

type RentalGear = {
  id?: string;
  title?: string;
  name?: string;
  images?: string[];
  image?: string;
};

type RentalItem = {
  id?: string;
  quantity?: number;
  gear?: RentalGear;
};

type ApiRental = {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: number | string;
  status: RentalStatus;

  items?: RentalItem[];

  gear?: RentalGear;
  gearTitle?: string;
  image?: string;
};

type RentalOrder = {
  id: string;
  gearTitle: string;
  image?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: RentalStatus;
};

type ApiPayment = {
  id: string;
  transactionId?: string;
  amount: number | string;
  method?: string;
  status: string;
  paidAt?: string | null;
  createdAt?: string;
};

type PaymentHistoryItem = {
  id: string;
  transactionId: string;
  method: string;
  amount: number;
  status: string;
  paidAt?: string | null;
};

type PaginatedRentalResponse = {
  success?: boolean;
  message?: string;
  data?: ApiRental[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

type PaginatedPaymentResponse = {
  success?: boolean;
  message?: string;
  data?: ApiPayment[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

/* =========================================================
   TABS
========================================================= */

const tabs: {
  value: RentalStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "همه" },
  { value: "PLACED", label: rentalStatusLabel.PLACED },
  { value: "CONFIRMED", label: rentalStatusLabel.CONFIRMED },
  { value: "PAID", label: rentalStatusLabel.PAID },
  { value: "PICKED_UP", label: rentalStatusLabel.PICKED_UP },
  { value: "RETURNED", label: rentalStatusLabel.RETURNED },
];

/* =========================================================
   HELPERS
========================================================= */

function paymentStatusFor(status: string): string {
  const s = status?.toUpperCase();

  if (s === "COMPLETED" || s === "SUCCESS" || s === "PAID") {
    return paymentStatusLabel.COMPLETED;
  }

  if (s === "PENDING") return paymentStatusLabel.PENDING;

  if (s === "FAILED") return paymentStatusLabel.FAILED;

  return status || "—";
}

function paymentStatusVariant(
  status: string,
): "success" | "warning" | "destructive" | "secondary" {
  const s = status?.toUpperCase();

  if (s === "COMPLETED" || s === "SUCCESS" || s === "PAID") return "success";

  if (s === "FAILED") return "destructive";

  if (s === "PENDING") return "warning";

  return "secondary";
}

/* =========================================================
   RENTAL MAPPER
========================================================= */

function toRentalOrder(order: ApiRental): RentalOrder {
  const firstItem = order.items?.[0];

  const gear = firstItem?.gear ?? order.gear;

  const gearTitle = order.gearTitle ?? gear?.title ?? gear?.name ?? "کالا";

  const image = order.image ?? gear?.images?.[0] ?? gear?.image;

  return {
    id: order.id,
    gearTitle,
    image,
    startDate: order.startDate,
    endDate: order.endDate,
    totalAmount: Number(order.totalAmount) || 0,
    status: order.status,
  };
}

/* =========================================================
   PAYMENT MAPPER
========================================================= */

function toPaymentHistory(payment: ApiPayment): PaymentHistoryItem {
  return {
    id: payment.id,

    transactionId: payment.transactionId ?? payment.id,

    method: payment.method ?? "پرداخت",

    amount: Number(payment.amount) || 0,

    status: payment.status,

    paidAt: payment.paidAt ?? payment.createdAt ?? null,
  };
}

/* =========================================================
   FIXTURE MAPPERS (backend unavailable → demo data)
========================================================= */

function toRentalOrderFromFixture(
  fixture: (typeof rentalOrders)[number],
): RentalOrder {
  return {
    id: fixture.id,
    gearTitle: fixture.gearTitle,
    startDate: fixture.startDate,
    endDate: fixture.endDate,
    totalAmount: fixture.totalAmount,
    status: fixture.status,
  };
}

function toPaymentHistoryFromFixture(
  fixture: (typeof paymentHistory)[number],
): PaymentHistoryItem {
  return {
    id: fixture.id,
    transactionId: fixture.transactionId,
    method: fixture.method,
    amount: fixture.amount,
    status: fixture.status,
    paidAt: fixture.paidAt,
  };
}

/* =========================================================
   TABLE SKELETON
========================================================= */

function RentalTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="h-11 w-14 shrink-0 animate-pulse rounded-md bg-surface-muted" />

              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
              </div>
            </div>
          </TableCell>

          <TableCell>
            <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
          </TableCell>

          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
          </TableCell>

          <TableCell>
            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-muted" />
          </TableCell>

          <TableCell className="text-end">
            <div className="ms-auto h-8 w-20 animate-pulse rounded bg-surface-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/* =========================================================
   PAYMENT TABLE SKELETON
========================================================= */

function PaymentTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
          </TableCell>

          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
          </TableCell>

          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
          </TableCell>

          <TableCell>
            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-muted" />
          </TableCell>

          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/* =========================================================
   STAT VALUE SKELETON
========================================================= */

function StatValueSkeleton() {
  return <div className="h-7 w-20 animate-pulse rounded bg-surface-muted" />;
}

/* =========================================================
   PAGE
========================================================= */

export default function CustomerOverviewPage() {
  const [tab, setTab] = useState<RentalStatus | "ALL">("ALL");

  const [rentals, setRentals] = useState<RentalOrder[]>([]);

  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [rentalResponse, paymentResponse] = await Promise.all([
          api.get<ApiResponse<ApiRental[]> | PaginatedRentalResponse>(
            "/rentals?limit=100",
          ),

          api.get<ApiResponse<ApiPayment[]> | PaginatedPaymentResponse>(
            "/payments?limit=100",
          ),
        ]);

        if (!active) return;

        /* -----------------------------------------------
           RENTALS
        ------------------------------------------------ */

        const rentalData = "data" in rentalResponse ? rentalResponse.data : [];

        const rentalArray = Array.isArray(rentalData) ? rentalData : [];

        setRentals(
          rentalArray.length > 0
            ? rentalArray.map(toRentalOrder)
            : rentalOrders.map(toRentalOrderFromFixture),
        );

        /* -----------------------------------------------
           PAYMENTS
        ------------------------------------------------ */

        const paymentData =
          "data" in paymentResponse ? paymentResponse.data : [];

        const paymentArray = Array.isArray(paymentData) ? paymentData : [];

        setPayments(
          paymentArray.length > 0
            ? paymentArray.map(toPaymentHistory)
            : paymentHistory.map(toPaymentHistoryFromFixture),
        );
      } catch {
        if (!active) return;

        // Backend unavailable — render the demo fixtures.
        setRentals(rentalOrders.map(toRentalOrderFromFixture));
        setPayments(paymentHistory.map(toPaymentHistoryFromFixture));
        setError(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredOrders = useMemo(() => {
    if (tab === "ALL") {
      return rentals;
    }

    return rentals.filter((order) => order.status === tab);
  }, [rentals, tab]);

  /* =======================================================
     STATS
  ======================================================= */

  const activeRentals = rentals.filter(
    (order) =>
      order.status === "CONFIRMED" ||
      order.status === "PAID" ||
      order.status === "PICKED_UP",
  ).length;

  const totalSpent = payments
    .filter(
      (payment) =>
        payment.status === "COMPLETED" ||
        payment.status === "SUCCESS" ||
        payment.status === "PAID",
    )
    .reduce((total, payment) => total + payment.amount, 0);

  const upcomingRental = rentals
    .filter((order) => order.status === "CONFIRMED" || order.status === "PAID")
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )[0];

  const reviewsLeft = rentals.filter(
    (order) => order.status === "RETURNED",
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="font-display text-2xl font-semibold">خوش آمدید</h1>

        <p className="mt-1 text-sm text-muted">
          در ادامه وضعیت اجاره‌های شما را می‌بینید.
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/10 p-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="اجاره‌های فعال"
          value={loading ? "..." : formatNumber(activeRentals)}
          icon={Package}
        />

        <StatCard
          label="مجموع پرداختی"
          value={loading ? "..." : formatToman(totalSpent)}
          icon={Wallet}
        />

        <StatCard
          label="تحویل بعدی"
          value={
            loading
              ? "..."
              : upcomingRental
                ? formatJalali(upcomingRental.startDate)
                : "—"
          }
          icon={Clock}
        />

        <StatCard
          label="نظرهای باقی‌مانده"
          value={loading ? "..." : formatNumber(reviewsLeft)}
          icon={Star}
        />
      </div>

      {/* =================================================
          RENTAL HISTORY
      ================================================= */}

      <Card>
        {/* Header ALWAYS visible */}

        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>تاریخچه سفارش‌های اجاره</CardTitle>

          <Button variant="outline" size="sm" asChild>
            <Link href="/gear">اجاره کالای جدید</Link>
          </Button>
        </CardHeader>

        <CardContent>
          {/* Tabs ALWAYS visible */}

          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as RentalStatus | "ALL")}
          >
            <TabsList className="flex-wrap">
              {tabs.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  disabled={loading}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Table */}

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کالا</TableHead>

                  <TableHead>تاریخ‌ها</TableHead>

                  <TableHead>جمع کل</TableHead>

                  <TableHead>وضعیت</TableHead>

                  <TableHead className="text-end">عملیات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* ONLY DATA LOADING */}

                {loading ? (
                  <RentalTableSkeleton />
                ) : (
                  <>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        {/* Gear */}

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                              {order.image ? (
                                <Image
                                  src={order.image}
                                  alt={order.gearTitle}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-muted" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[180px] truncate font-medium">
                                {order.gearTitle}
                              </p>

                              <p className="text-xs text-muted">
                                کالای اجاره‌ای
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Dates */}

                        <TableCell className="whitespace-nowrap text-muted">
                          {formatJalali(order.startDate)}
                          {" → "}
                          {formatJalali(order.endDate)}
                        </TableCell>

                        {/* Total */}

                        <TableCell>
                          {formatToman(order.totalAmount)}
                        </TableCell>

                        {/* Status */}

                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>

                        {/* Action */}

                        <TableCell className="text-end">
                          {order.status === "CONFIRMED" && (
                            <Button size="sm" asChild>
                              <Link
                                href={`/dashboard/customer/orders/${order.id}/pay`}
                              >
                                پرداخت کن
                              </Link>
                            </Button>
                          )}

                          {order.status === "RETURNED" && (
                            <Button size="sm" variant="outline">
                              ثبت نظر
                            </Button>
                          )}

                          {order.status !== "CONFIRMED" &&
                            order.status !== "RETURNED" && (
                              <span className="text-xs text-muted">—</span>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Empty */}

                    {filteredOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-8 w-8 text-muted" />

                            <p className="text-sm text-muted">
                              هنوز اجاره‌ای با این وضعیت ثبت نشده است.
                            </p>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              <Link href="/gear">جستجوی کالا</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* =================================================
          PAYMENT HISTORY
      ================================================= */}

      <Card>
        {/* Header ALWAYS visible */}

        <CardHeader>
          <CardTitle>تاریخچه پرداخت‌ها</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تراکنش</TableHead>

                  <TableHead>روش پرداخت</TableHead>

                  <TableHead>مبلغ</TableHead>

                  <TableHead>وضعیت</TableHead>

                  <TableHead>تاریخ پرداخت</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* ONLY PAYMENT DATA LOADING */}

                {loading ? (
                  <PaymentTableSkeleton />
                ) : (
                  <>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs" dir="ltr">
                          {payment.transactionId}
                        </TableCell>

                        <TableCell>{payment.method}</TableCell>

                        <TableCell>{formatToman(payment.amount)}</TableCell>

                        <TableCell>
                          <Badge variant={paymentStatusVariant(payment.status)}>
                            {paymentStatusFor(payment.status)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-muted">
                          {payment.paidAt
                            ? formatJalali(payment.paidAt)
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Empty */}

                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Wallet className="h-8 w-8 text-muted" />

                            <p className="text-sm text-muted">
                              هنوز پرداختی ثبت نشده است.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
