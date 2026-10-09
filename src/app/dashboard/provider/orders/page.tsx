"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/order-status-badge";

import { api, ApiRequestError } from "@/lib/api";
import { rentalOrders } from "@/lib/content";
import { formatJalaliRange, formatNumber, formatToman } from "@/lib/format";
import type { RentalStatus } from "@/types";

/* =========================================================
   TYPES
========================================================= */

interface GearItem {
  id: string;
  name?: string;
  title?: string;
}

interface ProviderOrderItem {
  id?: string;
  gearItemId?: string;
  quantity?: number;

  gearItem?: GearItem;

  // fallback if backend uses "gear"
  gear?: GearItem;
}

interface CustomerInfo {
  id?: string;
  name?: string;
  email?: string;
}

interface ApiProviderOrder {
  id: string;

  customerId?: string;

  customer?: CustomerInfo;

  user?: CustomerInfo;

  startDate: string;
  endDate: string;

  totalAmount?: number | string;

  status: RentalStatus;

  items?: ProviderOrderItem[];

  // Possible backend fallback fields
  gearTitle?: string;
  customerName?: string;
}

interface ProviderOrder {
  id: string;
  gearTitle: string;
  customerName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: RentalStatus;
}

interface ProviderOrdersResponse {
  success?: boolean;
  message?: string;

  data?:
    | ApiProviderOrder[]
    | {
        orders?: ApiProviderOrder[];
        rentals?: ApiProviderOrder[];
      };

  orders?: ApiProviderOrder[];
  rentals?: ApiProviderOrder[];
}

/* =========================================================
   NEXT STATUS ACTIONS
========================================================= */

const nextAction: Partial<
  Record<RentalStatus, { label: string; next: RentalStatus }>
