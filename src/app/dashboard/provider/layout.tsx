"use client";

import { LayoutDashboard, Package, ClipboardList, UserCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const navItems = [
  { href: "/dashboard/provider", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/provider/gear", label: "Inventory", icon: Package },
  { href: "/dashboard/provider/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/provider/profile", label: "Profile", icon: UserCircle },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Provider">
      {children}
    </DashboardShell>
  );
}
