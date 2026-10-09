"use client";

import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  Tags,
  UserCircle,
  Newspaper,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const navItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
  { href: "/dashboard/admin/gear", label: "Manage Gear", icon: Package },
  { href: "/dashboard/admin/rentals", label: "Rentals", icon: ClipboardList },
  { href: "/dashboard/admin/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/dashboard/admin/profile", label: "Profile", icon: UserCircle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Admin">
      {children}
    </DashboardShell>
  );
}
