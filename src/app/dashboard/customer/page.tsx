"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Package, Wallet, Star, Clock } from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/dashboard/stat-card";
import { OrderStatusBadge } from "@/components/order-status-badge";

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

import { api, ApiRequestError, type ApiResponse } from "@/lib/api";

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
  { value: "ALL", label: "All" },
  { value: "PLACED", label: "Placed" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "PICKED_UP", label: "Picked up" },
  { value: "RETURNED", label: "Returned" },
];

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   RENTAL MAPPER
========================================================= */

function toRentalOrder(order: ApiRental): RentalOrder {
  const firstItem = order.items?.[0];

  const gear = firstItem?.gear ?? order.gear;

  const gearTitle = order.gearTitle ?? gear?.title ?? gear?.name ?? "Gear item";

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

    method: payment.method ?? "Payment",

    amount: Number(payment.amount) || 0,

    status: payment.status,

    paidAt: payment.paidAt ?? payment.createdAt ?? null,
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

          <TableCell className="text-right">
            <div className="ml-auto h-8 w-20 animate-pulse rounded bg-surface-muted" />
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

        setRentals(rentalArray.map(toRentalOrder));

        /* -----------------------------------------------
           PAYMENTS
        ------------------------------------------------ */

        const paymentData =
          "data" in paymentResponse ? paymentResponse.data : [];

        const paymentArray = Array.isArray(paymentData) ? paymentData : [];

        setPayments(paymentArray.map(toPaymentHistory));
      } catch (requestError) {
        if (!active) return;

        const message =
          requestError instanceof ApiRequestError
            ? requestError.message
            : "Could not load your dashboard.";

        setError(message);

        toast.error(message);
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
        <h1 className="font-display text-2xl font-semibold">Welcome back</h1>

        <p className="mt-1 text-sm text-muted">
          Here&apos;s what&apos;s happening with your rentals.
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
          label="Active rentals"
          value={loading ? "..." : String(activeRentals)}
          icon={Package}
        />

        <StatCard
          label="Total spent"
          value={loading ? "..." : formatCurrency(totalSpent)}
          icon={Wallet}
        />

        <StatCard
          label="Upcoming pickup"
          value={
            loading
              ? "..."
              : upcomingRental
                ? formatDate(upcomingRental.startDate)
                : "—"
          }
          icon={Clock}
        />

        <StatCard
          label="Reviews left"
          value={loading ? "..." : String(reviewsLeft)}
          icon={Star}
        />
      </div>

      {/* =================================================
          RENTAL HISTORY
      ================================================= */}

      <Card>
        {/* Header ALWAYS visible */}

        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Rental order history</CardTitle>

          <Button variant="outline" size="sm" asChild>
            <Link href="/gear">Rent more gear</Link>
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
                  <TableHead>Gear</TableHead>

                  <TableHead>Dates</TableHead>

                  <TableHead>Total</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="text-right">Action</TableHead>
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

                              <p className="text-xs text-muted">Rental item</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Dates */}

                        <TableCell className="whitespace-nowrap text-muted">
                          {formatDate(order.startDate)}
                          {" → "}
                          {formatDate(order.endDate)}
                        </TableCell>

                        {/* Total */}

                        <TableCell>
                          {formatCurrency(order.totalAmount)}
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
                            <Button size="sm" variant="outline">
                              Leave review
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
                              No rentals in this status yet.
                            </p>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              <Link href="/gear">Browse gear</Link>
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
          <CardTitle>Payment history</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>

                  <TableHead>Method</TableHead>

                  <TableHead>Amount</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead>Paid on</TableHead>
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
                        <TableCell className="font-mono text-xs">
                          {payment.transactionId}
                        </TableCell>

                        <TableCell>{payment.method}</TableCell>

                        <TableCell>{formatCurrency(payment.amount)}</TableCell>

                        <TableCell>
                          <OrderStatusBadge
                            status={
                              payment.status === "COMPLETED" ||
                              payment.status === "SUCCESS" ||
                              payment.status === "PAID"
                                ? "RETURNED"
                                : "PLACED"
                            }
                          />
                        </TableCell>

                        <TableCell className="text-muted">
                          {formatDate(payment.paidAt ?? undefined)}
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
                              No payment history yet.
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
