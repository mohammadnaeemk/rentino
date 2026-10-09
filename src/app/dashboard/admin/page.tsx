"use client";

import { Users, Package, ClipboardList, Wallet } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { api, ApiRequestError } from "@/lib/api";
import { useEffect, useState } from "react";

// =====================================================
// Types
// =====================================================

interface OrderStatus {
  status: string;
  count: number;
}

interface AdminDashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalGear: number;
  totalOrders: number;
  activeOrders: number;
  totalRevenue: string | number;
  ordersByStatus: OrderStatus[];
}

interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardStats;
}

const COLORS = [
  "#F2A93B",
  "#4FD1C5",
  "#C9791E",
  "#12777A",
  "#8B8B85",
  "#B3402A",
];

// =====================================================
// Safe default stats
// =====================================================

const EMPTY_STATS: AdminDashboardStats = {
  totalUsers: 0,
  totalCustomers: 0,
  totalProviders: 0,
  totalGear: 0,
  totalOrders: 0,
  activeOrders: 0,
  totalRevenue: 0,
  ordersByStatus: [],
};

// =====================================================
// Component
// =====================================================

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminDashboardStats>(EMPTY_STATS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===================================================
  // Fetch dashboard
  // ===================================================

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError(null);

      const response =
        await api.get<AdminDashboardResponse>("/admin/dashboard");

      console.log("ADMIN DASHBOARD RESPONSE:", response);

      // Backend response:
      //
      // {
      //   success: true,
      //   message: "...",
      //   data: {
      //      totalUsers: ...,
      //      totalCustomers: ...,
      //      ...
      //   }
      // }

      if (
        !response ||
        typeof response !== "object" ||
        !response.data ||
        typeof response.data !== "object"
      ) {
        throw new Error("Invalid dashboard response from server.");
      }

      setStats({
        ...EMPTY_STATS,
        ...response.data,
        ordersByStatus: Array.isArray(response.data.ordersByStatus)
          ? response.data.ordersByStatus
          : [],
      });
    } catch (err) {
      console.error("Failed to fetch admin dashboard:", err);

      setError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // Initial fetch
  // ===================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ===================================================
  // Loading
  // ===================================================

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Platform overview
          </h1>

          <p className="mt-1 text-sm text-muted">
            Global health across all users, gear, and rentals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-muted/40"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl bg-muted/40" />
          <div className="h-96 animate-pulse rounded-xl bg-muted/40" />
        </div>
      </div>
    );
  }

  // ===================================================
  // Error
  // ===================================================

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Platform overview
          </h1>

          <p className="mt-1 text-sm text-muted">
            Global health across all users, gear, and rentals.
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>

        <button
          onClick={fetchDashboard}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  // ===================================================
  // Safe values
  // ===================================================

  const totalUsers = Number(stats.totalUsers || 0);
  const totalCustomers = Number(stats.totalCustomers || 0);
  const totalProviders = Number(stats.totalProviders || 0);
  const totalGear = Number(stats.totalGear || 0);
  const totalOrders = Number(stats.totalOrders || 0);
  const activeOrders = Number(stats.activeOrders || 0);
  const revenue = Number(stats.totalRevenue || 0);

  const bookingData = Array.isArray(stats.ordersByStatus)
    ? stats.ordersByStatus.map((item) => ({
        name: String(item.status || "").replaceAll("_", " "),
        value: Number(item.count || 0),
      }))
    : [];

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="font-display text-2xl font-semibold">
          Platform overview
        </h1>

        <p className="mt-1 text-sm text-muted">
          Global health across all users, gear, and rentals.
        </p>
      </div>

      {/* Main Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={totalUsers.toLocaleString()}
          icon={Users}
        />

        <StatCard
          label="Active gear listings"
          value={totalGear.toLocaleString()}
          icon={Package}
        />

        <StatCard
          label="Total rentals"
          value={totalOrders.toLocaleString()}
          icon={ClipboardList}
        />

        <StatCard
          label="Total revenue"
          value={`$${revenue.toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      {/* Additional Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">Customers</p>

            <p className="mt-2 text-2xl font-semibold">
              {totalCustomers.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">Providers</p>

            <p className="mt-2 text-2xl font-semibold">
              {totalProviders.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">Active orders</p>

            <p className="mt-2 text-2xl font-semibold">
              {activeOrders.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by Status */}

        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {bookingData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No order data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {bookingData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}

        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {bookingData.length > 0 ? (
                bookingData.map((order) => (
                  <div
                    key={order.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{order.name}</p>

                      <p className="text-sm text-muted">Rental orders</p>
                    </div>

                    <Badge variant="secondary">{order.value}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No orders available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
