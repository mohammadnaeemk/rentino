import { Injectable } from "@nestjs/common";
import { RentalStatus, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

/** Statuses in which an order's money is considered earned by the provider. */
const REVENUE_STATUSES: RentalStatus[] = [
  RentalStatus.PAID,
  RentalStatus.PICKED_UP,
  RentalStatus.RETURNED,
];

/** Statuses that mean "the order is still in flight". */
const ACTIVE_STATUSES: RentalStatus[] = [
  RentalStatus.PLACED,
  RentalStatus.CONFIRMED,
  RentalStatus.PAID,
  RentalStatus.PICKED_UP,
];

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface DashboardOrder {
  id: string;
  gearTitle: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  totalAmount: number;
}

export interface ProviderDashboardDto {
  totalGear: number;
  gearListed: number;
  activeRentals: number;
  pendingOrders: number;
  totalRevenue: number;
  revenue30d: number;
  averageRating: number;
  avgRating: number;
  revenueByMonth: RevenuePoint[];
  monthlyRevenue: RevenuePoint[];
  recentOrders: DashboardOrder[];
  orders: DashboardOrder[];
}

export interface AdminDashboardDto {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalGear: number;
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  ordersByStatus: { status: RentalStatus; count: number }[];
}

const MONTH_COUNT = 6;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async forProvider(providerId: string): Promise<ProviderDashboardDto> {
    const now = new Date();
    const since = startOfMonth(now, MONTH_COUNT - 1);
    const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const providerItemFilter = { gearItem: { providerId } };

    const [
      totalGear,
      gearListed,
      pendingOrders,
      activeRentals,
      revenueItems,
      rating,
      recentOrders,
      revenueOrders,
    ] = await Promise.all([
      this.prisma.gearItem.count({ where: { providerId } }),
      this.prisma.gearItem.count({ where: { providerId, isActive: true } }),
      this.prisma.rentalOrder.count({
        where: {
          status: RentalStatus.PLACED,
          items: { some: providerItemFilter },
        },
      }),
      this.prisma.rentalOrder.count({
        where: {
          status: { in: ACTIVE_STATUSES },
          items: { some: providerItemFilter },
        },
      }),
      this.prisma.rentalOrderItem.findMany({
        where: {
          ...providerItemFilter,
          rentalOrder: { status: { in: REVENUE_STATUSES } },
        },
        select: {
          subtotal: true,
          rentalOrder: { select: { createdAt: true } },
        },
      }),
      this.prisma.gearItem.aggregate({
        where: { providerId, reviewCount: { gt: 0 } },
        _avg: { avgRating: true },
      }),
      this.prisma.rentalOrder.findMany({
        where: { items: { some: providerItemFilter } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { name: true } },
          items: { select: { gearItem: { select: { name: true } } } },
        },
      }),
      // Every earned subtotal in the last 6 months, for the revenue chart.
      this.prisma.rentalOrderItem.findMany({
        where: {
          ...providerItemFilter,
          rentalOrder: {
            status: { in: REVENUE_STATUSES },
            createdAt: { gte: since },
          },
        },
        select: {
          subtotal: true,
          rentalOrder: { select: { createdAt: true } },
        },
      }),
    ]);

    const totalRevenue = sum(revenueItems.map((item) => item.subtotal));
    const revenue30d = sum(
      revenueItems
        .filter((item) => item.rentalOrder.createdAt >= since30d)
        .map((item) => item.subtotal),
    );
    const averageRating = round2(rating._avg.avgRating ?? 0);

    const revenueByMonth = bucketByMonth(revenueOrders, MONTH_COUNT);

    return {
      totalGear,
      gearListed,
      activeRentals,
      pendingOrders,
      totalRevenue,
      revenue30d,
      averageRating,
      avgRating: averageRating,
      revenueByMonth,
      monthlyRevenue: revenueByMonth,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        gearTitle: order.items[0]?.gearItem.name ?? "",
        customerName: order.customer.name,
        startDate: toDateOnly(order.startDate),
        endDate: toDateOnly(order.endDate),
        status: order.status,
        totalAmount: order.totalAmount,
      })),
      orders: [],
    };
  }

  async forAdmin(): Promise<AdminDashboardDto> {
    const [
      roleCounts,
      totalGear,
      totalOrders,
      activeOrders,
      statusGroups,
      revenue,
    ] = await Promise.all([
      this.prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      this.prisma.gearItem.count(),
      this.prisma.rentalOrder.count(),
      this.prisma.rentalOrder.count({
        where: { status: { in: ACTIVE_STATUSES } },
      }),
      this.prisma.rentalOrder.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

    const countFor = (role: Role) =>
      roleCounts.find((entry) => entry.role === role)?._count._all ?? 0;

    return {
      totalUsers: roleCounts.reduce(
        (total, entry) => total + entry._count._all,
        0,
      ),
      totalCustomers: countFor(Role.CUSTOMER),
      totalProviders: countFor(Role.PROVIDER),
      totalGear,
      totalOrders,
      activeOrders,
      totalRevenue: revenue._sum.amount ?? 0,
      ordersByStatus: statusGroups.map((group) => ({
        status: group.status,
        count: group._count._all,
      })),
    };
  }
}

// --- helpers ---------------------------------------------------------------

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(reference: Date, monthsBack: number): Date {
  return new Date(
    Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth() - monthsBack,
      1,
    ),
  );
}

/**
 * Groups earned subtotals into the last `months` calendar months and labels
 * each bucket with its Persian month name (e.g. «مرداد»).
 */
function bucketByMonth(
  rows: { subtotal: number; rentalOrder: { createdAt: Date } }[],
  months: number,
): RevenuePoint[] {
  const now = new Date();
  const labels: string[] = [];
  const keys: string[] = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1),
    );
    keys.push(monthKey(date));
    labels.push(persianMonth(date));
  }

  const totals = new Map<string, number>(keys.map((key) => [key, 0]));
  for (const row of rows) {
    const key = monthKey(row.rentalOrder.createdAt);
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + row.subtotal);
    }
  }

  return keys.map((key, index) => ({
    month: labels[index],
    revenue: totals.get(key) ?? 0,
  }));
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

const persianMonthFormatter = new Intl.DateTimeFormat("fa-IR", {
  month: "long",
  timeZone: "UTC",
});

function persianMonth(date: Date): string {
  // Intl needs an in-month day to name the month reliably.
  return persianMonthFormatter.format(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 15)),
  );
}
