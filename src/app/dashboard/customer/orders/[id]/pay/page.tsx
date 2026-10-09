"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";

import { CreditCard, Loader2, ShieldCheck, Package } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { api, ApiRequestError } from "@/lib/api";
import { toast } from "sonner";

import type { RentalStatus } from "@/types";

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

type CustomerOrder = {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: string | number;
  status: RentalStatus;
  items?: RentalItem[];

  // Optional fallback
  gearTitle?: string;
};

type RentalApiResponse = {
  success?: boolean;
  message?: string;
  data?: CustomerOrder[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type PaymentMethod = "stripe" | null;

type PaymentResponse = {
  payment?: {
    id: string;
    transactionId: string;
    status: string;
    amount: number | string;
  };

  redirectUrl?: string | null;
  sessionId?: string;
};

// =====================================================
// HELPERS
// =====================================================

function extractOrders(response: unknown): CustomerOrder[] {
  // Case 1: Direct array
  if (Array.isArray(response)) {
    return response as CustomerOrder[];
  }

  // Case 2:
  // {
  //   success: true,
  //   data: [...]
  // }

  if (typeof response === "object" && response !== null && "data" in response) {
    const outer = response as {
      data?: unknown;
    };

    if (Array.isArray(outer.data)) {
      return outer.data as CustomerOrder[];
    }

    // Case 3:
    // {
    //   data: {
    //     data: [...]
    //   }
    // }

    if (
      typeof outer.data === "object" &&
      outer.data !== null &&
      "data" in outer.data
    ) {
      const nested = outer.data as {
        data?: unknown;
      };

      if (Array.isArray(nested.data)) {
        return nested.data as CustomerOrder[];
      }
    }
  }

  return [];
}

function extractPaymentResponse(response: unknown): PaymentResponse {
  // Direct response:
  // {
  //   payment: {...},
  //   redirectUrl: "..."
  // }

  if (typeof response === "object" && response !== null) {
    const value = response as Record<string, unknown>;

    if ("redirectUrl" in value || "payment" in value) {
      return response as PaymentResponse;
    }

    // Wrapped response:
    // {
    //   success: true,
    //   data: {
    //     payment: {...},
    //     redirectUrl: "..."
    //   }
    // }

    if (
      "data" in value &&
      typeof value.data === "object" &&
      value.data !== null
    ) {
      return value.data as PaymentResponse;
    }
  }

  return {};
}

function getGearTitle(order: CustomerOrder) {
  if (order.gearTitle) {
    return order.gearTitle;
  }

  const items = order.items ?? [];

  if (items.length === 0) {
    return "Rental gear";
  }

  const names = items.map((item) => item.gearItem?.name).filter(Boolean);

  if (names.length === 0) {
    return "Rental gear";
  }

  if (names.length === 1) {
    return names[0] as string;
  }

  return `${names[0]} + ${names.length - 1} more`;
}

function getGearImage(order: CustomerOrder) {
  return order.items?.[0]?.gearItem?.images?.[0] ?? null;
}

// =====================================================
// PAYMENT PAGE
// =====================================================

export default function PayOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<CustomerOrder | null>(null);

  const [loadingOrder, setLoadingOrder] = useState(true);

  const [loadError, setLoadError] = useState(false);

  const [method, setMethod] = useState<PaymentMethod>(null);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD ORDER
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        setLoadingOrder(true);
        setLoadError(false);

        /*
         * Backend:
         *
         * GET /api/rentals
         */

        const response = await api.get<unknown>("/rentals");

        if (!mounted) return;

        console.log("RENTALS RESPONSE:", response);

        const orders = extractOrders(response);

        const foundOrder = orders.find((item) => item.id === id) ?? null;

        setOrder(foundOrder);
      } catch (error) {
        if (!mounted) return;

        console.error("LOAD RENTAL ORDER ERROR:", error);

        setLoadError(true);

        toast.error(
          error instanceof ApiRequestError
            ? error.message
            : "Could not load this rental order.",
        );
      } finally {
        if (mounted) {
          setLoadingOrder(false);
        }
      }
    }

    if (id) {
      loadOrder();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // =====================================================
  // START STRIPE PAYMENT
  // =====================================================

  async function pay() {
    if (!order) {
      return;
    }

    if (!method) {
      toast.error("Please select a payment method.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post<unknown>("/payments/create", {
        rentalOrderId: order.id,
        method: "STRIPE",
      });

      console.log("PAYMENT CREATE RESPONSE:", response);

      const result = extractPaymentResponse(response);

      if (!result.redirectUrl) {
        throw new Error(
          "Stripe payment redirect URL was not returned by the server.",
        );
      }

      /*
       * Redirect to actual Stripe Checkout.
       */
      window.location.href = result.redirectUrl;
    } catch (error) {
      console.error("Payment creation error:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to create Stripe payment session.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (loadError) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <CreditCard className="h-5 w-5 text-danger" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Unable to load this rental order
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =====================================================
  // LOADING SKELETON
  // =====================================================

  if (loadingOrder) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-56" />

                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Summary */}

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 shrink-0 rounded-md" />

                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-52" />

                  <Skeleton className="h-4 w-40" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />

                  <Skeleton className="h-7 w-28" />
                </div>
              </div>
            </div>

            {/* Payment Method */}

            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />

              {/* Stripe */}

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Skeleton className="h-10 w-10 rounded-md" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />

                  <Skeleton className="h-4 w-40" />
                </div>

                <Skeleton className="h-4 w-4 rounded-full" />
              </div>

              {/* SSLCommerz */}

              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                <Skeleton className="h-10 w-10 rounded-md" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />

                  <Skeleton className="h-4 w-36" />
                </div>

                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>

            <Separator />

            {/* Security */}

            <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-4">
              <Skeleton className="h-5 w-5 rounded-full" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />

                <Skeleton className="h-3 w-full" />

                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>

            {/* Button */}

            <Skeleton className="h-11 w-full rounded-md" />

            <Skeleton className="mx-auto h-3 w-56" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!order) {
    notFound();
  }

  const gearTitle = getGearTitle(order);

  const gearImage = getGearImage(order);

  // =====================================================
  // PAYMENT PAGE
  // =====================================================

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Card>
        {/* =================================================
            HEADER
        ================================================= */}

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>

            <div>
              <CardTitle>Complete your payment</CardTitle>

              <CardDescription>
                Choose your preferred payment method to complete this rental.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {/* Gear Image */}

                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background">
                  {gearImage ? (
                    <img
                      src={gearImage}
                      alt={gearTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div>
                  <p className="font-medium">{gearTitle}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.startDate}
                    {" → "}
                    {order.endDate}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground">Total due</p>

                <p className="text-xl font-bold">
                  ${Number(order.totalAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              PAYMENT METHODS
          ================================================= */}

          <div className="space-y-3">
            <p className="text-sm font-medium">Select payment method</p>

            {/* Stripe */}

            <button
              type="button"
              onClick={() => setMethod("stripe")}
              disabled={loading}
              className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                method === "stripe"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Pay with Stripe</p>

                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Available
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  International cards
                </p>
              </div>

              <div
                className={`h-4 w-4 rounded-full border-2 ${
                  method === "stripe"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                }`}
              />
            </button>

            {/* SSLCommerz - Coming Soon */}

            <div className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg border border-border bg-muted/30 p-4 opacity-70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-muted-foreground">
                    Pay with SSLCommerz
                  </p>

                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Coming Soon
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  bKash, Nagad, cards
                </p>
              </div>

              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />
            </div>
          </div>

          <Separator />

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

            <div>
              <p className="text-sm font-medium">Secure payment</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Your payment is processed securely through Stripe. We do not
                store your card details.
              </p>
            </div>
          </div>

          {/* =================================================
              PAY BUTTON
          ================================================= */}

          <Button
            type="button"
            onClick={pay}
            disabled={!method || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Stripe...
              </>
            ) : (
              <>Pay ${Number(order.totalAmount).toFixed(2)}</>
            )}
          </Button>

          {!method && (
            <p className="text-center text-xs text-muted-foreground">
              Please select Stripe to continue.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
