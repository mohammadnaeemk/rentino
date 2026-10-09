"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Users, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { api, ApiRequestError, type ApiResponse } from "@/lib/api";

import type { User, UserStatus } from "@/types";

// =====================================================
// Constants
// =====================================================

const PAGE_SIZE = 5;

// =====================================================
// Local Type
// =====================================================

type AdminUser = User & {
  createdAt: string;
};

// =====================================================
// Component
// =====================================================

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [page, setPage] = useState(1);

  // ===================================================
  // Fetch Users
  // ===================================================

  async function fetchUsers() {
    try {
      setLoading(true);

      const response = await api.get<ApiResponse<AdminUser[]>>("/admin/users");

      console.log("ADMIN USERS RESPONSE:", response);

      if (
        !response ||
        typeof response !== "object" ||
        !Array.isArray(response.data)
      ) {
        throw new Error("Invalid users response from server.");
      }

      setUsers(response.data);
    } catch (error) {
      console.error("Failed to load users:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // Initial Fetch
  // ===================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===================================================
  // Filtering
  // ===================================================

  const filtered = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ===================================================
  // Pagination
  // ===================================================

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const pagedUsers = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ===================================================
  // Toggle User Status
  // ===================================================

  async function toggleStatus(id: string) {
    const target = users.find((user) => user.id === id);

    if (!target) return;

    const newStatus: UserStatus =
      target.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      await api.patch(`/admin/users/${id}`, {
        status: newStatus,
      });

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id
            ? {
                ...user,
                status: newStatus,
              }
            : user,
        ),
      );

      toast.success(
        newStatus === "SUSPENDED"
          ? `${target.name} suspended`
          : `${target.name} activated`,
      );
    } catch (error) {
      console.error("Failed to update user:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not update user.",
      );
    }
  }

  // ===================================================
  // Format Date
  // ===================================================

  function formatDate(date: string) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // ===================================================
  // Loading State
  // ===================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Manage users</h1>

          <p className="mt-1 text-sm text-muted">
            Manage customers and providers across the platform.
          </p>
        </div>

        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center">
              <Users className="mb-4 h-10 w-10 animate-pulse text-muted" />

              <p className="text-sm text-muted">Loading users...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===================================================
  // Main UI
  // ===================================================

  return (
    <div className="space-y-6">
      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Manage users</h1>

          <p className="mt-1 text-sm text-muted">
            {filtered.length} users match your filters.
          </p>
        </div>

        <Button variant="outline" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* =================================================
          Users Card
      ================================================= */}

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All users</CardTitle>

          {/* Search + Role Filter */}

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {/* Search */}

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <Input
                placeholder="Search name or email..."
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Role */}

            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>

                <SelectItem value="CUSTOMER">Customer</SelectItem>

                <SelectItem value="PROVIDER">Provider</SelectItem>

                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* =================================================
              Table
          ================================================= */}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>

                  <TableHead>Email</TableHead>

                  <TableHead>Role</TableHead>

                  <TableHead>Joined</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedUsers.map((user) => (
                  <TableRow key={user.id}>
                    {/* Name */}

                    <TableCell className="font-medium">
                      {user.name || "Unknown"}
                    </TableCell>

                    {/* Email */}

                    <TableCell className="text-muted">
                      {user.email || "-"}
                    </TableCell>

                    {/* Role */}

                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>

                    {/* Joined */}

                    <TableCell className="text-muted">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    {/* Status */}

                    <TableCell>
                      <Badge
                        variant={
                          user.status === "ACTIVE" ? "success" : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>

                    {/* Action */}

                    <TableCell className="text-right">
                      {user.role === "ADMIN" ? (
                        <span className="text-xs text-muted">Protected</span>
                      ) : (
                        <Button
                          size="sm"
                          variant={
                            user.status === "ACTIVE" ? "destructive" : "outline"
                          }
                          onClick={() => toggleStatus(user.id)}
                        >
                          {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Empty */}

                {pagedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="mb-3 h-8 w-8 text-muted" />

                        <p className="font-medium">No users found</p>

                        <p className="mt-1 text-sm text-muted">
                          Try changing your search or role filter.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* =================================================
              Pagination
          ================================================= */}

          {filtered.length > 0 && (
            <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(safePage - 1) * PAGE_SIZE + 1}
                </span>{" "}
                –{" "}
                <span className="font-medium text-foreground">
                  {Math.min(safePage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>

                <span className="px-2 text-sm text-muted">
                  Page {safePage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
