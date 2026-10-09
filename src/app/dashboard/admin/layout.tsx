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
  { href: "/dashboard/admin", label: "نمای کلی", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "مدیریت کاربران", icon: Users },
  { href: "/dashboard/admin/gear", label: "مدیریت کالاها", icon: Package },
  { href: "/dashboard/admin/rentals", label: "اجاره‌ها", icon: ClipboardList },
  { href: "/dashboard/admin/categories", label: "دسته‌بندی‌ها", icon: Tags },
  { href: "/dashboard/admin/blog", label: "وبلاگ", icon: Newspaper },
  { href: "/dashboard/admin/profile", label: "پروفایل", icon: UserCircle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell navItems={navItems} roleLabel="مدیر">
      {children}
    </DashboardShell>
  );
}
