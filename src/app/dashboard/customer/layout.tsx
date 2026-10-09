"use client";

import { LayoutDashboard, Package, CreditCard, UserCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const navItems = [
  { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/customer/orders", label: "My Rentals", icon: Package },
  { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/customer/profile", label: "Profile", icon: UserCircle },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Customer">
      {children}
    </DashboardShell>
  );
}