> = {
  PLACED: {
    label: "تأیید",
    next: "CONFIRMED",
  },

  PAID: {
    label: "ثبت تحویل",
    next: "PICKED_UP",
  },

  PICKED_UP: {
    label: "ثبت بازگشت",
    next: "RETURNED",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function extractOrders(
  response: ProviderOrdersResponse | ApiProviderOrder[],
): ApiProviderOrder[] {
  // Case 1:
  // Backend directly returns []
  if (Array.isArray(response)) {
    return response;
  }

  // Case 2:
  // Backend returns:
  // {
  //   success: true,
  //   data: [...]
  // }
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Case 3:
  // Backend returns:
  // {
  //   success: true,
  //   data: {
  //     orders: [...]
  //   }
  // }
  if (
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    if (Array.isArray(response.data.orders)) {
      return response.data.orders;
    }

    if (Array.isArray(response.data.rentals)) {
      return response.data.rentals;
    }
  }

  // Case 4:
  // {
  //   orders: [...]
  // }
  if (Array.isArray(response.orders)) {
    return response.orders;
  }

  // Case 5:
  // {
  //   rentals: [...]
  // }
  if (Array.isArray(response.rentals)) {
    return response.rentals;
  }

  return [];
}

function getGearTitle(order: ApiProviderOrder): string {
  // Direct field
  if (order.gearTitle) {
    return order.gearTitle;
  }

  // items[].gearItem.name
  const names =
    order.items
      ?.map((item) => {
        return (
          item.gearItem?.name ??
          item.gearItem?.title ??
          item.gear?.name ??
          item.gear?.title
        );
      })
      .filter(Boolean) ?? [];

  if (names.length > 0) {
    return names.join(", ");
  }

  return "کالا";
}

function getCustomerName(order: ApiProviderOrder): string {
  return (
    order.customerName ??
    order.customer?.name ??
    order.user?.name ??
    order.customer?.email ??
    order.user?.email ??
    "مشتری"
  );
}

function normalizeOrder(order: ApiProviderOrder): ProviderOrder {
  return {
    id: order.id,

    gearTitle: getGearTitle(order),

    customerName: getCustomerName(order),

    startDate: order.startDate,

    endDate: order.endDate,

    totalAmount: Number(order.totalAmount ?? 0),

    status: order.status,
  };
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function ProviderOrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>سفارش</TableHead>
              <TableHead>کالا</TableHead>
              <TableHead>مشتری</TableHead>
              <TableHead>تاریخ‌ها</TableHead>
              <TableHead>جمع کل</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="text-end">اقدام</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>

                <TableCell>
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD PROVIDER ORDERS
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        setLoading(true);

        const response = await api.get<
          ProviderOrdersResponse | ApiProviderOrder[]
        >("/provider/orders");

        console.log("PROVIDER ORDERS RESPONSE:", response);

        if (!mounted) {
          return;
        }

        const rawOrders = extractOrders(response);

        console.log("EXTRACTED ORDERS:", rawOrders);

        const normalizedOrders = rawOrders.map(normalizeOrder);

        setOrders(normalizedOrders);
      } catch (error) {
        console.error("Provider orders error:", error);

        if (!mounted) {
          return;
        }

        setOrders(rentalOrders);
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

  /* =====================================================
     ADVANCE ORDER STATUS
  ===================================================== */

  async function advance(id: string) {
    const order = orders.find((item) => item.id === id);

    if (!order) {
      return;
    }

    const action = nextAction[order.status];

    if (!action) {
      return;
    }

    try {
      await api.patch(`/provider/orders/${id}`, {
        status: action.next,
      });

      setOrders((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status: action.next,
              }
            : item,
        ),
      );

      toast.success("سفارش با موفقیت به‌روز شد.");
    } catch (error) {
      console.error("Order update error:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : "به‌روزرسانی سفارش ممکن نشد.",
      );
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="font-display text-2xl font-semibold">سفارش‌های ورودی</h1>

        <p className="mt-1 text-sm text-muted">
          رزروها را تأیید کنید و وضعیت را هم‌گام با جابه‌جایی کالا به‌روز کنید.
        </p>
      </div>

      {/* LOADING */}

      {loading ? (
        <ProviderOrdersSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              همه سفارش‌ها
              <span className="ms-2 text-sm font-normal text-muted">
                ({formatNumber(orders.length)})
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>سفارش</TableHead>

                    <TableHead>کالا</TableHead>

                    <TableHead>مشتری</TableHead>

                    <TableHead>تاریخ‌ها</TableHead>

                    <TableHead className="text-end">جمع کل</TableHead>

                    <TableHead>وضعیت</TableHead>

                    <TableHead className="text-end">اقدام</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {/* ORDERS */}

                  {orders.map((order) => {
                    const action = nextAction[order.status];

                    return (
                      <TableRow key={order.id}>
                        {/* ORDER ID */}

                        <TableCell className="font-mono text-xs">
                          <span
                            dir="ltr"
                            className="block max-w-28 truncate text-start"
                            title={order.id}
                          >
                            {order.id}
                          </span>
                        </TableCell>

                        {/* GEAR */}

                        <TableCell className="font-medium">
                          <span
                            className="block max-w-48 truncate"
                            title={order.gearTitle}
                          >
                            {order.gearTitle}
                          </span>
                        </TableCell>

                        {/* CUSTOMER */}

                        <TableCell className="text-muted">
                          {order.customerName}
                        </TableCell>

                        {/* DATES */}

                        <TableCell className="whitespace-nowrap text-muted">
                          {formatJalaliRange(order.startDate, order.endDate)}
                        </TableCell>

                        {/* TOTAL */}

                        <TableCell className="text-end">
                          {formatToman(order.totalAmount)}
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>

                        {/* ACTION */}

                        <TableCell className="text-end">
                          {action ? (
                            <Button size="sm" onClick={() => advance(order.id)}>
                              {action.label}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted">
                              بدون اقدام
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* EMPTY */}

                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
                        <div className="space-y-2">
                          <p className="font-medium">هنوز سفارشی ثبت نشده است.</p>

                          <p className="text-sm text-muted">
                            سفارش‌های مشتریان اینجا نمایش داده می‌شود.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
