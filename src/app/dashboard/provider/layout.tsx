"use client";

import { LayoutDashboard, Package, ClipboardList, UserCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const navItems = [
  { href: "/dashboard/provider", label: "نمای کلی", icon: LayoutDashboard },
  { href: "/dashboard/provider/gear", label: "کالاها", icon: Package },
  { href: "/dashboard/provider/orders", label: "سفارش‌ها", icon: ClipboardList },
  { href: "/dashboard/provider/profile", label: "پروفایل", icon: UserCircle },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="تأمین‌کننده">
      {children}
    </DashboardShell>
  );
}
