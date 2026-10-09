"use client";

import { LayoutDashboard, Package, CreditCard, UserCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const navItems = [
  { href: "/dashboard/customer", label: "نمای کلی", icon: LayoutDashboard },
  { href: "/dashboard/customer/orders", label: "اجاره‌های من", icon: Package },
  { href: "/dashboard/customer/payments", label: "پرداخت‌ها", icon: CreditCard },
  { href: "/dashboard/customer/profile", label: "پروفایل", icon: UserCircle },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="مشتری">
      {children}
    </DashboardShell>
  );
}
