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

import { api } from "@/lib/api";
import { formatNumber, formatToman } from "@/lib/format";
import { rentalStatusLabel } from "@/lib/labels";
import { gearItems, platformUsers, rentalOrders } from "@/lib/content";
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

// Chart palette — semantic tokens (resolved from CSS variables in both themes).
const COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--success)",
  "var(--muted)",
  "var(--danger)",
  "var(--foreground)",
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

const statusLabel = (status: string): string =>
  (rentalStatusLabel as Record<string, string>)[status] ??
  status.replaceAll("_", " ");

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

      // Mock fallback: the backend is unavailable during local development.
      const ordersByStatus: OrderStatus[] = Object.entries(
        rentalOrders.reduce<Record<string, number>>((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {}),
      ).map(([status, count]) => ({ status, count }));

      setStats({
        totalUsers: platformUsers.length,
        totalCustomers: platformUsers.filter((u) => u.role === "CUSTOMER").length,
        totalProviders: platformUsers.filter((u) => u.role === "PROVIDER").length,
        totalGear: gearItems.length,
        totalOrders: rentalOrders.length,
        activeOrders: rentalOrders.filter(
          (o) => o.status !== "CANCELLED" && o.status !== "RETURNED",
        ).length,
        totalRevenue: rentalOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        ordersByStatus,
      });
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // Initial fetch
  // ===================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
            نمای کلی پلتفرم
          </h1>

          <p className="mt-1 text-sm text-muted">
            وضعیت کلی کاربران، کالاها و اجاره‌ها.
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
            نمای کلی پلتفرم
          </h1>

          <p className="mt-1 text-sm text-muted">
            وضعیت کلی کاربران، کالاها و اجاره‌ها.
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>

        <button
          onClick={fetchDashboard}
          className="rounded-md border px-4 py-2 text-sm"
        >
          تلاش دوباره
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
        name: statusLabel(String(item.status || "")),
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
          نمای کلی پلتفرم
        </h1>

        <p className="mt-1 text-sm text-muted">
          وضعیت کلی کاربران، کالاها و اجاره‌ها.
        </p>
      </div>

      {/* Main Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="کل کاربران"
          value={formatNumber(totalUsers)}
          icon={Users}
        />

        <StatCard
          label="کالاهای فعال"
          value={formatNumber(totalGear)}
          icon={Package}
        />

        <StatCard
          label="کل اجاره‌ها"
          value={formatNumber(totalOrders)}
          icon={ClipboardList}
        />

        <StatCard
          label="کل درآمد"
          value={formatToman(revenue)}
          icon={Wallet}
        />
      </div>

      {/* Additional Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">مشتریان</p>

            <p className="mt-2 text-2xl font-semibold">
              {formatNumber(totalCustomers)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">تأمین‌کنندگان</p>

            <p className="mt-2 text-2xl font-semibold">
              {formatNumber(totalProviders)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">سفارش‌های فعال</p>

            <p className="mt-2 text-2xl font-semibold">
              {formatNumber(activeOrders)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by Status */}

        <Card>
          <CardHeader>
            <CardTitle>سفارش‌ها بر اساس وضعیت</CardTitle>
          </CardHeader>

          <CardContent className="h-72">
            {bookingData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                داده‌ای برای سفارش موجود نیست.
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
                      // RTL: reverse legend item order for Persian.
                      direction: "rtl",
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
            <CardTitle>خلاصه سفارش‌ها</CardTitle>
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

                      <p className="text-sm text-muted">سفارش‌های اجاره</p>
                    </div>

                    <Badge variant="secondary">{formatNumber(order.value)}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">سفارشی موجود نیست.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
