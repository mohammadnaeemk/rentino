"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Wallet, ClipboardList, Star } from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatCard } from "@/components/dashboard/stat-card";
import { OrderStatusBadge } from "@/components/order-status-badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { api, ApiRequestError, type ApiResponse } from "@/lib/api";

import type { RentalStatus } from "@/types";

// =========================
// Types
// =========================

type DashboardOrder = {
  id: string;
  gearTitle: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
};

type RevenuePoint = {
  month: string;
  revenue: number;
};

interface ProviderDashboard {
  totalGear?: number;
  pendingOrders?: number;
  gearListed?: number;
  activeRentals?: number;
  totalRevenue?: number;
  revenue30d?: number;
  averageRating?: number;
  avgRating?: number;

  revenueByMonth?: RevenuePoint[];
  monthlyRevenue?: RevenuePoint[];

  recentOrders?: DashboardOrder[];
  orders?: DashboardOrder[];
}

const emptyDashboard: ProviderDashboard = {
  totalGear: 0,
  pendingOrders: 0,
  gearListed: 0,
  activeRentals: 0,
  totalRevenue: 0,
  revenue30d: 0,
  averageRating: 0,
  avgRating: 0,
  revenueByMonth: [],
  monthlyRevenue: [],
  recentOrders: [],
  orders: [],
};

// =========================
// Helpers
// =========================

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// =========================
// Skeleton Components
// =========================

function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>

              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RevenueSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>

      <CardContent className="h-72">
        <div className="flex h-full items-end justify-between gap-4 px-4 pb-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex h-full flex-1 items-end">
              <Skeleton
                className="w-full rounded-t-md"
                style={{
                  height: `${35 + index * 9}%`,
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gear</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// =========================
// Page
// =========================

export default function ProviderOverviewPage() {
  const [dashboard, setDashboard] = useState<ProviderDashboard>(emptyDashboard);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // =========================
  // Load dashboard
  // =========================

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<ApiResponse<ProviderDashboard>>(
          "/provider/dashboard",
        );

        if (!active) return;

        setDashboard(response.data ?? emptyDashboard);
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError instanceof ApiRequestError
            ? requestError.message
            : "Could not load your dashboard.",
        );
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

  // =========================
  // Dashboard values
  // =========================

  const gearListed = dashboard.gearListed ?? dashboard.totalGear ?? 0;

  const activeRentals = dashboard.activeRentals ?? 0;

  const pendingOrders = dashboard.pendingOrders ?? 0;

  const totalRevenue = dashboard.totalRevenue ?? 0;

  const averageRating = dashboard.avgRating ?? dashboard.averageRating ?? 0;

  // =========================
  // Revenue
  // =========================

  const chartData = dashboard.revenueByMonth ?? dashboard.monthlyRevenue ?? [];

  // =========================
  // Orders
  // =========================

  const orders = dashboard.recentOrders ?? dashboard.orders ?? [];

  // =========================
  // Render
  // =========================

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="font-display text-2xl font-semibold">
          Provider overview
        </h1>

        <p className="mt-1 text-sm text-muted">
          Track your inventory performance and incoming bookings.
        </p>
      </div>

      {/* Error */}

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* =========================
          Stats
      ========================= */}

      {loading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Gear listed"
            value={String(gearListed)}
            icon={Package}
          />

          <StatCard
            label="Active rentals"
            value={String(activeRentals)}
            icon={ClipboardList}
          />

          <StatCard
            label="Pending requests"
            value={String(pendingOrders)}
            icon={ClipboardList}
          />

          <StatCard
            label="Total revenue"
            value={formatCurrency(totalRevenue)}
            icon={Wallet}
          />

          <StatCard
            label="Avg. rating"
            value={averageRating.toFixed(1)}
            icon={Star}
          />
        </div>
      )}

      {/* =========================
          Revenue
      ========================= */}

      {loading ? (
        <RevenueSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Revenue, last 6 months</CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {chartData.length === 0 ? (
              <p className="py-24 text-center text-sm text-muted">
                No revenue data yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="var(--color-muted)"
                    fontSize={12}
                  />

                  <YAxis stroke="var(--color-muted)" fontSize={12} />

                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* =========================
          Incoming Orders
      ========================= */}

      {loading ? (
        <OrdersSkeleton />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Incoming orders</CardTitle>

            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/provider/orders">View all</Link>
            </Button>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gear</TableHead>

                  <TableHead>Customer</TableHead>

                  <TableHead>Dates</TableHead>

                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.slice(0, 4).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.gearTitle}
                    </TableCell>

                    <TableCell className="text-muted">
                      {order.customerName}
                    </TableCell>

                    <TableCell className="text-muted">
                      {order.startDate} → {order.endDate}
                    </TableCell>

                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}

                {orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted"
                    >
                      No incoming orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
