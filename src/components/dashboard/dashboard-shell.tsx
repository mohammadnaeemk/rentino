"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Aperture, LogOut, Moon, Sun, type LucideIcon } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth-context";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

/* =========================================================
   TYPES
========================================================= */

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/* =========================================================
   TOP NAVIGATION
========================================================= */

const topNavItems = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/gear",
    label: "Browse Gear",
  },
  {
    href: "/how-it-works",
    label: "How It Works",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/contact",
    label: "Support",
  },
];

/* =========================================================
   DASHBOARD SHELL
========================================================= */

export function DashboardShell({
  children,
  navItems,
  roleLabel,
}: {
  children: React.ReactNode;
  navItems: DashboardNavItem[];
  roleLabel: string;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/");
    }
  }

  /* =======================================================
     ROLE
  ======================================================= */

  const role = user?.role?.toString().toLowerCase();

  const dashboardHref = role ? `/dashboard/${role}` : "/login";

  const profileHref = role ? `/dashboard/${role}/profile` : "/login";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex min-h-screen">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-2 border-b border-border px-6 py-5 font-display text-lg font-semibold"
        >
          <Aperture className="h-6 w-6 text-primary" strokeWidth={1.75} />
          LensLoop
        </Link>

        {/* Sidebar Navigation */}

        <nav className="flex-1 p-3">
          <p className="px-3 pb-3 pt-1 exif-chip">{roleLabel}</p>

          <div className="space-y-2">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-surface-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />

                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Logout */}

        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-danger hover:bg-surface-muted"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* =================================================
            TOP NAVBAR
        ================================================= */}

        <header className="sticky top-0 z-40 h-20 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="relative flex h-full items-center px-4 sm:px-6 lg:px-8">
            {/* CENTER NAVIGATION */}
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
              {topNavItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-primary"
                        : "text-foreground/75 hover:text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT SIDE */}
            <div className="ml-auto flex items-center gap-2">
              {/* Theme */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="hidden h-4 w-4 dark:block" />
                <Moon className="block h-4 w-4 dark:hidden" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Avatar>
                      <AvatarImage
                        src={user?.avatarUrl ?? undefined}
                        alt={user?.name ?? ""}
                      />

                      <AvatarFallback>
                        {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-semibold">
                      {user?.name ?? "User"}
                    </p>

                    {user?.email && (
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {user.email}
                      </p>
                    )}

                    {user?.role && (
                      <p className="mt-1 text-xs font-medium text-primary">
                        {user.role}
                      </p>
                    )}
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref}>Dashboard</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={profileHref}>Profile</Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-danger focus:text-danger"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* =================================================
            MOBILE TOP NAVIGATION
        ================================================= */}

        <div className="border-b border-border bg-background md:hidden">
          <nav className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
            {topNavItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/75 hover:bg-surface-muted hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
