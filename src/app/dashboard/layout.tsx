"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);

      return;
    }

    const role = user.role.toLowerCase();

    if (pathname.startsWith("/dashboard/customer")) {
      if (role !== "customer") {
        router.replace(`/dashboard/${role}`);
        return;
      }
    }

    if (pathname.startsWith("/dashboard/provider")) {
      if (role !== "provider") {
        router.replace(`/dashboard/${role}`);
        return;
      }
    }

    if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "admin") {
        router.replace(`/dashboard/${role}`);
        return;
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
