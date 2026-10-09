"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CreditCard, Package } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// =====================================================
// TYPES
// =====================================================

type GearItem = {
  id: string;
  name: string;
  brand?: string;
  images?: string[];
};

type RentalItem = {
  id: string;
  gearItemId: string;
  quantity: number;
  pricePerDay: string | number;
  subtotal: string | number;
  gearItem?: GearItem;
};

type RentalOrder = {
  id: string;
  customerId: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: string | number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: RentalItem[];
};

type Payment = {
  id: string;
  rentalOrderId: string;
  userId: string;
  transactionId: string;
  amount: string | number;
  method: string;
  status: string;
  gatewayResponse?: {
    reference?: string;
  };
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  rentalOrder?: RentalOrder;
};

// =====================================================
// API RESPONSE TYPE
// =====================================================

type PaymentApiResponse = {
  success?: boolean;
  message?: string;

  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  data?: Payment[];
};

// =====================================================
// SKELETON
// =====================================================

function PaymentSkeleton() {
  return (
    <div className="animate-pulse">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gear</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid on</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-md bg-muted" />

                  <div className="space-y-2">
                    <div className="h-3 w-36 rounded bg-muted" />
                    <div className="h-2.5 w-20 rounded bg-muted" />
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="h-3 w-32 rounded bg-muted" />
              </TableCell>

              <TableCell>
                <div className="h-3 w-20 rounded bg-muted" />
              </TableCell>

              <TableCell>
                <div className="h-3 w-16 rounded bg-muted" />
              </TableCell>

              <TableCell>
                <div className="h-6 w-20 rounded-full bg-muted" />
              </TableCell>

              <TableCell>
                <div className="h-3 w-24 rounded bg-muted" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// =====================================================
// HELPERS
// =====================================================

function formatAmount(amount: string | number) {
  return `$${Number(amount).toFixed(2)}`;
}

function formatDate(date?: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPaymentGear(payment: Payment) {
  return payment.rentalOrder?.items?.[0]?.gearItem;
}

// =====================================================
// PAGE
// =====================================================

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [totalPayments, setTotalPayments] = useState(0);

  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadPayments() {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<PaymentApiResponse>("/payments");

        if (!mounted) return;

        // =================================================
        // IMPORTANT
        //
        // Depending on your api.ts implementation,
        // response may be:
        //
        // 1. {
        //      success: true,
        //      data: [...]
        //    }
        //
        // OR
        //
        // 2. [...]
        //
        // OR
        //
        // 3. {
        //      data: {
        //        success: true,
        //        data: [...]
        //      }
        //    }
        //
        // We safely handle all three.
        // =================================================

        const rawResponse = response as unknown;

        let paymentList: Payment[] = [];

        let total = 0;

        // -------------------------------------------------
        // CASE 1
        //
        // api.get() returns:
        //
        // {
        //   success: true,
        //   data: [...]
        // }
        // -------------------------------------------------

        if (
          typeof rawResponse === "object" &&
          rawResponse !== null &&
          "data" in rawResponse
        ) {
          const outer = rawResponse as {
            data?: unknown;
            meta?: {
              total?: number;
            };
          };

          // data itself is array
          if (Array.isArray(outer.data)) {
            paymentList = outer.data as Payment[];
            total = outer.meta?.total ?? paymentList.length;
          }

          // data contains another response object
          else if (
            typeof outer.data === "object" &&
            outer.data !== null &&
            "data" in outer.data
          ) {
            const nested = outer.data as {
              data?: unknown;
              meta?: {
                total?: number;
              };
            };

            if (Array.isArray(nested.data)) {
              paymentList = nested.data as Payment[];

              total = nested.meta?.total ?? paymentList.length;
            }
          }
        }

        // -------------------------------------------------
        // CASE 2
        //
        // api.get() returns direct array
        // -------------------------------------------------
        else if (Array.isArray(rawResponse)) {
          paymentList = rawResponse as Payment[];
          total = paymentList.length;
        }

        // -------------------------------------------------
        // FINAL SAFETY
        // -------------------------------------------------

        if (!Array.isArray(paymentList)) {
          paymentList = [];
        }

        setPayments(paymentList);

        setTotalPayments(total || paymentList.length);
      } catch (requestError) {
        if (!mounted) return;

        console.error("PAYMENTS LOAD ERROR:", requestError);

        const message =
          requestError instanceof ApiRequestError
            ? requestError.message
            : "Could not load payment history.";

        setError(message);

        setPayments([]);

        setTotalPayments(0);

        toast.error(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // COMPLETED PAYMENTS
  // =====================================================

  const completedPayments = payments.filter(
    (payment) => payment.status?.toUpperCase() === "COMPLETED",
  ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="font-display text-2xl font-semibold">Payment history</h1>

        <p className="mt-1 text-sm text-muted">
          View all payments made for your rental orders.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted">Total payments</p>

              <p className="text-2xl font-semibold">
                {loading ? "—" : totalPayments}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted">Completed</p>

              <p className="text-2xl font-semibold">
                {loading ? "—" : completedPayments}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PAYMENT CARD */}

      <Card>
        <CardHeader>
          <CardTitle>
            {loading
              ? "Payment history"
              : `${payments.length} ${
                  payments.length === 1 ? "payment" : "payments"
                }`}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* ================================
              LOADING
          ================================= */}

          {loading && <PaymentSkeleton />}

          {/* ================================
              ERROR
          ================================= */}

          {!loading && error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center">
              <p className="font-medium text-danger">
                Could not load payment history
              </p>

              <p className="mt-1 text-sm text-muted">{error}</p>
            </div>
          )}

          {/* ================================
              EMPTY
          ================================= */}

          {!loading && !error && payments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-5 w-5 text-muted" />
              </div>

              <h3 className="mt-4 font-medium">No payments yet</h3>

              <p className="mt-1 max-w-sm text-sm text-muted">
                Your completed rental payments will appear here.
              </p>
            </div>
          )}

          {/* ================================
              TABLE
          ================================= */}

          {!loading && !error && payments.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gear</TableHead>

                    <TableHead>Transaction</TableHead>

                    <TableHead>Method</TableHead>

                    <TableHead>Amount</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead>Paid on</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {payments.map((payment) => {
                    const gear = getPaymentGear(payment);

                    const image = gear?.images?.[0];

                    return (
                      <TableRow key={payment.id}>
                        {/* GEAR */}

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                              {image ? (
                                <Image
                                  src={image}
                                  alt={gear?.name ?? "Gear"}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-4 w-4 text-muted" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate font-medium">
                                {gear?.name ?? "Rental gear"}
                              </p>

                              {gear?.brand && (
                                <p className="text-xs text-muted">
                                  {gear.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* TRANSACTION */}

                        <TableCell>
                          <span className="block max-w-[220px] truncate font-mono text-xs">
                            {payment.transactionId}
                          </span>
                        </TableCell>

                        {/* METHOD */}

                        <TableCell>
                          {payment.method === "STRIPE"
                            ? "Stripe"
                            : payment.method === "SSLCOMMERZ"
                              ? "SSLCommerz"
                              : payment.method}
                        </TableCell>

                        {/* AMOUNT */}

                        <TableCell className="font-medium">
                          {formatAmount(payment.amount)}
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                          <OrderStatusBadge
                            status={
                              payment.status?.toUpperCase() === "COMPLETED"
                                ? "RETURNED"
                                : "PLACED"
                            }
                          />
                        </TableCell>

                        {/* DATE */}

                        <TableCell className="whitespace-nowrap text-sm text-muted">
                          {formatDate(payment.paidAt ?? payment.createdAt)}
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
